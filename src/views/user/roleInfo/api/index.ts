import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';
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
): Promise<ResponseBody> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.page, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getRoleInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(baseService.user + baseRoleInfo + RoleInfoUrl.url, { id });
}

export function deleteRoleInfo(ids: string): Promise<ResponseBody> {
	return deleteData(baseService.user + baseRoleInfo + RoleInfoUrl.url, { ids });
}

// 新增角色信息
export function addRoleInfo(params: RoleInfo): Promise<ResponseBody> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}

// 编辑角色信息
export function editRoleInfo(params: RoleInfo): Promise<ResponseBody> {
	return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}
