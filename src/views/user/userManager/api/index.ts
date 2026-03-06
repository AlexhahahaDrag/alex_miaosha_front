import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { UserManagerInfo } from '../config';

const baseUserManager = '/user';

const userMangerUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

// 获取用户分页列表
export function getUserManagerPage(
	params: UserManagerInfo | null,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<UserManagerInfo>>> {
	let url = baseService.user + baseUserManager + userMangerUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

// 获取用户详情
export function getUserManagerDetail(id: number): Promise<ResponseBody> {
	return getData(baseService.user + baseUserManager + userMangerUrl.url, {
		id,
	});
}

// 删除用户
export function deleteUserManager(ids: string): Promise<ResponseBody> {
	return deleteData(baseService.user + baseUserManager + userMangerUrl.url, {
		ids,
	});
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

// 新增用户
export function addUserManager(
	params: UserManagerInfo | null,
): Promise<ResponseBody> {
	return postData(
		baseService.user + baseUserManager + userMangerUrl.url,
		params,
	);
}

//编辑用户
export function editUserManager(
	params: UserManagerInfo | null,
): Promise<ResponseBody> {
	return putData(
		baseService.user + baseUserManager + userMangerUrl.url,
		params,
	);
}

// 获取用户列表
export function getUserManagerList(
	params: UserManagerInfo | null,
): Promise<ResponseBody<UserManagerInfo[]>> {
	let url = baseService.user + baseUserManager + userMangerUrl.list;
	return postData(url, params);
}
