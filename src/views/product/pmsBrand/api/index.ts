import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsBrandData } from '../config';

const basePmsBrand = '/api/v1//pms-brand';

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
	id: number | string,
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

export function addOrEditPmsBrand(
	method: string,
	params: PmsBrandData,
): Promise<ResponseBody<PmsBrandData>> {
	if ('put' == method) {
		return putData(
			baseService.product + basePmsBrand + PmsBrandUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.product + basePmsBrand + PmsBrandUrl.url,
			params,
		);
	}
}
