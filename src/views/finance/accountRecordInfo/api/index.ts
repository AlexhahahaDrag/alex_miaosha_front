import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';

import type { ResponseBody } from '@/types/api';

const baseAccountRecordInfo = '/api/v1//account-record-info';

const AccountRecordInfoUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoPage(
	params: unknown,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url =
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getAccountRecordInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.finance +
			baseAccountRecordInfo +
			AccountRecordInfoUrl.url +
			'?id=' +
			id,
	);
}

export function deleteAccountRecordInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.finance +
			baseAccountRecordInfo +
			AccountRecordInfoUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditAccountRecordInfo(
	method: string,
	params: unknown,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
			params,
		);
	}
}
