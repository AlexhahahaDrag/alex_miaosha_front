import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsShopProductData } from '../config';

const basePmsShopProduct = '/api/v1//pms-shop-product';

const PmsShopProductUrl = {
	page: '/page',
	url: '',
	newestPage: '/newestPage',
	hisInfo: '/hisInfo',
};

export function getPmsShopProductPage(
	params: PmsShopProductData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	let url = baseService.product + basePmsShopProduct + PmsShopProductUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getNewestPmsShopProductPage(
	params: PmsShopProductData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	let url =
		baseService.product + basePmsShopProduct + PmsShopProductUrl.newestPage;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsShopProductDetail(
	id: number,
): Promise<ResponseBody<PmsShopProductData>> {
	return getDataOne(
		baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
		{
			id,
		},
	);
}

export function deletePmsShopProduct(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
		{
			ids,
		},
	);
}

export function getProductHisInfo(
	skuId: string,
	startTime: string | null,
): Promise<ResponseBody<PmsShopProductData[]>> {
	return getDataOne(
		baseService.product + basePmsShopProduct + PmsShopProductUrl.hisInfo,
		{
			skuId,
			startTime,
		},
	);
}

export function addOrEditPmsShopProduct(
	method: string,
	params: PmsShopProductData,
): Promise<ResponseBody<PmsShopProductData>> {
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
