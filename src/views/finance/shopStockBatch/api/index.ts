import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopStockBatch = '/api/v1//shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url = baseService.finance + baseShopStockBatch + ShopStockBatchUrl.page;
	return postData(url, params, { pageNo, pageSize });
}

export function getShopStockBatchDetail(id: number): Promise<ResponseBody> {
	return getData(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		{
			id,
		},
	);
}

export function deleteShopStockBatch(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditShopStockBatch(
	method: string,
	params: any,
): Promise<ResponseBody> {
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
