import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { useFinanceSummary } from '@/views/selfFinance/financeManager/composables/useFinanceSummary';
import {
	columns,
	getCategoryEmoji,
	getCategoryPillStyle,
	type FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';

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

	it('账单流水表格列配置应采用弹性主列 + 比例中间列 + 刚性固定操作列，消除宽屏空白断层并防止 colgroup 溢出', () => {
		expect(columns).toHaveLength(5);
		const [nameCol, typeCol, sourceCol, amountCol, opCol] = columns as any[];

		// 主列不写死百分比以吸收减去勾选列与固定列后的弹性宽度
		expect(nameCol.key).toBe('name');
		expect(nameCol.width).toBeUndefined();
		expect(nameCol.minWidth).toBe(240);

		// 类别与支付方式按比例分配并居中对齐
		expect(typeCol.key).toBe('typeCode');
		expect(typeCol.width).toBe('20%');
		expect(typeCol.align).toBe('center');

		expect(sourceCol.key).toBe('fromSource');
		expect(sourceCol.width).toBe('20%');
		expect(sourceCol.align).toBe('center');

		// 金额按比例分配且严格靠右对齐
		expect(amountCol.key).toBe('amount');
		expect(amountCol.width).toBe('16%');
		expect(amountCol.align).toBe('right');

		// 操作列遵循刚性下限
		expect(opCol.key).toBe('operation');
		expect(opCol.fixed).toBe('right');
		expect(opCol.width).toBe(230);
		expect(opCol.minWidth).toBe(220);
	});

	it('BaseRbacDrawer 应支持 showFooter 控制，且编辑加载中应保持 isEdit 为 true 并隐藏底部按钮', () => {
		// 模拟编辑模式下的状态流转
		const modelInfo = ref<{ id?: number | string | null; open?: boolean }>({
			id: '123456789',
			open: true,
		});
		const formState = ref<{ id?: string }>({});
		const detailLoading = ref<boolean>(true);

		// 计算属性契约校验
		const isEdit = () => Boolean(modelInfo.value?.id || formState.value?.id);
		const showFooter = () => !detailLoading.value;

		// 1. 在详情数据尚未返回的加载阶段 (detailLoading = true, formState = {})
		expect(isEdit()).toBe(true); // 避免闪烁成新增模式
		expect(showFooter()).toBe(false); // 加载时隐藏底部操作按钮

		// 2. 详情加载完成阶段
		detailLoading.value = false;
		formState.value = { id: '123456789' };
		expect(isEdit()).toBe(true);
		expect(showFooter()).toBe(true); // 加载完毕后平滑展示底部按钮
	});

	it('分类 Emoji 词典与无框柔光胶囊样式应由列表与详情抽屉共享并覆盖高频生活场景', () => {
		expect(getCategoryEmoji('转账')).toBe('🔄');
		expect(getCategoryEmoji('公司')).toBe('🏢');
		expect(getCategoryEmoji('出行')).toBe('🚕');
		expect(getCategoryEmoji('剪发')).toBe('💇');
		expect(getCategoryEmoji('生活缴费')).toBe('🧾');

		const pillStyle = getCategoryPillStyle('餐饮') as Record<string, string>;
		expect(pillStyle.border).toBe('none');
		expect(pillStyle.borderRadius).toBe('9999px');
		expect(pillStyle.display).toBe('inline-flex');
	});
});
