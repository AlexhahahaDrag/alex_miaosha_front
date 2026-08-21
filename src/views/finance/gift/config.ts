import type { FileInfo } from '@/views/common/my-upload/config';

export type GiftDirection = 'GIVE' | 'RECEIVE' | 'RETURN';
export type GiftPersonScope = 'CONTACT' | 'ORG_MEMBER' | 'ALL';
export type GiftId = string;

/** 与后端 FileInfoVo 对齐；id 用 string 防 Long 精度丢失 */
export type GiftFileInfo = Omit<FileInfo, 'id'> & { id?: GiftId };

export interface GiftPersonInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	bindUserId?: GiftId;
	personName?: string;
	phone?: string;
	/** 头像 OSS 文件 ID（读写）；清除时传 null 落库 */
	avatar?: GiftId | null;
	/** 只读：后端 OssApi 回填 */
	fileInfoVo?: GiftFileInfo;
	relationType?: string;
	relationOptionId?: string;
	remark?: string;
	createTime?: string;
	relationGrade?: 'CORE' | 'IMPORTANT' | 'NORMAL' | 'WEAK';
}

export interface GiftPersonBusinessInfo extends GiftPersonInfo {
	totalGiveAmount?: number;
	totalReceiveAmount?: number;
	netAmount?: number;
	latestRecordTime?: string;
	latestEventName?: string;
	latestDirection?: GiftDirection;
	pendingReturnAmount?: number;
	relationStatus?: 'ACTIVE' | 'GENERAL' | 'DISTANT';
}

export interface GiftPersonSummary {
	personCount?: number;
	netAmount?: number;
	positiveBalanceSum?: number;
	negativeBalanceSum?: number;
	totalReceiveAmount?: number;
	totalGiveAmount?: number;
	activeCount?: number;
	pendingMaintenanceCount?: number;
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
	personScope?: GiftPersonScope;
	relationGrade?: string;
	relationStatus?: string;
}

export interface GiftEventInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	eventName?: string;
	eventType?: string;
	eventTypeOptionId?: string;
	eventTime?: string;
	hostPersonId?: GiftId;
	hostPersonName?: string;
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
	eventType?: string;
	eventOptionId?: GiftId;
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

export interface GiftPersonRelationOptions {
	presets?: GiftRelationOptionItem[];
	customs?: GiftRelationOptionItem[];
}

export interface GiftRelationOptionItem {
	id: string;
	name: string;
}

/** @deprecated 兼容 Ant Design Select，请使用 GiftRelationOptionItem */
export interface GiftRelationSelectOption {
	label: string;
	value: string;
}

export interface GiftRelationSelectGroup {
	label: string;
	options: GiftRelationSelectOption[];
}

export const giftDirectionOptions = [
	{ label: '随礼', value: 'GIVE' },
	{ label: '收礼', value: 'RECEIVE' },
	{ label: '回礼', value: 'RETURN' },
];

/** 人员范围筛选项：CONTACT=未绑定账号的外部联系人，ORG_MEMBER=已绑定的家庭组成员 */
export const giftPersonScopeOptions: {
	label: string;
	value: GiftPersonScope;
}[] = [
	{ label: '外部联系人', value: 'CONTACT' },
	{ label: '家庭组成员', value: 'ORG_MEMBER' },
];

/** 回礼状态筛选项，值对应记录表 returned_flag（后端按字符串比较） */
export const giftReturnStatusOptions = [
	{ label: '待回礼', value: '0' },
	{ label: '已回礼', value: '1' },
];

export const GIFT_RECORD_PATH = '/finance/gift/record';
export const GIFT_PERSON_PATH = '/finance/gift/person';
export const GIFT_EVENT_PATH = '/finance/gift/event';

export const quickGiftAmounts = [200, 500, 1000, 2000];

/** 接口不可用时的兜底预设 */
export const FALLBACK_GIFT_RELATION_OPTIONS: GiftRelationOptionItem[] = [
	{ id: '9000000000000000001', name: '亲属' },
	{ id: '9000000000000000002', name: '朋友' },
	{ id: '9000000000000000003', name: '同事' },
	{ id: '9000000000000000004', name: '邻里' },
	{ id: '9000000000000000005', name: '其他' },
];

const PRESET_NAME_TO_CODE: Record<string, string> = {
	亲属: 'RELATIVE',
	朋友: 'FRIEND',
	同事: 'COLLEAGUE',
	邻里: 'NEIGHBOR',
	其他: 'OTHER',
};

/** @deprecated 请使用 useGiftRelationOptions().giftRelationOptions */
export const giftRelationOptions: GiftRelationSelectOption[] =
	FALLBACK_GIFT_RELATION_OPTIONS.map((item) => ({
		label: item.name,
		value: PRESET_NAME_TO_CODE[item.name] || item.id,
	}));

/** 表单「自定义关系」选项值，不入库 */
export const RELATION_CUSTOM = 'CUSTOM';

