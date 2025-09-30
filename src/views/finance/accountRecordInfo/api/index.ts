import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { AccountRecordInfoData } from '../config';

const baseAccountRecordInfo = '/api/v1//account-record-info';

const AccountRecordInfoUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoPage(
	params: AccountRecordInfoData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<AccountRecordInfoData>>> {
	let url =
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getAccountRecordInfoDetail(
	id: number,
): Promise<ResponseBody<AccountRecordInfoData>> {
	return getDataOne(
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
		{
			id,
		},
	);
}

export function deleteAccountRecordInfo(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
		{
			ids,
		},
	);
}

export function addOrEditAccountRecordInfo(
	method: string,
	params: AccountRecordInfoData,
): Promise<ResponseBody<AccountRecordInfoData>> {
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
