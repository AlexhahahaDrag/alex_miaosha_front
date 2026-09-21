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
			containLabel: true,
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
			border-radius: 12px;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
			transition: all 0.3s ease;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
			}

			:deep(.ant-card-body) {
				padding: 18px 20px;
				display: flex;
				align-items: center;
				gap: 16px;
			}

			.kpi-icon-badge {
				width: 52px;
				height: 52px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24px;
				flex-shrink: 0;

				&.blue {
					background: #e6f7ff;
					color: #1890ff;
				}

				&.cyan {
					background: #e6fffb;
					color: #13c2c2;
				}

				&.purple {
					background: #f9f0ff;
					color: #722ed1;
				}

				&.green {
					background: #f6ffed;
					color: #52c41a;
				}
			}

			.kpi-content {
				flex: 1;

				.kpi-title {
					font-size: 13px;
					color: #8c8c8c;
					margin-bottom: 4px;
				}

				.kpi-value-row {
					display: flex;
					align-items: baseline;
					gap: 4px;
					margin-bottom: 4px;

					.kpi-currency {
						font-size: 16px;
						font-weight: 600;
						color: #262626;
					}

					.kpi-number {
						font-size: 22px;
						font-weight: 700;
						color: #1f1f1f;
					}

					.kpi-unit {
						font-size: 12px;
						color: #8c8c8c;
					}
				}

				.kpi-trend {
					font-size: 12px;
					display: flex;
					align-items: center;
					gap: 4px;

					&.up {
						color: #52c41a;
					}

					&.stable {
						color: #1890ff;
					}
				}
			}
		}
	}

	.chart-card {
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
		margin-bottom: 20px;

		:deep(.ant-card-head) {
			border-bottom: 1px solid #f0f0f0;
			font-weight: 600;
		}

		.chart-container-box {
			height: 320px;
			width: 100%;
		}
	}
}
</style>
