import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopStockBatchData } from '../config';

const baseShopStockBatch = '/shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: ShopStockBatchData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<ShopStockBatchData>>> {
	let url = baseService.finance + baseShopStockBatch + ShopStockBatchUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockBatchDetail(
	id: string,
): Promise<ResponseBody<ShopStockBatchData>> {
	return getDataOne(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		{
			id,
		},
	);
}

export function deleteShopStockBatch(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		{
			ids,
		},
	);
}

export function addShopStockBatch(
	params: ShopStockBatchData,
): Promise<ResponseBody<ShopStockBatchData>> {
	return postData(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		params,
	);
}

export function editShopStockBatch(
	params: ShopStockBatchData,
): Promise<ResponseBody<ShopStockBatchData>> {
	return putData(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		params,
	);
}
