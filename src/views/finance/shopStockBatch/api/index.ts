import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopStockBatchData } from '../config';

const baseShopStockBatch = '/api/v1//shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: ShopStockBatchData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockBatchData>>> {
	let url = baseService.finance + baseShopStockBatch + ShopStockBatchUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockBatchDetail(
	id: number,
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

export function addOrEditShopStockBatch(
	method: string,
	params: ShopStockBatchData,
): Promise<ResponseBody<ShopStockBatchData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
			params,
		);
	}
}
