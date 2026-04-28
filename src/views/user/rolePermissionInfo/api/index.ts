import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseRolePermissionInfo = '/role-permission-info';

const RolePermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getRolePermissionInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	return postData(
		baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.page,
		params,
		{
			pageNum: pageNum ?? 1,
			pageSize: pageSize ?? 10,
		},
	);
}

export function getRolePermissionInfoDetail(id: string): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
		{ id },
	);
}

export function deleteRolePermissionInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
		{ ids },
	);
}

export function addRolePermissionInfo(params: any): Promise<ResponseBody> {
	return postData(
		baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
		params,
	);
}

export function editRolePermissionInfo(params: any): Promise<ResponseBody> {
	return putData(
		baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
		params,
	);
}
