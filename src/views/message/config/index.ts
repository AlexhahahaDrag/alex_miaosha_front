export type MessageType = 'ALL' | 'GIFT_EVENT' | 'GIFT_RETURN' | 'COUPON_EXPIRE' | 'CARD_EXPIRE' | 'SYSTEM';

export type MessageSubType = 'WELCOME' | 'ANNOUNCE' | 'D_DAY' | 'D_MINUS_1' | 'D_MINUS_3' | 'IMBALANCE' | 'EVENT_RETURN';

export type MessagePriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export type MessageBizType =
	| 'SYSTEM'
	| 'GIFT_EVENT'
	| 'GIFT_RETURN'
	| 'COUPON'
	| 'ACCOUNT_RECORD'
	| 'PREPAID_CARD';

export interface SysMessageInfoData {
	id?: string;
	orgId?: string;
	userId?: string;
	msgType?: string;
	subType?: string;
	priority?: MessagePriority | string;
	title?: string;
	content?: string;
	bizId?: string;
	bizType?: MessageBizType | string;
	jumpUrl?: string;
	readStatus?: number;
	readTime?: string;
	dedupKey?: string;
	remindDate?: string;
	createTime?: string;
	keyword?: string;
	onlyUnread?: boolean;
}

export interface SysMessageSummaryData {
	unreadTotal: number;
	systemUnread: number;
	giftEventUnread: number;
	couponExpireUnread: number;
	cardExpireUnread: number;
}

export interface MessageCategoryTab {
	key: MessageType;
	label: string;
	summaryField?: keyof SysMessageSummaryData;
}

export const MESSAGE_CATEGORY_TABS: MessageCategoryTab[] = [
	{ key: 'ALL', label: '全部', summaryField: 'unreadTotal' },
	{ key: 'GIFT_EVENT', label: '礼金事件', summaryField: 'giftEventUnread' },
	{ key: 'COUPON_EXPIRE', label: '消费券到期', summaryField: 'couponExpireUnread' },
	{ key: 'CARD_EXPIRE', label: '猫超/预付卡', summaryField: 'cardExpireUnread' },
	{ key: 'SYSTEM', label: '系统通知', summaryField: 'systemUnread' },
];

export interface MessageTagMeta {
	text: string;
	color: string;
}

/**
 * 解析 PC 端消息卡片标签文案与 Ant Design Tag 颜色
 */
export const resolvePcMessageTagMeta = (item: SysMessageInfoData): MessageTagMeta => {
	if (item.msgType === 'GIFT_RETURN' || item.bizType === 'GIFT_RETURN') {
		return {
			text: item.subType === 'EVENT_RETURN' ? '重大喜事回礼' : '礼金盈余待回',
			color: 'gold',
		};
	}
	if (item.subType === 'D_DAY' || item.priority === 'HIGH') {
		return {
			text: item.msgType === 'GIFT_EVENT' ? '今日举行' : '今日到期',
			color: 'error',
		};
	}
	if (item.subType === 'D_MINUS_1' || item.priority === 'MEDIUM') {
		return {
			text: item.msgType === 'GIFT_EVENT' ? '明日举行' : '明日到期',
			color: 'warning',
		};
	}
	if (item.subType === 'D_MINUS_3') {
		return {
			text: '临期提醒',
			color: 'processing',
		};
	}
	if (item.msgType === 'GIFT_EVENT') {
		return { text: '礼金事件', color: 'orange' };
	}
	if (item.msgType === 'COUPON_EXPIRE') {
		return { text: '消费券', color: 'blue' };
	}
	if (item.msgType === 'CARD_EXPIRE') {
		return { text: '猫超/预付卡', color: 'cyan' };
	}
	return { text: '系统通知', color: 'purple' };
};

/**
 * 解析 PC 端点击消息后的目标跳转路由
 */
export const resolvePcMessageJumpRoute = (item: SysMessageInfoData): string => {
	if (item.bizType === 'GIFT_RETURN' || item.msgType === 'GIFT_RETURN') {
		return '/finance/gift/analysis';
	}
	if (item.bizType === 'ACCOUNT_RECORD') {
		return '/selfFinance/accountRecordInfo';
	}
	if (item.bizType === 'PREPAID_CARD' || item.msgType === 'CARD_EXPIRE') {
		return '/selfFinance/prepaidCardInfoT';
	}
	if (item.bizType === 'GIFT_EVENT' || item.msgType === 'GIFT_EVENT') {
		return '/finance/gift/event';
	}
	if (item.bizType === 'COUPON' || item.msgType === 'COUPON_EXPIRE') {
		return '/cpn-coupon/cpn-coupon-info';
	}
	if (item.jumpUrl && item.jumpUrl.trim()) {
		if (item.jumpUrl.trim() === '/finance/accountRecordInfo') {
			return '/selfFinance/accountRecordInfo';
		}
		return item.jumpUrl.trim();
	}
	return '';
};

const ID_KEY_PATTERN = /(^id$|Id$)/;

/**
 * 递归把所有 id / *Id 字段转为 string，防止 64 位雪花 ID 精度丢失
 */
export function normalizeMessageIds<T>(input: T): T {
	if (input === null || input === undefined) {
		return input;
	}
	if (Array.isArray(input)) {
		return input.map((item) => normalizeMessageIds(item)) as unknown as T;
	}
	if (typeof input === 'object') {
		const copy: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
			if (
				ID_KEY_PATTERN.test(key) &&
				(typeof value === 'number' || typeof value === 'bigint')
			) {
				copy[key] = String(value);
			} else if (value && typeof value === 'object') {
				copy[key] = normalizeMessageIds(value);
			} else {
				copy[key] = value;
			}
		}
		return copy as T;
	}
	return input;
}
