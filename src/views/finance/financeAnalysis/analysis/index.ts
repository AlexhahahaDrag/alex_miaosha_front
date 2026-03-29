import type { FinanceManagerData } from '@/views/finance/financeManager/config';

interface ItemInfo {
	name: string;
	value: number | string;
}

// 分析数据
export interface AnalysisData {
	typeCode?: string;
	typeName?: string;
	incomeAndExpenses?: string;
	amount: number;
	infoDate: string;
	userId?: string;
	username?: string;
	yoyTrend?: string;
	momTrend?: string;
}

// 余额数据
export interface BalanceData {
	/** 总金额环比 */
	momTrend: string;
	/** 总金额同比 */
	yoyTrend: string;
	/** 收入环比 */
	incomeMomTrend?: string;
	/** 收入同比 */
	incomeYoyTrend?: string;
	/** 支出环比 */
	expenseMomTrend?: string;
	/** 支出同比 */
	expenseYoyTrend?: string;
	/** 月总收入 */
	monthIncomeSum?: number;
	/** 月总支出 */
	monthExpenseSum?: number;
	/** 余额列表 */
	list: FinanceManagerData[];
}

// 提示框参数
export interface TooltipParam {
	axisValue: string;
	marker: string;
	value: number;
	seriesName: string;
}

// 日期格式化
const dateFormatter = 'YYYY-MM';

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

export { dateFormatter, tooltip, type ItemInfo };
