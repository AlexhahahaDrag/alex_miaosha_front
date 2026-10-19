import { describe, expect, it } from 'vitest';
import {
	getExpireStatusColor,
	labelMap,
	columns as couponColumns,
} from '@/views/cpn-coupon/cpn-coupon-info/config';

/**
 * 计算消费券剩余可用比率
 */
export function calcCouponRemainingRatio(
	remainingQuantity?: number,
	totalQuantity?: number
): number {
	if (!totalQuantity || totalQuantity <= 0) return 0;
	if (!remainingQuantity || remainingQuantity <= 0) return 0;
	if (remainingQuantity >= totalQuantity) return 1;
	return Math.round((remainingQuantity / totalQuantity) * 100) / 100;
}

/**
 * 判定消费券是否即将到期（例如剩余天数在 3 天内）
 */
export function isCouponExpiringSoon(expireRangeStatus?: number): boolean {
	// expireRangeStatus: 0: 已过期, 1: 正常, 2: 临期 3 天内
	return expireRangeStatus === 2;
}

/**
 * 递归规范化消费券中心的雪花 ID（string 防精度丢失护城河）
 */
export function normalizeCouponIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeCouponIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeCouponIds(val);
		}
	}
	return result as T;
}

describe('Coupon Center - 消费券核心逻辑与 ID 安全契约', () => {
	describe('到期状态颜色映射 getExpireStatusColor', () => {
		it('应准确映射 0/1/2 对应语义颜色', () => {
			expect(getExpireStatusColor(0)).toBe('red');
			expect(getExpireStatusColor(1)).toBe('green');
			expect(getExpireStatusColor(2)).toBe('orange');
			expect(getExpireStatusColor(undefined)).toBe('default');
			expect(getExpireStatusColor(999)).toBe('default');
		});
	});

	describe('消费券核销余量与临期判定纯函数', () => {
		it('calcCouponRemainingRatio 应正确处理正常、边界与除零情况', () => {
			expect(calcCouponRemainingRatio(50, 100)).toBe(0.5);
			expect(calcCouponRemainingRatio(0, 100)).toBe(0);
			expect(calcCouponRemainingRatio(-5, 100)).toBe(0);
			expect(calcCouponRemainingRatio(100, 0)).toBe(0);
			expect(calcCouponRemainingRatio(120, 100)).toBe(1);
			expect(calcCouponRemainingRatio(1, 3)).toBe(0.33);
		});

		it('isCouponExpiringSoon 仅在 expireRangeStatus=2 时返回 true', () => {
			expect(isCouponExpiringSoon(2)).toBe(true);
			expect(isCouponExpiringSoon(1)).toBe(false);
			expect(isCouponExpiringSoon(0)).toBe(false);
			expect(isCouponExpiringSoon(undefined)).toBe(false);
		});
	});

	describe('消费券中心表格列与字段映射表', () => {
		it('couponColumns 应包含面值、余量与临期状态列', () => {
			const keys = couponColumns.value.map((col: any) => col.key || col.dataIndex);
			expect(keys).toContain('couponName');
			expect(keys).toContain('unitValue');
			expect(keys).toContain('remainingQuantity');
			expect(keys).toContain('expireStatus');
			expect(keys).toContain('operation');
		});

		it('labelMap 应包含发券必填核心字段', () => {
			expect(labelMap.value.couponName.label).toBe('消费券名称');
			expect(labelMap.value.totalQuantity.label).toBe('发行总数量');
			expect(labelMap.value.unitValue.label).toBe('消费券面值');
			expect(labelMap.value.minSpend.label).toBe('最低消费门槛');
		});
	});

	describe('消费券大数雪花 ID 安全转换', () => {
		it('normalizeCouponIds 应转换券卡各类关联 ID 且不污染普通数值', () => {
			const rawCoupon = {
				id: 1789230192830192831n,
				couponId: 987654321987654321n,
				userCouponId: 10086,
				merchantId: 20001,
				orderId: 30002,
				unitValue: 50.0,
				minSpend: 200.0,
				totalQuantity: 1000,
			};
			const res = normalizeCouponIds(rawCoupon);
			expect(res.id).toBe('1789230192830192831');
			expect(res.couponId).toBe('987654321987654321');
			expect(res.userCouponId).toBe('10086');
			expect(res.merchantId).toBe('20001');
			expect(res.orderId).toBe('30002');
			expect(res.unitValue).toBe(50.0);
			expect(res.minSpend).toBe(200.0);
			expect(res.totalQuantity).toBe(1000);
		});
	});
});
