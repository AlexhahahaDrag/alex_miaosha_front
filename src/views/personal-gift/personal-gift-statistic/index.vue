<template>
	<!-- 根据 Figma 设计生成的统计概览页面 -->
	<div class="personal-gift-statistic">
		<!-- 头部导航栏 -->
		<header class="header">
			<div class="header-container">
				<!-- 左侧品牌区域 -->
				<div class="logo-section">
					<i class="logo-icon"></i>
					<h1 class="title">随礼收礼管理</h1>
				</div>

				<!-- 右侧导航区域 -->
				<div class="nav-section">
					<!-- 导航菜单 -->
					<nav class="nav-menu">
						<button
							class="nav-btn nav-btn--active"
							@click="onNavigateStatistic"
						>
							<span class="nav-btn-text">统计概览</span>
							<i class="nav-icon"></i>
						</button>
						<button class="nav-btn" @click="onNavigateRecords">
							<span class="nav-btn-text">记录管理</span>
							<i class="nav-icon"></i>
						</button>
					</nav>

					<!-- 用户信息区域 -->
					<div class="user-info">
						<button class="notification-btn" @click="onShowNotification">
							<i class="notification-icon"></i>
						</button>
						<div class="user-profile">
							<img :src="userAvatar" alt="用户头像" class="avatar" />
							<span class="username">{{ userName }}</span>
						</div>
					</div>
				</div>
			</div>
		</header>

		<!-- 主内容区域 -->
		<main class="main-content">
			<div class="content-wrapper">
				<!-- 页面标题区域 -->
				<div class="page-header">
					<h2 class="page-title">统计概览</h2>
					<p class="page-description">查看您的人情往来数据统计和趋势分析</p>
				</div>

				<!-- 统计卡片网格 -->
				<div class="statistics-grid">
					<!-- 统计卡片循环 -->
					<div v-for="card in statisticCards" :key="card.id" class="stat-card">
						<div class="stat-card-content">
							<div class="stat-info">
								<p class="stat-label">{{ card.label }}</p>
								<h3 class="stat-value">¥{{ getCardValue(card.value) }}</h3>
							</div>
							<div :class="['stat-icon', `stat-icon--${card.iconType}`]">
								<svg
									class="icon-svg"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										:d="card.svgPath"
										:fill="
											card.iconType === 'receive' ? 'currentColor' : 'none'
										"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</div>
						<div class="stat-footer">
							<span class="stat-trend stat-trend--up">
								{{ card.trend }}{{ getCardValue(card.trendValue) }}%
							</span>
							<i class="trend-icon"></i>
						</div>
					</div>
				</div>

				<!-- 图表区域 -->
				<div class="charts-section">
					<!-- 随礼收礼趋势图表 -->
					<div class="chart-card">
						<h3 class="chart-title">随礼收礼趋势</h3>
						<div class="chart-container">
							<div v-if="isLoadingTrend" class="chart-loading">
								<span>趋势数据加载中...</span>
							</div>
							<chart
								v-else
								:options="trendChartOptions"
								width="100%"
								height="400px"
							/>
						</div>
					</div>

					<!-- 场合分布图表 -->
					<div class="chart-section">
						<div class="chart-header">
							<h3 class="chart-title">场合分布</h3>
						</div>
						<div class="chart-container">
							<div v-if="isLoadingOccasion" class="chart-loading">
								<span>场合数据加载中...</span>
							</div>
							<chart
								v-else
								:options="chartOptions"
								width="100%"
								height="400px"
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import Chart from '@/views/model/chart/index.vue';
import {
	getOccasionDistribution,
	getPersonalGiftTrend,
	getPersonalGiftStatistic,
} from './api/index';
import {
	type StatisticData,
	initialStatisticData,
	defaultUserInfo,
	errorMessages,
	pageTexts,
	amountFormatOptions,
	percentageFractionDigits,
	pieChartColors,
	lineChartColors,
	statisticCards,
} from './config/index';

// 用户信息
const userName = ref(defaultUserInfo.name);
const userAvatar = ref(defaultUserInfo.avatar);

// 统计数据
const statisticData = ref<StatisticData>(initialStatisticData);
const isLoadingStatistic = ref(true);

// 统计数据显示格式化
const monthGiftOut = computed(() => {
	const amount = statisticData.value.monthGiftOutAmount;
	return amount ?
			(amount / 100).toLocaleString(amountFormatOptions.locale, {
				maximumFractionDigits: amountFormatOptions.maximumFractionDigits,
			})
		:	'0';
});

