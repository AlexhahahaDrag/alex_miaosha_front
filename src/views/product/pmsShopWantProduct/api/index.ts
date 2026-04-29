import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsShopWantProductData } from '../config';

const basePmsShopWantProduct = '/pms-shop-want-product';

const PmsShopWantProductUrl = {
	page: '/page',
	url: '',
};

export function getPmsShopWantProductPage(
	params: PmsShopWantProductData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsShopWantProductData>>> {
	let url =
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsShopWantProductDetail(
	id: string,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return getDataOne(
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
		{
			id,
		},
	);
}

export function deletePmsShopWantProduct(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
		{
			ids,
		},
	);
}

export function addPmsShopWantProduct(
	params: PmsShopWantProductData,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return postData(
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
		params,
	);
}

export function editPmsShopWantProduct(
	params: PmsShopWantProductData,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return putData(
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
		params,
	);
}