export function toSelectOptions(
	items: GiftRelationOptionItem[] = [],
): GiftRelationSelectOption[] {
	return items.map((item) => ({ label: item.name, value: item.id }));
}

export function toEventTypeSelectOptions(
	items: GiftEventTypeOptionItem[] = [],
): GiftRelationSelectOption[] {
	return items.map((item) => ({
		label: item.name,
		value: EVENT_PRESET_NAME_TO_CODE[item.name] || item.eventCode || item.name,
	}));
}

export function resolvePresetCode(
	presetId: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): string {
	const preset = presets.find((item) => item.id === presetId);
	if (!preset) {
		return presetId;
	}
	return PRESET_NAME_TO_CODE[preset.name] || preset.name;
}

export function buildGiftRelationSelectOptions(
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
	customOptions: GiftRelationOptionItem[] = [],
): GiftRelationSelectGroup[] {
	const groups: GiftRelationSelectGroup[] = [
		{ label: '常用', options: toSelectOptions(presets) },
	];
	if (customOptions.length) {
		groups.push({
			label: '我的',
			options: toSelectOptions(customOptions),
		});
	}
	groups.push({
		label: '其他',
		options: [{ label: '自定义…', value: RELATION_CUSTOM }],
	});
	return groups;
}

export function isPresetRelationType(
	relation?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
) {
	if (!relation) {
		return false;
	}
	return (
		Object.values(PRESET_NAME_TO_CODE).includes(relation) ||
		presets.some((item) => PRESET_NAME_TO_CODE[item.name] === relation)
	);
}

export function findOptionIdByRelationType(
	relationType?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
	customOptions: GiftRelationOptionItem[] = [],
): string | undefined {
	if (!relationType) {
		return undefined;
	}
	const preset = presets.find(
		(item) => PRESET_NAME_TO_CODE[item.name] === relationType,
	);
	if (preset) {
		return preset.id;
	}
	return customOptions.find((item) => item.name === relationType)?.id;
}

/** 列表/详情头像：缩略图优先 */
export function personAvatarSrc(
	person?: Pick<GiftPersonInfo, 'fileInfoVo'> | null,
): string {
	return (
		person?.fileInfoVo?.preThumbnailUrl || person?.fileInfoVo?.preUrl || ''
	);
}

export interface GiftPersonFormState extends GiftPersonInfo {
	relationMode?: string;
	customRelation?: string;
}

export function mapRelationToFormFields(
	data: GiftPersonInfo = {},
	customOptions: GiftRelationOptionItem[] = [],
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): GiftPersonFormState {
	const { relationType, relationOptionId, ...rest } = data;
	if (relationOptionId) {
		return {
			...rest,
			relationType,
			relationOptionId,
			relationMode: relationOptionId,
			customRelation: '',
		};
	}
	if (!relationType) {
		return { ...rest, relationMode: undefined, customRelation: '' };
	}
	const matchedId = findOptionIdByRelationType(
		relationType,
		presets,
		customOptions,
	);
	if (matchedId) {
		return {
			...rest,
			relationType,
			relationOptionId: matchedId,
			relationMode: matchedId,
			customRelation: '',
		};
	}
	return {
		...rest,
		relationType,
		relationMode: RELATION_CUSTOM,
		customRelation: relationType,
	};
}

export function buildRelationTypeForSave(
	form: GiftPersonFormState,
	// 保留形参以兼容既有调用方；改为回传 relationOptionId 后不再需要在此查词典
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): Pick<GiftPersonInfo, 'relationType' | 'relationOptionId'> {
	if (form.relationMode === RELATION_CUSTOM) {
		return { relationType: form.customRelation?.trim() || '' };
	}
	if (!form.relationMode) {
		return {};
	}
	return { relationOptionId: form.relationMode };
}

export interface GiftEventTypeOptionItem {
	id: string;
	name: string;
	eventCode?: string;
	category?: string;
	icon?: string;
	status?: number;
	useCount?: number;
	defaultAmount?: number;
	sortOrder?: number;
}

export interface GiftEventTypeOptions {
	presets?: GiftEventTypeOptionItem[];
	customs?: GiftEventTypeOptionItem[];
}

export interface GiftRecordRecommendAmount {
	averageAmount?: number;
	latestAmount?: number;
	defaultAmount?: number;
	recommendations?: number[];
}

export interface GiftEventFormState extends GiftEventInfo {
	eventTypeMode?: string;
	customEventType?: string;
}

