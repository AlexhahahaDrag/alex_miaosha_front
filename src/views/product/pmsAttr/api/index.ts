import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsAttrData } from '../config';

const basePmsAttr = '/api/v1//pms-attr';

const PmsAttrUrl = {
	page: '/page',
	url: '',
};

export function getPmsAttrPage(
	params: PmsAttrData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsAttrData>>> {
	let url = baseService.product + basePmsAttr + PmsAttrUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsAttrDetail(
	id: number,
): Promise<ResponseBody<PmsAttrData>> {
	return getDataOne(baseService.product + basePmsAttr + PmsAttrUrl.url, {
		id,
	});
}

export function deletePmsAttr(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.product + basePmsAttr + PmsAttrUrl.url, {
		ids,
	});
}

export function addOrEditPmsAttr(
	method: string,
	params: PmsAttrData,
): Promise<ResponseBody<PmsAttrData>> {
	if ('put' == method) {
		return putData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	} else {
		return postData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	}
}
