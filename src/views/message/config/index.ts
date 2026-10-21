export type MessageType = 'ALL' | 'GIFT_EVENT' | 'GIFT_RETURN' | 'BUDGET' | 'COUPON_EXPIRE' | 'CARD_EXPIRE' | 'SYSTEM';

export type MessageSubType = 'WELCOME' | 'ANNOUNCE' | 'D_DAY' | 'D_MINUS_1' | 'D_MINUS_3' | 'IMBALANCE' | 'EVENT_RETURN' | 'BUDGET_OVER' | 'BUDGET_WARN';

export type MessagePriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export type MessageBizType =
	| 'SYSTEM'
	| 'GIFT_EVENT'
	| 'GIFT_RETURN'
	| 'BUDGET'
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
	if (item.msgType === 'BUDGET' || item.bizType === 'BUDGET') {
		return {
			text: item.subType === 'BUDGET_OVER' ? '预算超支' : '预算预警',
			color: item.subType === 'BUDGET_OVER' ? 'error' : 'warning',
		};
	}
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
	if (item.bizType === 'BUDGET' || item.msgType === 'BUDGET') {
		return '/finance/financeManager';
	}
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

export interface UserNoticeConfigData {
	id?: string;
	userId?: string;
	noticeCode: string;
	noticeName?: string;
	noticeDesc?: string;
	internalEnabled: boolean;
	wechatEnabled: boolean;
}

export interface NoticeBizMeta {
	code: string;
	icon: string;
	badgeClass: string;
	color: string;
}

export const NOTICE_BIZ_META_MAP: Record<string, NoticeBizMeta> = {
	GLOBAL: { code: 'GLOBAL', icon: '⚡', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', color: 'blue' },
	GIFT_EVENT: { code: 'GIFT_EVENT', icon: '🎁', badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300', color: 'orange' },
	GIFT_RETURN: { code: 'GIFT_RETURN', icon: '🧧', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', color: 'red' },
	COUPON: { code: 'COUPON', icon: '🎟️', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', color: 'amber' },
	PREPAID_CARD: { code: 'PREPAID_CARD', icon: '💳', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', color: 'green' },
	BUDGET_OVER: { code: 'BUDGET_OVER', icon: '⚠️', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', color: 'rose' },
	FINANCE_REPORT: { code: 'FINANCE_REPORT', icon: '📊', badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', color: 'indigo' },
	SYSTEM: { code: 'SYSTEM', icon: '🔔', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', color: 'slate' },
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