const monthGiftIn = computed(() => {
	const amount = statisticData.value.monthGiftInAmount;
	return amount ?
			(amount / 100).toLocaleString(amountFormatOptions.locale, {
				maximumFractionDigits: amountFormatOptions.maximumFractionDigits,
			})
		:	'0';
});

const yearGiftOut = computed(() => {
	const amount = statisticData.value.yearGiftOutAmount;
	return amount ?
			(amount / 100).toLocaleString(amountFormatOptions.locale, {
				maximumFractionDigits: amountFormatOptions.maximumFractionDigits,
			})
		:	'0';
});

const yearGiftIn = computed(() => {
	const amount = statisticData.value.yearGiftInAmount;
	return amount ?
			(amount / 100).toLocaleString(amountFormatOptions.locale, {
				maximumFractionDigits: amountFormatOptions.maximumFractionDigits,
			})
		:	'0';
});

const monthMoM = computed(
	() =>
		statisticData.value.monthGiftOutMoM?.toFixed(percentageFractionDigits) ||
		'0',
);
const monthInMoM = computed(
	() =>
		statisticData.value.monthGiftInMoM?.toFixed(percentageFractionDigits) ||
		'0',
);
const yearYoY = computed(
	() =>
		statisticData.value.yearGiftOutYoY?.toFixed(percentageFractionDigits) ||
		'0',
);
const yearInYoY = computed(
	() =>
		statisticData.value.yearGiftInYoY?.toFixed(percentageFractionDigits) || '0',
);

// 数据访问映射
const dataMap = computed(() => ({
	monthGiftOut: monthGiftOut.value,
	monthGiftIn: monthGiftIn.value,
	yearGiftOut: yearGiftOut.value,
	yearGiftIn: yearGiftIn.value,
	monthMoM: monthMoM.value,
	monthInMoM: monthInMoM.value,
	yearYoY: yearYoY.value,
	yearInYoY: yearInYoY.value,
}));

/**
 * 获取卡片显示值
 */
const getCardValue = (key: string): string => {
	return dataMap.value[key as keyof typeof dataMap.value] || '0';
};

// 场合分布图表相关
const occasionData = ref<Array<{ name: string; value: number }>>([]);
const isLoadingOccasion = ref(true);

// 趋势图表相关
const trendData = ref<
	Array<{ month: string; giftOutAmount: number; giftInAmount: number }>
>([]);
const isLoadingTrend = ref(true);

/**
 * 获取个人随礼统计数据
 */
const fetchPersonalGiftStatistic = async () => {
	try {
		isLoadingStatistic.value = true;
		const {
			code,
			message: messageInfo,
			data,
		} = await getPersonalGiftStatistic();
		if (code === '200') {
			statisticData.value = data || initialStatisticData;
		} else {
			message.error(messageInfo || errorMessages.statisticFail, 3);
		}
	} catch (error) {
		console.error('获取统计数据失败:', error);
		message.error(errorMessages.statisticException, 3);
	} finally {
		isLoadingStatistic.value = false;
	}
};

/**
 * 获取个人随礼场合分布数据
 */
const fetchOccasionDistribution = async () => {
	try {
		isLoadingOccasion.value = true;
		const {
			code,
			message: messageInfo,
			data,
		} = await getOccasionDistribution();
		if (code === '200') {
			const chartData =
				data?.map((item: { occasion: string; count: number }) => ({
					name: item.occasion,
					value: item.count,
				})) || [];
			occasionData.value = chartData;
		} else {
			message.error(messageInfo || errorMessages.occasionFail, 3);
		}
	} catch (error) {
		console.error('获取场合分布数据失败:', error);
		message.error(errorMessages.occasionException, 3);
	} finally {
		isLoadingOccasion.value = false;
	}
};

/**
 * 获取个人随礼收支趋势数据
 */
const fetchPersonalGiftTrend = async () => {
	try {
		isLoadingTrend.value = true;
		const { code, message: messageInfo, data } = await getPersonalGiftTrend();
		if (code === '200') {
			trendData.value = data || [];
		} else {
			message.error(messageInfo || errorMessages.trendFail, 3);
		}
	} catch (error) {
		console.error('获取趋势数据失败:', error);
		message.error(errorMessages.trendException, 3);
	} finally {
		isLoadingTrend.value = false;
	}
};

/**
 * 计算图表配置
 */
const chartOptions = computed(() => ({
	tooltip: {
		trigger: 'item',
		formatter: '{b}: {c} ({d}%)',
	},
	legend: {
		orient: 'vertical',
		left: 'left',
		top: 'center',
	},
	series: [
		{
			name: '随礼场合',
			type: 'pie',
			radius: ['40%', '70%'],
			center: ['50%', '50%'],
			data: occasionData.value,
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)',
				},
			},
			color: pieChartColors,
		},
	],
}));

