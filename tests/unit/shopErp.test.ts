import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PAY_WAY_OPTIONS,
	DEFAULT_INCOME_EXPENSE_OPTIONS,
	DEFAULT_VALID_OPTIONS,
	columns as financeColumns,
} from '@/views/finance/shopFinance/config';
import { columns as stockColumns } from '@/views/finance/shopStock/config';
import { columns as batchColumns } from '@/views/finance/shopStockBatch/config';

/**
 * 计算店铺收支结余净额
 */
export function calcFinanceNetBalance(income: number = 0, expense: number = 0): number {
	const net = (Number(income) || 0) - (Number(expense) || 0);
	return Math.round(net * 100) / 100;
}

/**
 * 计算进货批次综合总成本（货品采购总成本 + 差旅杂费）
 */
export function calcBatchTotalCost(cost: number = 0, travelExpense: number = 0): number {
	const total = (Number(cost) || 0) + (Number(travelExpense) || 0);
	return Math.round(total * 100) / 100;
}

/**
 * 计算商品库存单件预计毛利与毛利率
 */
export function calcStockProfitAndMargin(salePrice: number = 0, costPrice: number = 0) {
	const profit = Math.round(((Number(salePrice) || 0) - (Number(costPrice) || 0)) * 100) / 100;
	let marginRate = 0;
	if (salePrice && salePrice > 0) {
		marginRate = Math.round((profit / salePrice) * 10000) / 100; // 百分比，保留2位
	}
	return { profit, marginRate };
}

/**
 * 递归规范化店铺进销存全域大数雪花 ID（string 防精度丢失护城河）
 */
export function normalizeShopErpIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeShopErpIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeShopErpIds(val);
		}
	}
	return result as T;
}

