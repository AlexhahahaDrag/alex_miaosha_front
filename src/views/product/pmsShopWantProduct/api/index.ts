import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsShopWantProductData } from '../pmsShopWantProductListTs';

const basePmsShopWantProduct = '/api/v1//pms-shop-want-product';

const PmsShopWantProductUrl = {
	page: '/page',
	url: '',
};

export function getPmsShopWantProductPage(
	params: PmsShopWantProductData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopWantProductData>>> {
	let url =
		baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.page;
	return postData(url, params, { pageNo, pageSize });
}

export function getPmsShopWantProductDetail(
	id: number,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return getDataOne(
		baseService.product +
			basePmsShopWantProduct +
			PmsShopWantProductUrl.url +
			'?id=' +
			id,
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

export function addOrEditPmsShopWantProduct(
	method: string,
	params: PmsShopWantProductData,
): Promise<ResponseBody<PmsShopWantProductData>> {
	if ('put' == method) {
		return putData(
			baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url,
			params,
		);
	}
}
