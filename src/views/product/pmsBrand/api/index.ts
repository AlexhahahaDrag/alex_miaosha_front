import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsBrandData } from '../config';

const basePmsBrand = '/pms-brand';

const PmsBrandUrl = {
	page: '/page',
	url: '',
};

export function getPmsBrandPage(
	params: PmsBrandData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsBrandData>>> {
	let url = baseService.product + basePmsBrand + PmsBrandUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsBrandDetail(
	id: string,
): Promise<ResponseBody<PmsBrandData>> {
	return getDataOne(baseService.product + basePmsBrand + PmsBrandUrl.url, {
		id,
	});
}

export function deletePmsBrand(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.product + basePmsBrand + PmsBrandUrl.url, {
		ids,
	});
}

export function addPmsBrand(
	params: PmsBrandData,
): Promise<ResponseBody<PmsBrandData>> {
	return postData(baseService.product + basePmsBrand + PmsBrandUrl.url, params);
}

export function editPmsBrand(
	params: PmsBrandData,
): Promise<ResponseBody<PmsBrandData>> {
	return putData(baseService.product + basePmsBrand + PmsBrandUrl.url, params);
}
