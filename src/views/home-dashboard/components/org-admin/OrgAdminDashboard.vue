<template>
	<div class="org-admin-dashboard" data-testid="dash-org-admin-root">
		<!-- 欢迎横幅 -->
		<WelcomeHeader role-type="org_admin" />

		<!-- 机构/家庭运营 KPI 看板 -->
		<div class="stats-overview-section">
			<a-row :gutter="[16, 16]">
				<!-- KPI 1: 支出 / 成员 -->
				<a-col :xs="24" :sm="12" :md="6">
					<a-card
						:bordered="false"
						class="kpi-card"
						:class="{ 'clickable-card': isFamilyContext }"
						data-testid="dash-org-kpi-expense"
						@click="isFamilyContext && navigateTo('/finance/financeManager', { type: 'expense' })"
					>
						<div class="kpi-top-row">
							<div class="kpi-title">{{ isFamilyContext ? '本月综合总支出' : '本机构在册员工' }}</div>
							<div :class="['kpi-icon-badge', isFamilyContext ? 'orange' : 'blue']">
								<fall-outlined v-if="isFamilyContext" />
								<team-outlined v-else />
							</div>
						</div>
						<div class="kpi-value-row">
							<span class="kpi-currency" v-if="isFamilyContext">¥</span>
							<span class="kpi-number">{{ isFamilyContext ? formatMoney(familyStats.totalExpense) : orgStats.memberCount }}</span>
							<span class="kpi-unit" v-if="!isFamilyContext">人</span>
						</div>
						<div class="kpi-bottom-row" v-if="isFamilyContext">
							<div class="kpi-breakdown-capsule">
								<span>日常 ¥{{ formatMoney(familyStats.dailyExpense) }}</span>
								<span class="dot-divider">·</span>
								<span>随礼 ¥{{ formatMoney(familyStats.giftExpense) }}</span>
							</div>
							<a-tooltip
								v-if="familyStats.expenseMomTrend"
								:title="`较上月环比: ${familyStats.expenseMomTrend} · 较去年同期同比: ${familyStats.expenseYoyTrend || '持平'}`"
							>
								<div :class="['kpi-trend-badge', isTrendGood('expense', familyStats.expenseMomTrend) ? 'good' : 'warn']">
									<fall-outlined v-if="isNegativeTrend(familyStats.expenseMomTrend)" />
									<rise-outlined v-else />
									<span>环比 {{ familyStats.expenseMomTrend }}</span>
								</div>
							</a-tooltip>
						</div>
						<div class="kpi-bottom-row" v-else>
							<div class="kpi-trend-badge good">
								<check-circle-outlined />
								<span>全员绑定有效机构</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<!-- KPI 2: 收入 / 商品 -->
				<a-col :xs="24" :sm="12" :md="6">
					<a-card
						:bordered="false"
						class="kpi-card"
						:class="{ 'clickable-card': isFamilyContext }"
						data-testid="dash-org-kpi-income"
						@click="isFamilyContext && navigateTo('/finance/financeManager', { type: 'income' })"
					>
						<div class="kpi-top-row">
							<div class="kpi-title">{{ isFamilyContext ? '本月综合总收入' : '管辖商品/秒杀在售' }}</div>
							<div :class="['kpi-icon-badge', isFamilyContext ? 'cyan' : 'cyan']">
								<rise-outlined v-if="isFamilyContext" />
								<appstore-outlined v-else />
							</div>
						</div>
						<div class="kpi-value-row">
							<span class="kpi-currency" v-if="isFamilyContext">¥</span>
							<span class="kpi-number">{{ isFamilyContext ? formatMoney(familyStats.totalIncome) : orgStats.productCount }}</span>
							<span class="kpi-unit" v-if="!isFamilyContext">件</span>
						</div>
						<div class="kpi-bottom-row" v-if="isFamilyContext">
							<div class="kpi-breakdown-capsule">
								<span>日常 ¥{{ formatMoney(familyStats.dailyIncome) }}</span>
								<span class="dot-divider">·</span>
								<span>收礼 ¥{{ formatMoney(familyStats.giftIncome) }}</span>
							</div>
							<a-tooltip
								v-if="familyStats.incomeMomTrend"
								:title="`较上月环比: ${familyStats.incomeMomTrend} · 较去年同期同比: ${familyStats.incomeYoyTrend || '持平'}`"
							>
								<div :class="['kpi-trend-badge', isTrendGood('income', familyStats.incomeMomTrend) ? 'good' : 'warn']">
									<rise-outlined v-if="!isNegativeTrend(familyStats.incomeMomTrend)" />
									<fall-outlined v-else />
									<span>环比 {{ familyStats.incomeMomTrend }}</span>
								</div>
							</a-tooltip>
						</div>
						<div class="kpi-bottom-row" v-else>
							<div class="kpi-trend-badge good">
								<arrow-up-outlined />
								<span>上架率 94.2%</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<!-- KPI 3: 净结余 / 成交额 -->
				<a-col :xs="24" :sm="12" :md="6">
					<a-card
						:bordered="false"
						class="kpi-card"
						:class="{ 'clickable-card': isFamilyContext }"
						data-testid="dash-org-kpi-balance"
						@click="isFamilyContext && navigateTo('/finance/financeAnalysis')"
					>
						<div class="kpi-top-row">
							<div class="kpi-title">{{ isFamilyContext ? '本月家庭净结余' : '本月成交额' }}</div>
							<div :class="['kpi-icon-badge', isFamilyContext ? (familyStats.netBalance >= 0 ? 'pink' : 'danger-badge') : 'orange']">
								<wallet-outlined v-if="isFamilyContext" />
								<dollar-outlined v-else />
							</div>
						</div>
						<div class="kpi-value-row">
							<span class="kpi-currency">¥</span>
							<span :class="['kpi-number', isFamilyContext && familyStats.netBalance < 0 ? 'text-rose-600' : '']">
								{{ isFamilyContext ? formatMoney(familyStats.netBalance) : orgStats.monthlySales.toLocaleString() }}
							</span>
						</div>
						<div class="kpi-bottom-row" v-if="isFamilyContext">
							<div :class="['kpi-breakdown-capsule', familyStats.netBalance < 0 ? 'danger' : '']">
								<span v-if="familyStats.netBalance >= 0">储蓄率 {{ familyStats.savingsRate }}% · 结余充裕</span>
								<span v-else>当月超支 ¥{{ formatMoney(Math.abs(familyStats.netBalance)) }}</span>
							</div>
							<a-tooltip
								v-if="familyStats.balanceMomTrend"
								:title="`结余较上月环比: ${familyStats.balanceMomTrend} · 较去年同期同比: ${familyStats.balanceYoyTrend || '持平'}`"
							>
								<div :class="['kpi-trend-badge', isTrendGood('income', familyStats.balanceMomTrend) ? 'good' : 'warn']">
									<rise-outlined v-if="!isNegativeTrend(familyStats.balanceMomTrend)" />
									<fall-outlined v-else />
									<span>环比 {{ familyStats.balanceMomTrend }}</span>
								</div>
							</a-tooltip>
						</div>
						<div class="kpi-bottom-row" v-else>
							<div class="kpi-trend-badge good">
								<arrow-up-outlined />
								<span>环比增长 +9.4%</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<!-- KPI 4: 家庭规模活跃度 / 机构礼金 -->
				<a-col :xs="24" :sm="12" :md="6">
					<a-card
						:bordered="false"
						class="kpi-card"
						:class="{ 'clickable-card': isFamilyContext }"
						data-testid="dash-org-kpi-scale"
						@click="isFamilyContext && navigateTo('/finance/gift/person')"
					>
						<div class="kpi-top-row">
							<div class="kpi-title">{{ isFamilyContext ? '家庭在册亲友' : '机构礼金往来总额' }}</div>
							<div :class="['kpi-icon-badge', isFamilyContext ? 'blue' : 'pink']">
								<team-outlined v-if="isFamilyContext" />
								<account-book-outlined v-else />
							</div>
						</div>
						<div class="kpi-value-row">
							<span class="kpi-currency" v-if="!isFamilyContext">¥</span>
							<span class="kpi-number">{{ isFamilyContext ? familyStats.memberCount : orgStats.giftTurnover.toLocaleString() }}</span>
							<span class="kpi-unit" v-if="isFamilyContext">人</span>
						</div>
						<div class="kpi-bottom-row" v-if="isFamilyContext">
							<div class="kpi-breakdown-capsule">
								<span>本月人情 {{ familyStats.monthEventCount }} 场</span>
								<span class="dot-divider">·</span>
								<span>记账 {{ familyStats.dailyCount }} 笔</span>
							</div>
							<div class="kpi-trend-badge info">
								<check-circle-outlined />
								<span>在册建档</span>
							</div>
						</div>
						<div class="kpi-bottom-row" v-else>
							<div class="kpi-trend-badge good">
								<check-circle-outlined />
								<span>累计收礼32笔/随礼26笔</span>
							</div>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 主体内容 -->
		<div class="main-dashboard-grid">
			<a-row :gutter="[16, 16]">
				<!-- 左侧分析 -->
				<a-col :xs="24" :lg="16">
					<a-card
						:title="chartCardTitle"
						:bordered="false"
						class="chart-card"
						data-testid="dash-org-chart-card"
					>
						<template #extra v-if="isFamilyContext">
							<a-radio-group
								v-model:value="activeChartTab"
								size="small"
								button-style="solid"
								@change="onChartTabChange"
								data-testid="dash-org-chart-tabs"
							>
								<a-radio-button value="trend">综合走势</a-radio-button>
								<a-radio-button value="category">支出分类</a-radio-button>
								<a-radio-button value="gift">人情专线</a-radio-button>
							</a-radio-group>
						</template>
						<div ref="chartContainer" class="chart-container-box"></div>
					</a-card>

					<!-- 机构/家庭事由与审核卡片 -->
					<OrgTodoCard :is-family-context="isFamilyContext" />
				</a-col>

				<!-- 右侧操作 -->
				<a-col :xs="24" :lg="8">
					<QuickActionGrid
						:title="isFamilyContext ? '家庭常用管理通道' : '机构常用管理通道'"
						:actions="isFamilyContext ? FAMILY_ADMIN_ACTIONS : ORG_ADMIN_ACTIONS"
					/>
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user/user';
import WelcomeHeader from '../common/WelcomeHeader.vue';
import QuickActionGrid from '../common/QuickActionGrid.vue';
import OrgTodoCard from './OrgTodoCard.vue';
import { ORG_ADMIN_ACTIONS, FAMILY_ADMIN_ACTIONS } from '../../config';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import {
	getGiftPersonSummary,
	getGiftEventPage,
	getGiftRecordSummary,
	getGiftAnalysisTrend,
} from '@/views/finance/gift/api';
import { getFinanceSummary } from '@/views/finance/financeManager/api';
import { getIncomeAndExpense, getMonthExpense, getBalance } from '@/views/finance/financeAnalysis/api';
import dayjs from 'dayjs';
import {
	TeamOutlined,
	AppstoreOutlined,
	DollarOutlined,
	AccountBookOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
	FallOutlined,
	RiseOutlined,
	WalletOutlined,
	WarningOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const orgName = computed(
	() => userStore.getOrgInfo?.orgName || userStore.getUserInfo?.orgName || '',
);
const roleName = computed(() => userStore.getRoleInfo?.roleName || '');

const isFamilyContext = computed(() => {
	const org = orgName.value || '';
	const role = roleName.value || '';
	return org.includes('家') || role.includes('家庭') || role.includes('人情');
});

const activeChartTab = ref<'trend' | 'category' | 'gift'>('trend');

const chartCardTitle = computed(() => {
	if (!isFamilyContext.value) return '本机构月度销售与礼金往来走势';
	switch (activeChartTab.value) {
		case 'category':
			return '家庭本月日常支出分类占比构成';
		case 'gift':
			return '家庭月度人情礼金收支走势';
		case 'trend':
		default:
			return '家庭月度综合收支走势 (日常+人情)';
	}
});

const orgStats = ref({
	memberCount: 42,
	productCount: 128,
	monthlySales: 168900,
	giftTurnover: 46200,
});

const familyStats = ref({
	memberCount: 0,
	monthEventCount: 0,
	eventCount: 0,
	dailyExpense: 0,
	dailyIncome: 0,
	dailyCount: 0,
	giftExpense: 0,
	giftIncome: 0,
	totalExpense: 0,
	totalIncome: 0,
	netBalance: 0,
	savingsRate: 0,
	expenseMomTrend: '',
	expenseYoyTrend: '',
	incomeMomTrend: '',
	incomeYoyTrend: '',
	balanceMomTrend: '',
	balanceYoyTrend: '',
});

const isNegativeTrend = (trend?: string) => {
	if (!trend) return false;
	return trend.trim().startsWith('-');
};

const isTrendGood = (type: 'expense' | 'income', trend?: string) => {
	if (!trend) return true;
	const isNeg = isNegativeTrend(trend);
	if (type === 'expense') {
		return isNeg; // 支出减少为好 (绿)
	}
	return !isNeg; // 收入/结余增加为好 (绿)
};

const formatMoney = (val: number | string | undefined, decimals = 2): string => {
	const num = Number(val);
	if (isNaN(num)) return '0.00';
	return num.toLocaleString('zh-CN', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
};

const navigateTo = (path: string, query?: Record<string, string>) => {
	void router.push({ path, query });
};

const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

let cachedTrendData: any[] = [];
let cachedCategoryData: any[] = [];
let cachedMonthExpenseList: any[] = [];

const onChartResize = () => {
	chartInstance?.resize();
};

const renderComprehensiveTrend = () => {
	if (!chartInstance) return;
	const months = cachedTrendData.map((item) => item.label || '');
	const giftGives = cachedTrendData.map((item) => item.giveAmount || 0);
	const giftReceives = cachedTrendData.map((item) => item.receiveAmount || 0);

	// 综合收支 = 随礼支出 + 日常支出映射 (若有日常月度数据则叠加，无则以礼金为主轴)
	const expenseMap = new Map<string, number>();
	cachedMonthExpenseList.forEach((e) => {
		if (e.infoDate) {
			const mKey = dayjs(e.infoDate).format('YYYY-MM');
			expenseMap.set(mKey, (expenseMap.get(mKey) || 0) + Number(e.amount || 0));
		}
	});

	const totalExpenseSeries = months.map((m, idx) => {
		const dailyVal = expenseMap.get(m) || 0;
		return (giftGives[idx] || 0) + dailyVal;
	});

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
			},
			legend: {
				data: ['综合总支出 (元)', '综合总收入 (元)'],
				top: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '40px',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				data: months.length ? months : ['4月', '5月', '6月', '7月', '8月', '9月'],
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			series: [
				{
					name: '综合总支出 (元)',
					type: 'bar',
					barWidth: 18,
					data: totalExpenseSeries.length ? totalExpenseSeries : [8200, 10500, 11800, 13400, 15200, 16800],
					itemStyle: {
						color: '#13c2c2',
						borderRadius: [4, 4, 0, 0],
					},
				},
				{
					name: '综合总收入 (元)',
					type: 'line',
					smooth: true,
					data: giftReceives.length ? giftReceives : [18000, 22000, 31000, 29000, 38000, 46200],
					itemStyle: { color: '#eb2f96' },
				},
			],
		},
		true,
	);
};

