import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PrepaidConsumeRecordTData } from '../config';

const basePrepaidConsumeRecordT = '/api/v1//prepaid-consume-record-t';

const PrepaidConsumeRecordTUrl = {
	page: '/page',
	url: '',
};

export function getPrepaidConsumeRecordTPage(
	params: PrepaidConsumeRecordTData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidConsumeRecordTData>>> {
	let url =
		baseService.finance +
		basePrepaidConsumeRecordT +
		PrepaidConsumeRecordTUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPrepaidConsumeRecordTDetail(
	id: number,
): Promise<ResponseBody<PrepaidConsumeRecordTData>> {
	return getDataOne(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url,
		{
			id,
		},
	);
}

export function deletePrepaidConsumeRecordT(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditPrepaidConsumeRecordT(
	method: string,
	params: PrepaidConsumeRecordTData,
): Promise<ResponseBody<PrepaidConsumeRecordTData>> {
	if ('put' == method) {
		return putData(
			baseService.finance +
				basePrepaidConsumeRecordT +
				PrepaidConsumeRecordTUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance +
				basePrepaidConsumeRecordT +
				PrepaidConsumeRecordTUrl.url,
			params,
		);
	}
}
