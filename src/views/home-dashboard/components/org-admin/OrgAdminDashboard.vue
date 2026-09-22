<template>
	<div class="org-admin-dashboard" data-testid="dash-org-admin-root">
		<!-- 欢迎横幅 -->
		<WelcomeHeader role-type="org_admin" />

		<!-- 机构/家庭运营 KPI 看板 -->
		<div class="stats-overview-section">
			<a-row :gutter="[16, 16]">
				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-org-kpi-members">
						<div class="kpi-icon-badge blue">
							<team-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">{{ isFamilyContext ? '家庭在册成员' : '本机构在册员工' }}</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ isFamilyContext ? familyStats.memberCount : orgStats.memberCount }}</span>
								<span class="kpi-unit">人</span>
							</div>
							<div class="kpi-trend up">
								<check-circle-outlined />
								<span>{{ isFamilyContext ? (familyStats.memberCount > 0 ? '家庭档案建档齐全' : '暂无家庭成员档案') : '全员绑定有效机构' }}</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-org-kpi-products">
						<div class="kpi-icon-badge cyan">
							<appstore-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">{{ isFamilyContext ? '家庭往来人情事件' : '管辖商品/秒杀在售' }}</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ isFamilyContext ? familyStats.eventCount : orgStats.productCount }}</span>
								<span class="kpi-unit">{{ isFamilyContext ? '场' : '件' }}</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>{{ isFamilyContext ? (familyStats.eventCount > 0 ? '覆盖婚丧嫁娶与满月等' : '暂无历史人情事件') : '上架率 94.2%' }}</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-org-kpi-turnover">
						<div class="kpi-icon-badge orange">
							<dollar-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">{{ isFamilyContext ? '本月人情往来流转' : '本月成交额' }}</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ (isFamilyContext ? familyStats.monthlyAmount : orgStats.monthlySales).toLocaleString() }}</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>{{ isFamilyContext ? familyStats.monthlyDetail : '环比增长 +9.4%' }}</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-org-kpi-gift">
						<div class="kpi-icon-badge pink">
							<account-book-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">{{ isFamilyContext ? '家庭礼金总吞吐额' : '机构礼金往来总额' }}</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ (isFamilyContext ? familyStats.totalGiftTurnover : orgStats.giftTurnover).toLocaleString() }}</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>{{ isFamilyContext ? familyStats.totalGiftDetail : '累计收礼32笔/随礼26笔' }}</span>
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
						:title="isFamilyContext ? '家庭月度人情礼金收支与往来走势' : '本机构月度销售与礼金往来走势'"
						:bordered="false"
						class="chart-card"
						data-testid="dash-org-chart-card"
					>
						<div ref="chartContainer" class="chart-container-box"></div>
					</a-card>

					<!-- 机构待办与审核 -->
					<OrgTodoCard :is-family-context="isFamilyContext" />
				</a-col>

				<!-- 右侧操作 -->
				<a-col :xs="24" :lg="8">
					<QuickActionGrid
						:title="isFamilyContext ? '家庭常用管理通道' : '机构常用管理通道'"
						:actions="ORG_ADMIN_ACTIONS"
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
import { ORG_ADMIN_ACTIONS } from '../../config';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import {
	getGiftPersonSummary,
	getGiftEventPage,
	getGiftRecordSummary,
	getGiftAnalysisTrend,
} from '@/views/finance/gift/api';
import dayjs from 'dayjs';
import {
	TeamOutlined,
	AppstoreOutlined,
	DollarOutlined,
	AccountBookOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons-vue';

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
	eventCount: 0,
	monthlyAmount: 0,
	monthlyDetail: '本月暂无往来',
	totalGiftTurnover: 0,
	totalGiftDetail: '暂无往来记录',
});

const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

const onChartResize = () => {
	chartInstance?.resize();
};

const updateChart = (trendData: any[]) => {
	if (!chartInstance) return;
	const months = trendData.map((item) => item.label || '');
	const giveData = trendData.map((item) => item.giveAmount || 0);
	const receiveData = trendData.map((item) => item.receiveAmount || 0);

	chartInstance.setOption({
		legend: {
			data: isFamilyContext.value ? ['随礼支出 (元)', '收礼收入 (元)'] : ['部门销售额 (元)', '礼金往来流转 (元)'],
		},
		xAxis: {
			data: months.length ? months : ['4月', '5月', '6月', '7月', '8月', '9月'],
		},
		series: [
			{
				name: isFamilyContext.value ? '随礼支出 (元)' : '部门销售额 (元)',
				data: months.length ? giveData : [82000, 105000, 118000, 134000, 152000, 168900],
			},
			{
				name: isFamilyContext.value ? '收礼收入 (元)' : '礼金往来流转 (元)',
				data: months.length ? receiveData : [18000, 22000, 31000, 29000, 38000, 46200],
			},
		],
	});
};

