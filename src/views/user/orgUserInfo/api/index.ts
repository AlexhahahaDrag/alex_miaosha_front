import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseOrgUserInfo = '/api/v1//org-user-info';

const OrgUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgUserInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		baseOrgUserInfo +
		OrgUserInfoUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getOrgUserInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url + '?id=' + id,
	);
}

export function deleteOrgUserInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url + '?ids=' + ids,
	);
}

export function addOrEditOrgUserInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url,
			params,
		);
	}
}
