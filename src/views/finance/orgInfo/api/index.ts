import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { OrgInfoData } from '../config';

const baseOrgInfo = '/org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: OrgInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<OrgInfoData>>> {
	let url = baseService.finance + baseOrgInfo + OrgInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getOrgInfoDetail(
	id: string,
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

export function addOrgInfo(
	params: OrgInfoData,
): Promise<ResponseBody<OrgInfoData>> {
	return postData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}

export function editOrgInfo(
	params: OrgInfoData,
): Promise<ResponseBody<OrgInfoData>> {
	return putData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}