/**
 * 计算趋势图表配置
 */
const trendChartOptions = computed(() => {
	const months = trendData.value.map((item) => item.month);
	const giftOutAmounts = trendData.value.map((item) => item.giftOutAmount);
	const giftInAmounts = trendData.value.map((item) => item.giftInAmount);

	return {
		tooltip: {
			trigger: 'axis',
			formatter: (
				params: Array<{
					axisValue: string;
					marker: string;
					seriesName: string;
					value: number;
				}>,
			) => {
				let result = params[0].axisValue + '<br/>';
				params.forEach((param) => {
					result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
				});
				return result;
			},
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '10%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: months,
			boundaryGap: false,
		},
		yAxis: {
			type: 'value',
			name: '金额（元）',
		},
		series: [
			{
				name: '随礼',
				type: 'line',
				data: giftOutAmounts,
				smooth: true,
				itemStyle: { color: lineChartColors.giftOut },
				areaStyle: {
					color: lineChartColors.giftOutLight,
				},
			},
			{
				name: '收礼',
				type: 'line',
				data: giftInAmounts,
				smooth: true,
				itemStyle: { color: lineChartColors.giftIn },
				areaStyle: {
					color: lineChartColors.giftInLight,
				},
			},
		],
	};
});

/**
 * 导航到统计概览页面
 */
const onNavigateStatistic = () => {
	// 当前已在统计概览页面，可添加其他逻辑
	console.log(pageTexts.navigateStatisticLog);
};

/**
 * 导航到记录管理页面
 */
const onNavigateRecords = () => {
	// 导航逻辑
	console.log(pageTexts.navigateRecordsLog);
};

/**
 * 显示通知
 */
const onShowNotification = () => {
	console.log(pageTexts.showNotificationLog);
};

/**
 * 页面挂载时初始化
 */
onMounted(() => {
	// 获取统计数据
	fetchPersonalGiftStatistic();
	// 获取场合分布数据
	fetchOccasionDistribution();
	// 获取趋势数据
	fetchPersonalGiftTrend();
});
</script>

<style lang="less" scoped>
// 设计系统颜色变量
@primary-color: #3b82f6;
@text-primary: #1e293b;
@text-secondary: #6b7280;
@bg-primary: #f9fafb;
@bg-card: #ffffff;
@border-color: #e5e7eb;
@success-color: #22c55e;
@light-blue: #dbeafe;
@light-green: #dcfce7;
@light-yellow: #fef9c3;
@light-purple: #f3e8ff;
@shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.08);
@header-shadow:
	0px 0px 0px 0px rgba(0, 0, 0, 0),
	0px 0px 0px 0px rgba(0, 0, 0, 0),
	0px 1px 2px 0px rgba(0, 0, 0, 0.05);

// 全局样式
.personal-gift-statistic {
	min-height: 100vh;
	background-color: @bg-primary;
	font-family:
		'Inter',
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		sans-serif;
}

// 头部导航栏
.header {
	background-color: @bg-card;
	box-shadow: @header-shadow;
	border-bottom: 1px solid @border-color;
	padding: 0;
	position: sticky;
	top: 0;
	z-index: 100;
}

.header-container {
	max-width: 1336px;
	margin: 0 auto;
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 28px;
}

// 左侧品牌区域
.logo-section {
	display: flex;
	align-items: center;
	gap: 16px;
	min-width: 152px;
}

.logo-icon {
	display: inline-block;
	width: 24px;
	height: 32px;
	background-color: @primary-color;
	border-radius: 4px;
}

.title {
	margin: 0;
	font-size: 20px;
	font-weight: 400;
	line-height: 1.4;
	color: @text-primary;
	white-space: nowrap;
}

// 右侧导航区域
.nav-section {
	display: flex;
	align-items: center;
	gap: 120px;
	flex: 1;
	justify-content: flex-end;
}

// 导航菜单
.nav-menu {
	display: flex;
	gap: 0;
	align-items: center;
	height: 40px;
}

.nav-btn {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 24px;
	height: 40px;
	border: none;
	background-color: transparent;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.3s ease;

	// 默认状态
	.nav-btn-text {
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: @text-secondary;
		text-align: center;
	}

	.nav-icon {
		display: inline-block;
		width: 18px;
		height: 16px;
		background-size: contain;
	}

	&:hover {
		background-color: #f3f4f6;
	}

	// 激活状态
	&--active {
		background-color: @primary-color;

		.nav-btn-text {
			color: @bg-card;
		}

		.nav-icon {
			background-color: #60a5fa;
		}
	}
}

