import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { OrgUserInfoData } from '@/views/user/orgUserInfo/config';

const baseOrgUserInfo = '/org-user-info';

const OrgUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgUserInfoPage(
	params: OrgUserInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<OrgUserInfoData>>> {
	return postData(
		baseService.user + baseOrgUserInfo + OrgUserInfoUrl.page,
		params,
		{ pageNum: pageNum ? pageNum : 1, pageSize: pageSize ? pageSize : 10 },
	);
}

export function getOrgUserInfoDetail(
	id: string,
): Promise<ResponseBody<OrgUserInfoData>> {
	return getDataOne(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, {
		id,
	});
}

export function deleteOrgUserInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, {
		ids,
	});
}

// 新增用户公司信息（等价 assignSingleOrg：单用户唯一有效机构）
export function addOrgUserInfo(
	params: OrgUserInfoData,
): Promise<ResponseBody<boolean>> {
	return postData(
		baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url,
		params,
	);
}

export function editOrgUserInfo(
	params: OrgUserInfoData,
): Promise<ResponseBody<boolean>> {
	return putData(
		baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url,
		params,
	);
}