/** 接口不可用时的兜底预设 */
export const FALLBACK_GIFT_EVENT_OPTIONS: GiftEventTypeOptionItem[] = [
	{ id: '9100000000000000001', name: '婚礼', eventCode: 'WEDDING', icon: '💍', category: '婚庆类' },
	{ id: '9100000000000000002', name: '满月', eventCode: 'BIRTH', icon: '👶', category: '家庭类' },
	{ id: '9100000000000000003', name: '乔迁', eventCode: 'HOUSEWARMING', icon: '🏡', category: '家庭类' },
	{ id: '9100000000000000004', name: '升学', eventCode: 'EDUCATION', icon: '🎓', category: '家庭类' },
	{ id: '9100000000000000005', name: '寿宴', eventCode: 'BIRTHDAY', icon: '🎂', category: '家庭类' },
	{ id: '9100000000000000006', name: '其他', eventCode: 'OTHER', icon: '💬', category: '其他' },
];

const EVENT_PRESET_NAME_TO_CODE: Record<string, string> = {
	婚礼: 'WEDDING',
	满月: 'BIRTH',
	乔迁: 'HOUSEWARMING',
	升学: 'EDUCATION',
	寿宴: 'BIRTHDAY',
	生日: 'BIRTHDAY',
	春节: 'SPRING_FESTIVAL',
	中秋: 'MID_AUTUMN',
	端午: 'DRAGON_BOAT',
	白事: 'FUNERAL',
	感谢: 'THANKS',
	拜访: 'VISIT',
	考学: 'STUDY',
	其他: 'OTHER',
};

/** 表单「自定义事由类型」选项值，不入库 */
export const EVENT_TYPE_CUSTOM = 'CUSTOM';

/** @deprecated 请使用 useGiftEventTypeOptions().giftEventTypeOptions */
export const giftEventOptions = FALLBACK_GIFT_EVENT_OPTIONS.map((item) => ({
	label: item.name,
	value: EVENT_PRESET_NAME_TO_CODE[item.name] || item.id,
}));

export function resolveEventPresetCode(
	presetId: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
): string {
	const preset = presets.find((item) => item.id === presetId);
	if (!preset) {
		return presetId;
	}
	return EVENT_PRESET_NAME_TO_CODE[preset.name] || preset.name;
}

export function buildGiftEventTypeSelectOptions(
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
): GiftRelationSelectGroup[] {
	const groups: GiftRelationSelectGroup[] = [
		{ label: '常用', options: toSelectOptions(presets) },
	];
	if (customOptions.length) {
		groups.push({
			label: '家庭组',
			options: toSelectOptions(customOptions),
		});
	}
	groups.push({
		label: '其他',
		options: [{ label: '自定义…', value: EVENT_TYPE_CUSTOM }],
	});
	return groups;
}

export function isPresetEventType(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
) {
	if (!eventType) {
		return false;
	}
	return (
		Object.values(EVENT_PRESET_NAME_TO_CODE).includes(eventType) ||
		presets.some((item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType)
	);
}

export function findEventTypeOptionId(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
): string | undefined {
	if (!eventType) {
		return undefined;
	}
	const preset = presets.find(
		(item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType,
	);
	if (preset) {
		return preset.id;
	}
	return customOptions.find((item) => item.name === eventType)?.id;
}

export function mapEventTypeToFormFields(
	data: GiftEventInfo = {},
	customOptions: GiftEventTypeOptionItem[] = [],
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
): GiftEventFormState {
	const { eventType, eventTypeOptionId, ...rest } = data;
	if (eventTypeOptionId) {
		return {
			...rest,
			eventType,
			eventTypeOptionId,
			eventTypeMode: eventTypeOptionId,
			customEventType: '',
		};
	}
	if (!eventType) {
		return { ...rest, eventTypeMode: undefined, customEventType: '' };
	}
	const matchedId = findEventTypeOptionId(eventType, presets, customOptions);
	if (matchedId) {
		return {
			...rest,
			eventType,
			eventTypeOptionId: matchedId,
			eventTypeMode: matchedId,
			customEventType: '',
		};
	}
	return {
		...rest,
		eventType,
		eventTypeMode: EVENT_TYPE_CUSTOM,
		customEventType: eventType,
	};
}

export function buildEventTypeForSave(
	form: GiftEventFormState,
): Pick<GiftEventInfo, 'eventType' | 'eventTypeOptionId'> {
	if (form.eventTypeMode === EVENT_TYPE_CUSTOM) {
		return { eventType: form.customEventType?.trim() || '' };
	}
	if (!form.eventTypeMode) {
		return {};
	}
	return { eventTypeOptionId: form.eventTypeMode };
}

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

export function relationLabel(
	relation?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
) {
	if (!relation) return '-';
	const preset = presets.find(
		(item) => PRESET_NAME_TO_CODE[item.name] === relation,
	);
	return preset?.name ?? relation;
}

export function eventLabel(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
) {
	if (!eventType) return '-';
	const preset = presets.find(
		(item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType,
	);
	if (preset) {
		return preset.name;
	}
	const custom = customOptions.find((item) => item.name === eventType);
	return custom?.name ?? eventType;
}

export function money(value?: number | string) {
	const amount = Number(value || 0);
	return `¥${amount.toFixed(2)}`;
}
