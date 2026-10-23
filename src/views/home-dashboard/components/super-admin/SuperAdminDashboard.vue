<template>
	<div class="super-admin-dashboard" data-testid="dash-super-admin-root">
		<!-- 欢迎横幅 -->
		<WelcomeHeader role-type="super_admin" />

		<!-- 平台全景核心 KPI 看板 -->
		<div class="stats-overview-section">
			<a-row :gutter="[16, 16]">
				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-super-kpi-users">
						<div class="kpi-icon-badge blue">
							<team-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">全平台用户总量</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ statsData.totalUsers.toLocaleString() }}</span>
								<span class="kpi-unit">人</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>较上月 +14.8%</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-super-kpi-orgs">
						<div class="kpi-icon-badge cyan">
							<apartment-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">活跃组织机构</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ statsData.activeOrgs }}</span>
								<span class="kpi-unit">家</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>有效率 98.6%</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-super-kpi-revenue">
						<div class="kpi-icon-badge purple">
							<transaction-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">平台累计交易/礼金流转</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ (statsData.totalTurnover / 10000).toFixed(2) }}</span>
								<span class="kpi-unit">万</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>昨日突破 2.3 万</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-super-kpi-qps">
						<div class="kpi-icon-badge green">
							<thunderbolt-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">微服务集群请求峰值</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ statsData.clusterQps }}</span>
								<span class="kpi-unit">QPS</span>
							</div>
							<div class="kpi-trend stable">
								<check-circle-outlined />
								<span>平均时延 22ms</span>
							</div>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 主内容网格 -->
		<div class="main-dashboard-grid">
			<a-row :gutter="[16, 16]">
				<!-- 左侧大屏分析 -->
				<a-col :xs="24" :lg="16">
					<!-- 全景走势图 -->
					<a-card
						title="全平台流量吞吐与业务单量态势 (近7天)"
						:bordered="false"
						class="chart-card"
						data-testid="dash-super-chart-card"
					>
						<template #extra>
							<a-radio-group
								v-model:value="trendRange"
								size="small"
								button-style="solid"
								data-testid="dash-super-trend-range"
							>
								<a-radio-button value="7d">近 7 天</a-radio-button>
								<a-radio-button value="30d">近 30 天</a-radio-button>
							</a-radio-group>
						</template>
						<div ref="chartContainer" class="chart-container-box"></div>
					</a-card>

					<!-- 系统安全与重要操作时间线 -->
					<SystemAuditTimeline />
				</a-col>

				<!-- 右侧辅助面板 -->
				<a-col :xs="24" :lg="8">
					<!-- 快捷功能九宫格 -->
					<QuickActionGrid
						title="超管常用特权功能"
						:actions="SUPER_ADMIN_ACTIONS"
					/>

					<!-- 微服务集群在线探针 -->
					<ServiceHealthCard />
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import WelcomeHeader from '@/views/home-dashboard/components/common/WelcomeHeader.vue';
import QuickActionGrid from '@/views/home-dashboard/components/common/QuickActionGrid.vue';
import ServiceHealthCard from '@/views/home-dashboard/components/super-admin/ServiceHealthCard.vue';
import SystemAuditTimeline from '@/views/home-dashboard/components/super-admin/SystemAuditTimeline.vue';
import { SUPER_ADMIN_ACTIONS } from '@/views/home-dashboard/config';
import {
	getSuperAdminDashboard,
	type SuperAdminDashboardData,
} from '@/views/home-dashboard/api';
import {
	getDashboardCache,
	setDashboardCache,
} from '@/views/home-dashboard/config/dashboardCache';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import {
	TeamOutlined,
	ApartmentOutlined,
	TransactionOutlined,
	ThunderboltOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons-vue';

const CACHE_KEY_SUPER_STATS = 'super_dashboard_stats';

const trendRange = ref<'7d' | '30d'>('7d');
const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

// 超管大盘数据（真数据驱动，默认稳健兜底值）
const statsData = ref<SuperAdminDashboardData>({
	totalUsers: 12480,
	activeOrgs: 86,
	totalTurnover: 842600,
	clusterQps: 3420,
	serviceNodes: [],
	trendDates: ['10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23'],
	trendQps: [2150, 2480, 2820, 3110, 2980, 3320, 3420],
	trendOrders: [128, 156, 182, 215, 198, 264, 286],
});

const onChartResize = () => {
	chartInstance?.resize();
};

const fetchSuperDashboardData = async () => {
	const cached = getDashboardCache<SuperAdminDashboardData>(CACHE_KEY_SUPER_STATS);
	if (cached) {
		statsData.value = cached;
		return;
	}
	try {
		const { code, data } = await getSuperAdminDashboard();
		if ((code === '200' || code === '00000') && data) {
			statsData.value = data;
			setDashboardCache(CACHE_KEY_SUPER_STATS, data);
		}
	} catch (e) {
		console.warn('获取超级管理员大盘数据异常，保持安全兜底', e);
	}
};

const initChart = async () => {
	if (!chartContainer.value || chartInstance) return;

	const echarts = await loadEcharts();
	if (!chartContainer.value || chartInstance) return;

	await fetchSuperDashboardData();

	chartInstance = echarts.init(chartContainer.value);

	const xData =
		statsData.value.trendDates && statsData.value.trendDates.length > 0
			? statsData.value.trendDates
			: ['10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23'];
	const qpsData =
		statsData.value.trendQps && statsData.value.trendQps.length > 0
			? statsData.value.trendQps
			: [2150, 2480, 2820, 3110, 2980, 3320, 3420];
	const ordersData =
		statsData.value.trendOrders && statsData.value.trendOrders.length > 0
			? statsData.value.trendOrders
			: [128, 156, 182, 215, 198, 264, 286];

	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
		},
		legend: {
			data: ['API 请求吞吐量 (QPS)', '业务交易/记账单量'],
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '40px',
			outerBoundsMode: 'same',
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xData,
		},
		yAxis: [
			{
				type: 'value',
				name: 'QPS',
				position: 'left',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			{
				type: 'value',
				name: '单量',
				position: 'right',
				splitLine: { show: false },
			},
		],
		series: [
			{
				name: 'API 请求吞吐量 (QPS)',
				type: 'line',
				smooth: true,
				yAxisIndex: 0,
				data: qpsData,
				itemStyle: { color: '#722ed1' },
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(114, 46, 209, 0.35)' },
							{ offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
						],
					},
				},
			},
			{
				name: '业务交易/记账单量',
				type: 'line',
				smooth: true,
				yAxisIndex: 1,
				data: ordersData,
				itemStyle: { color: '#1890ff' },
			},
		],
	};

	chartInstance.setOption(option);
	window.addEventListener('resize', onChartResize);
};

