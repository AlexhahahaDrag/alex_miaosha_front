import {
	deleteData,
	getDataOne,
	postData,
	putData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftEventInfo,
	GiftEventQuery,
	GiftPersonInfo,
	GiftPersonQuery,
	GiftRecordInfo,
	GiftRecordQuery,
} from '@/views/finance/gift/config';

const giftApi = {
	person: '/gift-person-info-t',
	event: '/gift-event-info-t',
	record: '/gift-record-info-t',
};

function pageUrl(base: string) {
	return `${baseService.finance}${base}/page`;
}

function listUrl(base: string) {
	return `${baseService.finance}${base}/list`;
}

function baseUrl(base: string) {
	return `${baseService.finance}${base}`;
}

export function getGiftPersonPage(
	params: GiftPersonQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftPersonInfo>>> {
	return postData(pageUrl(giftApi.person), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});
}

export function getGiftPersonList(
	params: GiftPersonQuery = {},
): Promise<ResponseBody<GiftPersonInfo[]>> {
	return postData(listUrl(giftApi.person), params);
}

export function getGiftPersonDetail(
	id: string | number,
): Promise<ResponseBody<GiftPersonInfo>> {
	return getDataOne(baseUrl(giftApi.person), { id });
}

export function addGiftPerson(
	params: GiftPersonInfo,
): Promise<ResponseBody<GiftPersonInfo>> {
	return postData(baseUrl(giftApi.person), params);
}

export function updateGiftPerson(
	params: GiftPersonInfo,
): Promise<ResponseBody<boolean>> {
	return putData(baseUrl(giftApi.person), params);
}

export function deleteGiftPerson(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.person), { ids });
}

export function getGiftEventPage(
	params: GiftEventQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> {
	return postData(pageUrl(giftApi.event), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});
}

export function getGiftEventList(
	params: GiftEventQuery = {},
): Promise<ResponseBody<GiftEventInfo[]>> {
	return postData(listUrl(giftApi.event), params);
}

export function getGiftEventDetail(
	id: string | number,
): Promise<ResponseBody<GiftEventInfo>> {
	return getDataOne(baseUrl(giftApi.event), { id });
}

export function addGiftEvent(
	params: GiftEventInfo,
): Promise<ResponseBody<GiftEventInfo>> {
	return postData(baseUrl(giftApi.event), params);
}

export function updateGiftEvent(
	params: GiftEventInfo,
): Promise<ResponseBody<boolean>> {
	return putData(baseUrl(giftApi.event), params);
}

export function deleteGiftEvent(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.event), { ids });
}

export function getGiftRecordPage(
	params: GiftRecordQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftRecordInfo>>> {
	return postData(pageUrl(giftApi.record), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});
}

export function getGiftRecordDetail(
	id: string | number,
): Promise<ResponseBody<GiftRecordInfo>> {
	return getDataOne(baseUrl(giftApi.record), { id });
}

export function addGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<GiftRecordInfo>> {
	return postData(baseUrl(giftApi.record), params);
}

export function updateGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<boolean>> {
	return putData(baseUrl(giftApi.record), params);
}

export function deleteGiftRecord(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.record), { ids });
}

export function getPendingReturnAmount(
	receiveRecordId: string | number,
): Promise<ResponseBody<number>> {
	return getDataOne(`${baseUrl(giftApi.record)}/pending-return-amount`, {
		receiveRecordId,
	});
}

export function markGiftReturned(
	receiveRecordId: string | number,
): Promise<ResponseBody<boolean>> {
	return putData(`${baseUrl(giftApi.record)}/mark-returned`, {}, {
		receiveRecordId,
	} as any);
}
