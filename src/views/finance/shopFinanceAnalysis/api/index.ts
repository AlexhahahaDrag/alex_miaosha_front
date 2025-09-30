import { getDataOne, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseFinanceAnalysis = '/api/v1/shop-finance-analysis';

const financeAnalysisUrl = {
	getDayShopFinanceInfo: '/getDayShopFinanceInfo',
	getMonthShopFinanceInfo: '/getMonthShopFinanceInfo',
	getShopNameInfo: '/getShopNameInfo',
	getPayWayInfo: '/getPayWayInfo',
	getChainAndYear: '/getChainAndYear',
};

export function getDayShopFinanceInfo(
	searchDate?: string,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getDayShopFinanceInfo +
		'?searchDate=' +
		searchDate;
	return getDataOne(url);
}

export function getMonthShopFinanceInfo(
	searchDate?: string,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getMonthShopFinanceInfo +
		'?searchDate=' +
		searchDate;
	return getDataOne(url);
}

export function getShopNameInfo(searchDate?: string): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getShopNameInfo +
		'?searchDate=' +
		searchDate;
	return getDataOne(url);
}

export function getPayWayInfo(searchDate?: string): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getPayWayInfo +
		'?searchDate=' +
		searchDate;
	return getDataOne(url);
}

export function getChainAndYear(searchDate?: string): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getChainAndYear +
		'?searchDate=' +
		searchDate;
	return getDataOne(url);
}
