import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { ResponseBody } from '@/types/api';

const baseDictManager = '/api/v1/dict-info';

const dictUrl = {
	page: '/page',
	listByBelong: '/listByBelong',
	url: '',
};

export function getDictManagerPage(
	params: unknown,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	return postData(
		baseService.finance + baseDictManager + dictUrl.page,
		params,
		{
			pageNo: pageNo ? pageNo : 1,
			pageSize: pageSize ? pageSize : 10,
		},
	);
}

export function getDictList(belongTo?: string): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance +
			baseDictManager +
			dictUrl.listByBelong +
			'?belongTo=' +
			belongTo,
	);
}

export function getDictManagerDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance + baseDictManager + dictUrl.url + '?id=' + id,
	);
}

export function deleteDictManager(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseDictManager + dictUrl.url + '?ids=' + ids,
	);
}

export function addOrEditDictManager(
	method: string,
	params: unknown,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(baseService.finance + baseDictManager + dictUrl.url, params);
	} else {
		return postData(
			baseService.finance + baseDictManager + dictUrl.url,
			params,
		);
	}
}
