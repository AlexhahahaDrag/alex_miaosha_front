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

				&.green {
					background: #f6ffed;
					color: #52c41a;
				}

				&.orange {
					background: #fff7e6;
					color: #fa8c16;
				}

				&.purple {
					background: #f9f0ff;
					color: #722ed1;
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

					&.expense {
						color: #fa8c16;
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
