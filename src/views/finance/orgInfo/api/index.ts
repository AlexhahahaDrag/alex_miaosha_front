import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { OrgInfoData } from '../config';

const baseOrgInfo = '/api/v1//org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: OrgInfoData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<OrgInfoData>>> {
	let url = baseService.finance + baseOrgInfo + OrgInfoUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getOrgInfoDetail(
	id: number,
): Promise<ResponseBody<OrgInfoData>> {
	return getDataOne(baseService.finance + baseOrgInfo + OrgInfoUrl.url, {
		id,
	});
}

export function deleteOrgInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, {
		ids,
	});
}

export function addOrEditOrgInfo(
	method: string,
	params: OrgInfoData,
): Promise<ResponseBody<OrgInfoData>> {
	if ('put' == method) {
		return putData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
	} else {
		return postData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
	}
}
