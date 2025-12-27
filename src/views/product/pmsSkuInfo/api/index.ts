import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsSkuInfoData } from '../config';

const basePmsSkuInfo = '/api/v1/pms-sku-info';

const PmsSkuInfoUrl = {
	page: '/page',
	url: '',
};

export function getPmsSkuInfoPage(
	params: PmsSkuInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsSkuInfoData>>> {
	let url = baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,	
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsSkuInfoDetail(
	id: number,
): Promise<ResponseBody<PmsSkuInfoData>> {
	return getDataOne(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, {
		id,
	});
}

export function deletePmsSkuInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, {
		ids,
	});
}

export function addOrEditPmsSkuInfo(
	method: string,
	params: PmsSkuInfoData,
): Promise<ResponseBody<PmsSkuInfoData>> {
	if ('put' == method) {
		return putData(
			baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url,
			params,
		);
	}
}
