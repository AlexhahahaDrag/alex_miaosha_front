import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { CommonPageResult, ResponseBody } from '@/types/api';

import type { CpnCouponInfoData } from '../config';

// 基础URL配置
const baseCpnCouponInfo = '/api/v1/cpn-coupon-info';

// API端点配置
const CpnCouponInfoEndpoints = {
	page: '/page',
	detail: '',
	delete: '',
	create: '',
	update: '',
};

/**
 * 获取CpnCouponInfo分页数据
 * @param params 查询参数
 * @param pageNo 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @returns Promise<ApiResponse>
 */
export async function getCpnCouponInfoPage(
	params: CpnCouponInfoData,
	pageNo?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<CpnCouponInfoData>>> {
	const url =
		baseService.finance + baseCpnCouponInfo + CpnCouponInfoEndpoints.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

/**
 * 获取CpnCouponInfo详情
 * @param id 记录ID
 * @returns Promise<ApiResponse>
 */
export async function getCpnCouponInfoDetail(
	id: number,
): Promise<ResponseBody<CpnCouponInfoData>> {
	const url =
		baseService.finance + baseCpnCouponInfo + CpnCouponInfoEndpoints.detail;
	return getData(url, { id });
}

/**
 * 删除CpnCouponInfo记录
 * @param ids 要删除的记录ID，支持单个ID或逗号分隔的多个ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCpnCouponInfo(
	ids: string | number | (string | number)[],
): Promise<ResponseBody<boolean>> {
	const url =
		baseService.finance + baseCpnCouponInfo + CpnCouponInfoEndpoints.delete;
	return deleteData(url, { ids });
}

/**
 * 创建CpnCouponInfo记录
 * @param params 请求参数
 * @returns ResponseBody<CpnCouponInfoData>
 */
export async function addCpnCouponInfo(
	params: CpnCouponInfoData,
): Promise<ResponseBody<CpnCouponInfoData>> {
	return postData(
		baseService.finance + baseCpnCouponInfo + CpnCouponInfoEndpoints.create,
		params,
	);
}

export async function editCpnCouponInfo(
	params: CpnCouponInfoData,
): Promise<ResponseBody<CpnCouponInfoData>> {
	return putData(
		baseService.finance + baseCpnCouponInfo + CpnCouponInfoEndpoints.update,
		params,
	);
}
