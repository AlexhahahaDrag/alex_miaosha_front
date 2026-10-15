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
					<a-button
						size="small"
						type="primary"
						ghost
						@click="selectCurrentMonth"
						>本月</a-button
					>

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

		<!-- 2. 核心 KPI 4 列卡片解耦子组件 -->
		<finance-analysis-kpi-row
			:sum-amount="sumAmount"
			:yoy-trend="yoyTrend"
			:mom-trend="momTrend"
			:month-income-sum="monthIncomeSum"
			:income-yoy-trend="incomeYoyTrend"
			:income-mom-trend="incomeMomTrend"
			:month-expense-sum="monthExpenseSum"
			:expense-yoy-trend="expenseYoyTrend"
			:expense-mom-trend="expenseMomTrend"
			:month-balance="monthBalance"
			:month-balance-number="monthBalanceNumber"
			:savings-rate-class="savingsRateClass"
			:savings-rate-text="savingsRateText"
			:format-amount="formatAmount"
			:format-trend="formatTrend"
			:get-trend-class="getTrendClass"
		/>

		<!-- 3. 资产与账户明细看板解耦子组件 -->
		<finance-analysis-account-grid
			:list-configs="listConfigs"
			:format-amount="formatAmount"
		/>

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
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';
import {
	type AnalysisData,
	type ItemInfo,
} from '@/views/selfFinance/financeAnalysis/analysis';
import BigNumber from 'bignumber.js';
import type { Dayjs } from '@/utils/dayjs';
import { nowDayjs, dateFormatYYYYMM } from '@/utils/dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from '@/views/selfFinance/financeAnalysis/chart/bar';
import {
	getBalance,
	getIncomeAndExpense,
	getDayExpense,
	getMonthExpense,
} from '@/views/selfFinance/financeAnalysis/api';
import { useUserStore } from '@/store/modules/user/user';
import { useUserInfo } from '@/composables/useUserInfo';
import PieChart from '@/views/selfFinance/financeAnalysis/chart/pieChart.vue';
import BarChart from '@/views/selfFinance/financeAnalysis/chart/barChart.vue';

const loading = ref<boolean>(false);

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
const monthExpenseSum = ref<BigNumber>(new BigNumber(0));
const monthIncomeSum = ref<BigNumber>(new BigNumber(0));

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
	const arrow =
		isUp ? '↑'
		: isDown ? '↓'
		: '';
	return `${defaultPrefix} ${trend} ${arrow}`.trim();
};

const formatAmount = (
	val: BigNumber | number | string | undefined | null,
) => {
	if (val === undefined || val === null) return '0.00';
	let num: number;
	if (typeof val === 'number') {
		num = val;
	} else if (typeof val === 'string') {
		num = Number(val) || 0;
	} else {
		num = val.toNumber() || 0;
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
			(acc: BigNumber, item: FinanceManagerData) => {
				return acc.plus(item.amount ? item.amount : 0);
			},
			new BigNumber(0),
		) || new BigNumber(0)
	);
});

// 当月结余
const monthBalance = computed(() => {
	return (monthIncomeSum.value || new BigNumber(0)).minus(
		monthExpenseSum.value || new BigNumber(0),
	);
});

const monthBalanceNumber = computed(() => {
	return (monthBalance.value || new BigNumber(0)).toNumber();
});

// 当月储蓄率
const savingsRateText = computed(() => {
	const income = (monthIncomeSum.value || new BigNumber(0)).toNumber();
	const expense = (monthExpenseSum.value || new BigNumber(0)).toNumber();
	if (income <= 0) {
		return '0.0%';
	}
	const rate = ((income - expense) / income) * 100;
	return `${rate.toFixed(1)}%`;
});

const savingsRateClass = computed(() => {
	const income = (monthIncomeSum.value || new BigNumber(0)).toNumber();
	const expense = (monthExpenseSum.value || new BigNumber(0)).toNumber();
	if (income <= 0) return 'text-muted';
	const rate = ((income - expense) / income) * 100;
	if (rate >= 50) return 'text-green';
	if (rate >= 0) return 'text-blue';
	return 'text-danger';
});


const searchUser = ref<number>(userInfo?.id || 0);
const searchDateTime = ref<Dayjs>(nowDayjs());

const selectPrevMonth = () => {
	searchDateTime.value = searchDateTime.value.subtract(1, 'month');
	getInfo();
};

const selectCurrentMonth = () => {
	searchDateTime.value = nowDayjs();
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
		getBalanceDetailData(balanceList.value, ['yhk', 'wx', 'zfb', 'xj', 'jd']) ||
		[];
	const creditList =
		getBalanceDetailData(balanceList.value, ['hb', 'bt']) || [];
	const utilityList =
		getBalanceDetailData(balanceList.value, ['sf', 'rqf', 'dfw', 'dfm']) || [];
	const phoneList = getBalanceDetailData(balanceList.value, ['hf']) || [];

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
const getBalanceInfo = async (userid: string | null, dateStr: string) => {
	const belongTo =
		userid === '0' || userid === null || userid === undefined ?
			null
		:	Number(userid);
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
			monthIncomeSum.value = new BigNumber((data as any).monthIncomeSum || 0);
		}
		if ((data as any)?.monthExpenseSum !== undefined) {
			monthExpenseSum.value = new BigNumber((data as any).monthExpenseSum || 0);
		}
	} else {
		message.error(messageInfo || '查询余额失败！');
	}
};

// 获取收入和支出信息
const getIncomeAndExpenseInfo = async (
	userid: string | null,
	dateStr: string,
) => {
	const belongTo =
		userid === '0' || userid === null || userid === undefined ?
			null
		:	Number(userid);
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
	requestFn: (belongTo?: number | null, dateStr?: string) => Promise<any>,
	userid: string | null,
	dateStr: string,
): Promise<AnalysisData[]> => {
	const belongTo =
		userid === '0' || userid === null || userid === undefined ?
			null
		:	Number(userid);
	const {
		code,
		data,
		message: messageInfo,
	} = await requestFn(belongTo, dateStr);
	if (code === '200') {
		return (data as AnalysisData[]) || [];
	} else {
		message.error(messageInfo || '查询走势失败！');
	}
	return [];
};

// 获取日收支对比信息
const getDayExpenseInfo = async (userid: string | null, dateStr: string) => {
	const rawList = await getExpenseSeries(getDayExpense, userid, dateStr);
	const xAxis: string[] = [];
	const incomeList: number[] = [];
	const expenseList: number[] = [];

	rawList.forEach((item) => {
		const num = Number.parseInt(item.infoDate, 10);
		xAxis.push(Number.isNaN(num) ? item.infoDate : `${num}日`);
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
const getMonthExpenseInfo = async (userid: string | null, dateStr: string) => {
	const rawList = await getExpenseSeries(getMonthExpense, userid, dateStr);
	const xAxis: string[] = [];
	const incomeList: number[] = [];
	const expenseList: number[] = [];

	rawList.forEach((item) => {
		const num = Number.parseInt(item.infoDate, 10);
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
		const dateStr = searchDateTime.value.format(dateFormatYYYYMM);
		await Promise.all([
			getBalanceInfo(String(searchUser.value), dateStr),
			getIncomeAndExpenseInfo(String(searchUser.value), dateStr),
			getDayExpenseInfo(String(searchUser.value), dateStr),
			getMonthExpenseInfo(String(searchUser.value), dateStr),
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
