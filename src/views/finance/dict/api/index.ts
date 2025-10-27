import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { DictInfo } from '../config';

const baseDictManager = '/api/v1/dict-info';

const dictUrl = {
	page: '/page',
	listByBelong: '/listByBelong',
	url: '',
};

export function getDictManagerPage(
	params: DictInfo,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<DictInfo>>> {
	return postData(
		baseService.finance + baseDictManager + dictUrl.page,
		params,
		{
			pageNo: pageNo ? pageNo : 1,
			pageSize: pageSize ? pageSize : 10,
		},
	);
}

export function getDictList(
	belongTo?: string,
): Promise<ResponseBody<DictInfo[]>> {
	return getDataOne(
		baseService.finance + baseDictManager + dictUrl.listByBelong,
		{ belongTo },
	);
}

export function getDictManagerDetail(
	id: number | undefined,
): Promise<ResponseBody<DictInfo>> {
	return getDataOne(baseService.finance + baseDictManager + dictUrl.url, {
		id,
	});
}

export function deleteDictManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.finance + baseDictManager + dictUrl.url, {
		ids,
	});
}

export function addOrEditDictManager(
	method: string,
	params: DictInfo,
): Promise<ResponseBody<DictInfo>> {
	if ('put' == method) {
		return putData(baseService.finance + baseDictManager + dictUrl.url, params);
	} else {
		return postData(
			baseService.finance + baseDictManager + dictUrl.url,
			params,
		);
	}
}
