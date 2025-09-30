import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopStock = '/api/v1//shop-stock';

const ShopStockUrl = {
	page: '/page',
	url: '',
};

export function getShopStockPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseShopStock +
		ShopStockUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getShopStockDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance + baseShopStock + ShopStockUrl.url + '?id=' + id,
	);
}

export function deleteShopStock(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseShopStock + ShopStockUrl.url + '?ids=' + ids,
	);
}

export function addOrEditShopStock(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopStock + ShopStockUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopStock + ShopStockUrl.url,
			params,
		);
	}
}
