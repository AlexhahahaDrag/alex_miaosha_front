import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopOrderDetailData } from '../config';

const baseShopOrderDetail = '/api/v1//shop-order-detail';

const ShopOrderDetailUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderDetailPage(
	params: ShopOrderDetailData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopOrderDetailData>>> {
	let url = baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopOrderDetailDetail(
	id: number,
): Promise<ResponseBody<ShopOrderDetailData>> {
	return getDataOne(
		baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
		{
			id,
		},
	);
}

export function deleteShopOrderDetail(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditShopOrderDetail(
	method: string,
	params: ShopOrderDetailData,
): Promise<ResponseBody<ShopOrderDetailData>> {
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
