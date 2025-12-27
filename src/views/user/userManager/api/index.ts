import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { UserManagerInfo } from '../config';

const baseUserManager = '/api/v1/user';

const userMangerUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

export function getUserManagerPage(
	params: UserManagerInfo | null,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<UserManagerInfo>>> {
	let url = baseService.user + baseUserManager + userMangerUrl.page;
	return postData(url, params, { pageNum: pageNum ?? 1, pageSize: pageSize ?? 10 });
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
	params: UserManagerInfo | null,
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

export function getUserManagerList(
	params: UserManagerInfo | null,
): Promise<ResponseBody<UserManagerInfo[]>> {
	let url = baseService.user + baseUserManager + userMangerUrl.list;
	return postData(url, params);
}
