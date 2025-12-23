import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { CommonPageResult, ResponseBody } from '@/types/api';

import type { CpnUserCouponInfoData } from '../config';

// 基础URL配置
const baseCpnUserCouponInfo = '/api/v1/cpn-user-coupon-info';

// API端点配置
const CpnUserCouponInfoEndpoints = {
	page: '/page',
	detail: '',
	delete: '',
	create: '',
	update: '',
	redeem: '/redeem',
};

/**
 * 获取CpnUserCouponInfo分页数据
 * @param params 查询参数
 * @param pageNo 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @returns Promise<ApiResponse>
 */
export async function getCpnUserCouponInfoPage(
	params: CpnUserCouponInfoData,
	pageNo?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<CpnUserCouponInfoData>>> {
	const url =
		baseService.finance +
		baseCpnUserCouponInfo +
		CpnUserCouponInfoEndpoints.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

/**
 * 获取CpnUserCouponInfo详情
 * @param id 记录ID
 * @returns Promise<ApiResponse>
 */
export async function getCpnUserCouponInfoDetail(
	id: number,
): Promise<ResponseBody<CpnUserCouponInfoData>> {
	const url =
		baseService.finance +
		baseCpnUserCouponInfo +
		CpnUserCouponInfoEndpoints.detail;
	return getData(url, { id });
}

/**
 * 删除CpnUserCouponInfo记录
 * @param ids 要删除的记录ID，支持单个ID或逗号分隔的多个ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCpnUserCouponInfo(
	ids: string | number | (string | number)[],
): Promise<ResponseBody<boolean>> {
	const url =
		baseService.finance +
		baseCpnUserCouponInfo +
		CpnUserCouponInfoEndpoints.delete;
	return deleteData(url, { ids });
}

/**
 * 创建CpnUserCouponInfo记录
 * @param params 请求参数
 * @returns ResponseBody<CpnUserCouponInfoData>
 */
export async function addCpnUserCouponInfo(
	params: CpnUserCouponInfoData,
): Promise<ResponseBody<CpnUserCouponInfoData>> {
	return postData(
		baseService.finance +
			baseCpnUserCouponInfo +
			CpnUserCouponInfoEndpoints.create,
		params,
	);
}

export async function editCpnUserCouponInfo(
	params: CpnUserCouponInfoData,
): Promise<ResponseBody<CpnUserCouponInfoData>> {
	return putData(
		baseService.finance +
			baseCpnUserCouponInfo +
			CpnUserCouponInfoEndpoints.update,
		params,
	);
}

// AI Agent：消费券核销数量请求（按数量核销）
export interface CpnUserCouponRedeemReq {
	userId: number;
	couponId: number;
	redemptionQuantity: number;
	remarks?: string;
	// 其他后端支持的字段（如 orderId/merchantId/redemptionValue/redemptionTime/userCouponId）暂不在该页面使用
}

/**
 * 消费券核销数量（按数量核销）
 * 对应后端：POST /api/v1/cpn-user-coupon-info/redeem
 */
export async function redeemCpnUserCouponInfo(
	params: CpnUserCouponRedeemReq,
): Promise<ResponseBody<boolean>> {
	const url =
		baseService.finance +
		baseCpnUserCouponInfo +
		CpnUserCouponInfoEndpoints.redeem;
	return postData(url, params);
}