const renderCategoryPie = () => {
	if (!chartInstance) return;

	const pieData = cachedCategoryData.map((item) => ({
		name: item.typeName || '日常其他',
		value: Number(item.amount || item.expenseAmount || 0),
	}));

	const hasData = pieData.length > 0 && pieData.some((p) => p.value > 0);

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'item',
				formatter: '{b}: ¥{c} ({d}%)',
			},
			legend: {
				orient: 'vertical',
				right: '5%',
				top: 'middle',
			},
			series: [
				{
					name: '支出分类',
					type: 'pie',
					radius: ['42%', '72%'],
					center: ['40%', '50%'],
					avoidLabelOverlap: true,
					itemStyle: {
						borderRadius: 8,
						borderColor: '#fff',
						borderWidth: 2,
					},
					label: {
						show: false,
						position: 'center',
					},
					emphasis: {
						label: {
							show: true,
							fontSize: 16,
							fontWeight: 'bold',
						},
					},
					data: hasData
						? pieData
						: [
								{ value: 1200, name: '餐饮美食' },
								{ value: 800, name: '居家生活' },
								{ value: 650, name: '生活缴费' },
								{ value: 450, name: '交通出行' },
								{ value: 900, name: '休闲娱乐' },
						  ],
				},
			],
		},
		true,
	);
};

