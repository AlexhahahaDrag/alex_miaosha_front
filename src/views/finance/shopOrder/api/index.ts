import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopOrder = '/api/v1//shop-order';

const ShopOrderUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseShopOrder +
		ShopOrderUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getShopOrderDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance + baseShopOrder + ShopOrderUrl.url + '?id=' + id,
	);
}

export function deleteShopOrder(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseShopOrder + ShopOrderUrl.url + '?ids=' + ids,
	);
}

export function addOrEditShopOrder(
	method: string,
	params: any,
): Promise<ResponseBody> {
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
