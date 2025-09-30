import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const basePmsAttr = '/api/v1//pms-attr';

const PmsAttrUrl = {
	page: '/page',
	url: '',
};

export function getPmsAttrPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.product +
		basePmsAttr +
		PmsAttrUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getPmsAttrDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.product + basePmsAttr + PmsAttrUrl.url + '?id=' + id,
	);
}

export function deletePmsAttr(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.product + basePmsAttr + PmsAttrUrl.url + '?ids=' + ids,
	);
}

export function addOrEditPmsAttr(
	method: string,
	params: any,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	} else {
		return postData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	}
}
