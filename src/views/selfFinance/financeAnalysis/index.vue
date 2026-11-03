<template>
	<div
		class="finance-analysis-page w-full p-3.5 bg-slate-50 min-h-[calc(100vh-110px)] box-border"
	>
		<!-- 00 · 顶部单行检索工具栏 (P0) -->
		<div
			class="search-card bg-white px-4 py-2.5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 mb-3.5"
		>
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div class="flex items-center flex-wrap gap-2.5">
					<span class="text-xs font-medium text-slate-500">统计月份</span>
					<a-date-picker
						v-model:value="searchDateTime"
						picker="month"
						:locale="locale"
						:allow-clear="false"
						class="w-36 !rounded-xl !border-slate-200/80"
						@change="changeMonth"
					/>

					<!-- 动态高亮周期快捷胶囊 (上月 / 本月) -->
					<div
						class="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border-0 gap-0.5 h-8 box-border"
					>
						<button
							type="button"
							:class="[
								'border-0 text-xs px-3 py-1 rounded-lg cursor-pointer leading-snug transition-all duration-150',
								selectedMonthPreset === 'prev' ?
									'bg-white text-indigo-600 font-semibold shadow-2xs'
								:	'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60',
							]"
							@click="selectPrevMonth"
						>
							上月
						</button>
						<button
							type="button"
							:class="[
								'border-0 text-xs px-3 py-1 rounded-lg cursor-pointer leading-snug transition-all duration-150',
								selectedMonthPreset === 'current' ?
									'bg-white text-indigo-600 font-semibold shadow-2xs'
								:	'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60',
							]"
							@click="selectCurrentMonth"
						>
							本月
						</button>
					</div>

					<span class="text-slate-200 mx-1 select-none">|</span>

					<span class="text-xs font-medium text-slate-500">归属成员</span>
					<a-select
						class="w-44"
						v-model:value="searchUser"
						:field-names="{ label: 'nickName', value: 'id' }"
						:options="userOptions"
						placeholder="请选择成员"
						@change="changeMonth"
					/>
				</div>

				<div class="flex items-center">
					<button
						type="button"
						:disabled="loading"
						class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border-0 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white disabled:opacity-60 text-xs font-medium cursor-pointer transition-all duration-200"
						@click="getInfo"
					>
						<ReloadOutlined :spin="loading" class="text-xs" />
						<span>刷新分析</span>
					</button>
				</div>
			</div>
		</div>

		<!-- 第一层 (P0 第一视觉重点)：01 当月核心财务指标 (左 7) + 02 资产净值概览 (右 5) -->
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
			:liquid-subtotal="liquidSubtotal"
			:credit-subtotal="creditSubtotal"
			:prepaid-subtotal="prepaidSubtotal"
			:format-amount="formatAmount"
			:format-trend="formatTrend"
			:get-trend-class="getTrendClass"
		/>

		<!-- 第二层 (P0/P1 核心结构与分布)：03 当月收支结构横向排行 (左 7) + 04 账户资产分布 (右 5) -->
		<finance-analysis-account-grid
			:list-configs="listConfigs"
			:pie-income-data="pieIncomeData"
			:pie-expense-data="pieExpenseData"
			:format-amount="formatAmount"
			@select-category="handleDrillDownCategory"
			@select-account="handleDrillDownAccount"
		/>

		<!-- 第三层 (P1/P2 趋势与近期变动)：05 收支变化趋势 (左 7) + 06 最近财务流水 (右 5) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
			<!-- 05 · 收支变化趋势 (占 7/12，平滑双折线图 + 月度/日度切换) -->
			<div
				class="lg:col-span-7 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col h-[340px]"
			>
				<div class="flex items-center justify-between gap-2 mb-2 shrink-0 flex-wrap">
					<div class="flex items-center gap-2">
						<span
							class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
						>
							<LineChartOutlined class="text-xs" />
						</span>
						<span class="text-sm font-bold text-slate-800">
							{{ trendMode === 'month' ? '月度收支趋势' : '当月日度收支趋势' }}
						</span>
						<span class="text-[11px] text-slate-400 hidden sm:inline">
							悬浮查看当期收入、支出与净结余
						</span>
					</div>

					<!-- 趋势维度切换 (月度趋势 / 当月日趋势) -->
					<div
						class="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border-0 gap-0.5"
					>
						<button
							type="button"
							:class="[
								'border-0 text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150',
								trendMode === 'month' ?
									'bg-white text-indigo-600 font-semibold shadow-2xs'
								:	'bg-transparent text-slate-500 hover:text-slate-900',
							]"
							@click="trendMode = 'month'"
						>
							月度趋势
						</button>
						<button
							type="button"
							:class="[
								'border-0 text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150',
								trendMode === 'day' ?
									'bg-white text-indigo-600 font-semibold shadow-2xs'
								:	'bg-transparent text-slate-500 hover:text-slate-900',
							]"
							@click="trendMode = 'day'"
						>
							当月日趋势
						</button>
					</div>
				</div>

				<div class="flex-1 min-h-0">
					<bar-chart
						height="100%"
						width="100%"
						:title="trendMode === 'month' ? '月度收支趋势' : '当月日度收支趋势'"
						:income-data="
							trendMode === 'month' ? monthIncomeData : dayIncomeData
						"
						:expense-data="
							trendMode === 'month' ? monthExpenseData : dayExpenseData
						"
						:config="trendMode === 'month' ? monthConfig : dayConfig"
					/>
				</div>
			</div>

			<!-- 06 · 当月最近财务流水 (占 5/12，真实拉取最新 6 条 + 穿透账单流水页) -->
			<div
				class="lg:col-span-5 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col h-[340px]"
			>
				<div class="flex items-center justify-between gap-2 mb-3 shrink-0">
					<div class="flex items-center gap-2">
						<span
							class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
						>
							<UnorderedListOutlined class="text-xs" />
						</span>
						<span class="text-sm font-bold text-slate-800">最近财务流水</span>
						<span class="text-[11px] text-slate-400 font-mono">
							({{ currentMonthLabel }})
						</span>
					</div>
					<button
						type="button"
						class="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
						@click="goToFinanceManager()"
					>
						<span>查看全部流水</span>
						<ArrowRightOutlined class="text-[11px]" />
					</button>
				</div>

				<div
					v-if="recentRecords.length > 0"
					class="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-0.5"
				>
					<div
						v-for="item in recentRecords"
						:key="item.id"
						class="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-indigo-500/[0.06] cursor-pointer transition-all"
						title="点击前往账单流水页查看"
						@click="goToFinanceManager({ typeCode: item.typeCode })"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<span
								class="w-7 h-7 rounded-xl bg-white shadow-2xs inline-flex items-center justify-center text-xs shrink-0"
							>
								{{ getCategoryEmoji(item.typeCode) }}
							</span>
							<div class="flex flex-col min-w-0">
								<div class="flex items-center gap-1.5 min-w-0">
									<span
										class="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate transition-colors"
									>
										{{ item.name || item.typeCode || '日常账目' }}
									</span>
									<span
										v-if="item.typeCode && item.typeCode !== item.name"
										class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600 shrink-0"
									>
										{{ item.typeCode }}
									</span>
								</div>
								<div class="flex items-center gap-1.5 text-[11px] text-slate-400">
									<span class="font-mono">{{
										formatShortDate(item.infoDate)
									}}</span>
									<template v-if="item.belongToName">
										<span>·</span>
										<span>{{ item.belongToName }}</span>
									</template>
								</div>
							</div>
						</div>

						<span
							:class="[
								'text-xs font-bold font-mono tabular-nums shrink-0',
								item.incomeAndExpenses === 'income' ?
									'text-emerald-600'
								:	'text-rose-600',
							]"
						>
							{{ item.incomeAndExpenses === 'income' ? '+' : '-' }}¥{{
								formatAmount(item.amount)
							}}
						</span>
					</div>
				</div>
				<div
					v-else
					class="flex-1 flex flex-col items-center justify-center text-xs text-slate-400"
				>
					<span>当月暂无财务流水记录</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	ReloadOutlined,
	LineChartOutlined,
	UnorderedListOutlined,
	ArrowRightOutlined,
} from '@ant-design/icons-vue';
import {
	getCategoryEmoji,
	type FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';
import { getFinanceMangerPage } from '@/views/selfFinance/financeManager/api';
import {
	type AnalysisData,
	type ItemInfo,
} from '@/views/selfFinance/financeAnalysis/analysis';
import BigNumber from 'bignumber.js';
import type { Dayjs } from '@/utils/dayjs';
import {
	nowDayjs,
	dateFormatYYYYMM,
	formatDate,
	getMonthRange,
} from '@/utils/dayjs';
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
import BarChart from '@/views/selfFinance/financeAnalysis/chart/barChart.vue';

const router = useRouter();
const loading = ref<boolean>(false);
const trendMode = ref<'month' | 'day'>('month');
const recentRecords = ref<FinanceManagerData[]>([]);

// 用户信息
const userInfo = useUserStore()?.getUserInfo;

// 用户列表与选项（置顶「家庭组所有人」，后续展示家庭组织成员）
const { userList } = useUserInfo();

const userOptions = computed(() => {
	const list: Array<{ id: string; nickName: string }> = [
		{ id: '0', nickName: '家庭组所有人' },
	];
	const exists = new Set<string>(['0']);

	if (Array.isArray(userList.value) && userList.value.length > 0) {
		for (const u of userList.value) {
			if (u.id != null) {
				const idStr = String(u.id);
				exists.add(idStr);
				list.push({
					id: idStr,
					nickName: u.nickName || u.username || `成员(${idStr})`,
				});
			}
		}
	}

	if (userInfo?.id && !exists.has(String(userInfo.id))) {
		list.push({
			id: String(userInfo.id),
			nickName: userInfo.nickName || userInfo.username || '当前用户',
		});
	}

	return list;
});

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

const formatShortDate = (date?: string | Dayjs) => {
	if (!date) return '-';
	return formatDate(date, 'MM-DD HH:mm');
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
		return expense > 0 ? '超支赤字' : '0.0%';
	}
	const rate = ((income - expense) / income) * 100;
	return `${rate.toFixed(1)}%`;
});

