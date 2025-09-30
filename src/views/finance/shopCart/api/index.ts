import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopCartData } from '../config';

const baseShopCart = '/api/v1/shop-cart';

const ShopCartUrl = {
	page: '/page',
	url: '',
};

export function getShopCartPage(
	params: ShopCartData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopCartData>>> {
	let url = baseService.finance + baseShopCart + ShopCartUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopCartDetail(
	id: number,
): Promise<ResponseBody<ShopCartData>> {
	return getDataOne(baseService.finance + baseShopCart + ShopCartUrl.url, {
		id,
	});
}

export function deleteShopCart(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.finance + baseShopCart + ShopCartUrl.url, {
		ids,
	});
}

export function addOrEditShopCart(
	method: string,
	params: ShopCartData,
): Promise<ResponseBody<ShopCartData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopCart + ShopCartUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopCart + ShopCartUrl.url,
			params,
		);
	}
}
