import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { RoleUserInfoData } from '@/views/user/roleUserInfo/config';

const baseRoleUserInfo = '/role-user-info';

const RoleUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleUserInfoPage(
	params: RoleUserInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<RoleUserInfoData>>> {
	return postData(
		baseService.user + baseRoleUserInfo + RoleUserInfoUrl.page,
		params,
		{
			pageNum: pageNum ?? 1,
			pageSize: pageSize ?? 10,
		},
	);
}

export function getRoleUserInfoDetail(
	id: string,
): Promise<ResponseBody<RoleUserInfoData>> {
	return getDataOne(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, {
		id,
	});
}

export function deleteRoleUserInfo(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, {
		ids,
	});
}

export function addRoleUserInfo(
	params: RoleUserInfoData,
): Promise<ResponseBody<boolean>> {
	return postData(
		baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url,
		params,
	);
}

export function editRoleUserInfo(
	params: RoleUserInfoData,
): Promise<ResponseBody<boolean>> {
	return putData(
		baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url,
		params,
	);
}
