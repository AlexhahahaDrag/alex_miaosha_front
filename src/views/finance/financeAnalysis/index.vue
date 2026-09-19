<template>
	<div class="finance-analysis-page">
		<!-- 1. 顶部检索卡片 -->
		<div class="search-card">
			<div class="search-row">
				<div class="search-left">
					<span class="search-label">统计月份:</span>
					<a-date-picker
						v-model:value="searchDateTime"
						picker="month"
						:locale="locale"
						:allow-clear="false"
						@change="changeMonth"
					/>
					<a-button size="small" @click="selectPrevMonth">上月</a-button>
					<a-button size="small" type="primary" ghost @click="selectCurrentMonth">本月</a-button>

					<a-divider type="vertical" style="margin: 0 16px" />

					<span class="search-label">归属成员:</span>
					<a-select
						class="search-user-select"
						v-model:value="searchUser"
						:field-names="{ label: 'nickName', value: 'id' }"
						:options="userList"
						placeholder="请选择用户"
						@change="changeMonth"
					/>
				</div>

				<div class="search-right">
					<a-button :loading="loading" @click="getInfo">
						<template #icon><reload-outlined /></template>
						刷新分析
					</a-button>
				</div>
			</div>
		</div>

		<!-- 2. 核心 KPI 4 列卡片 -->
		<div class="kpi-grid">
			<!-- 卡片 1: 总资产净值 -->
			<div class="kpi-card card-asset">
				<div class="kpi-card-inner">
					<div class="kpi-header">
						<span class="kpi-title">总资产净值</span>
						<span class="kpi-badge badge-blue">资产全景</span>
					</div>
					<div class="kpi-amount text-blue">
						<span class="currency-symbol">¥</span>{{ formatAmount(sumAmount) }}
					</div>
					<div class="kpi-footer">
						<span :class="['trend-pill', getTrendClass(yoyTrend)]">
							{{ formatTrend(yoyTrend, '同比') }}
						</span>
						<span :class="['trend-pill', getTrendClass(momTrend)]">
							{{ formatTrend(momTrend, '环比') }}
						</span>
					</div>
				</div>
			</div>

			<!-- 卡片 2: 本月总收入 -->
			<div class="kpi-card card-income">
				<div class="kpi-card-inner">
					<div class="kpi-header">
						<span class="kpi-title">本月总收入</span>
						<span class="kpi-badge badge-green">资金流入</span>
					</div>
					<div class="kpi-amount text-green">
						<span class="currency-symbol">¥</span>{{ formatAmount(monthIncomeSum) }}
					</div>
					<div class="kpi-footer">
						<span :class="['trend-pill', getTrendClass(incomeYoyTrend)]">
							{{ formatTrend(incomeYoyTrend, '同比') }}
						</span>
						<span :class="['trend-pill', getTrendClass(incomeMomTrend)]">
							{{ formatTrend(incomeMomTrend, '环比') }}
						</span>
					</div>
				</div>
			</div>

			<!-- 卡片 3: 本月总支出 -->
			<div class="kpi-card card-expense">
				<div class="kpi-card-inner">
					<div class="kpi-header">
						<span class="kpi-title">本月总消费</span>
						<span class="kpi-badge badge-orange">资金流出</span>
					</div>
					<div class="kpi-amount text-orange">
						<span class="currency-symbol">¥</span>{{ formatAmount(monthExpenseSum) }}
					</div>
					<div class="kpi-footer">
						<span :class="['trend-pill', getTrendClass(expenseYoyTrend)]">
							{{ formatTrend(expenseYoyTrend, '同比') }}
						</span>
						<span :class="['trend-pill', getTrendClass(expenseMomTrend)]">
							{{ formatTrend(expenseMomTrend, '环比') }}
						</span>
					</div>
				</div>
			</div>

			<!-- 卡片 4: 本月结余与储蓄率 -->
			<div class="kpi-card card-balance">
				<div class="kpi-card-inner">
					<div class="kpi-header">
						<span class="kpi-title">当月净结余</span>
						<span class="kpi-badge badge-purple">财务结余</span>
					</div>
					<div class="kpi-amount" :class="monthBalanceNumber >= 0 ? 'text-purple' : 'text-danger'">
						<span class="currency-symbol">¥</span>{{ formatAmount(monthBalance) }}
					</div>
					<div class="kpi-footer">
						<span class="sub-label">当月储蓄率:</span>
						<span class="savings-rate-tag" :class="savingsRateClass">
							{{ savingsRateText }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 3. 资产与账户明细看板 (4 列) -->
		<div class="account-grid">
			<div v-for="(config, index) in listConfigs" :key="index" class="account-card">
				<div class="account-card-header">
					<div class="header-left">
						<span class="account-icon">{{ config.icon }}</span>
						<span class="account-title">{{ config.title }}</span>
					</div>
					<div class="header-right">
						<span class="subtotal-label">小计:</span>
						<span class="subtotal-value">¥{{ formatAmount(config.subtotal) }}</span>
					</div>
				</div>
				<div class="account-list">
					<div
						v-for="(item, itemIndex) in config.list"
						:key="itemIndex"
						class="account-item"
					>
						<span class="item-name">{{ item.typeName }}</span>
						<span
							class="item-value"
							:class="Number(item.amount || 0) < 0 ? 'text-danger' : config.valueClass"
						>
							¥{{ formatAmount(item.amount || 0) }}
						</span>
					</div>
					<div v-if="!config.list || config.list.length === 0" class="empty-items">
						暂无账户数据
					</div>
				</div>
			</div>
		</div>

		<!-- 4. 收支占比分析 (环形图) -->
		<a-row :gutter="16" class="chart-row">
			<a-col :span="12">
				<div class="chart-card">
					<pie-chart
						title="当月收入结构"
						height="100%"
						width="100%"
						:data="pieIncomeData"
					/>
				</div>
			</a-col>
			<a-col :span="12">
				<div class="chart-card">
					<pie-chart
						title="当月支出结构"
						height="100%"
						width="100%"
						:data="pieExpenseData"
					/>
				</div>
			</a-col>
		</a-row>

		<!-- 5. 走势柱状图分析 (收入 vs 支出 双柱对比) -->
		<a-row :gutter="16" class="chart-row">
			<a-col :span="12">
				<div class="chart-card">
					<bar-chart
						height="100%"
						width="100%"
						title="日度收支对比"
						:income-data="dayIncomeData"
						:expense-data="dayExpenseData"
						:config="dayConfig"
					/>
				</div>
			</a-col>
			<a-col :span="12">
				<div class="chart-card">
					<bar-chart
						height="100%"
						width="100%"
						title="月度收支对比"
						:income-data="monthIncomeData"
						:expense-data="monthExpenseData"
						:config="monthConfig"
					/>
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import type { FinanceManagerData } from '@/views/finance/financeManager/config';
import type {
	AnalysisData,
	TooltipParam,
} from '@/views/finance/financeAnalysis/analysis';
import * as math from 'mathjs';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from './chart/bar';
import {
	dateFormatter,
	type ItemInfo,
} from '@/views/finance/financeAnalysis/analysis';
import {
	getBalance,
	getIncomeAndExpense,
	getDayExpense,
	getMonthExpense,
} from '@/views/finance/financeAnalysis/api';
import { useUserStore } from '@/store/modules/user/user';
import { useUserInfo } from '@/composables/useUserInfo';
import PieChart from './chart/pieChart.vue';
import BarChart from './chart/barChart.vue';

const loading = ref(false);

// 用户信息
const userInfo = useUserStore()?.getUserInfo;

// 用户列表
const { userList } = useUserInfo();
userList.value = [{ id: '0', nickName: '所有人' }];

// 余额列表
const balanceList = ref<FinanceManagerData[]>([]);

// 同比 / 环比
const yoyTrend = ref<string>('');
const momTrend = ref<string>('');
const expenseYoyTrend = ref<string>('');
const expenseMomTrend = ref<string>('');
const incomeYoyTrend = ref<string>('');
const incomeMomTrend = ref<string>('');

// 月消费总金额 / 月收入总金额
const monthExpenseSum = ref<math.BigNumber>(math.bignumber(0));
const monthIncomeSum = ref<math.BigNumber>(math.bignumber(0));

// 趋势样式
const getTrendClass = (trend?: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) {
		return 'trend-stable';
	}
	return trend.startsWith('+') ? 'trend-up' : 'trend-down';
};

