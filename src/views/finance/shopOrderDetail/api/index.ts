import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ShopOrderDetailData } from '../config';

const baseShopOrderDetail = '/shop-order-detail';

const ShopOrderDetailUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderDetailPage(
	params: ShopOrderDetailData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<ShopOrderDetailData>>> {
	let url = baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopOrderDetailDetail(
	id: string,
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

export function addShopOrderDetail(
	params: ShopOrderDetailData,
): Promise<ResponseBody<ShopOrderDetailData>> {
	return postData(
		baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
		params,
	);
}

export function editShopOrderDetail(
	params: ShopOrderDetailData,
): Promise<ResponseBody<ShopOrderDetailData>> {
	return putData(
		baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url,
		params,
	);
}
