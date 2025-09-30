import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopStockData } from '../config';

const baseShopStock = '/api/v1//shop-stock';

const ShopStockUrl = {
	page: '/page',
	url: '',
};

export function getShopStockPage(
	params: ShopStockData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockData>>> {
	let url = baseService.finance + baseShopStock + ShopStockUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockDetail(
	id: number,
): Promise<ResponseBody<ShopStockData>> {
	return getDataOne(baseService.finance + baseShopStock + ShopStockUrl.url, {
		id,
	});
}

export function deleteShopStock(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.finance + baseShopStock + ShopStockUrl.url, {
		ids,
	});
}

export function addOrEditShopStock(
	method: string,
	params: ShopStockData,
): Promise<ResponseBody<ShopStockData>> {
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
