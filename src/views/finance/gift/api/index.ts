import {
	deleteData,
	getDataOne,
	postData,
	putData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftAmountTrend,
	GiftEventBusinessInfo,
	GiftEventInfo,
	GiftEventQuery,
	GiftEventSummary,
	GiftEventTypeOptions,
	GiftPersonBusinessInfo,
	GiftPersonInfo,
	GiftPersonProfile,
	GiftPersonQuery,
	GiftPersonRelationOptions,
	GiftPersonSummary,
	GiftRankingItem,
	GiftRecordInfo,
	GiftRecordQuery,
	GiftRecordSummary,
	GiftRelationDistribution,
} from '@/views/finance/gift/config';

const giftIdKeys = new Set(['id', 'creator', 'updater', 'operator', 'deleter']);

const giftApi = {
	person: '/gift-person-info-t',
	event: '/gift-event-info-t',
	record: '/gift-record-info-t',
	analysis: '/gift-analysis',
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

function shouldNormalizeGiftId(key: string) {
	return giftIdKeys.has(key) || key.endsWith('Id');
}

function normalizeGiftIds<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((item) => normalizeGiftIds(item)) as T;
	}
	if (!value || typeof value !== 'object') {
		return value;
	}
	const source = value as Record<string, unknown>;
	const normalized: Record<string, unknown> = {};
	Object.keys(source).forEach((key) => {
		const item = source[key];
		if (
			shouldNormalizeGiftId(key) &&
			(typeof item === 'number' || typeof item === 'bigint')
		) {
			normalized[key] = String(item);
			return;
		}
		normalized[key] = normalizeGiftIds(item);
	});
	return normalized as T;
}

function normalizeGiftResponse<T>(response: ResponseBody<T>): ResponseBody<T> {
	if (!response.data) {
		return response;
	}
	return {
		...response,
		data: normalizeGiftIds(response.data),
	};
}