const savingsRateClass = computed(() => {
	const income = (monthIncomeSum.value || new BigNumber(0)).toNumber();
	const expense = (monthExpenseSum.value || new BigNumber(0)).toNumber();
	if (income <= 0) {
		return expense > 0 ? 'text-danger' : 'text-muted';
	}
	const rate = ((income - expense) / income) * 100;
	if (rate >= 50) return 'text-green';
	if (rate >= 0) return 'text-blue';
	return 'text-danger';
});

const searchUser = ref<string>(userInfo?.id ? String(userInfo.id) : '0');
const searchDateTime = ref<Dayjs>(nowDayjs());

const currentMonthLabel = computed(
	() => searchDateTime.value?.format(dateFormatYYYYMM) || '',
);

const selectedMonthPreset = computed(() => {
	const selectedStr = searchDateTime.value?.format(dateFormatYYYYMM);
	const currentStr = nowDayjs().format(dateFormatYYYYMM);
	const prevStr = nowDayjs().subtract(1, 'month').format(dateFormatYYYYMM);
	if (selectedStr === currentStr) return 'current';
	if (selectedStr === prevStr) return 'prev';
	return 'other';
});

const selectPrevMonth = () => {
	searchDateTime.value = nowDayjs().subtract(1, 'month');
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

// 三大资产账户分组：流动资金 / 信用负债 / 专户预存 (合并水电燃气与话费预存)
const listConfigs = computed(() => {
	const liquidList =
		getBalanceDetailData(balanceList.value, ['yhk', 'wx', 'zfb', 'xj', 'jd']) ||
		[];
	const creditList =
		getBalanceDetailData(balanceList.value, ['hb', 'bt']) || [];
	const prepaidList =
		getBalanceDetailData(balanceList.value, [
			'sf',
			'rqf',
			'dfw',
			'dfm',
			'hf',
		]) || [];

	return [
		{
			key: 'liquid',
			title: '流动资金账户',
			desc: '现金、银行卡及主流电子钱包可用余额',
			icon: '💰',
			list: liquidList,
			subtotal: calculateSubtotal(liquidList),
			valueClass: 'text-dark',
		},
		{
			key: 'credit',
			title: '信用与负债',
			desc: '花呗、白条等信用账户待还负债',
			icon: '💳',
			list: creditList,
			subtotal: calculateSubtotal(creditList),
			valueClass: 'text-dark',
		},
		{
			key: 'prepaid',
			title: '水电话费专户预存',
			desc: '水电燃气卡及家庭成员手机话费预存余额',
			icon: '⚡',
			list: prepaidList,
			subtotal: calculateSubtotal(prepaidList),
			valueClass: 'text-dark',
		},
	];
});

const liquidSubtotal = computed(() => Number(listConfigs.value[0]?.subtotal || 0));
const creditSubtotal = computed(() => Number(listConfigs.value[1]?.subtotal || 0));
const prepaidSubtotal = computed(() => Number(listConfigs.value[2]?.subtotal || 0));

// 支出分析数据 / 收入分析数据
const pieExpenseData = ref<ItemInfo[]>([]);
const pieIncomeData = ref<ItemInfo[]>([]);

// 获取余额信息
const getBalanceInfo = async (
	userid: string | null | undefined,
	dateStr: string,
) => {
	const belongTo = !userid || userid === '0' ? null : String(userid);
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
	userid: string | null | undefined,
	dateStr: string,
) => {
	const belongTo = !userid || userid === '0' ? null : String(userid);
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
	requestFn: (belongTo?: string | null, dateStr?: string) => Promise<any>,
	userid: string | null | undefined,
	dateStr: string,
): Promise<AnalysisData[]> => {
	const belongTo = !userid || userid === '0' ? null : String(userid);
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
const getDayExpenseInfo = async (
	userid: string | null | undefined,
	dateStr: string,
) => {
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
const getMonthExpenseInfo = async (
	userid: string | null | undefined,
	dateStr: string,
) => {
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

// 获取当月最近 6 条真实财务流水
const getRecentFinanceRecords = async (
	userid: string | null | undefined,
	dateStr: string,
) => {
	try {
		const [monthStart, monthEnd] = getMonthRange(dateStr);
		const belongTo = !userid || userid === '0' ? undefined : String(userid);
		const { code, data } = await getFinanceMangerPage(
			{
				infoDateStart: monthStart,
				infoDateEnd: monthEnd,
				belongTo,
				isValid: '1',
			},
			1,
			6,
		);
		if (code === '200' && data?.records) {
			recentRecords.value = data.records;
		} else {
			recentRecords.value = [];
		}
	} catch (e) {
		console.warn('获取最近财务流水失败:', e);
		recentRecords.value = [];
	}
};

// 穿透跳转至账单流水页面
const goToFinanceManager = (extraQuery?: Record<string, string | undefined>) => {
	const query: Record<string, string> = {};
	if (extraQuery) {
		Object.entries(extraQuery).forEach(([k, v]) => {
			if (v) query[k] = v;
		});
	}
	router.push({
		path: '/selfFinance/financeManager',
		query,
	});
};

const handleDrillDownCategory = (
	categoryName: string,
	_direction: 'income' | 'expense',
) => {
	goToFinanceManager({ typeCode: categoryName });
};

const handleDrillDownAccount = (fromSourceCode: string) => {
	goToFinanceManager({ fromSource: fromSourceCode });
};

const changeMonth = () => {
	getInfo();
};

async function getInfo() {
	loading.value = true;
	try {
		const dateStr = searchDateTime.value.format(dateFormatYYYYMM);
		const userParam = searchUser.value ? String(searchUser.value) : '0';
		await Promise.all([
			getBalanceInfo(userParam, dateStr),
			getIncomeAndExpenseInfo(userParam, dateStr),
			getDayExpenseInfo(userParam, dateStr),
			getMonthExpenseInfo(userParam, dateStr),
			getRecentFinanceRecords(userParam, dateStr),
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
.search-card {
	:deep(.ant-select-selector),
	:deep(.ant-picker) {
		border-radius: 12px !important;
		border-color: rgba(226, 232, 240, 0.9) !important;
	}
}
</style>
