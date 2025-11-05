/**
 * 统计概览页面配置文件
 */

// ==================== 类型定义 ====================

/**
 * API 查询参数接口
 */
export interface QueryParams {
	startTime?: string;
	endTime?: string;
}

/**
 * 个人随礼统计概览数据接口
 */
export interface PersonalGiftStatisticData {
	monthGiftOutAmount: number;
	monthGiftOutMoM: number;
	monthGiftInAmount: number;
	monthGiftInMoM: number;
	yearGiftOutAmount: number;
	yearGiftOutYoY: number;
	yearGiftInAmount: number;
	yearGiftInYoY: number;
	totalContacts: number;
	monthNewContacts: number;
	yearNewContacts: number;
}

/**
 * 统计数据接口
 */
export interface StatisticData {
	monthGiftOutAmount: number;
	monthGiftOutMoM: number;
	monthGiftInAmount: number;
	monthGiftInMoM: number;
	yearGiftOutAmount: number;
	yearGiftOutYoY: number;
	yearGiftInAmount: number;
	yearGiftInYoY: number;
}

/**
 * 趋势数据项接口
 */
export interface TrendDataItem {
	month: string;
	giftOutAmount: number;
	giftInAmount: number;
}

/**
 * 场合分布数据项接口
 */
export interface OccasionDataItem {
	name: string;
	value: number;
}

/**
 * 统计卡片配置接口
 */
export interface StatisticCardConfig {
	id: string;
	label: string;
	value: string; // ref key
	trendValue: string; // computed key
	trend: string;
	iconType: 'give' | 'receive';
	svgPath: string;
}

// ==================== 样式主题颜色 ====================

export const themeColors = {
	primary: '#3b82f6',
	textPrimary: '#1e293b',
	textSecondary: '#6b7280',
	bgPrimary: '#f9fafb',
	bgCard: '#ffffff',
	borderColor: '#e5e7eb',
	successColor: '#22c55e',
	lightBlue: '#dbeafe',
	lightGreen: '#dcfce7',
	lightYellow: '#fef9c3',
	lightPurple: '#f3e8ff',
	dangerColor: '#ef4444',
	warningColor: '#f59e0b',
	infoColor: '#10b981',
};

// ==================== 阴影样式 ====================

export const shadows = {
	default: '0px 4px 20px 0px rgba(0, 0, 0, 0.08)',
	header: `0px 0px 0px 0px rgba(0, 0, 0, 0),
		0px 0px 0px 0px rgba(0, 0, 0, 0),
		0px 1px 2px 0px rgba(0, 0, 0, 0.05)`,
	hover: '0px 6px 24px 0px rgba(0, 0, 0, 0.12)',
};

// ==================== 图表颜色配置 ====================

/**
 * 环形图色组配置
 */
export const pieChartColors = [
	'#3b82f6',
	'#ef4444',
	'#f59e0b',
	'#10b981',
	'#8b5cf6',
	'#ec4899',
];

/**
 * 折线图色组配置
 */
export const lineChartColors = {
	giftOut: '#ef4444',
	giftIn: '#10b981',
	giftOutLight: 'rgba(239, 68, 68, 0.1)',
	giftInLight: 'rgba(16, 185, 129, 0.1)',
};

// ==================== 数据格式化配置 ====================

/**
 * 金额格式化选项
 */
export const amountFormatOptions = {
	locale: 'zh-CN',
	maximumFractionDigits: 2,
};

/**
 * 百分比保留小数位
 */
export const percentageFractionDigits = 1;

// ==================== 初始统计数据 ====================

/**
 * 初始统计数据
 */
export const initialStatisticData: StatisticData = {
	monthGiftOutAmount: 0,
	monthGiftOutMoM: 0,
	monthGiftInAmount: 0,
	monthGiftInMoM: 0,
	yearGiftOutAmount: 0,
	yearGiftOutYoY: 0,
	yearGiftInAmount: 0,
	yearGiftInYoY: 0,
};

// ==================== 图表配置常量 ====================

/**
 * 图表加载文本
 */
export const chartLoadingTexts = {
	occasion: '场合数据加载中...',
	trend: '趋势数据加载中...',
	statistic: '统计数据加载中...',
};

/**
 * 图表尺寸配置
 */
export const chartDimensions = {
	width: '100%',
	height: '400px',
};

/**
 * 图表高度（像素）
 */
export const chartHeightPx = 400;

// ==================== 用户信息默认值 ====================

export const defaultUserInfo = {
	name: '张先生',
	avatar: '',
};

// ==================== 错误提示信息 ====================

export const errorMessages = {
	statisticFail: '获取统计数据失败！',
	statisticException: '获取统计数据异常！',
	occasionFail: '获取场合分布数据失败！',
	occasionException: '获取场合分布数据异常！',
	trendFail: '获取趋势数据失败！',
	trendException: '获取趋势数据异常！',
};

// ==================== 页面文本配置 ====================

export const pageTexts = {
	pageTitle: '统计概览',
	pageDescription: '查看您的人情往来数据统计和趋势分析',
	navigateStatisticLog: '当前页面：统计概览',
	navigateRecordsLog: '跳转到记录管理页面',
	showNotificationLog: '打开通知中心',
};

// ==================== 响应式断点 ====================

export const breakpoints = {
	desktop: 1200,
	tablet: 768,
};

// ==================== 动画时长 ====================

export const animations = {
	transitionDuration: '0.3s',
	easing: 'ease',
};

// ==================== 统计卡片配置 ====================

/**
 * 统计卡片配置数组
 */
export const statisticCards: StatisticCardConfig[] = [
	{
		id: 'monthGiftOut',
		label: '本月随礼',
		value: 'monthGiftOut',
		trendValue: 'monthMoM',
		trend: '较上月增长',
		iconType: 'give',
		svgPath: 'M7 14l5-5 5 5',
	},
	{
		id: 'monthGiftIn',
		label: '本月收礼',
		value: 'monthGiftIn',
		trendValue: 'monthInMoM',
		trend: '较上月增长',
		iconType: 'receive',
		svgPath: 'M7 10l5 5 5-5',
	},
	{
		id: 'yearGiftOut',
		label: '年度随礼',
		value: 'yearGiftOut',
		trendValue: 'yearYoY',
		trend: '较去年增长',
		iconType: 'give',
		svgPath:
			'M20 12v7c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-7M12 2l-5 5h3v3h4V7l3-5z',
	},
	{
		id: 'yearGiftIn',
		label: '年度收礼',
		value: 'yearGiftIn',
		trendValue: 'yearInYoY',
		trend: '较去年增长',
		iconType: 'receive',
		svgPath:
			'M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V9H1c-.55 0-1-.45-1-1s.45-1 1-1h22c.55 0 1 .45 1 1s-.45 1-1 1z',
	},
];
