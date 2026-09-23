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
							<a-radio-group v-model:value="trendRange" size="small" button-style="solid">
								<a-radio-button value="7d">近7天</a-radio-button>
								<a-radio-button value="30d">近30天</a-radio-button>
							</a-radio-group>
						</template>
						<div ref="chartContainer" class="chart-container-box"></div>
					</a-card>

					<!-- 系统安全审计流 -->
					<SystemAuditTimeline />
				</a-col>

				<!-- 右侧控制与运维 -->
				<a-col :xs="24" :lg="8">
					<!-- 超管专属高频入口 -->
					<QuickActionGrid
						title="系统级全局管理通道"
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
import WelcomeHeader from '../common/WelcomeHeader.vue';
import QuickActionGrid from '../common/QuickActionGrid.vue';
import ServiceHealthCard from './ServiceHealthCard.vue';
import SystemAuditTimeline from './SystemAuditTimeline.vue';
import { SUPER_ADMIN_ACTIONS } from '../../config';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import {
	TeamOutlined,
	ApartmentOutlined,
	TransactionOutlined,
	ThunderboltOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons-vue';

const trendRange = ref<'7d' | '30d'>('7d');
const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

// 超管大盘数据
const statsData = ref({
	totalUsers: 12480,
	activeOrgs: 86,
	totalTurnover: 842600,
	clusterQps: 3420,
});

const onChartResize = () => {
	chartInstance?.resize();
};

const initChart = async () => {
	if (!chartContainer.value || chartInstance) return;

	const echarts = await loadEcharts();
	if (!chartContainer.value || chartInstance) return;

	chartInstance = echarts.init(chartContainer.value);

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
			data: ['09-16', '09-17', '09-18', '09-19', '09-20', '09-21', '09-22'],
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
				data: [1800, 2200, 2400, 2900, 3100, 3250, 3420],
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
				data: [420, 560, 610, 780, 890, 1120, 1340],
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
		chartInstance.setOption({
			xAxis: {
				data: ['09-16', '09-17', '09-18', '09-19', '09-20', '09-21', '09-22'],
			},
			series: [
				{ data: [1800, 2200, 2400, 2900, 3100, 3250, 3420] },
				{ data: [420, 560, 610, 780, 890, 1120, 1340] },
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
				width: 50px;
				height: 50px;
				border-radius: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 22px;
				flex-shrink: 0;

				&.blue {
					background: #eff6ff;
					color: #2563eb;
					border: 1px solid #dbeafe;
				}

				&.cyan {
					background: #ecfdf5;
					color: #059669;
					border: 1px solid #a7f3d0;
				}

				&.purple {
					background: #faf5ff;
					color: #9333ea;
					border: 1px solid #f3e8ff;
				}

				&.green {
					background: #ecfdf5;
					color: #047857;
					border: 1px solid #a7f3d0;
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
					border-radius: 9999px;
					width: fit-content;

					&.up {
						background: #ecfdf5;
						color: #047857;
						border: 1px solid rgba(167, 243, 208, 0.8);
						font-weight: 500;
					}

					&.stable {
						background: #eff6ff;
						color: #1d4ed8;
						border: 1px solid rgba(191, 219, 254, 0.8);
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
