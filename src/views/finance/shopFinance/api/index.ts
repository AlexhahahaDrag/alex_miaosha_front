import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopFinance = '/api/v1//shop-finance';

const ShopFinanceUrl = {
	page: '/page',
	url: '',
};

export function getShopFinancePage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseShopFinance +
		ShopFinanceUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getShopFinanceDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance + baseShopFinance + ShopFinanceUrl.url + '?id=' + id,
	);
}

export function deleteShopFinance(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance + baseShopFinance + ShopFinanceUrl.url + '?ids=' + ids,
	);
}

export function addOrEditShopFinance(
	method: string,
	params: any,
): Promise<ResponseBody> {
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
