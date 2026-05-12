export type GiftDirection = 'GIVE' | 'RECEIVE' | 'RETURN';

export interface GiftPersonInfo {
	id?: string | number;
	orgId?: string | number;
	userId?: string | number;
	bindUserId?: string | number;
	personName?: string;
	phone?: string;
	relationType?: string;
	remark?: string;
	createTime?: string;
}

export interface GiftPersonQuery {
	keyword?: string;
	relationType?: string;
}

export interface GiftEventInfo {
	id?: string | number;
	orgId?: string | number;
	userId?: string | number;
	eventName?: string;
	eventType?: string;
	eventTime?: string;
	hostPersonId?: string | number;
	remark?: string;
	createTime?: string;
}

export interface GiftEventQuery {
	keyword?: string;
	eventType?: string;
	eventTimeStart?: string;
	eventTimeEnd?: string;
}

export interface GiftRecordInfo {
	id?: string | number;
	orgId?: string | number;
	userId?: string | number;
	eventId?: string | number;
	giverPersonId?: string | number;
	receiverPersonId?: string | number;
	relatedRecordId?: string | number;
	direction?: GiftDirection;
	amount?: number;
	payTime?: string;
	returnedFlag?: number;
	remark?: string;
	createTime?: string;
}

export interface GiftRecordQuery {
	keyword?: string;
	eventId?: string | number;
	giverPersonId?: string | number;
	receiverPersonId?: string | number;
	direction?: GiftDirection;
	returnStatus?: string;
	payTimeStart?: string;
	payTimeEnd?: string;
	amountMin?: number;
	amountMax?: number;
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

export function money(value?: number | string) {
	const amount = Number(value || 0);
	return `￥${amount.toFixed(2)}`;
}
