import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopOrderData } from '../config';

const baseShopOrder = '/api/v1//shop-order';

const ShopOrderUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderPage(
	params: ShopOrderData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopOrderData>>> {
	let url = baseService.finance + baseShopOrder + ShopOrderUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopOrderDetail(
	id: number,
): Promise<ResponseBody<ShopOrderData>> {
	return getDataOne(baseService.finance + baseShopOrder + ShopOrderUrl.url, {
		id,
	});
}

export function deleteShopOrder(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.finance + baseShopOrder + ShopOrderUrl.url, {
		ids,
	});
}

export function addOrEditShopOrder(
	method: string,
	params: ShopOrderData,
): Promise<ResponseBody<ShopOrderData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopOrder + ShopOrderUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopOrder + ShopOrderUrl.url,
			params,
		);
	}
}
