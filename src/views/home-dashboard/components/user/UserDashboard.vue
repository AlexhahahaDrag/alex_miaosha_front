<template>
	<div class="user-dashboard" data-testid="dash-user-dashboard-root">
		<!-- 欢迎横幅 -->
		<WelcomeHeader role-type="user" />

		<!-- 个人资产与人情核心 KPI -->
		<div class="stats-overview-section">
			<a-row :gutter="[16, 16]">
				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-user-kpi-records">
						<div class="kpi-icon-badge blue">
							<profile-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">我登记的礼簿笔数</div>
							<div class="kpi-value-row">
								<span class="kpi-number">{{ personalStats.recordCount }}</span>
								<span class="kpi-unit">笔</span>
							</div>
							<div class="kpi-trend stable">
								<clock-circle-outlined />
								<span>涵盖亲友与同事人情</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-user-kpi-received">
						<div class="kpi-icon-badge green">
							<rise-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">累计收礼总额</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ personalStats.receivedAmount.toLocaleString() }}</span>
							</div>
							<div class="kpi-trend up">
								<arrow-up-outlined />
								<span>共办宴席 3 场</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-user-kpi-sent">
						<div class="kpi-icon-badge orange">
							<fall-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">累计随礼支出</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ personalStats.sentAmount.toLocaleString() }}</span>
							</div>
							<div class="kpi-trend expense">
								<check-outlined />
								<span>赴宴出席 22 次</span>
							</div>
						</div>
					</a-card>
				</a-col>

				<a-col :xs="24" :sm="12" :md="6">
					<a-card :bordered="false" class="kpi-card" data-testid="dash-user-kpi-balance">
						<div class="kpi-icon-badge purple">
							<wallet-outlined />
						</div>
						<div class="kpi-content">
							<div class="kpi-title">人情往来净结余</div>
							<div class="kpi-value-row">
								<span class="kpi-currency">¥</span>
								<span class="kpi-number">{{ netBalance.toLocaleString() }}</span>
							</div>
							<div class="kpi-trend up">
								<heart-outlined />
								<span>收支基本均衡健康</span>
							</div>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 主内容区 -->
		<div class="main-dashboard-grid">
			<a-row :gutter="[16, 16]">
				<!-- 左侧分析 -->
				<a-col :xs="24" :lg="16">
					<a-card
						title="近半年人情礼尚往来走势 (收礼 vs 随礼)"
						:bordered="false"
						class="chart-card"
						data-testid="dash-user-chart-card"
					>
						<div ref="chartContainer" class="chart-container-box"></div>
					</a-card>

					<!-- 个人待办日程 -->
					<PersonalTodoCard />
				</a-col>

				<!-- 右侧快捷功能 -->
				<a-col :xs="24" :lg="8">
					<QuickActionGrid
						title="快捷服务与常用入口"
						:actions="USER_ACTIONS"
					/>
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import WelcomeHeader from '../common/WelcomeHeader.vue';
import QuickActionGrid from '../common/QuickActionGrid.vue';
import PersonalTodoCard from './PersonalTodoCard.vue';
import { USER_ACTIONS } from '../../config';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import {
	ProfileOutlined,
	RiseOutlined,
	FallOutlined,
	WalletOutlined,
	ClockCircleOutlined,
	ArrowUpOutlined,
	CheckOutlined,
	HeartOutlined,
} from '@ant-design/icons-vue';

const personalStats = ref({
	recordCount: 38,
	receivedAmount: 32600,
	sentAmount: 24800,
});

const netBalance = computed(
	() => personalStats.value.receivedAmount - personalStats.value.sentAmount,
);

const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

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
			axisPointer: { type: 'shadow' },
		},
		legend: {
			data: ['收受礼金 (元)', '随礼支出 (元)'],
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
				name: '收受礼金 (元)',
				type: 'bar',
				barWidth: 16,
				data: [3000, 12000, 2000, 5000, 4600, 6000],
				itemStyle: {
					color: '#52c41a',
					borderRadius: [4, 4, 0, 0],
				},
			},
			{
				name: '随礼支出 (元)',
				type: 'bar',
				barWidth: 16,
				data: [2000, 4500, 3200, 6000, 3100, 6000],
				itemStyle: {
					color: '#fa8c16',
					borderRadius: [4, 4, 0, 0],
				},
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

onMounted(() => {
	void initChart();
});

onUnmounted(() => {
	disposeChart();
});
</script>

<style scoped lang="scss">
.user-dashboard {
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

				&.green {
					background: #ecfdf5;
					color: #059669;
					border: 1px solid #a7f3d0;
				}

				&.orange {
					background: #fffbeb;
					color: #d97706;
					border: 1px solid #fde68a;
				}

				&.purple {
					background: #faf5ff;
					color: #9333ea;
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
					border-radius: 9999px;
					width: fit-content;

					&.up {
						background: #ecfdf5;
						color: #047857;
						border: 1px solid rgba(167, 243, 208, 0.8);
						font-weight: 500;
					}

					&.expense {
						background: #fffbeb;
						color: #b45309;
						border: 1px solid rgba(253, 230, 138, 0.8);
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
