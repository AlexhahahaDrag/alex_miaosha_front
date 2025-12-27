import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseRoleUserInfo = '/api/v1/role-user-info';

const RoleUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleUserInfoPage(
	params: any,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody> {
	return postData(
		baseService.user + baseRoleUserInfo + RoleUserInfoUrl.page,
		params,
		{
			pageNum: pageNum ?? 1,
			pageSize: pageSize ?? 10,
		},
	);
}

export function getRoleUserInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, {
		id,
	});
}

export function deleteRoleUserInfo(ids: string): Promise<ResponseBody> {
	return deleteData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, {
		ids,
	});
}

export function addOrEditRoleUserInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url,
			params,
		);
	}
}