describe('Shop ERP & Finance - 店铺进销存与电商财务纯算法与契约测试', () => {
	describe('店铺财务选项与死锁防回归断言', () => {
		it('DEFAULT_PAY_WAY_OPTIONS 应包含微信、支付宝、现金及其他渠道', () => {
			const codes = DEFAULT_PAY_WAY_OPTIONS.map((o) => o.typeCode);
			expect(codes).toEqual(['wx', 'zfb', 'xj', 'other']);
		});

		it('DEFAULT_INCOME_EXPENSE_OPTIONS 应包含收入与支出', () => {
			expect(DEFAULT_INCOME_EXPENSE_OPTIONS).toEqual([
				{ typeCode: 'income', typeName: '收入' },
				{ typeCode: 'expense', typeName: '支出' },
			]);
		});

		it('DEFAULT_VALID_OPTIONS 具备有效(1)与失效(0)状态', () => {
			expect(DEFAULT_VALID_OPTIONS).toEqual([
				{ typeCode: '1', typeName: '有效' },
				{ typeCode: '0', typeName: '失效' },
			]);
		});

		it('防回归测试：改变 payWay 必须独立于 isValid，不得互相污染覆盖', () => {
			const formState = {
				payWay: 'wx',
				isValid: '1',
				saleAmount: 299,
			};
			// 切换支付方式为支付宝
			formState.payWay = 'zfb';
			expect(formState.payWay).toBe('zfb');
			expect(formState.isValid).toBe('1'); // 坚决不被赋值为 'zfb' 或 2

			// 切换有效状态为失效
			formState.isValid = '0';
			expect(formState.isValid).toBe('0');
			expect(formState.payWay).toBe('zfb'); // 坚决不被重置
		});
	});

	describe('店铺经营核心计算纯函数', () => {
		it('calcFinanceNetBalance 应精准计算收入与支出结余，防御浮点截断', () => {
			expect(calcFinanceNetBalance(1000.5, 300.2)).toBe(700.3);
			expect(calcFinanceNetBalance(200, 500)).toBe(-300);
			expect(calcFinanceNetBalance(0, 0)).toBe(0);
		});

		it('calcBatchTotalCost 应计算货品成本与差旅杂费之和', () => {
			expect(calcBatchTotalCost(5000, 350.5)).toBe(5350.5);
			expect(calcBatchTotalCost(1200, 0)).toBe(1200);
			expect(calcBatchTotalCost(0, 80)).toBe(80);
		});

		it('calcStockProfitAndMargin 应推导单件预计毛利与毛利率', () => {
			// 正常盈利场景：售价 100，进价 60 -> 毛利 40，毛利率 40%
			const profit1 = calcStockProfitAndMargin(100, 60);
			expect(profit1.profit).toBe(40);
			expect(profit1.marginRate).toBe(40);

			// 保本场景：售价 50，进价 50 -> 毛利 0，毛利率 0%
			const profit2 = calcStockProfitAndMargin(50, 50);
			expect(profit2.profit).toBe(0);
			expect(profit2.marginRate).toBe(0);

			// 亏损甩卖场景：售价 80，进价 100 -> 毛利 -20，毛利率 -25%
			const profit3 = calcStockProfitAndMargin(80, 100);
			expect(profit3.profit).toBe(-20);
			expect(profit3.marginRate).toBe(-25);

			// 售价为 0 边界防除零崩溃
			const profitZero = calcStockProfitAndMargin(0, 50);
			expect(profitZero.profit).toBe(-50);
			expect(profitZero.marginRate).toBe(0);
		});
	});

	describe('店铺进销存表格列配置规范', () => {
		it('financeColumns 应包含销售金额、销售件数与支付方式', () => {
			const keys = financeColumns.value.map((col: any) => col.key || col.dataIndex);
			expect(keys).toContain('saleAmount');
			expect(keys).toContain('saleNum');
			expect(keys).toContain('payWay');
			expect(keys).toContain('operation');
		});

		it('stockColumns 应包含成本价、零售价与库存数量', () => {
			const keys = stockColumns.value.map((col: any) => col.key || col.dataIndex);
			expect(keys).toContain('costAmount');
			expect(keys).toContain('saleAmount');
			expect(keys).toContain('saleNum');
			expect(keys).toContain('operation');
		});

		it('batchColumns 应包含批次编码、货品成本与差旅费用', () => {
			const keys = batchColumns.value.map((col: any) => col.key || col.dataIndex);
			expect(keys).toContain('batchCode');
			expect(keys).toContain('cost');
			expect(keys).toContain('travelExpense');
			expect(keys).toContain('operation');
		});
	});

	describe('店铺进销存全域 ID 安全转换 normalizeShopErpIds', () => {
		it('应递归将 cartId, shopId, stockId, batchId, orderId 转为 string', () => {
			const rawErpPayload = {
				id: 198273918273918273n,
				cartId: 101,
				shopId: 202,
				stockId: 303,
				batchId: 404,
				orderId: 505,
				userId: 606,
				attrId: 707,
				totalCost: 1500.5,
				batchName: '2026年秋季首批入库',
				items: [
					{ stockId: 303, num: 50 },
					{ stockId: 304, num: 20 },
				],
			};

			const normalized = normalizeShopErpIds(rawErpPayload);
			expect(normalized.id).toBe('198273918273918273');
			expect(normalized.cartId).toBe('101');
			expect(normalized.shopId).toBe('202');
			expect(normalized.stockId).toBe('303');
			expect(normalized.batchId).toBe('404');
			expect(normalized.orderId).toBe('505');
			expect(normalized.userId).toBe('606');
			expect(normalized.attrId).toBe('707');
			// 非 ID 字段类型维持原样
			expect(normalized.totalCost).toBe(1500.5);
			expect(normalized.batchName).toBe('2026年秋季首批入库');
			// 嵌套数组元素中的 ID 亦被安全处理
			expect(normalized.items[0].stockId).toBe('303');
			expect(normalized.items[1].stockId).toBe('304');
		});
	});
});
