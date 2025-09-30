import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const basePrepaidConsumeRecordT = '/api/v1//prepaid-consume-record-t';

const PrepaidConsumeRecordTUrl = {
	page: '/page',
	url: '',
};

export function getPrepaidConsumeRecordTPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance +
		basePrepaidConsumeRecordT +
		PrepaidConsumeRecordTUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getPrepaidConsumeRecordTDetail(
	id: number,
): Promise<ResponseBody> {
	return getData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url +
			'?id=' +
			id,
	);
}

export function deletePrepaidConsumeRecordT(
	ids: string,
): Promise<ResponseBody> {
	return deleteData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditPrepaidConsumeRecordT(
	method: string,
	params: any,
): Promise<ResponseBody> {
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
