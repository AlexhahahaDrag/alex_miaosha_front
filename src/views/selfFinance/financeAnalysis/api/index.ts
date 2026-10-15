import { getData, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';

import {
	type AnalysisData,
	type BalanceData,
} from '@/views/selfFinance/financeAnalysis/analysis';

const baseFinanceAnalysis = '/finance-analysis';

const financeAnalysisUrl = {
	getBalance: '/getBalance',
	getIncomeAndExpense: '/getIncomeAndExpense',
	getDayExpense: '/getDayExpense',
	getMonthExpense: '/getMonthExpense',
};

export const getBalance = (
	belongTo?: string | number | null,
	searchDate?: string,
): Promise<ResponseBody<BalanceData>> => {
	const params: Record<string, unknown> = {
		searchDate,
	};
	if (belongTo && belongTo !== '0') {
		params.belongTo = String(belongTo);
	}
	return getData(
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBalance,
		params,
	);
};

// 获取收入和支出信息
// todo: 将来添加type参数，根据type查询收入和支出
export const getIncomeAndExpense = (
	belongTo?: string | number | null,
	searchDate?: string,
	type?: string,
): Promise<ResponseBody<AnalysisData[]>> => {
	const params: Record<string, unknown> = {
		searchDate,
		type,
	};
	if (belongTo && belongTo !== '0') {
		params.belongTo = String(belongTo);
	}
	return getData(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getIncomeAndExpense,
		params,
	);
};

export const getDayExpense = (
	belongTo?: string | number | null,
	searchDate?: string,
): Promise<ResponseBody<AnalysisData[]>> => {
	const params: Record<string, unknown> = {
		searchDate,
	};
	if (belongTo && belongTo !== '0') {
		params.belongTo = String(belongTo);
	}
	return getData(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getDayExpense,
		params,
	);
};

export const getMonthExpense = (
	belongTo?: string | number | null,
	searchDate?: string,
): Promise<ResponseBody<AnalysisData[]>> => {
	const params: Record<string, unknown> = {
		searchDate,
	};
	if (belongTo && belongTo !== '0') {
		params.belongTo = String(belongTo);
	}
	return getData(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getMonthExpense,
		params,
	);
};
