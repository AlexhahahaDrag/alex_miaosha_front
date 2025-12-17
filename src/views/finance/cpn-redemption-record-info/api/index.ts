import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { CommonPageResult, ResponseBody } from '@/types/api';

import type { CpnRedemptionRecordInfoData } from '../config';

// 基础URL配置
const baseCpnRedemptionRecordInfo = '/api/v1/cpn-redemption-record-info';

// API端点配置
const CpnRedemptionRecordInfoEndpoints = {
	page: '/page',
	detail: '',
	delete: '',
	create: '',
	update: '',
};

/**
 * 获取CpnRedemptionRecordInfo分页数据
 * @param params 查询参数
 * @param pageNo 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @returns Promise<ApiResponse>
 */
export async function getCpnRedemptionRecordInfoPage(
	params: CpnRedemptionRecordInfoData,
	pageNo?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<CpnRedemptionRecordInfoData>>> {
	const url =
		baseService.finance +
		baseCpnRedemptionRecordInfo +
		CpnRedemptionRecordInfoEndpoints.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

/**
 * 获取CpnRedemptionRecordInfo详情
 * @param id 记录ID
 * @returns Promise<ApiResponse>
 */
export async function getCpnRedemptionRecordInfoDetail(
	id: number,
): Promise<ResponseBody<CpnRedemptionRecordInfoData>> {
	const url =
		baseService.finance +
		baseCpnRedemptionRecordInfo +
		CpnRedemptionRecordInfoEndpoints.detail;
	return getData(url, { id });
}

/**
 * 删除CpnRedemptionRecordInfo记录
 * @param ids 要删除的记录ID，支持单个ID或逗号分隔的多个ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCpnRedemptionRecordInfo(
	ids: string | number | (string | number)[],
): Promise<ResponseBody<boolean>> {
	const url =
		baseService.finance +
		baseCpnRedemptionRecordInfo +
		CpnRedemptionRecordInfoEndpoints.delete;
	return deleteData(url, { ids });
}

/**
 * 创建CpnRedemptionRecordInfo记录
 * @param params 请求参数
 * @returns ResponseBody<CpnRedemptionRecordInfoData>
 */
export async function addCpnRedemptionRecordInfo(
	params: CpnRedemptionRecordInfoData,
): Promise<ResponseBody<CpnRedemptionRecordInfoData>> {
	return postData(
		baseService.finance +
			baseCpnRedemptionRecordInfo +
			CpnRedemptionRecordInfoEndpoints.create,
		params,
	);
}

export async function editCpnRedemptionRecordInfo(
	params: CpnRedemptionRecordInfoData,
): Promise<ResponseBody<CpnRedemptionRecordInfoData>> {
	return putData(
		baseService.finance +
			baseCpnRedemptionRecordInfo +
			CpnRedemptionRecordInfoEndpoints.update,
		params,
	);
}