const renderGiftTrend = () => {
	if (!chartInstance) return;
	const months = cachedTrendData.map((item) => item.label || '');
	const giveData = cachedTrendData.map((item) => item.giveAmount || 0);
	const receiveData = cachedTrendData.map((item) => item.receiveAmount || 0);

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
			},
			legend: {
				data: ['随礼支出 (元)', '收礼收入 (元)'],
				top: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '40px',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				data: months.length ? months : ['4月', '5月', '6月', '7月', '8月', '9月'],
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			series: [
				{
					name: '随礼支出 (元)',
					type: 'bar',
					barWidth: 18,
					data: months.length ? giveData : [8200, 10500, 11800, 13400, 15200, 16890],
					itemStyle: {
						color: '#fa541c',
						borderRadius: [4, 4, 0, 0],
					},
				},
				{
					name: '收礼收入 (元)',
					type: 'line',
					smooth: true,
					data: months.length ? receiveData : [18000, 22000, 31000, 29000, 38000, 46200],
					itemStyle: { color: '#eb2f96' },
				},
			],
		},
		true,
	);
};

const onChartTabChange = () => {
	switch (activeChartTab.value) {
		case 'category':
			renderCategoryPie();
			break;
		case 'gift':
			renderGiftTrend();
			break;
		case 'trend':
		default:
			renderComprehensiveTrend();
			break;
	}
};

