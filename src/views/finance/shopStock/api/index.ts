import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopStockData } from '../config';

const baseShopStock = '/shop-stock';

const ShopStockUrl = {
	page: '/page',
	url: '',
};

export function getShopStockPage(
	params: ShopStockData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<ShopStockData>>> {
	let url = baseService.finance + baseShopStock + ShopStockUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockDetail(
	id: string,
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

export function addShopStock(
	params: ShopStockData,
): Promise<ResponseBody<ShopStockData>> {
	return postData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}

export function editShopStock(
	params: ShopStockData,
): Promise<ResponseBody<ShopStockData>> {
	return putData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}
