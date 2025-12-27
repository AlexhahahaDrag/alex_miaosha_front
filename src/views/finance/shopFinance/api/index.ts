import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopFinanceData } from '../config';

const baseShopFinance = '/api/v1//shop-finance';

const ShopFinanceUrl = {
	page: '/page',
	url: '',
};

export function getShopFinancePage(
	params: ShopFinanceData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<ShopFinanceData>>> {
	let url = baseService.finance + baseShopFinance + ShopFinanceUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,	
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopFinanceDetail(
	id: number,
): Promise<ResponseBody<ShopFinanceData>> {
	return getDataOne(
		baseService.finance + baseShopFinance + ShopFinanceUrl.url,
		{
			id,
		},
	);
}

export function deleteShopFinance(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseShopFinance + ShopFinanceUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditShopFinance(
	method: string,
	params: ShopFinanceData,
): Promise<ResponseBody<ShopFinanceData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopFinance + ShopFinanceUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopFinance + ShopFinanceUrl.url,
			params,
		);
	}
}
