import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { CommonPageResult, ResponseBody } from '@/types/api';

import type { CouponInfoData } from '../config';

// 基础URL配置
const baseCouponInfo = '/api/v1/coupon-info';

// API端点配置
const CouponInfoEndpoints = {
	page: '/page',
	detail: '',
	delete: '',
	create: '',
	update: '',
};

/**
 * 获取CouponInfo分页数据
 * @param params 查询参数
 * @param pageNo 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @returns Promise<ApiResponse>
 */
export async function getCouponInfoPage(
	params: CouponInfoData,
	pageNo?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<CouponInfoData>>> {
	const url = baseService.finance + baseCouponInfo + CouponInfoEndpoints.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

/**
 * 获取CouponInfo详情
 * @param id 记录ID
 * @returns Promise<ApiResponse>
 */
export async function getCouponInfoDetail(
	id: number,
): Promise<ResponseBody<CouponInfoData>> {
	const url = baseService.finance + baseCouponInfo + CouponInfoEndpoints.detail;
	return getData(url, { id });
}

/**
 * 删除CouponInfo记录
 * @param ids 要删除的记录ID，支持单个ID或逗号分隔的多个ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCouponInfo(
	ids: string | number | (string | number)[],
): Promise<ResponseBody<boolean>> {
	const url = baseService.finance + baseCouponInfo + CouponInfoEndpoints.delete;
	return deleteData(url, { ids });
}

/**
 * 创建CouponInfo记录
 * @param params 请求参数
 * @returns ResponseBody<CouponInfoData>
 */
export async function addCouponInfo(
	params: CouponInfoData,
): Promise<ResponseBody<CouponInfoData>> {
	return postData(
		baseService.finance + baseCouponInfo + CouponInfoEndpoints.create,
		params,
	);
}

export async function editCouponInfo(
	params: CouponInfoData,
): Promise<ResponseBody<CouponInfoData>> {
	return putData(
		baseService.finance + baseCouponInfo + CouponInfoEndpoints.update,
		params,
	);
}
