import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopOrderData } from '../config';

const baseShopOrder = '/shop-order';

const ShopOrderUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderPage(
	params: ShopOrderData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<ShopOrderData>>> {
	let url = baseService.finance + baseShopOrder + ShopOrderUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopOrderDetail(
	id: string,
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

export function addShopOrder(
	params: ShopOrderData,
): Promise<ResponseBody<ShopOrderData>> {
	return postData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}

export function editShopOrder(
	params: ShopOrderData,
): Promise<ResponseBody<ShopOrderData>> {
	return putData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}