const formatTrend = (trend: string | undefined, defaultPrefix: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) {
		return `${defaultPrefix} -`;
	}
	const isUp = trend.startsWith('+');
	const isDown = trend.startsWith('-');
	const arrow = isUp ? '↑' : isDown ? '↓' : '';
	return `${defaultPrefix} ${trend} ${arrow}`.trim();
};

const formatAmount = (val: math.BigNumber | number | string | undefined | null) => {
	if (val === undefined || val === null) return '0.00';
	let num: number;
	if (typeof val === 'number') {
		num = val;
	} else if (typeof val === 'string') {
		num = Number(val) || 0;
	} else {
		num = Number(math.format(val, { notation: 'fixed', precision: 2 })) || 0;
	}
	return num.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

// 总资产金额
const sumAmount = computed(() => {
	return (
		balanceList.value?.reduce(
			(acc: math.BigNumber, item: FinanceManagerData) => {
				return math.add(acc, math.bignumber(item.amount ? item.amount : 0));
			},
			math.bignumber(0),
		) || math.bignumber(0)
	);
});

// 当月结余
const monthBalance = computed(() => {
	return math.subtract(
		monthIncomeSum.value || math.bignumber(0),
		monthExpenseSum.value || math.bignumber(0),
	);
});

const monthBalanceNumber = computed(() => {
	return Number(
		math.format(monthBalance.value, { notation: 'fixed', precision: 2 }),
	);
});

// 当月储蓄率
const savingsRateText = computed(() => {
	const income = Number(
		math.format(monthIncomeSum.value || math.bignumber(0), {
			notation: 'fixed',
			precision: 2,
		}),
	);
	const expense = Number(
		math.format(monthExpenseSum.value || math.bignumber(0), {
			notation: 'fixed',
			precision: 2,
		}),
	);
	if (income <= 0) {
		return '0.0%';
	}
	const rate = ((income - expense) / income) * 100;
	return `${rate.toFixed(1)}%`;
});

const savingsRateClass = computed(() => {
	const income = Number(
		math.format(monthIncomeSum.value || math.bignumber(0), {
			notation: 'fixed',
			precision: 2,
		}),
	);
	const expense = Number(
		math.format(monthExpenseSum.value || math.bignumber(0), {
			notation: 'fixed',
			precision: 2,
		}),
	);
	if (income <= 0) return 'text-muted';
	const rate = ((income - expense) / income) * 100;
	if (rate >= 50) return 'text-green';
	if (rate >= 0) return 'text-blue';
	return 'text-danger';
});

const searchUser = ref<number>(userInfo?.id || 0);
const searchDateTime = ref<Dayjs>(dayjs());

const selectPrevMonth = () => {
	searchDateTime.value = searchDateTime.value.subtract(1, 'month');
	getInfo();
};

const selectCurrentMonth = () => {
	searchDateTime.value = dayjs();
	getInfo();
};

// 获取余额明细列表数据
const getBalanceDetailData = (
	data: FinanceManagerData[],
	keywords: string[],
): FinanceManagerData[] => {
	if (!data?.length) {
		return [];
	}
	return (
		data.filter(
			(item: FinanceManagerData) =>
				item?.typeCode &&
				keywords.some(
					(k: string) => item?.typeCode && item?.typeCode.indexOf(k) > -1,
				),
		) || []
	);
};

const calculateSubtotal = (list: FinanceManagerData[]): number => {
	if (!list?.length) return 0;
	return list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
};

// 资产卡片配置
const listConfigs = computed(() => {
	const liquidList =
		getBalanceDetailData(balanceList.value, ['yhk', 'wx', 'zfb', 'xj', 'jd']) || [];
	const creditList =
		getBalanceDetailData(balanceList.value, ['hb', 'bt']) || [];
	const utilityList =
		getBalanceDetailData(balanceList.value, ['sf', 'rqf', 'dfw', 'dfm']) || [];
	const phoneList =
		getBalanceDetailData(balanceList.value, ['hf']) || [];

	return [
		{
			title: '流动资金 / 电子账户',
			icon: '💰',
			list: liquidList,
			subtotal: calculateSubtotal(liquidList),
			valueClass: 'text-dark',
		},
		{
			title: '信用与负债',
			icon: '💳',
			list: creditList,
			subtotal: calculateSubtotal(creditList),
			valueClass: 'text-dark',
		},
		{
			title: '生活缴费',
			icon: '⚡',
			list: utilityList,
			subtotal: calculateSubtotal(utilityList),
			valueClass: 'text-dark',
		},
		{
			title: '通讯缴费',
			icon: '📱',
			list: phoneList,
			subtotal: calculateSubtotal(phoneList),
			valueClass: 'text-dark',
		},
	];
});

// 支出分析数据 / 收入分析数据
const pieExpenseData = ref<ItemInfo[]>([]);
const pieIncomeData = ref<ItemInfo[]>([]);

// 获取余额信息
const getBalanceInfo = async (
	userid: number | string | null,
	dateStr: string,
) => {
	const belongTo =
		userid === '0' || userid === 0 || userid === null || userid === undefined
			? null
			: Number(userid);
	const {
		code,
		data,
		message: messageInfo,
	} = await getBalance(belongTo, dateStr);
	if (code === '200') {
		balanceList.value = data?.list || [];
		yoyTrend.value = data?.yoyTrend || '';
		momTrend.value = data?.momTrend || '';

		incomeYoyTrend.value = (data as any)?.incomeYoyTrend || '';
		incomeMomTrend.value = (data as any)?.incomeMomTrend || '';
		expenseYoyTrend.value = (data as any)?.expenseYoyTrend || '';
		expenseMomTrend.value = (data as any)?.expenseMomTrend || '';

		if ((data as any)?.monthIncomeSum !== undefined) {
			monthIncomeSum.value = math.bignumber((data as any).monthIncomeSum);
		}
		if ((data as any)?.monthExpenseSum !== undefined) {
			monthExpenseSum.value = math.bignumber((data as any).monthExpenseSum);
		}
	} else {
		message.error(messageInfo || '查询余额失败！');
	}
};

// 获取收入和支出信息
const getIncomeAndExpenseInfo = async (
	userid: number | string | null,
	dateStr: string,
) => {
	const belongTo =
		userid === '0' || userid === 0 || userid === null || userid === undefined
			? null
			: Number(userid);
	const {
		code,
		data,
		message: messageInfo,
	} = await getIncomeAndExpense(belongTo, dateStr);
	if (code === '200') {
		const listData = Array.isArray(data) ? data : (data as any)?.list || [];
		if (listData?.length) {
			const income: ItemInfo[] = [];
			listData
				.filter(
					(item: FinanceManagerData) => item.incomeAndExpenses === 'income',
				)
				.forEach((item: FinanceManagerData) => {
					income.push({ name: item.typeCode || '', value: item.amount || 0 });
				});
			pieIncomeData.value = income;

			const expense: ItemInfo[] = [];
			listData
				.filter(
					(item: FinanceManagerData) => item.incomeAndExpenses === 'expense',
				)
				.forEach((item: FinanceManagerData) => {
					expense.push({ name: item.typeCode || '', value: item.amount || 0 });
				});
			pieExpenseData.value = expense;
		} else {
			pieIncomeData.value = [];
			pieExpenseData.value = [];
		}
	} else {
		message.error(messageInfo || '查询收支失败！');
	}
};

// 日收支配置与数据
const dayIncomeData = ref<number[]>([]);
const dayExpenseData = ref<number[]>([]);
const dayConfig = ref<barItem>({
	xAxis: [],
	xTile: '天数',
	yTitle: '金额 (元)',
});

// 月收支配置与数据
const monthIncomeData = ref<number[]>([]);
const monthExpenseData = ref<number[]>([]);
const monthConfig = ref<barItem>({
	xAxis: [],
	xTile: '月份',
	yTitle: '金额 (元)',
});

const getExpenseSeries = async (
	requestFn: (
		belongTo?: number | null,
		dateStr?: string,
	) => Promise<any>,
	userid: number | string | null,
	dateStr: string,
): Promise<AnalysisData[]> => {
	const belongTo =
		userid === '0' || userid === 0 || userid === null || userid === undefined
			? null
			: Number(userid);
	const { code, data, message: messageInfo } = await requestFn(belongTo, dateStr);
	if (code === '200') {
		return (data as AnalysisData[]) || [];
	} else {
		message.error(messageInfo || '查询走势失败！');
	}
	return [];
};

// 获取日收支对比信息
const getDayExpenseInfo = async (
	userid: number | string | null,
	dateStr: string,
) => {
	const rawList = await getExpenseSeries(
		getDayExpense,
		userid,
		dateStr,
	);
	const xAxis: string[] = [];
	const incomeList: number[] = [];
	const expenseList: number[] = [];

	rawList.forEach((item) => {
		const num = parseInt(item.infoDate, 10);
		xAxis.push(isNaN(num) ? item.infoDate : `${num}日`);
		if (item.incomeAmount !== undefined && item.expenseAmount !== undefined) {
			incomeList.push(Number(item.incomeAmount) || 0);
			expenseList.push(Number(item.expenseAmount) || 0);
		} else {
			const val = Number(item.amount) || 0;
			if (val > 0) {
				expenseList.push(val);
				incomeList.push(0);
			} else if (val < 0) {
				expenseList.push(0);
				incomeList.push(Math.abs(val));
			} else {
				expenseList.push(0);
				incomeList.push(0);
			}
		}
	});

	dayConfig.value.xAxis = xAxis;
	dayIncomeData.value = incomeList;
	dayExpenseData.value = expenseList;
};

// 获取月收支对比信息
const getMonthExpenseInfo = async (
	userid: number | string | null,
	dateStr: string,
) => {
	const rawList = await getExpenseSeries(
		getMonthExpense,
		userid,
		dateStr,
	);
	const xAxis: string[] = [];
	const incomeList: number[] = [];
	const expenseList: number[] = [];

	rawList.forEach((item) => {
		const num = parseInt(item.infoDate, 10);
		if (num >= 1 && num <= 12) {
			xAxis.push(`${num}月`);
			if (item.incomeAmount !== undefined && item.expenseAmount !== undefined) {
				incomeList.push(Number(item.incomeAmount) || 0);
				expenseList.push(Number(item.expenseAmount) || 0);
			} else {
				const val = Number(item.amount) || 0;
				if (val > 0) {
					expenseList.push(val);
					incomeList.push(0);
				} else if (val < 0) {
					expenseList.push(0);
					incomeList.push(Math.abs(val));
				} else {
					expenseList.push(0);
					incomeList.push(0);
				}
			}
		}
	});

	monthConfig.value.xAxis = xAxis;
	monthIncomeData.value = incomeList;
	monthExpenseData.value = expenseList;
};

const changeMonth = () => {
	getInfo();
};

async function getInfo() {
	loading.value = true;
	try {
		const dateStr = searchDateTime.value.format(dateFormatter);
		await Promise.all([
			getBalanceInfo(searchUser.value, dateStr),
			getIncomeAndExpenseInfo(searchUser.value, dateStr),
			getDayExpenseInfo(searchUser.value, dateStr),
			getMonthExpenseInfo(searchUser.value, dateStr),
		]);
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	getInfo();
});
</script>

<style lang="less" scoped>
.finance-analysis-page {
	width: 100%;
	padding: 16px;
	background-color: #f8fafc;
	min-height: calc(100vh - 110px);
}

.search-card {
	background: #ffffff;
	border-radius: 8px;
	padding: 14px 20px;
	margin-bottom: 16px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
	border: 1px solid #f1f5f9;

	.search-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}

	.search-left {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;

		.search-label {
			font-size: 13px;
			font-weight: 500;
			color: #475569;
		}

		.search-user-select {
			width: 140px;
		}
	}
}

