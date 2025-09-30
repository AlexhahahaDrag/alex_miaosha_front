import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
	postFileData,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PersonalGiftData } from '../config';

const basePersonalGift = '/api/v1/personal-gift';

const PersonalGiftUrl = {
	page: '/page',
	url: '',
	notice: '/notice',
	import: '/import',
};

export function getPersonalGiftPage(
	params: PersonalGiftData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PersonalGiftData>>> {
	let url = baseService.finance + basePersonalGift + PersonalGiftUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPersonalGiftDetail(
	id: number,
): Promise<ResponseBody<PersonalGiftData>> {
	return getDataOne(
		baseService.finance + basePersonalGift + PersonalGiftUrl.url,
		{
			id,
		},
	);
}

export function deletePersonalGift(
	ids: string,
): Promise<ResponseBody<boolean>> {
	return deleteData(
		baseService.finance + basePersonalGift + PersonalGiftUrl.url,
		{
			ids,
		},
	);
}

export function noticePersonalGift(
	id: number,
): Promise<ResponseBody<PersonalGiftData>> {
	return getDataOne(
		baseService.finance + basePersonalGift + PersonalGiftUrl.notice,
		{
			id,
		},
	);
}

export function addOrEditPersonalGift(
	method: string,
	params: PersonalGiftData,
): Promise<ResponseBody<PersonalGiftData>> {
	if ('put' == method) {
		return putData(
			baseService.finance + basePersonalGift + PersonalGiftUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + basePersonalGift + PersonalGiftUrl.url,
			params,
		);
	}
}

export function importPersonalGift(
	file: any,
): Promise<ResponseBody<PersonalGiftData>> {
	return postFileData(
		baseService.finance + basePersonalGift + PersonalGiftUrl.import,
		file,
	);
}
