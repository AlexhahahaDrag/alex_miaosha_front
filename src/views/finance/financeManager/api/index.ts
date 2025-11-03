import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { FinanceManagerData } from '../config';

const baseFinanceManager = '/api/v1/finance-info';

const financeMangerUrl = {
	page: '/page',
	url: '',
};

export function getFinanceMangerPage(
	params: FinanceManagerData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<FinanceManagerData>>> {
	let url = baseService.finance + baseFinanceManager + financeMangerUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getFinanceMangerDetail(
	id: number,
): Promise<ResponseBody<FinanceManagerData>> {
	return getDataOne(
		baseService.finance + baseFinanceManager + financeMangerUrl.url,
		{
			id,
		},
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