const loadDashboardMetrics = async () => {
	if (isFamilyContext.value) {
		try {
			// 1. 获取人员统计
			const { code: personCode, data: personData } = await getGiftPersonSummary();
			if (personCode === '200' && personData) {
				familyStats.value.memberCount = personData.personCount ?? 0;
			}

			// 2. 获取人情事件总数
			const { code: eventCode, data: eventData } = await getGiftEventPage({}, 1, 1);
			if (eventCode === '200' && eventData) {
				familyStats.value.eventCount = eventData.total ?? 0;
			}

			// 3. 获取本月往来流转额
			const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD 00:00:00');
			const { code: monthCode, data: monthData } = await getGiftRecordSummary({
				payTimeStart: startOfMonth,
			});
			if (monthCode === '200' && monthData) {
				const mRec = Number(monthData.receiveAmount) || 0;
				const mGive = Number(monthData.giveAmount) || 0;
				familyStats.value.monthlyAmount = mRec + mGive;
				const count = monthData.recordCount ?? 0;
				familyStats.value.monthlyDetail = count > 0 ? `本月往来 ${count} 笔` : '本月暂无往来';
			}

			// 4. 获取历史累计流转总额
			const { code: totalCode, data: totalData } = await getGiftRecordSummary({});
			if (totalCode === '200' && totalData) {
				const tRec = Number(totalData.receiveAmount) || 0;
				const tGive = Number(totalData.giveAmount) || 0;
				familyStats.value.totalGiftTurnover = tRec + tGive;
				familyStats.value.totalGiftDetail = `收礼 ¥${tRec.toLocaleString()} / 随礼 ¥${tGive.toLocaleString()}`;
			}

			// 5. 获取月度趋势
			const { code: trendCode, data: trendData } = await getGiftAnalysisTrend({ period: 'month' });
			if (trendCode === '200' && Array.isArray(trendData) && trendData.length > 0) {
				updateChart(trendData);
			}
		} catch (error) {
			console.error('加载家庭人情统计指标异常：', error);
		}
	}
};

const initChart = async () => {
	if (!chartContainer.value || chartInstance) return;

	const echarts = await loadEcharts();
	if (!chartContainer.value || chartInstance) return;

	chartInstance = echarts.init(chartContainer.value);

	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
		},
		legend: {
			data: isFamilyContext.value ? ['随礼支出 (元)', '收礼收入 (元)'] : ['部门销售额 (元)', '礼金往来流转 (元)'],
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
			data: ['4月', '5月', '6月', '7月', '8月', '9月'],
		},
		yAxis: {
			type: 'value',
			splitLine: { lineStyle: { type: 'dashed' } },
		},
		series: [
			{
				name: isFamilyContext.value ? '随礼支出 (元)' : '部门销售额 (元)',
				type: 'bar',
				barWidth: 18,
				data: [82000, 105000, 118000, 134000, 152000, 168900],
				itemStyle: {
					color: '#13c2c2',
					borderRadius: [4, 4, 0, 0],
				},
			},
			{
				name: isFamilyContext.value ? '收礼收入 (元)' : '礼金往来流转 (元)',
				type: 'line',
				smooth: true,
				data: [18000, 22000, 31000, 29000, 38000, 46200],
				itemStyle: { color: '#eb2f96' },
			},
		],
	};

	chartInstance.setOption(option);
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
				transform: translateY(-2px);
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
				border-color: #cbd5e1;
			}

			:deep(.ant-card-body) {
				padding: 20px;
				display: flex;
				align-items: center;
				gap: 16px;
			}

			.kpi-icon-badge {
				width: 50px;
				height: 50px;
				border-radius: 14px; /* Tailwind rounded-xl */
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 22px;
				flex-shrink: 0;

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
			}

			.kpi-content {
				flex: 1;

				.kpi-title {
					font-size: 13px;
					font-weight: 500;
					color: #64748b; /* Tailwind slate-500 */
					margin-bottom: 6px;
				}

				.kpi-value-row {
					display: flex;
					align-items: baseline;
					gap: 4px;
					margin-bottom: 6px;

					.kpi-currency {
						font-size: 16px;
						font-weight: 700;
						color: #0f172a;
					}

					.kpi-number {
						font-size: 26px;
						font-weight: 800;
						color: #0f172a; /* Tailwind slate-900 */
						letter-spacing: -0.5px;
					}

					.kpi-unit {
						font-size: 12px;
						font-weight: 500;
						color: #64748b;
					}
				}

				.kpi-trend {
					font-size: 12px;
					display: inline-flex;
					align-items: center;
					gap: 4px;
					padding: 2px 8px;
					border-radius: 9999px; /* Tailwind rounded-full */
					width: fit-content;

					&.up {
						background: #ecfdf5;
						color: #047857; /* Tailwind emerald-700 */
						border: 1px solid rgba(167, 243, 208, 0.8);
						font-weight: 500;
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
