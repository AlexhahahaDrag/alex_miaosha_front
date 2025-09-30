import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseShopOrderDetail = '/api/v1//shop-order-detail';

const ShopOrderDetailUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderDetailPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		baseShopOrderDetail +
		ShopOrderDetailUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getShopOrderDetailDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance +
			baseShopOrderDetail +
			ShopOrderDetailUrl.url +
			'?id=' +
			id,
	);
}

export function deleteShopOrderDetail(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance +
			baseShopOrderDetail +
			ShopOrderDetailUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditShopOrderDetail(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
			params,
		);
	}
}
