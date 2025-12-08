import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PermissionInfo } from '../permissionInfoListTs';

const basePermissionInfo = '/api/v1//permission-info';

const PermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getPermissionInfoPage(
	params: PermissionInfo,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PermissionInfo>>> {
	return postData(
		baseService.user + basePermissionInfo + PermissionInfoUrl.page,
		params,
		{
			pageNo: pageNo || 1,
			pageSize: pageSize || 10,
		},
	);
}

export function getPermissionInfoDetail(
	id: number,
): Promise<ResponseBody<PermissionInfo>> {
	return getDataOne(
		baseService.user + basePermissionInfo + PermissionInfoUrl.url,
		{ id },
	);
}

export function deletePermissionInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + basePermissionInfo + PermissionInfoUrl.url,
		{ ids },
	);
}

export function addPermissionInfo(
	params: PermissionInfo,
): Promise<ResponseBody> {
	return postData(
		baseService.user + basePermissionInfo + PermissionInfoUrl.url,
		params,
	);
}

export function editPermissionInfo(
	params: PermissionInfo,
): Promise<ResponseBody> {
	return putData(
		baseService.user + basePermissionInfo + PermissionInfoUrl.url,
		params,
	);
}
