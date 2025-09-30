import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseUserManager = '/api/v1/user';

const userMangerUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

export function getUserManagerPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		baseUserManager +
		userMangerUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getUserManagerDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseUserManager + userMangerUrl.url + '?id=' + id,
	);
}

export function deleteUserManager(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseUserManager + userMangerUrl.url + '?ids=' + ids,
	);
}

export function addOrEditUserManager(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.user + baseUserManager + userMangerUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.user + baseUserManager + userMangerUrl.url,
			params,
		);
	}
}

export function getUserManagerList(params: any): Promise<ResponseBody> {
	let url = baseService.user + baseUserManager + userMangerUrl.list;
	return postData(url, params);
}
