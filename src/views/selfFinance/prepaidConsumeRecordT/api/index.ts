import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PrepaidConsumeRecordTData } from '../config';

const basePrepaidConsumeRecordT = '/prepaid-consume-record-t';

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
	id: string,
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

export function addPrepaidConsumeRecordT(
	params: PrepaidConsumeRecordTData,
): Promise<ResponseBody<PrepaidConsumeRecordTData>> {
	return postData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url,
		params,
	);
}

export function editPrepaidConsumeRecordT(
	params: PrepaidConsumeRecordTData,
): Promise<ResponseBody<PrepaidConsumeRecordTData>> {
	return putData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url,
		params,
	);
}
