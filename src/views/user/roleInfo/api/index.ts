import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { RoleInfo } from '../roleInfoListTs';

const baseRoleInfo = '/api/v1/role-info';

const RoleInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleInfoPage(
	params: RoleInfo,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<RoleInfo>>> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.page, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getRoleInfoDetail(id: number): Promise<ResponseBody<RoleInfo>> {
	return getDataOne(baseService.user + baseRoleInfo + RoleInfoUrl.url, { id });
}

export function deleteRoleInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseRoleInfo + RoleInfoUrl.url, { ids });
}

// 新增角色信息
export function addRoleInfo(params: RoleInfo): Promise<ResponseBody<RoleInfo>> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}

// 编辑角色信息
export function editRoleInfo(
	params: RoleInfo,
): Promise<ResponseBody<RoleInfo>> {
	return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}
