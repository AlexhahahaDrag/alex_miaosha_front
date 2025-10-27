<template>
	<div class="dashboard-container">
		<!-- 欢迎区域 -->
		<div class="welcome-section">
			<a-card class="welcome-card">
				<div class="welcome-content">
					<div class="welcome-text">
						<h2>欢迎回来，{{ userInfo?.nickName }}！</h2>
						<p>今天是 {{ currentDate }}，祝您工作愉快！</p>
					</div>
					<div class="welcome-image">
						<a-avatar :size="64" style="background-color: #1890ff">
							<template #icon>
								<user-outlined />
							</template>
						</a-avatar>
					</div>
				</div>
			</a-card>
		</div>

		<!-- 数据统计卡片 -->
		<div class="stats-section">
			<a-row :gutter="[16, 16]">
				<a-col :xs="24" :sm="12" :md="6">
					<a-card class="stat-card">
						<a-statistic
							title="今日订单"
							:value="statsData.todayOrders"
							:value-style="{ color: '#3f8600' }"
						>
							<template #prefix>
								<shopping-cart-outlined />
							</template>
						</a-statistic>
						<div class="stat-trend">
							<span class="trend-up">↗ +12.5%</span>
						</div>
					</a-card>
				</a-col>
				<a-col :xs="24" :sm="12" :md="6">
					<a-card class="stat-card">
						<a-statistic
							title="今日销售额"
							:value="statsData.todayRevenue"
							prefix="¥"
							:value-style="{ color: '#1890ff' }"
						/>
						<div class="stat-trend">
							<span class="trend-up">↗ +8.3%</span>
						</div>
					</a-card>
				</a-col>
				<a-col :xs="24" :sm="12" :md="6">
					<a-card class="stat-card">
						<a-statistic
							title="活跃用户"
							:value="statsData.activeUsers"
							:value-style="{ color: '#52c41a' }"
						>
							<template #prefix>
								<team-outlined />
							</template>
						</a-statistic>
						<div class="stat-trend">
							<span class="trend-down">↘ -2.1%</span>
						</div>
					</a-card>
				</a-col>
				<a-col :xs="24" :sm="12" :md="6">
					<a-card class="stat-card">
						<a-statistic
							title="商品数量"
							:value="statsData.totalProducts"
							:value-style="{ color: '#722ed1' }"
						>
							<template #prefix>
								<appstore-outlined />
							</template>
						</a-statistic>
						<div class="stat-trend">
							<span class="trend-up">↗ +5.2%</span>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 图表和快捷操作 -->
		<div class="content-section">
			<a-row :gutter="[16, 16]">
				<!-- 销售趋势图表 -->
				<a-col :xs="24" :lg="16">
					<a-card title="销售趋势" class="chart-card">
						<div ref="chartContainer" style="height: 300px"></div>
					</a-card>
				</a-col>

				<!-- 快捷操作 -->
				<a-col :xs="24" :lg="8">
					<a-card title="快捷操作" class="quick-actions-card">
						<div class="quick-actions">
							<a-button
								type="primary"
								size="large"
								block
								class="action-btn"
								@click="navigateTo('/product')"
							>
								<plus-outlined />
								添加商品
							</a-button>
							<a-button
								size="large"
								block
								class="action-btn"
								@click="navigateTo('/seckill')"
							>
								<thunderbolt-outlined />
								秒杀管理
							</a-button>
							<a-button
								size="large"
								block
								class="action-btn"
								@click="navigateTo('/order')"
							>
								<file-text-outlined />
								订单管理
							</a-button>
							<a-button
								size="large"
								block
								class="action-btn"
								@click="navigateTo('/user')"
							>
								<user-outlined />
								用户管理
							</a-button>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 最新动态和待办事项 -->
		<div class="bottom-section">
			<a-row :gutter="[16, 16]">
				<!-- 最新动态 -->
				<a-col :xs="24" :lg="12">
					<a-card title="最新动态" class="activity-card">
						<a-timeline>
							<a-timeline-item
								v-for="(item, index) in recentActivities"
								:key="index"
								:color="item.color"
							>
								<div class="activity-item">
									<div class="activity-title">{{ item.title }}</div>
									<div class="activity-time">{{ item.time }}</div>
								</div>
							</a-timeline-item>
						</a-timeline>
					</a-card>
				</a-col>

				<!-- 待办事项 -->
				<a-col :xs="24" :lg="12">
					<a-card title="待办事项" class="tdo-card">
						<a-list :data-source="tdoList" size="small">
							<template #renderItem="{ item }">
								<a-list-item>
									<template #actions>
										<a-button
											type="link"
											size="small"
											@click="completetdo(item.id)"
										>
											完成
										</a-button>
									</template>
									<div class="tdo-item">
										<a-tag
											:color="
												item.priority === 'high' ? 'red'
												: item.priority === 'medium' ? 'orange'
												: 'green'
											"
										>
											{{
												item.priority === 'high' ? '高'
												: item.priority === 'medium' ? '中'
												: '低'
											}}
										</a-tag>
										<span>{{ item.task }}</span>
									</div>
								</a-list-item>
							</template>
						</a-list>
					</a-card>
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user/user';
import * as echarts from 'echarts';
import moment from 'moment';
import {
	UserOutlined,
	ShoppingCartOutlined,
	TeamOutlined,
	AppstoreOutlined,
	PlusOutlined,
	ThunderboltOutlined,
	FileTextOutlined,
} from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';

