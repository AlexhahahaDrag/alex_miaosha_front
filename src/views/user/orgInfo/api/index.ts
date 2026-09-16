import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';

const baseOrgInfo = '/org-info';

const OrgInfoUrl = {
	page: '/page',
	tree: '/tree',
	url: '',
};

export function getOrgInfoPage(
	params: OrgInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<OrgInfoData>>> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.page, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

// 获取机构树（后端按 parentId 组装 children，并复用数据权限过滤）
export function getOrgInfoTree(
	params?: OrgInfoData,
): Promise<ResponseBody<OrgInfoData[]>> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.tree, params || {});
}

export function getOrgInfoDetail(
	id: string,
): Promise<ResponseBody<OrgInfoData>> {
	return getDataOne(baseService.user + baseOrgInfo + OrgInfoUrl.url, { id });
}

export function deleteOrgInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseOrgInfo + OrgInfoUrl.url, { ids });
}

// 添加机构表信息
export function addOrgInfo(
	params: OrgInfoData,
): Promise<ResponseBody<boolean>> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}

// 编辑机构表信息
export function editOrgInfo(
	params: OrgInfoData,
): Promise<ResponseBody<boolean>> {
	return putData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}
