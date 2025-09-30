import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PrepaidCardInfoTData } from '../config';

const basePrepaidCardInfoT = '/api/v1/prepaid-card-info-t';

const PrepaidCardInfoTUrl = {
	page: '/page',
	list: '/list',
	consumeAndRecharge: '/consumeAndRecharge',
	url: '',
};

export function getPrepaidCardInfoTPage(
	params: PrepaidCardInfoTData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidCardInfoTData>>> {
	let url =
		baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPrepaidCardInfoList(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData[]>> {
	let url =
		baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.list;
	return postData(url, params);
}

export function getPrepaidCardInfoTDetail(
	id: number,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	return getDataOne(
		baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url,
		{
			id,
		},
	);
}

export function deletePrepaidCardInfoT(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url,
		{
			ids,
		},
	);
}

export function consumeAndRecharge(
	params: any,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	let url =
		baseService.finance +
		basePrepaidCardInfoT +
		PrepaidCardInfoTUrl.consumeAndRecharge;
	return postData(url, params);
}

export function addOrEditPrepaidCardInfoT(
	method: string,
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url,
			params,
		);
	}
}
