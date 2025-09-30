import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseOrgInfo = '/api/v1//org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.user +
		baseOrgInfo +
		OrgInfoUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getOrgInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseOrgInfo + OrgInfoUrl.url + '?id=' + id,
	);
}

export function deleteOrgInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseOrgInfo + OrgInfoUrl.url + '?ids=' + ids,
	);
}

export function addOrEditOrgInfo(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
	} else {
		return postData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
	}
}
