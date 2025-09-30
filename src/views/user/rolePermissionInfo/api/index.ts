import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseRolePermissionInfo = '/api/v1//role-permission-info';

const RolePermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getRolePermissionInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		baseRolePermissionInfo +
		RolePermissionInfoUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getRolePermissionInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user +
			baseRolePermissionInfo +
			RolePermissionInfoUrl.url +
			'?id=' +
			id,
	);
}

export function deleteRolePermissionInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user +
			baseRolePermissionInfo +
			RolePermissionInfoUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditRolePermissionInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url,
			params,
		);
	}
}