export function getGiftPersonPage(
	params: GiftPersonQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftPersonInfo>>> {
	return postData<CommonPageResult<GiftPersonInfo>>(
		pageUrl(giftApi.person),
		normalizeGiftIds(params),
		{
			pageNum: pageNum || 1,
			pageSize: pageSize || 10,
		},
	).then(normalizeGiftResponse);
}

export function getGiftPersonBusinessPage(
	params: GiftPersonQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftPersonBusinessInfo>>> {
	return postData<CommonPageResult<GiftPersonBusinessInfo>>(
		`${baseUrl(giftApi.person)}/business-page`,
		normalizeGiftIds(params),
		{
			pageNum: pageNum || 1,
			pageSize: pageSize || 10,
		},
	).then(normalizeGiftResponse);
}

export function getGiftPersonSummary(): Promise<
	ResponseBody<GiftPersonSummary>
> {
	return getDataOne(`${baseUrl(giftApi.person)}/summary`);
}

export function getGiftPersonProfile(
	id: string,
): Promise<ResponseBody<GiftPersonProfile>> {
	return getDataOne<GiftPersonProfile>(`${baseUrl(giftApi.person)}/profile`, {
		id,
	}).then(normalizeGiftResponse);
}

export function getGiftPersonList(
	params: GiftPersonQuery = {},
): Promise<ResponseBody<GiftPersonInfo[]>> {
	return postData<GiftPersonInfo[]>(
		listUrl(giftApi.person),
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function getGiftPersonDetail(
	id: string,
): Promise<ResponseBody<GiftPersonInfo>> {
	return getDataOne<GiftPersonInfo>(baseUrl(giftApi.person), { id }).then(
		normalizeGiftResponse,
	);
}

export function getGiftPersonRelationOptions(
	personId?: string,
): Promise<ResponseBody<GiftPersonRelationOptions>> {
	return getDataOne<GiftPersonRelationOptions>(
		`${baseUrl(giftApi.person)}/relation-options`,
		personId ? { personId } : {},
	);
}

export function addGiftPerson(
	params: GiftPersonInfo,
): Promise<ResponseBody<GiftPersonInfo>> {
	return postData<GiftPersonInfo>(
		baseUrl(giftApi.person),
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function updateGiftPerson(
	params: GiftPersonInfo,
): Promise<ResponseBody<boolean>> {
	return putData<boolean>(baseUrl(giftApi.person), normalizeGiftIds(params));
}

export function deleteGiftPerson(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.person), { ids });
}

export function getGiftEventPage(
	params: GiftEventQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> {
	return postData<CommonPageResult<GiftEventInfo>>(
		pageUrl(giftApi.event),
		normalizeGiftIds(params),
		{
			pageNum: pageNum || 1,
			pageSize: pageSize || 10,
		},
	).then(normalizeGiftResponse);
}

export function getGiftEventBusinessPage(
	params: GiftEventQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftEventBusinessInfo>>> {
	return postData<CommonPageResult<GiftEventBusinessInfo>>(
		`${baseUrl(giftApi.event)}/business-page`,
		normalizeGiftIds(params),
		{
			pageNum: pageNum || 1,
			pageSize: pageSize || 10,
		},
	).then(normalizeGiftResponse);
}

export function getGiftEventTypeOptions(): Promise<
	ResponseBody<GiftEventTypeOptions>
> {
	return getDataOne<GiftEventTypeOptions>(
		`${baseUrl(giftApi.event)}/event-type-options`,
	).then(normalizeGiftResponse);
}

export function getGiftEventSummary(): Promise<ResponseBody<GiftEventSummary>> {
	return getDataOne(`${baseUrl(giftApi.event)}/summary`);
}

export function getGiftEventList(
	params: GiftEventQuery = {},
): Promise<ResponseBody<GiftEventInfo[]>> {
	return postData<GiftEventInfo[]>(
		listUrl(giftApi.event),
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function getGiftEventDetail(
	id: string,
): Promise<ResponseBody<GiftEventInfo>> {
	return getDataOne<GiftEventInfo>(baseUrl(giftApi.event), { id }).then(
		normalizeGiftResponse,
	);
}

export function addGiftEvent(
	params: GiftEventInfo,
): Promise<ResponseBody<GiftEventInfo>> {
	return postData<GiftEventInfo>(
		baseUrl(giftApi.event),
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function updateGiftEvent(
	params: GiftEventInfo,
): Promise<ResponseBody<boolean>> {
	return putData<boolean>(baseUrl(giftApi.event), normalizeGiftIds(params));
}

export function deleteGiftEvent(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.event), { ids });
}

export function getGiftRecordPage(
	params: GiftRecordQuery,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<GiftRecordInfo>>> {
	return postData<CommonPageResult<GiftRecordInfo>>(
		pageUrl(giftApi.record),
		normalizeGiftIds(params),
		{
			pageNum: pageNum || 1,
			pageSize: pageSize || 10,
		},
	).then(normalizeGiftResponse);
}

export function getGiftRecordSummary(
	params: GiftRecordQuery,
): Promise<ResponseBody<GiftRecordSummary>> {
	return postData<GiftRecordSummary>(
		`${baseUrl(giftApi.record)}/summary`,
		normalizeGiftIds(params),
	);
}

export function getGiftRecordDetail(
	id: string,
): Promise<ResponseBody<GiftRecordInfo>> {
	return getDataOne<GiftRecordInfo>(baseUrl(giftApi.record), { id }).then(
		normalizeGiftResponse,
	);
}

export function addGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<GiftRecordInfo>> {
	return postData<GiftRecordInfo>(
		baseUrl(giftApi.record),
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function updateGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<boolean>> {
	return putData<boolean>(baseUrl(giftApi.record), normalizeGiftIds(params));
}

export function deleteGiftRecord(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.record), { ids });
}

export function getPendingReturnAmount(
	receiveRecordId: string,
): Promise<ResponseBody<number>> {
	return getDataOne(`${baseUrl(giftApi.record)}/pending-return-amount`, {
		receiveRecordId,
	});
}

export function markGiftReturned(
	receiveRecordId: string,
): Promise<ResponseBody<boolean>> {
	return putData(`${baseUrl(giftApi.record)}/mark-returned`, {}, {
		receiveRecordId,
	} as any);
}

export function getGiftAnalysisOverview(): Promise<
	ResponseBody<GiftRecordSummary>
> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/overview`);
}

export function getGiftAnalysisTrend(): Promise<
	ResponseBody<GiftAmountTrend[]>
> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/trend`);
}

export function getGiftAnalysisRelationDistribution(): Promise<
	ResponseBody<GiftRelationDistribution[]>
> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/relation-distribution`);
}

export function getGiftAnalysisEventRanking(): Promise<
	ResponseBody<GiftRankingItem[]>
> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/event-ranking`);
}

export function getGiftAnalysisPersonRanking(): Promise<
	ResponseBody<GiftRankingItem[]>
> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/person-ranking`);
}