const router = useRouter();

const { userInfo } = storeToRefs(useUserStore());

const chartContainer = ref<HTMLElement>();

// 当前日期
const currentDate = computed(() => moment().format('YYYY年MM月DD日 dddd'));

// 统计数据
const statsData = ref({
	todayOrders: 1234,
	todayRevenue: 56789,
	activeUsers: 8901,
	totalProducts: 456,
});

// 最新动态
const recentActivities = ref([
	{
		title: '用户张三完成了一笔订单',
		time: '2小时前',
		color: 'green',
	},
	{
		title: '新商品"iPhone 15"已上架',
		time: '4小时前',
		color: 'blue',
	},
	{
		title: '秒杀活动"双11预热"已开始',
		time: '6小时前',
		color: 'red',
	},
	{
		title: '系统维护完成',
		time: '1天前',
		color: 'gray',
	},
]);

// 待办事项
const tdoList = ref([
	{
		id: 1,
		task: '审核待上架商品',
		priority: 'high',
	},
	{
		id: 2,
		task: '处理用户退款申请',
		priority: 'medium',
	},
	{
		id: 3,
		task: '更新商品库存信息',
		priority: 'low',
	},
	{
		id: 4,
		task: '制定下周营销计划',
		priority: 'medium',
	},
]);

// 导航到指定页面
const navigateTo = (path: string) => {
	router.push(path);
};

// 完成待办事项
const completetdo = (id: number) => {
	tdoList.value = tdoList.value.filter((item) => item.id !== id);
};

// 初始化图表
const initChart = () => {
	if (!chartContainer.value) return;

	const chart = echarts.init(chartContainer.value);

	const option = {
		title: {
			text: '最近7天销售趋势',
			textStyle: {
				fontSize: 14,
				fontWeight: 'normal',
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
		},
		yAxis: {
			type: 'value',
		},
		series: [
			{
				name: '销售额',
				type: 'line',
				smooth: true,
				data: [12000, 15000, 13000, 17000, 16000, 18000, 20000],
				itemStyle: {
					color: '#1890ff',
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{
								offset: 0,
								color: 'rgba(24, 144, 255, 0.3)',
							},
							{
								offset: 1,
								color: 'rgba(24, 144, 255, 0.1)',
							},
						],
					},
				},
			},
		],
	};

	chart.setOption(option);

	// 响应式调整
	window.addEventListener('resize', () => {
		chart?.resize();
	});
};

onMounted(() => {
	initChart();
});
</script>

<style scoped lang="scss">
.dashboard-container {
	padding: 20px;
	background-color: #f0f2f5;
	min-height: calc(100vh - 140px);
}

.welcome-section {
	margin-bottom: 20px;

	.welcome-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;

		:deep(.ant-card-body) {
			padding: 24px;
		}

		.welcome-content {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.welcome-text {
				h2 {
					color: white;
					margin: 0 0 8px 0;
					font-size: 24px;
				}

				p {
					color: rgba(255, 255, 255, 0.8);
					margin: 0;
					font-size: 14px;
				}
			}
		}
	}
}

.stats-section {
	margin-bottom: 20px;

	.stat-card {
		text-align: center;

		:deep(.ant-statistic-title) {
			color: #666;
			font-size: 14px;
		}

		:deep(.ant-statistic-content) {
			font-size: 24px;
			font-weight: bold;
		}

		.stat-trend {
			margin-top: 8px;

			.trend-up {
				color: #52c41a;
				font-size: 12px;
			}

			.trend-down {
				color: #ff4d4f;
				font-size: 12px;
			}
		}
	}
}

.content-section {
	margin-bottom: 20px;

	.chart-card {
		height: 400px;

		:deep(.ant-card-body) {
			height: calc(100% - 57px);
		}
	}

	.quick-actions-card {
		height: 400px;

		.quick-actions {
			display: flex;
			flex-direction: column;
			gap: 12px;

			.action-btn {
				height: 48px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 16px;

				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					transition: all 0.3s ease;
				}
			}
		}
	}
}

.bottom-section {
	.activity-card,
	.tdo-card {
		.activity-item {
			.activity-title {
				font-size: 14px;
				margin-bottom: 4px;
			}

			.activity-time {
				font-size: 12px;
				color: #999;
			}
		}

		.tdo-item {
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}
}

// 响应式设计
@media (max-width: 768px) {
	.dashboard-container {
		padding: 12px;
	}

	.welcome-content {
		flex-direction: column;
		text-align: center;
		gap: 16px;
	}

	.content-section {
		.chart-card,
		.quick-actions-card {
			height: auto;
		}
	}
}
</style>
