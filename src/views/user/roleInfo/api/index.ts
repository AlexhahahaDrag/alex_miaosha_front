import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { RoleInfoData } from '../roleInfo';

const baseRoleInfo = '/api/v1/role-info';

const RoleInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleInfoPage(
	params: RoleInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<RoleInfoData>>> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.page, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRoleInfoDetail(
	id: number,
): Promise<ResponseBody<RoleInfoData>> {
	return getDataOne(baseService.user + baseRoleInfo + RoleInfoUrl.url, { id });
}

export function deleteRoleInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseRoleInfo + RoleInfoUrl.url, { ids });
}

// 新增角色信息
export function addRoleInfo(
	params: RoleInfoData,
): Promise<ResponseBody<RoleInfoData>> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}

// 编辑角色信息
export function editRoleInfo(
	params: RoleInfoData,
): Promise<ResponseBody<RoleInfoData>> {
	return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}
