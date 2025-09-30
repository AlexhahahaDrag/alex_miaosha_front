import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopCart = '/api/v1//shop-cart';

const ShopCartUrl = {
	page: '/page',
	url: '',
};

export function getShopCartPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseShopCart +
		ShopCartUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getShopCartDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance + baseShopCart + ShopCartUrl.url + '?id=' + id,
	);
}

export function deleteShopCart(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseShopCart + ShopCartUrl.url + '?ids=' + ids,
	);
}

export function addOrEditShopCart(
	method: string,
	params: any,
): Promise<ResponseBody> {
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
