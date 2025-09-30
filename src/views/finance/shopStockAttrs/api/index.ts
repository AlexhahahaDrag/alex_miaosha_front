import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopStockAttrsData } from '../config';

const baseShopStockAttrs = '/api/v1//shop-stock-attrs';

const ShopStockAttrsUrl = {
	page: '/page',
	url: '',
};

export function getShopStockAttrsPage(
	params: ShopStockAttrsData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockAttrsData>>> {
	let url = baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockAttrsDetail(
	id: number,
): Promise<ResponseBody<ShopStockAttrsData>> {
	return getDataOne(
		baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url,
		{
			id,
		},
	);
}

export function deleteShopStockAttrs(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditShopStockAttrs(
	method: string,
	params: ShopStockAttrsData,
): Promise<ResponseBody<ShopStockAttrsData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url,
			params,
		);
	}
}
