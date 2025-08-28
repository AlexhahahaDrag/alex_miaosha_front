import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/api/common';

const basePrepaidConsumeRecordT = '/api/v1//prepaid-consume-record-t';

const PrepaidConsumeRecordTUrl = {
	page: '/page',
	url: '',
};

export function getPrepaidConsumeRecordTPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
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

export function getPrepaidConsumeRecordTDetail(id: number): Promise<any> {
	return getData(
		baseService.finance +
			basePrepaidConsumeRecordT +
			PrepaidConsumeRecordTUrl.url +
			'?id=' +
			id,
	);
}

export function deletePrepaidConsumeRecordT(ids: string): Promise<any> {
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
): Promise<any> {
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
