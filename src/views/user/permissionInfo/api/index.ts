import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const basePermissionInfo = '/api/v1//permission-info';

const PermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getPermissionInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		basePermissionInfo +
		PermissionInfoUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getPermissionInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + basePermissionInfo + PermissionInfoUrl.url + '?id=' + id,
	);
}

export function deletePermissionInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user +
			basePermissionInfo +
			PermissionInfoUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditPermissionInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.user + basePermissionInfo + PermissionInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.user + basePermissionInfo + PermissionInfoUrl.url,
			params,
		);
	}
}
