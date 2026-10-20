import { describe, expect, it } from 'vitest';
import {
	MESSAGE_CATEGORY_TABS,
	normalizeMessageIds,
	resolvePcMessageJumpRoute,
	resolvePcMessageTagMeta,
} from '@/views/message/config';

describe('PC Message Center Config & ID Safety', () => {
	it('normalizeMessageIds 应递归将所有 id / *Id 转为 string', () => {
		const raw = {
			id: 1928301928,
			userId: 1001,
			orgId: 2001,
			bizId: 5001,
			title: '消费券到期提醒',
		};
		const normalized = normalizeMessageIds(raw);
		expect(normalized.id).toBe('1928301928');
		expect(normalized.userId).toBe('1001');
		expect(normalized.orgId).toBe('2001');
		expect(normalized.bizId).toBe('5001');
	});

	it('resolvePcMessageTagMeta 应根据 subType 与 msgType 返回对应 Tag 配置', () => {
		expect(resolvePcMessageTagMeta({ msgType: 'GIFT_EVENT', subType: 'D_DAY' })).toEqual({
			text: '今日举行',
			color: 'error',
		});
		expect(resolvePcMessageTagMeta({ msgType: 'COUPON_EXPIRE', subType: 'D_MINUS_1' })).toEqual({
			text: '明日到期',
			color: 'warning',
		});
		expect(resolvePcMessageTagMeta({ msgType: 'CARD_EXPIRE', subType: 'D_MINUS_3' })).toEqual({
			text: '临期提醒',
			color: 'processing',
		});
		expect(resolvePcMessageTagMeta({ msgType: 'SYSTEM', subType: 'WELCOME' })).toEqual({
			text: '系统通知',
			color: 'purple',
		});
	});

	it('resolvePcMessageJumpRoute 应准确解析 PC 端业务跳转路由', () => {
		expect(resolvePcMessageJumpRoute({ msgType: 'GIFT_EVENT', bizType: 'GIFT_EVENT' })).toBe(
			'/finance/gift/event',
		);
		expect(resolvePcMessageJumpRoute({ msgType: 'COUPON_EXPIRE', bizType: 'COUPON' })).toBe(
			'/cpn-coupon/cpn-coupon-info',
		);
		expect(resolvePcMessageJumpRoute({ msgType: 'GIFT_RETURN', bizType: 'GIFT_RETURN' })).toBe(
			'/finance/gift/analysis',
		);
		expect(resolvePcMessageJumpRoute({ msgType: 'CARD_EXPIRE', bizType: 'ACCOUNT_RECORD' })).toBe(
			'/selfFinance/accountRecordInfo',
		);
		expect(resolvePcMessageJumpRoute({ msgType: 'CARD_EXPIRE', bizType: 'PREPAID_CARD' })).toBe(
			'/selfFinance/prepaidCardInfoT',
		);
		expect(resolvePcMessageJumpRoute({ msgType: 'SYSTEM', bizType: 'SYSTEM' })).toBe('');
		expect(resolvePcMessageJumpRoute({ msgType: 'BUDGET', bizType: 'BUDGET' })).toBe(
			'/finance/financeManager',
		);
	});

	it('resolvePcMessageTagMeta 应正确解析零花钱预算超支与预警 Tag', () => {
		expect(resolvePcMessageTagMeta({ msgType: 'BUDGET', subType: 'BUDGET_OVER' })).toEqual({
			text: '预算超支',
			color: 'error',
		});
		expect(resolvePcMessageTagMeta({ msgType: 'BUDGET', subType: 'BUDGET_WARN' })).toEqual({
			text: '预算预警',
			color: 'warning',
		});
	});

	it('MESSAGE_CATEGORY_TABS 应包含 5 个核心分类', () => {
		expect(MESSAGE_CATEGORY_TABS.length).toBe(5);
	});
});
