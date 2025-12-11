import { getDataOne, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';
import type { FinanceManagerData } from '../../financeManager/config';

const baseFinanceAnalysis = '/api/v1/finance-analysis';

const financeAnalysisUrl = {
	getBalance: '/getBalance',
	getIncomeAndExpense: '/getIncomeAndExpense',
	getDayExpense: '/getDayExpense',
	getMonthExpense: '/getMonthExpense',
};

export const getBalance = (
	belongTo?: number | null,
	searchDate?: string,
): Promise<ResponseBody<FinanceManagerData[]>> => {
	let params = {
		searchDate,
		belongTo,
	} as Record<string, unknown>;
	return getDataOne(
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBalance,
		params,
	);
};

// 获取收入和支出信息
// todo: 将来添加type参数，根据type查询收入和支出
export const getIncomeAndExpense = (
	belongTo?: number | null,
	searchDate?: string,
	type?: string,
): Promise<ResponseBody<any[]>> => {
	let params = {
		belongTo,
		searchDate,
		type,
	} as Record<string, unknown>;
	return getDataOne(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getIncomeAndExpense,
		params,
	);
};

export const getDayExpense = (
	belongTo?: number | null,
	searchDate?: string,
): Promise<ResponseBody> => {
	let params = {
		belongTo,
		searchDate,
	} as Record<string, unknown>;
	return getDataOne(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getDayExpense,
		params,
	);
};

export const getMonthExpense = (
	belongTo?: number | null,
	searchDate?: string,
): Promise<ResponseBody> => {
	let params = {
		belongTo,
		searchDate,
	} as Record<string, unknown>;
	return getDataOne(
		baseService.finance +
			baseFinanceAnalysis +
			financeAnalysisUrl.getMonthExpense,
		params,
	);
};
