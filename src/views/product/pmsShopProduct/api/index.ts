import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';
import type { PmsShopProductData } from '../pmsShopProductListTs';

const basePmsShopProduct = '/api/v1//pms-shop-product';

const PmsShopProductUrl = {
	page: '/page',
	url: '',
	newestPage: '/newestPage',
	hisInfo: '/hisInfo',
};

export function getPmsShopProductPage(
	params: unknown,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<unknown>> {
	let url =
		baseService.product +
		basePmsShopProduct +
		PmsShopProductUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getNewestPmsShopProductPage(
	params: PmsShopProductData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<PmsShopProductData[]>> {
	let url =
		baseService.product +
		basePmsShopProduct +
		PmsShopProductUrl.newestPage +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData<PmsShopProductData[]>(url, params);
}

export function getPmsShopProductDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.product +
			basePmsShopProduct +
			PmsShopProductUrl.url +
			'?id=' +
			id,
	);
}

export function deletePmsShopProduct(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.product +
			basePmsShopProduct +
			PmsShopProductUrl.url +
			'?ids=' +
			ids,
	);
}

export function getProductHisInfo(
	skuId: string,
	startTime: string | null,
): Promise<ResponseBody> {
	return getDataOne(
		baseService.product +
			basePmsShopProduct +
			PmsShopProductUrl.hisInfo +
			'?skuId=' +
			skuId +
			(startTime ? '&startTime=' + startTime : ''),
	);
}

export function addOrEditPmsShopProduct(
	method: string,
	params: unknown,
): Promise<ResponseBody<unknown>> {
	if ('put' == method) {
		return putData(
			baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
			params,
		);
	}
}
