import { describe, it, expect } from 'vitest';
import {
	toChineseCurrency,
	formatRegistryMoney,
	isLargeAmountRegistry,
	calculateRegistryMetrics,
} from '@/views/finance/gift/event/utils/registryPrint';

describe('礼簿台账打印与排版工具测试 (registryPrint.ts)', () => {
	describe('人民币数字转中文大写汉字算法 (toChineseCurrency)', () => {
		it('处理 0 或空值应返回 零元整', () => {
			expect(toChineseCurrency(0)).toBe('零元整');
			expect(toChineseCurrency('')).toBe('零元整');
			expect(toChineseCurrency(undefined)).toBe('零元整');
		});

		it('整数金额正确转换', () => {
			expect(toChineseCurrency(100)).toBe('壹佰元整');
			expect(toChineseCurrency(600)).toBe('陆佰元整');
			expect(toChineseCurrency(1000)).toBe('壹仟元整');
			expect(toChineseCurrency(2000)).toBe('贰仟元整');
			expect(toChineseCurrency(10000)).toBe('壹万元整');
			expect(toChineseCurrency(66666)).toBe('陆万陆仟陆佰陆拾陆元整');
		});

		it('带有角分小数的金额正确转换', () => {
			expect(toChineseCurrency(1688.88)).toBe('壹仟陆佰捌拾捌元捌角捌分');
			expect(toChineseCurrency(520.5)).toBe('伍佰贰拾元伍角');
			expect(toChineseCurrency(88.08)).toBe('捌拾捌元捌分');
		});
	});

	describe('金额千分位格式化 (formatRegistryMoney)', () => {
		it('正确格式化金额保留2位小数', () => {
			expect(formatRegistryMoney(0)).toBe('0.00');
			expect(formatRegistryMoney(600)).toBe('600.00');
			expect(formatRegistryMoney(10000)).toBe('10,000.00');
			expect(formatRegistryMoney('1234567.89')).toBe('1,234,567.89');
		});
	});

	describe('大额随礼高亮判定 (isLargeAmountRegistry)', () => {
		it('默认阈值 1000 元判定正确', () => {
			expect(isLargeAmountRegistry(500)).toBe(false);
			expect(isLargeAmountRegistry(999.99)).toBe(false);
			expect(isLargeAmountRegistry(1000)).toBe(true);
			expect(isLargeAmountRegistry(2000)).toBe(true);
			expect(isLargeAmountRegistry('5000')).toBe(true);
		});

		it('支持自定义阈值', () => {
			expect(isLargeAmountRegistry(800, 800)).toBe(true);
			expect(isLargeAmountRegistry(800, 2000)).toBe(false);
		});
	});

	describe('礼簿汇总统计计算 (calculateRegistryMetrics)', () => {
		it('空记录列表返回零汇总', () => {
			const res = calculateRegistryMetrics([]);
			expect(res.totalCount).toBe(0);
			expect(res.totalAmount).toBe(0);
			expect(res.totalAmountText).toBe('¥ 0.00');
			expect(res.avgAmountText).toBe('¥ 0.00');
			expect(res.totalChineseAmount).toBe('零元整');
		});

		it('多笔亲友随礼记录正确累加并计算平均值与大写', () => {
			const mockRecords = [
				{ amount: 600 },
				{ amount: '1200' },
				{ amount: 800 },
			];
			const res = calculateRegistryMetrics(mockRecords);
			expect(res.totalCount).toBe(3);
			expect(res.totalAmount).toBe(2600);
			expect(res.totalAmountText).toBe('¥ 2,600.00');
			expect(res.avgAmountText).toBe('¥ 866.67');
			expect(res.totalChineseAmount).toBe('贰仟陆佰元整');
		});
	});
});