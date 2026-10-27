import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { useFinanceSummary } from '@/views/selfFinance/financeManager/composables/useFinanceSummary';
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';

vi.mock('@/router', () => ({
	default: {
		push: vi.fn(),
		replace: vi.fn(),
		currentRoute: { value: { path: '/', query: {} } },
	},
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	useRoute: () => ({ path: '/', query: {} }),
}));

vi.mock('@/views/selfFinance/financeManager/api', () => ({
	getBudgetStatus: vi.fn().mockResolvedValue({
		code: '200',
		data: {
			budgetAmount: 2000,
			actualExpense: 500,
			remainingAmount: 1500,
			usagePercent: 25,
			isOverBudget: false,
			categoryNames: ['餐饮', '日常交通'],
			categoryCodes: ['餐饮', '日常交通'],
		},
	}),
}));

describe('Finance Taste-Skill & BudgetDailyGuide Contract Test', () => {
	it('当未配置预算额度或额度为0时，budgetDailyGuide 应返回 null', () => {
		const searchInfo = ref<FinanceManagerData>({});
		const dataSource = ref<FinanceManagerData[]>([]);
		const summaryData = ref<any>({ totalExpense: 0 });

		const { budgetDailyGuide, budgetStatus } = useFinanceSummary(
			searchInfo,
			dataSource,
			summaryData,
		);

		budgetStatus.value = null;
		expect(budgetDailyGuide.value).toBeNull();

		budgetStatus.value = {
			budgetAmount: 0,
			remainingAmount: 0,
			usagePercent: 0,
			isOverBudget: false,
		} as any;
		expect(budgetDailyGuide.value).toBeNull();
	});

	it('当处于当前月份且有预算时，正确计算建议日均与剩余天数', () => {
		const searchInfo = ref<FinanceManagerData>({});
		const dataSource = ref<FinanceManagerData[]>([]);
		const summaryData = ref<any>({ totalExpense: 100 });

		const { budgetDailyGuide, budgetStatus } = useFinanceSummary(
			searchInfo,
			dataSource,
			summaryData,
		);

		budgetStatus.value = {
			budgetAmount: 3000,
			remainingAmount: 1500,
			usagePercent: 50,
			isOverBudget: false,
		} as any;

		const guide = budgetDailyGuide.value;
		expect(guide).not.toBeNull();
		if (guide) {
			expect(guide.isOver).toBe(false);
			expect(guide.remainingDays).toBeGreaterThan(0);
			expect(guide.suggestedDaily).toBeGreaterThan(0);
			expect(guide.label).toContain(`建议日均 ≤ ¥${guide.suggestedDaily}`);
		}
	});

	it('当预算超支时，budgetDailyGuide 标记 isOver 为 true', () => {
		const searchInfo = ref<FinanceManagerData>({});
		const dataSource = ref<FinanceManagerData[]>([]);
		const summaryData = ref<any>({ totalExpense: 3500 });

		const { budgetDailyGuide, budgetStatus } = useFinanceSummary(
			searchInfo,
			dataSource,
			summaryData,
		);

		budgetStatus.value = {
			budgetAmount: 3000,
			remainingAmount: -500,
			usagePercent: 116,
			isOverBudget: true,
		} as any;

		const guide = budgetDailyGuide.value;
		expect(guide).not.toBeNull();
		if (guide) {
			expect(guide.isOver).toBe(true);
			expect(guide.suggestedDaily).toBe(0);
			expect(guide.label).toContain('已超支');
		}
	});
it('主要支出 topExpenseCategories 应默认剔除转账流水，仅汇总纯日常消费分类', () => {
		const searchInfo = ref<FinanceManagerData>({});
		const dataSource = ref<FinanceManagerData[]>([
			{ typeCode: '转账', amount: 188.63, incomeAndExpenses: 'expense' },
			{ typeCode: '内部转账', amount: 430.87, incomeAndExpenses: 'expense' },
			{ typeCode: '美食', amount: 60, incomeAndExpenses: 'expense' },
			{ typeCode: '耳机', amount: 40, incomeAndExpenses: 'expense' },
		]);
		const summaryData = ref<any>({ totalExpense: 100 });

		const { topExpenseCategories } = useFinanceSummary(
			searchInfo,
			dataSource,
			summaryData,
		);

		const categories = topExpenseCategories.value;
		expect(categories.length).toBe(2);
		expect(categories.find((c) => c.name === '转账')).toBeUndefined();
		expect(categories.find((c) => c.name === '内部转账')).toBeUndefined();
		expect(categories[0].name).toBe('美食');
		expect(categories[0].amount).toBe(60);
		expect(categories[0].percent).toBe(60);
		expect(categories[1].name).toBe('耳机');
		expect(categories[1].amount).toBe(40);
		expect(categories[1].percent).toBe(40);
	});

	it('当用户显式查询【转账】时，topExpenseCategories 允许统计转账类别', () => {
		const searchInfo = ref<FinanceManagerData>({ typeCode: '转账' });
		const dataSource = ref<FinanceManagerData[]>([
			{ typeCode: '转账', amount: 500, incomeAndExpenses: 'expense' },
			{ typeCode: '美食', amount: 100, incomeAndExpenses: 'expense' },
		]);
		const summaryData = ref<any>({ totalExpense: 600 });

		const { topExpenseCategories } = useFinanceSummary(
			searchInfo,
			dataSource,
			summaryData,
		);

		const categories = topExpenseCategories.value;
		expect(categories.find((c) => c.name === '转账')).toBeDefined();
		expect(categories[0].name).toBe('转账');
		expect(categories[0].amount).toBe(500);
	});
});
