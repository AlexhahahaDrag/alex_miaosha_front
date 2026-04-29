import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsAttrData } from '../config';

const basePmsAttr = '/pms-attr';

const PmsAttrUrl = {
	page: '/page',
	url: '',
};

export function getPmsAttrPage(
	params: PmsAttrData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsAttrData>>> {
	let url = baseService.product + basePmsAttr + PmsAttrUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsAttrDetail(
	id: string,
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

export function addPmsAttr(
	params: PmsAttrData,
): Promise<ResponseBody<PmsAttrData>> {
	return postData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
}

export function editPmsAttr(
	params: PmsAttrData,
): Promise<ResponseBody<PmsAttrData>> {
	return putData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
}
