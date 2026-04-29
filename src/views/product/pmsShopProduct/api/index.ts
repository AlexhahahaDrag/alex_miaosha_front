import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsShopProductData } from '../config';

const basePmsShopProduct = '/pms-shop-product';

const PmsShopProductUrl = {
	page: '/page',
	url: '',
	newestPage: '/newestPage',
	hisInfo: '/hisInfo',
};

export function getPmsShopProductPage(
	params: PmsShopProductData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	let url = baseService.product + basePmsShopProduct + PmsShopProductUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getNewestPmsShopProductPage(
	params: PmsShopProductData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	let url =
		baseService.product + basePmsShopProduct + PmsShopProductUrl.newestPage;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsShopProductDetail(
	id: string,
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

export function addPmsShopProduct(
	params: PmsShopProductData,
): Promise<ResponseBody<PmsShopProductData>> {
	return postData(
		baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
		params,
	);
}

export function editPmsShopProduct(
	params: PmsShopProductData,
): Promise<ResponseBody<PmsShopProductData>> {
	return putData(
		baseService.product + basePmsShopProduct + PmsShopProductUrl.url,
		params,
	);
}
