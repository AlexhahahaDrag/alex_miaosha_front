import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { AccountRecordInfo } from '../config';

const baseAccountRecordInfo = '/api/v1//account-record-info';

const AccountRecordInfoUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoPage(
	params: AccountRecordInfo,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<AccountRecordInfo>>> {
	let url =
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getAccountRecordInfoDetail(
	id: number,
): Promise<ResponseBody<AccountRecordInfo>> {
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

export function addAccountRecordInfo(
	params: AccountRecordInfo,
): Promise<ResponseBody<AccountRecordInfo>> {
	return postData(
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
		params,
	);
}

export function editAccountRecordInfo(
	params: AccountRecordInfo,
): Promise<ResponseBody<AccountRecordInfo>> {
	return putData(
		baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url,
		params,
	);
}