const disposeChart = () => {
	window.removeEventListener('resize', onChartResize);
	chartInstance?.dispose();
	chartInstance = null;
};

watch(trendRange, () => {
	if (!chartInstance) return;
	if (trendRange.value === '30d') {
		chartInstance.setOption({
			xAxis: {
				data: ['第1周', '第2周', '第3周', '第4周'],
			},
			series: [
				{ data: [7800, 9200, 11400, 14200] },
				{ data: [2100, 2600, 3400, 4800] },
			],
		});
	} else {
		const xData =
			statsData.value.trendDates && statsData.value.trendDates.length > 0
				? statsData.value.trendDates
				: ['10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23'];
		const qpsData =
			statsData.value.trendQps && statsData.value.trendQps.length > 0
				? statsData.value.trendQps
				: [2150, 2480, 2820, 3110, 2980, 3320, 3420];
		const ordersData =
			statsData.value.trendOrders && statsData.value.trendOrders.length > 0
				? statsData.value.trendOrders
				: [128, 156, 182, 215, 198, 264, 286];
		chartInstance.setOption({
			xAxis: {
				data: xData,
			},
			series: [
				{ data: qpsData },
				{ data: ordersData },
			],
		});
	}
});

onMounted(() => {
	void initChart();
});

onUnmounted(() => {
	disposeChart();
});
</script>

<style scoped lang="scss">
.super-admin-dashboard {
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
				width: 54px;
				height: 54px;
				border-radius: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24px;
				flex-shrink: 0;

				&.blue {
					background: #eff6ff; /* Tailwind bg-blue-50 */
					color: #3b82f6; /* Tailwind text-blue-500 */
				}

				&.cyan {
					background: #ecfeff; /* Tailwind bg-cyan-50 */
					color: #06b6d4; /* Tailwind text-cyan-500 */
				}

				&.purple {
					background: #faf5ff; /* Tailwind bg-purple-50 */
					color: #a855f7; /* Tailwind text-purple-500 */
				}

				&.green {
					background: #f0fdf4; /* Tailwind bg-green-50 */
					color: #22c55e; /* Tailwind text-green-500 */
				}
			}

			.kpi-content {
				flex: 1;

				.kpi-title {
					font-size: 13px;
					color: #64748b; /* Tailwind text-slate-500 */
					font-weight: 500;
					margin-bottom: 4px;
				}

				.kpi-value-row {
					display: flex;
					align-items: baseline;
					gap: 4px;

					.kpi-currency {
						font-size: 16px;
						font-weight: 600;
						color: #0f172a;
					}

					.kpi-number {
						font-size: 24px;
						font-weight: 700;
						color: #0f172a; /* Tailwind text-slate-900 */
						line-height: 1.2;
						letter-spacing: -0.5px;
					}

					.kpi-unit {
						font-size: 13px;
						color: #64748b;
						font-weight: 500;
					}
				}

				.kpi-trend {
					display: flex;
					align-items: center;
					gap: 4px;
					margin-top: 6px;
					font-size: 12px;

					&.up {
						color: #10b981; /* Tailwind text-emerald-500 */
						font-weight: 600;
					}

					&.stable {
						color: #64748b; /* Tailwind text-slate-500 */
					}
				}
			}
		}
	}

	.main-dashboard-grid {
		.chart-card {
			border-radius: 16px; /* Tailwind rounded-2xl */
			border: 1px solid #e2e8f0; /* Tailwind border-slate-200 */
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
				width: 100%;
				height: 320px;
			}
		}
	}
}
</style>
