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
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<DictInfo>>> {
	return postData(
		baseService.finance + baseDictManager + dictUrl.page,
		params,
		{
			pageNum: pageNum ? pageNum : 1,
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

// 新增字典信息
export function addDictManager(
	params: DictInfo,
): Promise<ResponseBody<DictInfo>> {
	return postData(baseService.finance + baseDictManager + dictUrl.url, params);
}

// 修改字典信息
export function editDictManager(
	params: DictInfo,
): Promise<ResponseBody<DictInfo>> {
	return putData(baseService.finance + baseDictManager + dictUrl.url, params);
}
