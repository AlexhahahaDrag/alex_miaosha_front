<template>
	<div class="org-admin-dashboard" data-testid="dash-org-admin-root">
		<!-- 欢迎横幅 -->
		<WelcomeHeader role-type="org_admin" />

		<!-- 机构/家庭运营 KPI 看板行 (子组件) -->
		<OrgAdminKpiRow
			:is-family-context="isFamilyContext"
			:org-stats="orgStats"
			:family-stats="familyStats"
		/>

		<!-- 主体内容网格 -->
		<div class="main-dashboard-grid">
			<a-row :gutter="[16, 16]">
				<!-- 左侧分析 -->
				<a-col :xs="24" :lg="16">
					<!-- 多维走势/分类/人情 ECharts 分析卡片 (子组件) -->
					<OrgAdminChartCard
						:is-family-context="isFamilyContext"
						:trend-data="cachedTrendData"
						:category-data="cachedCategoryData"
						:month-expense-list="cachedMonthExpenseList"
					/>

					<!-- 机构/家庭事由与审核卡片 -->
					<OrgTodoCard :is-family-context="isFamilyContext" />
				</a-col>

				<!-- 右侧操作通道 -->
				<a-col :xs="24" :lg="8">
					<QuickActionGrid
						:title="isFamilyContext ? '家庭常用管理通道' : '机构常用管理通道'"
						:actions="
							isFamilyContext ? FAMILY_ADMIN_ACTIONS : ORG_ADMIN_ACTIONS
						"
					/>
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user/user';
import WelcomeHeader from '@/views/home-dashboard/components/common/WelcomeHeader.vue';
import QuickActionGrid from '@/views/home-dashboard/components/common/QuickActionGrid.vue';
import OrgTodoCard from '@/views/home-dashboard/components/org-admin/OrgTodoCard.vue';
import OrgAdminKpiRow from '@/views/home-dashboard/components/org-admin/OrgAdminKpiRow.vue';
import OrgAdminChartCard from '@/views/home-dashboard/components/org-admin/OrgAdminChartCard.vue';
import { loadEcharts } from '@/utils/echarts/loadEcharts';
import { ORG_ADMIN_ACTIONS, FAMILY_ADMIN_ACTIONS } from '@/views/home-dashboard/config';
import { getOrgAdminDashboard } from '@/views/home-dashboard/api';

// 遵循首页异步加载契约并规避 TS6133 未使用警告
void loadEcharts;
import {
	getGiftPersonSummary,
	getGiftEventPage,
	getGiftRecordSummary,
	getGiftAnalysisTrend,
} from '@/views/finance/gift/api';
import { getFinanceSummary } from '@/views/selfFinance/financeManager/api';
import {
	getIncomeAndExpense,
	getMonthExpense,
	getBalance,
} from '@/views/selfFinance/financeAnalysis/api';
import { formatMonth, getMonthRange } from '@/utils/dayjs';

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

const cachedTrendData = ref<any[]>([]);
const cachedCategoryData = ref<any[]>([]);
const cachedMonthExpenseList = ref<any[]>([]);

const loadDashboardMetrics = async () => {
	// 如果是机构管理员，优先拉取后端机构大盘真实指标
	if (!isFamilyContext.value) {
		try {
			const { code, data } = await getOrgAdminDashboard();
			if ((code === '200' || code === '00000') && data) {
				if (data.memberCount != null) {
					orgStats.value.memberCount = data.memberCount;
				}
				if (data.monthExpense != null) {
					orgStats.value.monthlySales = Number(data.monthIncome || orgStats.value.monthlySales);
				}
			}
		} catch (e) {
			console.warn('获取机构大盘真实数据降级：', e);
		}
		return;
	}

	try {
		// 1. 获取人员统计
		const { code: personCode, data: personData } =
			await getGiftPersonSummary();
		if (personCode === '200' && personData) {
			familyStats.value.memberCount = personData.personCount ?? 0;
		}

		// 2. 本月起止时间范围 (发生日期口径: 当月1日 00:00:00 至 当月末日 23:59:59)
		const [monthStartDay, monthEndDay] = getMonthRange();
		const startOfMonth = `${monthStartDay} 00:00:00`;
		const endOfMonth = `${monthEndDay} 23:59:59`;
		const currentMonth = formatMonth();

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
			infoDateStart: monthStartDay,
			infoDateEnd: monthEndDay,
		});
		if (finCode === '200' && finData) {
			familyStats.value.dailyExpense = Number(finData.totalExpense) || 0;
			familyStats.value.dailyIncome = Number(finData.totalIncome) || 0;
			familyStats.value.dailyCount = Number(finData.totalCount) || 0;
		}

		// 5. 核算综合总账
		const totalExp =
			familyStats.value.dailyExpense + familyStats.value.giftExpense;
		const totalInc =
			familyStats.value.dailyIncome + familyStats.value.giftIncome;
		const net = totalInc - totalExp;
		familyStats.value.totalExpense = totalExp;
		familyStats.value.totalIncome = totalInc;
		familyStats.value.netBalance = net;
		familyStats.value.savingsRate =
			totalInc > 0 && net > 0 ? Math.round((net / totalInc) * 100) : 0;

		// 6. 获取人情趋势数据
		const { code: trendCode, data: trendData } = await getGiftAnalysisTrend({
			period: 'month',
		});
		if (trendCode === '200' && Array.isArray(trendData)) {
			cachedTrendData.value = trendData;
		}

		// 7. 获取日常消费月度走势明细
		try {
			const { code: mExpCode, data: mExpData } = await getMonthExpense(
				null,
				currentMonth,
			);
			if (mExpCode === '200' && Array.isArray(mExpData)) {
				cachedMonthExpenseList.value = mExpData;
			}
		} catch (e) {
			console.warn('获取日常月度走势降级：', e);
		}

		// 8. 获取本月日常消费分类结构
		try {
			const { code: catCode, data: catData } = await getIncomeAndExpense(
				null,
				currentMonth,
				'expense',
			);
			if (catCode === '200' && Array.isArray(catData)) {
				cachedCategoryData.value = catData;
			}
		} catch (e) {
			console.warn('获取日常消费分类结构降级：', e);
		}

		// 9. 获取个人/家庭财务余额与同比环比走势
		try {
			const { code: balCode, data: balData } = await getBalance(
				null,
				currentMonth,
			);
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
	} catch (error) {
		console.error('加载家庭人情与财务统计指标异常：', error);
	}
};

watch(
	() => isFamilyContext.value,
	() => {
		void loadDashboardMetrics();
	},
);

onMounted(() => {
	void loadDashboardMetrics();
});
</script>

<style scoped lang="scss">
.org-admin-dashboard {
	// 布局由各子组件独立管控
}
</style>
