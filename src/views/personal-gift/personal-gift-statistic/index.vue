<template>
	<!-- AI Agent: 根据 Figma 设计生成的统计概览页面 -->
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
					<!-- 本月随礼卡片 -->
					<div class="stat-card">
						<div class="stat-card-content">
							<div class="stat-info">
								<p class="stat-label">本月随礼</p>
								<h3 class="stat-value">¥{{ monthGiftOut }}</h3>
							</div>
							<div class="stat-icon stat-icon--give">
								<svg
									class="icon-svg"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7 14l5-5 5 5"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</div>
						<div class="stat-footer">
							<span class="stat-trend stat-trend--up">较上月增长12%</span>
							<i class="trend-icon"></i>
						</div>
					</div>

					<!-- 本月收礼卡片 -->
					<div class="stat-card">
						<div class="stat-card-content">
							<div class="stat-info">
								<p class="stat-label">本月收礼</p>
								<h3 class="stat-value">¥{{ monthGiftIn }}</h3>
							</div>
							<div class="stat-icon stat-icon--receive">
								<svg
									class="icon-svg"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7 10l5 5 5-5"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</div>
						<div class="stat-footer">
							<span class="stat-trend stat-trend--up">较上月增长8%</span>
							<i class="trend-icon"></i>
						</div>
					</div>

					<!-- 年度随礼卡片 -->
					<div class="stat-card">
						<div class="stat-card-content">
							<div class="stat-info">
								<p class="stat-label">年度随礼</p>
								<h3 class="stat-value">¥{{ yearGiftOut }}</h3>
							</div>
							<div class="stat-icon stat-icon--give">
								<svg
									class="icon-svg"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M20 12v7c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-7M12 2l-5 5h3v3h4V7l3-5z"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</div>
						<div class="stat-footer">
							<span class="stat-label-secondary">本年度累计支出</span>
						</div>
					</div>

					<!-- 年度收礼卡片 -->
					<div class="stat-card">
						<div class="stat-card-content">
							<div class="stat-info">
								<p class="stat-label">年度收礼</p>
								<h3 class="stat-value">¥{{ yearGiftIn }}</h3>
							</div>
							<div class="stat-icon stat-icon--receive">
								<svg
									class="icon-svg"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V9H1c-.55 0-1-.45-1-1s.45-1 1-1h22c.55 0 1 .45 1 1s-.45 1-1 1z"
										fill="currentColor"
									/>
								</svg>
							</div>
						</div>
						<div class="stat-footer">
							<span class="stat-label-secondary">本年度累计收入</span>
						</div>
					</div>
				</div>

				<!-- 图表区域 -->
				<div class="charts-section">
					<!-- 随礼收礼趋势图表 -->
					<div class="chart-card">
						<h3 class="chart-title">随礼收礼趋势</h3>
						<div class="chart-container">
							<div class="chart-placeholder">
								<!-- 图表组件将在这里渲染 -->
								<div class="chart-loading">趋势数据加载中...</div>
							</div>
							<div class="chart-legend"></div>
						</div>
					</div>

					<!-- 随礼场合分布图表 -->
					<div class="chart-card">
						<h3 class="chart-title">随礼场合分布</h3>
						<div class="chart-container">
							<div class="chart-placeholder">
								<!-- 图表组件将在这里渲染 -->
								<div class="chart-loading">场合数据加载中...</div>
							</div>
							<div class="chart-legend"></div>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 用户信息
const userName = ref('张先生');
const userAvatar = ref('');

// 统计数据 (AI Agent: 这些数据通常来自 API)
const monthGiftOut = ref('3,500');
const monthGiftIn = ref('5,200');
const yearGiftOut = ref('24,800');
const yearGiftIn = ref('32,600');

/**
 * 导航到统计概览页面
 */
const onNavigateStatistic = () => {
	// 当前已在统计概览页面，可添加其他逻辑
	console.log('当前页面：统计概览');
};

/**
 * 导航到记录管理页面
 */
const onNavigateRecords = () => {
	// 导航逻辑
	console.log('跳转到记录管理页面');
};

/**
 * 显示通知
 */
const onShowNotification = () => {
	console.log('打开通知中心');
};
</script>

<style lang="less" scoped>
// AI Agent: 设计系统颜色变量
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

.chart-title {
	margin: 0;
	font-size: 18px;
	font-weight: 400;
	line-height: 1.56;
	color: @text-primary;
	padding: 20px;
	border-bottom: 1px solid @border-color;
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
