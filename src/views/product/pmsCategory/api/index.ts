import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PmsCategoryData } from '../config';

const basePmsCategory = '/api/v1//pms-category';

const PmsCategoryUrl = {
	page: '/page',
	url: '',
};

export function getPmsCategoryPage(
	params: PmsCategoryData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PmsCategoryData>>> {
	let url = baseService.product + basePmsCategory + PmsCategoryUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,	
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsCategoryDetail(
	id: number | string,
): Promise<ResponseBody<PmsCategoryData>> {
	return getDataOne(
		baseService.product + basePmsCategory + PmsCategoryUrl.url,
		{
			id,
		},
	);
}

export function deletePmsCategory(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.product + basePmsCategory + PmsCategoryUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditPmsCategory(
	method: string,
	params: PmsCategoryData,
): Promise<ResponseBody<PmsCategoryData>> {
	if ('put' == method) {
		return putData(
			baseService.product + basePmsCategory + PmsCategoryUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.product + basePmsCategory + PmsCategoryUrl.url,
			params,
		);
	}
}
