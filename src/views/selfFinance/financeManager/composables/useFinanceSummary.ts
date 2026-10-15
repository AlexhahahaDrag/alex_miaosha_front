import { ref, computed, watch, type Ref } from 'vue';
import {
	formatDate,
	formatMonth,
	formatDayjs,
	nowDayjs,
} from '@/utils/dayjs';
import { getBudgetStatus } from '@/views/selfFinance/financeManager/api';
import type {
	FinanceManagerData,
	FinanceManagerParams,
	FinanceSummary,
	FinanceBudgetStatus,
} from '@/views/selfFinance/financeManager/config';

export interface TopExpenseCategoryItem {
	name: string;
	amount: number;
	percent: number;
}

export function useFinanceSummary(
	searchInfo: Ref<FinanceManagerParams>,
	dataSource: Ref<FinanceManagerData[]>,
	summaryData: Ref<FinanceSummary | undefined>,
) {
	const budgetStatus = ref<FinanceBudgetStatus | null>(null);
	const budgetLoading = ref<boolean>(false);
	const isFirstBudgetLoaded = ref<boolean>(false);

	const currentMonthStr = computed(() => {
		const start = searchInfo.value.infoDateStart;
		if (start) {
			return formatMonth(start);
		}
		return nowDayjs().format('YYYY-MM');
	});

	const budgetSpentLabel = computed(() => {
		const dir = (budgetStatus.value as any)?.incomeAndExpenses || 'expense';
		const hasExp = dir.includes('expense');
		const hasInc = dir.includes('income');
		if (hasExp && hasInc) return '已计';
		if (hasInc) return '已入';
		return '已用';
	});

	const budgetDirectionLabel = computed(() => {
		const dir = (budgetStatus.value as any)?.incomeAndExpenses || 'expense';
		const hasExp = dir.includes('expense');
		const hasInc = dir.includes('income');
		if (hasExp && hasInc) return '全部收支';
		if (hasInc) return '全部收入';
		return '全部支出';
	});

	const getBudgetProgressColor = (percent: number): string => {
		if (percent < 0) return '#52c41a';
		if (percent >= 150) return '#cf1322';
		if (percent >= 100) return '#ff4d4f';
		if (percent >= 90) return '#fa541c';
		if (percent >= 75) return '#faad14';
		return '#1677ff';
	};

	const progressStrokeColor = computed(() => {
		const pct = budgetStatus.value?.usagePercent || 0;
		return getBudgetProgressColor(pct);
	});

	const getEffectiveBudgetBelongTo = (): string | undefined => {
		if (searchInfo.value.belongTo) {
			return String(searchInfo.value.belongTo);
		}
		return undefined;
	};

	const loadBudgetStatus = async () => {
		budgetLoading.value = true;
		try {
			const { code, data } = await getBudgetStatus(
				currentMonthStr.value,
				getEffectiveBudgetBelongTo(),
			);
			if (code === '200' && data) {
				budgetStatus.value = data;
			}
		} catch (e) {
			console.warn('获取零花钱预算失败:', e);
		} finally {
			budgetLoading.value = false;
			isFirstBudgetLoaded.value = true;
		}
	};

	watch(
		() => searchInfo.value.belongTo,
		() => {
			loadBudgetStatus();
		},
	);

	// 统计标签标题自适应
	const summaryTitle = computed(() => {
		const start = searchInfo.value.infoDateStart;
		const end = searchInfo.value.infoDateEnd;
		if (start && end) {
			const startStr = formatDate(start);
			const endStr = formatDate(end);
			if (startStr === endStr) {
				return `${startStr} 账单`;
			}
			if (formatMonth(start) === formatMonth(end)) {
				return `${formatDate(start, 'YYYY年M月')} 账单`;
			}
			return `${formatDate(start, 'M/D')} ~ ${formatDate(end, 'M/D')} 统计`;
		}
		if (start) {
			return `自 ${formatDate(start)} 起`;
		}
		if (end) {
			return `至 ${formatDate(end)} 止`;
		}
		return '全量账单统计';
	});

	// 有效统计天数计算（用于日均支出）
	const effectiveDaysInfo = computed(() => {
		const start = searchInfo.value.infoDateStart;
		const end = searchInfo.value.infoDateEnd;
		const today = nowDayjs().startOf('day');

		if (start && end) {
			const startDate = formatDayjs(start).startOf('day');
			const endDate = formatDayjs(end).endOf('day');
			const isCurrentMonth =
				startDate.isSame(today, 'month') && startDate.date() === 1;
			if (isCurrentMonth && !today.isAfter(endDate, 'day')) {
				const passedDays = today.diff(startDate, 'day') + 1;
				return {
					days: Math.max(1, passedDays),
					label: `本月已过 ${passedDays} 天`,
				};
			}
			const diffDays = Math.max(
				1,
				formatDayjs(end).diff(formatDayjs(start), 'day') + 1,
			);
			return { days: diffDays, label: `区间共 ${diffDays} 天` };
		}

		if (start) {
			const startDate = formatDayjs(start).startOf('day');
			const diffDays = Math.max(1, today.diff(startDate, 'day') + 1);
			return { days: diffDays, label: `已过 ${diffDays} 天` };
		}

		if (end) {
			return { days: 30, label: '参考 30 天' };
		}

		const daysThisMonth = today.date();
		return {
			days: Math.max(1, daysThisMonth),
			label: `参考本月已过 ${daysThisMonth} 天`,
		};
	});

	// 日均支出
	const dailyExpenseAvg = computed(() => {
		const totalExp = Number(summaryData.value?.totalExpense) || 0;
		if (totalExp <= 0) return 0;
		const days = effectiveDaysInfo.value.days;
		return Number((totalExp / days).toFixed(2));
	});

	// Top 3 支出分类结构统计
	const topExpenseCategories = computed<TopExpenseCategoryItem[]>(() => {
		const records = dataSource.value || [];
		const expenseMap = new Map<string, number>();
		let totalExpenseInList = 0;

		for (const item of records) {
			const isExpense =
				item.incomeAndExpenses === 'expense' ||
				(!item.incomeAndExpenses && (Number(item.amount) || 0) < 0);
			if (isExpense && item.typeCode) {
				const amt = Math.abs(Number(item.amount) || 0);
				if (amt > 0) {
					expenseMap.set(
						item.typeCode,
						(expenseMap.get(item.typeCode) || 0) + amt,
					);
					totalExpenseInList += amt;
				}
			}
		}

		if (expenseMap.size === 0 || totalExpenseInList <= 0) {
			return [];
		}

		const sorted = Array.from(expenseMap.entries())
			.map(([name, amount]) => ({
				name,
				amount,
				percent: Math.min(
					100,
					Math.round((amount / totalExpenseInList) * 100),
				),
			}))
			.sort((a, b) => b.amount - a.amount);

		return sorted.slice(0, 3);
	});

	return {
		currentMonthStr,
		budgetStatus,
		budgetLoading,
		isFirstBudgetLoaded,
		budgetSpentLabel,
		budgetDirectionLabel,
		progressStrokeColor,
		summaryTitle,
		effectiveDaysInfo,
		dailyExpenseAvg,
		topExpenseCategories,
		getEffectiveBudgetBelongTo,
		loadBudgetStatus,
	};
}
