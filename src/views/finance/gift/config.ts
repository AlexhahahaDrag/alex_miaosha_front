export type GiftDirection = 'GIVE' | 'RECEIVE' | 'RETURN';
export type GiftId = string;

export interface GiftPersonInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	bindUserId?: GiftId;
	personName?: string;
	phone?: string;
	relationType?: string;
	remark?: string;
	createTime?: string;
}

export interface GiftPersonBusinessInfo extends GiftPersonInfo {
	totalGiveAmount?: number;
	totalReceiveAmount?: number;
	netAmount?: number;
	latestRecordTime?: string;
	latestEventName?: string;
	latestDirection?: GiftDirection;
	pendingReturnAmount?: number;
}

export interface GiftPersonSummary {
	personCount?: number;
	yearTotalAmount?: number;
	pendingReturnAmount?: number;
}

export interface GiftPersonProfile {
	person?: GiftPersonBusinessInfo;
	records?: GiftRecordInfo[];
}

export interface GiftPersonQuery {
	keyword?: string;
	relationType?: string;
}

export interface GiftEventInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	eventName?: string;
	eventType?: string;
	eventTime?: string;
	hostPersonId?: GiftId;
	remark?: string;
	createTime?: string;
}

export interface GiftEventBusinessInfo extends GiftEventInfo {
	participantCount?: number;
	totalAmount?: number;
	receiveAmount?: number;
	giveAmount?: number;
	eventStatus?: string;
	locationText?: string;
}

export interface GiftEventSummary {
	monthPendingCount?: number;
	totalAmount?: number;
	activePersonCount?: number;
}

export interface GiftEventQuery {
	keyword?: string;
	eventType?: string;
	eventTimeStart?: string;
	eventTimeEnd?: string;
}

export interface GiftRecordInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	eventId?: GiftId;
	giverPersonId?: GiftId;
	receiverPersonId?: GiftId;
	relatedRecordId?: GiftId;
	direction?: GiftDirection;
	amount?: number;
	payTime?: string;
	returnedFlag?: number;
	remark?: string;
	createTime?: string;
	eventName?: string;
	giverPersonName?: string;
	receiverPersonName?: string;
	personName?: string;
	paymentMethod?: string;
	handlerName?: string;
}

export interface GiftRecordSummary {
	receiveAmount?: number;
	giveAmount?: number;
	returnAmount?: number;
	netAmount?: number;
	recordCount?: number;
}

export interface GiftRecordQuery {
	keyword?: string;
	eventId?: GiftId;
	giverPersonId?: GiftId;
	receiverPersonId?: GiftId;
	direction?: GiftDirection;
	returnStatus?: string;
	payTimeStart?: string;
	payTimeEnd?: string;
	amountMin?: number;
	amountMax?: number;
}

export interface GiftAmountTrend {
	label?: string;
	giveAmount?: number;
	receiveAmount?: number;
}

export interface GiftRankingItem {
	name?: string;
	amount?: number;
	count?: number;
}

export interface GiftRelationDistribution {
	relationType?: string;
	count?: number;
}

export const giftDirectionOptions = [
	{ label: '随礼', value: 'GIVE' },
	{ label: '收礼', value: 'RECEIVE' },
	{ label: '回礼', value: 'RETURN' },
];

export const giftRelationOptions = [
	{ label: '亲属', value: 'RELATIVE' },
	{ label: '朋友', value: 'FRIEND' },
	{ label: '同事', value: 'COLLEAGUE' },
	{ label: '邻里', value: 'NEIGHBOR' },
	{ label: '其他', value: 'OTHER' },
];

export const giftEventOptions = [
	{ label: '婚礼', value: 'WEDDING' },
	{ label: '满月', value: 'BIRTH' },
	{ label: '乔迁', value: 'HOUSEWARMING' },
	{ label: '升学', value: 'EDUCATION' },
	{ label: '寿宴', value: 'BIRTHDAY' },
	{ label: '其他', value: 'OTHER' },
];

export function directionLabel(direction?: string) {
	return (
		giftDirectionOptions.find((item) => item.value === direction)?.label || '-'
	);
}

export function directionColor(direction?: string) {
	if (direction === 'RECEIVE') return 'green';
	if (direction === 'RETURN') return 'blue';
	if (direction === 'GIVE') return 'orange';
	return 'default';
}

export function relationLabel(relation?: string) {
	return (
		giftRelationOptions.find((item) => item.value === relation)?.label || '-'
	);
}

export function eventLabel(eventType?: string) {
	return (
		giftEventOptions.find((item) => item.value === eventType)?.label || '-'
	);
}

export function money(value?: number | string) {
	const amount = Number(value || 0);
	return `¥${amount.toFixed(2)}`;
}
