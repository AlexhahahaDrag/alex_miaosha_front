import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	FinanceManagerData,
	FinanceBudgetStatusVo,
	FinanceBudgetSaveReq,
} from '@/views/selfFinance/financeManager/config';

const baseFinanceManager = '/finance-info';

const financeMangerUrl = {
	page: '/page',
	url: '',
};

export function getFinanceMangerPage(
	params: FinanceManagerData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<FinanceManagerData>>> {
	let url = baseService.finance + baseFinanceManager + financeMangerUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getFinanceMangerDetail(
	id: string,
): Promise<ResponseBody<FinanceManagerData>> {
	return getDataOne(
		baseService.finance + baseFinanceManager + financeMangerUrl.url,
		{ id },
	);
}

export function deleteFinanceManger(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseFinanceManager + financeMangerUrl.url,
		{
			ids,
		},
	);
}

export function addFinanceManger(
	params: FinanceManagerData,
): Promise<ResponseBody<FinanceManagerData>> {
	return postData(
		baseService.finance + baseFinanceManager + financeMangerUrl.url,
		params,
	);
}

export function editFinanceManger(
	params: FinanceManagerData,
): Promise<ResponseBody<FinanceManagerData>> {
	return putData(
		baseService.finance + baseFinanceManager + financeMangerUrl.url,
		params,
	);
}

export interface FinanceSummaryData {
	totalExpense?: number;
	totalIncome?: number;
	totalBalance?: number;
	totalCount?: number;
}

export function getFinanceSummary(
	params: FinanceManagerData,
): Promise<ResponseBody<FinanceSummaryData>> {
	let url = baseService.finance + baseFinanceManager + '/summary';
	return postData(url, params);
}

const baseBudgetManager = '/finance-budget';

export function getBudgetStatus(
	budgetMonth: string,
	belongTo?: string,
): Promise<ResponseBody<FinanceBudgetStatusVo>> {
	return getDataOne(
		baseService.finance + baseBudgetManager + '/status',
		{ budgetMonth, yearMonth: budgetMonth, belongTo },
	);
}

export function saveMonthlyBudget(
	params: FinanceBudgetSaveReq,
): Promise<ResponseBody<boolean>> {
	const req = {
		...params,
		budgetMonth: params.budgetMonth || params.yearMonth,
		yearMonth: params.budgetMonth || params.yearMonth,
	};
	return postData(
		baseService.finance + baseBudgetManager + '/save',
		req,
	);
}

export function getBudgetCategories(
	budgetMonth: string,
	belongTo?: string,
): Promise<ResponseBody<string[]>> {
	return getDataOne(
		baseService.finance + baseBudgetManager + '/categories',
		{ budgetMonth, yearMonth: budgetMonth, belongTo },
	);
}

export function recommendBudget(
	params: import('@/views/selfFinance/financeManager/config').FinanceBudgetAiRecommendReq,
): Promise<ResponseBody<import('@/views/selfFinance/financeManager/config').FinanceBudgetAiRecommendVo>> {
	return postData(
		baseService.finance + baseBudgetManager + '/ai/recommend',
		params,
	);
}

export function parseBudgetCommand(
	params: import('@/views/selfFinance/financeManager/config').FinanceBudgetAiParseReq,
): Promise<ResponseBody<import('@/views/selfFinance/financeManager/config').FinanceBudgetAiParseVo>> {
	return postData(
		baseService.finance + baseBudgetManager + '/ai/parse',
		params,
	);
}

export function parseUniversalFinanceLedger(
	params: import('@/views/selfFinance/financeManager/config').UniversalFinanceAiParseReq,
): Promise<ResponseBody<import('@/views/selfFinance/financeManager/config').UniversalFinanceAiParseVo>> {
	return postData(
		baseService.finance + baseFinanceManager + '/ai-parse',
		params,
	);
}

export async function parseUniversalFinanceLedgerStream(
	params: import('@/views/selfFinance/financeManager/config').UniversalFinanceAiParseReq,
	callbacks: {
		onStage?: (stageVo: import('@/views/selfFinance/financeManager/config').UniversalFinanceAiStageVo) => void;
		onComplete?: (result: import('@/views/selfFinance/financeManager/config').UniversalFinanceAiParseVo) => void;
		onError?: (err: Error) => void;
	},
): Promise<void> {
	const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;
	const rawUrl = baseService.finance + baseFinanceManager + '/ai-parse-stream';
	const url = rawUrl
		.replace(/^\/(api\/am-[^/]+)\/(.*)/, `/$1/${apiPrefix}/$2`)
		.replace(/\/+/g, '/');

	const { useUserStore } = await import('@/store/modules/user/user');
	const userStore = useUserStore();
	const token = userStore.getToken;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: token } : {}),
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (!response.body) {
			throw new Error('ReadableStream not supported in this browser.');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith('data:')) {
					const jsonStr = trimmed.substring(5).trim();
					if (jsonStr) {
						try {
							const stageVo = JSON.parse(jsonStr) as import('@/views/selfFinance/financeManager/config').UniversalFinanceAiStageVo;
							if (callbacks.onStage) {
								callbacks.onStage(stageVo);
							}
							if (stageVo.stage === 'COMPLETE' && stageVo.partialData) {
								if (callbacks.onComplete) {
									callbacks.onComplete(stageVo.partialData);
								}
							}
						} catch (e) {
							// 忽略心跳或非 JSON 载荷
						}
					}
				}
			}
		}
	} catch (err: any) {
		if (callbacks.onError) {
			callbacks.onError(err instanceof Error ? err : new Error(String(err)));
		} else {
			throw err;
		}
	}
}