.kpi-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 16px;

	@media (max-width: 1200px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
}

.kpi-card {
	background: #ffffff;
	border-radius: 8px;
	padding: 18px 20px;
	position: relative;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	border: 1px solid #f1f5f9;
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		border-radius: 8px 8px 0 0;
	}

	&.card-asset::before {
		background: linear-gradient(90deg, #3b82f6, #60a5fa);
	}
	&.card-income::before {
		background: linear-gradient(90deg, #10b981, #34d399);
	}
	&.card-expense::before {
		background: linear-gradient(90deg, #f97316, #fb923c);
	}
	&.card-balance::before {
		background: linear-gradient(90deg, #8b5cf6, #a78bfa);
	}

	.kpi-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.kpi-title {
			font-size: 14px;
			color: #64748b;
			font-weight: 500;
		}

		.kpi-badge {
			font-size: 11px;
			padding: 2px 8px;
			border-radius: 4px;
			font-weight: 500;

			&.badge-blue {
				background: #eff6ff;
				color: #2563eb;
			}
			&.badge-green {
				background: #ecfdf5;
				color: #059669;
			}
			&.badge-orange {
				background: #fff7ed;
				color: #ea580c;
			}
			&.badge-purple {
				background: #f5f3ff;
				color: #7c3aed;
			}
		}
	}

	.kpi-amount {
		font-size: 26px;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 12px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

		.currency-symbol {
			font-size: 18px;
			margin-right: 2px;
		}

		&.text-blue {
			color: #1e40af;
		}
		&.text-green {
			color: #065f46;
		}
		&.text-orange {
			color: #9a3412;
		}
		&.text-purple {
			color: #5b21b6;
		}
		&.text-danger {
			color: #dc2626;
		}
	}

	.kpi-footer {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 12px;

		.sub-label {
			color: #64748b;
			font-size: 12px;
		}

		.savings-rate-tag {
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 4px;
			background: #f1f5f9;

			&.text-green {
				color: #059669;
				background: #ecfdf5;
			}
			&.text-blue {
				color: #2563eb;
				background: #eff6ff;
			}
			&.text-danger {
				color: #dc2626;
				background: #fef2f2;
			}
			&.text-muted {
				color: #94a3b8;
			}
		}
	}
}

.trend-pill {
	display: inline-flex;
	align-items: center;
	padding: 1px 8px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 500;

	&.trend-up {
		color: #dc2626;
		background: #fef2f2;
	}
	&.trend-down {
		color: #16a34a;
		background: #f0fdf4;
	}
	&.trend-stable {
		color: #64748b;
		background: #f1f5f9;
	}
}

.account-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 16px;

	@media (max-width: 1200px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
}

.account-card {
	background: #ffffff;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	border: 1px solid #f1f5f9;
	overflow: hidden;

	.account-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: #f8fafc;
		border-bottom: 1px solid #f1f5f9;

		.header-left {
			display: flex;
			align-items: center;
			gap: 6px;

			.account-icon {
				font-size: 16px;
			}

			.account-title {
				font-size: 13px;
				font-weight: 600;
				color: #334155;
			}
		}

		.header-right {
			font-size: 12px;

			.subtotal-label {
				color: #64748b;
				margin-right: 4px;
			}

			.subtotal-value {
				font-weight: 600;
				color: #0f172a;
			}
		}
	}

	.account-list {
		padding: 10px 14px;
		min-height: 140px;
		max-height: 200px;
		overflow-y: auto;

		.account-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 7px 8px;
			border-radius: 4px;
			transition: background-color 0.2s;

			&:hover {
				background-color: #f8fafc;
			}

			.item-name {
				font-size: 13px;
				color: #475569;
			}

			.item-value {
				font-size: 13px;
				font-weight: 600;

				&.text-dark {
					color: #1e293b;
				}
				&.text-danger {
					color: #dc2626;
				}
			}
		}

		.empty-items {
			text-align: center;
			color: #94a3b8;
			font-size: 12px;
			padding: 40px 0;
		}
	}
}

.chart-row {
	margin-bottom: 16px;
}

.chart-card {
	background: #ffffff;
	border-radius: 8px;
	padding: 12px;
	height: 360px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	border: 1px solid #f1f5f9;
}
</style>