const loadDashboardMetrics = async () => {
	if (isFamilyContext.value) {
		try {
			// 1. 获取人员统计
			const { code: personCode, data: personData } = await getGiftPersonSummary();
			if (personCode === '200' && personData) {
				familyStats.value.memberCount = personData.personCount ?? 0;
			}

			// 2. 本月起止时间范围 (发生日期口径: 当月1日 00:00:00 至 当月末日 23:59:59)
			const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD 00:00:00');
			const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD 23:59:59');

			// 按发生日期 (event_time) 统计本月人情事由场数
			const { code: eventCode, data: eventData } = await getGiftEventPage(
				{
					eventTimeStart: startOfMonth,
					eventTimeEnd: endOfMonth,
				},
				1,
				1,
			);
			if (eventCode === '200' && eventData) {
				familyStats.value.monthEventCount = eventData.total ?? 0;
				familyStats.value.eventCount = eventData.total ?? 0;
			}

			// 3. 获取按发生日期 (pay_time) 统计的本月礼尚往来流转
			const { code: monthCode, data: monthData } = await getGiftRecordSummary({
				payTimeStart: startOfMonth,
				payTimeEnd: endOfMonth,
			});
			if (monthCode === '200' && monthData) {
				familyStats.value.giftIncome = Number(monthData.receiveAmount) || 0;
				familyStats.value.giftExpense = Number(monthData.giveAmount) || 0;
			}

			// 4. 获取本月个人/家庭日常财务汇总
			const { code: finCode, data: finData } = await getFinanceSummary({
				infoDateStart: dayjs().startOf('month').format('YYYY-MM-DD'),
				infoDateEnd: dayjs().endOf('month').format('YYYY-MM-DD'),
			});
			if (finCode === '200' && finData) {
				familyStats.value.dailyExpense = Number(finData.totalExpense) || 0;
				familyStats.value.dailyIncome = Number(finData.totalIncome) || 0;
				familyStats.value.dailyCount = Number(finData.totalCount) || 0;
			}

			// 5. 核算综合总账
			const totalExp = familyStats.value.dailyExpense + familyStats.value.giftExpense;
			const totalInc = familyStats.value.dailyIncome + familyStats.value.giftIncome;
			const net = totalInc - totalExp;
			familyStats.value.totalExpense = totalExp;
			familyStats.value.totalIncome = totalInc;
			familyStats.value.netBalance = net;
			familyStats.value.savingsRate = totalInc > 0 && net > 0 ? Math.round((net / totalInc) * 100) : 0;

			// 6. 获取人情趋势数据
			const { code: trendCode, data: trendData } = await getGiftAnalysisTrend({ period: 'month' });
			if (trendCode === '200' && Array.isArray(trendData)) {
				cachedTrendData = trendData;
			}

			// 7. 获取日常消费月度走势明细
			try {
				const currentMonth = dayjs().format('YYYY-MM');
				const { code: mExpCode, data: mExpData } = await getMonthExpense(null, currentMonth);
				if (mExpCode === '200' && Array.isArray(mExpData)) {
					cachedMonthExpenseList = mExpData;
				}
			} catch (e) {
				console.warn('获取日常月度走势降级：', e);
			}

			// 8. 获取本月日常消费分类结构
			try {
				const currentMonth = dayjs().format('YYYY-MM');
				const { code: catCode, data: catData } = await getIncomeAndExpense(null, currentMonth, 'expense');
				if (catCode === '200' && Array.isArray(catData)) {
					cachedCategoryData = catData;
				}
			} catch (e) {
				console.warn('获取日常消费分类结构降级：', e);
			}

			// 9. 获取个人/家庭财务余额与同比环比走势
			try {
				const currentMonth = dayjs().format('YYYY-MM');
				const { code: balCode, data: balData } = await getBalance(null, currentMonth);
				if (balCode === '200' && balData) {
					familyStats.value.expenseMomTrend = balData.expenseMomTrend || '';
					familyStats.value.expenseYoyTrend = balData.expenseYoyTrend || '';
					familyStats.value.incomeMomTrend = balData.incomeMomTrend || '';
					familyStats.value.incomeYoyTrend = balData.incomeYoyTrend || '';
					familyStats.value.balanceMomTrend = balData.momTrend || '';
					familyStats.value.balanceYoyTrend = balData.yoyTrend || '';
				}
			} catch (e) {
				console.warn('获取财务同比环比趋势降级：', e);
			}

			// 根据当前激活的 tab 渲染图表
			onChartTabChange();
		} catch (error) {
			console.error('加载家庭人情与财务统计指标异常：', error);
		}
	} else {
		// 机构管理员默认图表渲染
		if (chartInstance) {
			chartInstance.setOption({
				legend: {
					data: ['部门销售额 (元)', '礼金往来流转 (元)'],
				},
				xAxis: {
					data: ['4月', '5月', '6月', '7月', '8月', '9月'],
				},
				series: [
					{
						name: '部门销售额 (元)',
						data: [82000, 105000, 118000, 134000, 152000, 168900],
					},
					{
						name: '礼金往来流转 (元)',
						data: [18000, 22000, 31000, 29000, 38000, 46200],
					},
				],
			});
		}
	}
};

