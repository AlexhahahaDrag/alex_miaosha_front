import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseRoleInfo = '/api/v1//role-info';

const RoleInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		baseRoleInfo +
		RoleInfoUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getRoleInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseRoleInfo + RoleInfoUrl.url + '?id=' + id,
	);
}

export function deleteRoleInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseRoleInfo + RoleInfoUrl.url + '?ids=' + ids,
	);
}

export function addOrEditRoleInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
	} else {
		return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
	}
}