// 用户信息区域
.user-info {
	display: flex;
	align-items: center;
	gap: 16px;
	height: 32px;
}

.notification-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 28px;
	border: none;
	background: transparent;
	cursor: pointer;
	padding: 0;

	.notification-icon {
		display: inline-block;
		width: 15.75px;
		height: 28px;
		background-size: contain;
	}
}

.user-profile {
	display: flex;
	align-items: center;
	gap: 8px;
	height: 32px;
}

.avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: 2px solid @primary-color;
	object-fit: cover;
	flex-shrink: 0;
}

.username {
	font-size: 16px;
	font-weight: 400;
	line-height: 1.5;
	color: @text-primary;
	white-space: nowrap;
}

// 主内容区域
.main-content {
	max-width: 1336px;
	margin: 0 auto;
	padding: 28px;
}

.content-wrapper {
	padding: 24px 16px;
}

// 页面标题区域
.page-header {
	margin-bottom: 32px;
}

.page-title {
	margin: 0 0 12px 0;
	font-size: 32px;
	font-weight: 400;
	line-height: 1.5;
	color: @text-primary;
}

.page-description {
	margin: 0;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.5;
	color: @text-secondary;
}

// 统计卡片网格
.statistics-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;

	// 响应式设计
	@media (max-width: 1200px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
}

// 统计卡片
.stat-card {
	display: flex;
	flex-direction: column;
	background-color: @bg-card;
	border: 1px solid @border-color;
	border-radius: 12px;
	box-shadow: @shadow;
	padding: 0;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0px 6px 24px 0px rgba(0, 0, 0, 0.12);
	}
}

.stat-card-content {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 20px;
	flex: 1;
	gap: 16px;
}

.stat-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.stat-label {
	margin: 0;
	font-size: 14px;
	font-weight: 400;
	line-height: 1.43;
	color: @text-secondary;
}

.stat-value {
	margin: 0;
	font-size: 24px;
	font-weight: 700;
	line-height: 1.33;
	color: @text-primary;
}

// 统计图标
.stat-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 9999px;
	flex-shrink: 0;

	// 给出类型 - 蓝色
	&--give {
		background-color: @light-blue;

		i {
			display: inline-block;
			width: 12px;
			height: 16px;
		}

		.icon-svg {
			width: 20px;
			height: 20px;
			color: @primary-color;
			display: inline-block;
		}
	}

	// 收到类型 - 绿色
	&--receive {
		background-color: @light-green;

		i {
			display: inline-block;
			width: 12px;
			height: 16px;
		}

		.icon-svg {
			width: 20px;
			height: 20px;
			color: @success-color;
			display: inline-block;
		}
	}
}

// 卡片底部
.stat-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 20px;
	border-top: 1px solid @border-color;
	min-height: 44px;
}

.stat-trend {
	font-size: 14px;
	font-weight: 400;
	line-height: 1.43;
	margin: 0;

	// 上升趋势 - 绿色
	&--up {
		color: @success-color;
	}

	// 下降趋势
	&--down {
		color: #ef4444;
	}
}

.stat-label-secondary {
	font-size: 14px;
	font-weight: 400;
	line-height: 1.43;
	color: @text-secondary;
}

.trend-icon {
	display: inline-block;
	width: 10.5px;
	height: 14px;
	background-size: contain;
	flex-shrink: 0;
}

// 图表区域
.charts-section {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;

	@media (max-width: 1200px) {
		grid-template-columns: 1fr;
	}
}

// 图表卡片
.chart-card {
	background-color: @bg-card;
	border: 1px solid @border-color;
	border-radius: 12px;
	box-shadow: @shadow;
	padding: 0;
	overflow: hidden;
}

.chart-section {
	background-color: @bg-card;
	border: 1px solid @border-color;
	border-radius: 12px;
	box-shadow: @shadow;
	padding: 0;
	overflow: hidden;
}

.chart-header {
	border-bottom: 1px solid @border-color;
	padding: 20px;
}

.chart-title {
	margin: 0;
	font-size: 18px;
	font-weight: 400;
	line-height: 1.56;
	color: @text-primary;
}

.chart-container {
	padding: 20px;
}

.chart-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 320px;
	background-color: #fafafa;
	border-radius: 8px;
	border: 1px dashed @border-color;
}

.chart-loading {
	font-size: 14px;
	color: @text-secondary;
}

.chart-legend {
	margin-top: 16px;
}
</style>