const initChart = async () => {
	if (!chartContainer.value || chartInstance) return;

	const echarts = await loadEcharts();
	if (!chartContainer.value || chartInstance) return;

	chartInstance = echarts.init(chartContainer.value);
	window.addEventListener('resize', onChartResize);
	void loadDashboardMetrics();
};

const disposeChart = () => {
	window.removeEventListener('resize', onChartResize);
	chartInstance?.dispose();
	chartInstance = null;
};

watch(
	() => isFamilyContext.value,
	() => {
		void loadDashboardMetrics();
	},
);

onMounted(() => {
	void initChart();
});

onUnmounted(() => {
	disposeChart();
});
</script>

<style scoped lang="scss">
.org-admin-dashboard {
	.stats-overview-section {
		margin-bottom: 20px;

		.kpi-card {
			border-radius: 16px; /* Tailwind rounded-2xl */
			background: #ffffff;
			border: 1px solid #e2e8f0; /* Tailwind border-slate-200 */
			box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
			transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

			&:hover {
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
				border-color: #cbd5e1;
			}

			&.clickable-card {
				cursor: pointer;

				&:hover {
					transform: translateY(-3px);
					box-shadow: 0 12px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
					border-color: #94a3b8;

					.kpi-icon-badge {
						transform: scale(1.08);
					}
				}
			}

			:deep(.ant-card-body) {
				padding: 18px 20px;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				min-height: 146px;
			}

			.kpi-top-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 8px;

				.kpi-title {
					font-size: 13px;
					font-weight: 600;
					color: #64748b; /* Tailwind slate-500 */
					letter-spacing: -0.2px;
				}
			}

			.kpi-icon-badge {
				width: 40px;
				height: 40px;
				border-radius: 12px; /* Tailwind rounded-xl */
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
				flex-shrink: 0;
				transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

				&.blue {
					background: #eff6ff; /* Tailwind blue-50 */
					color: #2563eb; /* Tailwind blue-600 */
					border: 1px solid #dbeafe;
				}

				&.cyan {
					background: #ecfdf5; /* Tailwind emerald-50 */
					color: #059669; /* Tailwind emerald-600 */
					border: 1px solid #a7f3d0;
				}

				&.orange {
					background: #fffbeb; /* Tailwind amber-50 */
					color: #d97706; /* Tailwind amber-600 */
					border: 1px solid #fde68a;
				}

				&.pink {
					background: #faf5ff; /* Tailwind purple-50 */
					color: #9333ea; /* Tailwind purple-600 */
					border: 1px solid #f3e8ff;
				}

				&.danger-badge {
					background: #fff1f2; /* Tailwind rose-50 */
					color: #e11d48; /* Tailwind rose-600 */
					border: 1px solid #fecdd3;
				}
			}

			.kpi-value-row {
				display: flex;
				align-items: baseline;
				gap: 4px;
				margin-bottom: 10px;

				.kpi-currency {
					font-size: 18px;
					font-weight: 700;
					color: #0f172a;
				}

				.kpi-number {
					font-size: 28px;
					font-weight: 800;
					color: #0f172a; /* Tailwind slate-900 */
					letter-spacing: -0.8px;
					font-variant-numeric: tabular-nums;
				}

				.kpi-unit {
					font-size: 13px;
					font-weight: 600;
					color: #64748b;
				}
			}

			.kpi-bottom-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				flex-wrap: wrap;

				.kpi-breakdown-capsule {
					font-size: 12px;
					font-weight: 500;
					color: #475569;
					background: #f8fafc;
					border: 1px solid #f1f5f9;
					padding: 2px 8px;
					border-radius: 9999px;
					display: inline-flex;
					align-items: center;
					gap: 4px;

					.dot-divider {
						color: #cbd5e1;
					}

					&.danger {
						background: #fff1f2;
						color: #e11d48;
						border-color: #ffe4e6;
					}
				}

				.kpi-trend-badge {
					font-size: 11px;
					font-weight: 600;
					display: inline-flex;
					align-items: center;
					gap: 3px;
					padding: 2px 7px;
					border-radius: 9999px;
					white-space: nowrap;
					transition: all 0.2s ease;
					cursor: pointer;

					&.good {
						background: #ecfdf5;
						color: #047857;
						border: 1px solid #a7f3d0;
					}

					&.warn {
						background: #fff7ed;
						color: #c2410c;
						border: 1px solid #ffedd5;
					}

					&.info {
						background: #eff6ff;
						color: #2563eb;
						border: 1px solid #dbeafe;
					}
				}
			}
		}
	}

	.chart-card {
		border-radius: 16px; /* Tailwind rounded-2xl */
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
		margin-bottom: 20px;
		background: #ffffff;

		:deep(.ant-card-head) {
			border-bottom: 1px solid #f1f5f9;
			font-weight: 700;
			color: #0f172a;
			font-size: 15px;
			letter-spacing: -0.2px;
			padding: 0 20px;
		}

		.chart-container-box {
			height: 320px;
			width: 100%;
		}
	}
}
</style>
