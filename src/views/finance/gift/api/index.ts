import {
	deleteData,
	getDataOne,
	postData,
	postDownloadFile,
	putData,
	baseService,
} from '@/utils/request';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { CommonPageResult, ResponseBody } from '@/types/api';
// ID 安全护城河实现抽到独立纯模块，由 tests/unit/giftNormalize.test.mts 锁契约
import {
	normalizeGiftIds,
	normalizeGiftResponse,
} from '@/views/finance/gift/api/normalize';
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
	GiftRecordRecommendAmount,
	GiftRelationDistribution,
} from '@/views/finance/gift/config';

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
	);
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
	);
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
	});
}

export function getGiftPersonList(
	params: GiftPersonQuery = {},
): Promise<ResponseBody<GiftPersonInfo[]>> {
	return postData<GiftPersonInfo[]>(
		listUrl(giftApi.person),
		normalizeGiftIds(params),
	);
}

export function getGiftOrgMemberOptions(
	keyword?: string,
): Promise<ResponseBody<GiftPersonInfo[]>> {
	return getDataOne<GiftPersonInfo[]>(
		`${baseUrl(giftApi.person)}/org-member-options`,
		keyword ? { keyword } : {},
	);
}

export function getGiftPersonDetail(
	id: string,
): Promise<ResponseBody<GiftPersonInfo>> {
	return getDataOne<GiftPersonInfo>(baseUrl(giftApi.person), { id });
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
	);
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
	);
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
	);
}

export function getGiftEventTypeOptions(): Promise<
	ResponseBody<GiftEventTypeOptions>
> {
	return getDataOne<GiftEventTypeOptions>(
		`${baseUrl(giftApi.event)}/event-type-options`,
	);
}

export function getGiftRecordRecommendAmount(params: {
	personId?: string | null;
	eventType: string;
	direction?: string | null;
}): Promise<ResponseBody<GiftRecordRecommendAmount>> {
	return getDataOne<GiftRecordRecommendAmount>(
		`${baseUrl(giftApi.event)}/recommend-amount`,
		normalizeGiftIds(params),
	).then(normalizeGiftResponse);
}

export function updateGiftEventTypeOption(
	params: Record<string, unknown>,
): Promise<ResponseBody<boolean>> {
	return putData<boolean>(
		`${baseUrl(giftApi.event)}/event-type-option`,
		normalizeGiftIds(params),
	);
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
	);
}

export function getGiftEventDetail(
	id: string,
): Promise<ResponseBody<GiftEventInfo>> {
	return getDataOne<GiftEventInfo>(baseUrl(giftApi.event), { id });
}

export function addGiftEvent(
	params: GiftEventInfo,
): Promise<ResponseBody<GiftEventInfo>> {
	return postData<GiftEventInfo>(
		baseUrl(giftApi.event),
		normalizeGiftIds(params),
	);
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
	);
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
	return getDataOne<GiftRecordInfo>(baseUrl(giftApi.record), { id });
}

export function addGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<GiftRecordInfo>> {
	return postData<GiftRecordInfo>(
		baseUrl(giftApi.record),
		normalizeGiftIds(params),
	);
}

export function updateGiftRecord(
	params: GiftRecordInfo,
): Promise<ResponseBody<boolean>> {
	return putData<boolean>(baseUrl(giftApi.record), normalizeGiftIds(params));
}

export function deleteGiftRecord(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseUrl(giftApi.record), { ids });
}

/**
 * 礼金记录 Excel 导出：POST /export 返回 Blob（后端 GiftRecordExportTest 已锁
 * Content-Disposition attachment 契约），由调用方触发浏览器下载。
 */
export function exportGiftRecords(
	params: GiftRecordQuery,
): Promise<AxiosResponse<Blob>> {
	return postDownloadFile(
		`${baseUrl(giftApi.record)}/export`,
		normalizeGiftIds(params),
	);
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
	// putData 第三参在实现里作为 query 参数透传，此处仅传 receiveRecordId
	return putData(`${baseUrl(giftApi.record)}/mark-returned`, {}, {
		receiveRecordId,
	} as unknown as AxiosRequestConfig);
}

/** analysis 筛选参数：period 统计粒度（month/year），direction 方向过滤（RECEIVE/GIVE/RETURN） */
export interface GiftAnalysisParams {
	period?: 'month' | 'year';
	direction?: 'RECEIVE' | 'GIVE' | 'RETURN';
}

export function getGiftAnalysisOverview(
	params?: GiftAnalysisParams,
): Promise<ResponseBody<GiftRecordSummary>> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/overview`, {
		direction: params?.direction,
	});
}

export function getGiftAnalysisTrend(
	params?: GiftAnalysisParams,
): Promise<ResponseBody<GiftAmountTrend[]>> {
	return getDataOne(`${baseUrl(giftApi.analysis)}/trend`, {
		period: params?.period,
		direction: params?.direction,
	});
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
