<template>
	<div class="shop-finance-analysis-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">SHOP REVENUE ANALYTICS</span>
				<h1>商店财务经营分析大盘</h1>
				<p class="subtitle">
					多维透视门店月度商品营收占比、支付渠道结构及日/月度销售件数与金额趋势
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-date-picker
						id="shop-analysis-month-picker"
						v-model:value="searchDateTime"
						name="searchDateTime"
						picker="month"
						:locale="locale"
						:allow-clear="false"
						@change="changeMonth"
					/>
					<a-button type="primary" :loading="loading" @click="changeMonth">
						刷新数据
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="kpi-row-grid" data-testid="shop-analysis-kpi-grid">
			<div class="kpi-card primary">
				<span class="kpi-label">当月商品累计营收</span>
				<strong class="kpi-value">¥{{ monthTotalRevenue }}</strong>
				<span class="kpi-sub">统计周期：{{ currentMonthLabel }}</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">当月累计销售件数</span>
				<strong class="kpi-value">{{ monthTotalPieces }} 件</strong>
				<span class="kpi-sub">活跃出单天数：{{ activeSaleDays }} 天</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">当月热销榜首商品</span>
				<strong class="kpi-value text-ellipsis" :title="topShopItem.name">
					{{ topShopItem.name }}
				</strong>
				<span class="kpi-sub">贡献营收：¥{{ topShopItem.amount }}</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">主力收款支付渠道</span>
				<strong class="kpi-value text-ellipsis" :title="topPayWayItem.name">
					{{ topPayWayItem.name }}
				</strong>
				<span class="kpi-sub">渠道入账：¥{{ topPayWayItem.amount }}</span>
			</div>
		</section>

		<section class="analysis-charts-grid" data-testid="shop-analysis-charts-grid">
			<div class="chart-panel-card">
				<div class="panel-header">
					<div>
						<h3>当月商品营收构成</h3>
						<span class="panel-sub">按商品名称聚合当月销售额占比</span>
					</div>
				</div>
				<div class="chart-body">
					<ShopPieChart
						title="当月收入分析"
						height="100%"
						width="100%"
						:data="pieShopData"
						:tooltip="tooltip"
					/>
				</div>
			</div>

			<div class="chart-panel-card">
				<div class="panel-header">
					<div>
						<h3>当月收支渠道分布</h3>
						<span class="panel-sub">按支付方式聚合当月结算金额占比</span>
					</div>
				</div>
				<div class="chart-body">
					<ShopPieChart
						title="当月支出分析"
						height="100%"
						width="100%"
						:data="piePayWayData"
						:tooltip="tooltip"
					/>
				</div>
			</div>

			<div class="chart-panel-card">
				<div class="panel-header">
					<div>
						<h3>当月日度营收与销量趋势</h3>
						<span class="panel-sub">每日销售额（元）与销售件数双轴对比</span>
					</div>
				</div>
				<div class="chart-body">
					<ShopBarChart
						height="100%"
						width="100%"
						title="日消费"
						:data="dayData"
						:config="dayConfig"
					/>
				</div>
			</div>

			<div class="chart-panel-card">
				<div class="panel-header">
					<div>
						<h3>年度月度营收与销量趋势</h3>
						<span class="panel-sub">近 12 个月度销售额与件数演进走势</span>
					</div>
				</div>
				<div class="chart-body">
					<ShopBarChart
						height="100%"
						width="100%"
						title="月消费"
						:data="monthData"
						:config="monthConfig"
					/>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	getDayShopFinanceInfo,
	getMonthShopFinanceInfo,
	getShopNameInfo,
	getPayWayInfo,
} from '@/views/finance/shopFinanceAnalysis/api';
import type { ShopFinanceData } from '@/views/finance/shopFinance/config';
import type { ItemInfo } from '@/views/finance/shopFinanceAnalysis/shopAnalysis';
import type { Dayjs } from '@/utils/dayjs';
import { formatTime, nowDayjs, dateFormatYYYYMM } from '@/utils/dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from '@/views/finance/shopFinanceAnalysis/chart/shopBar';

interface ApiResult<T> {
	code: string;
	data?: T;
	message?: string;
}

interface PayWayInfoItem {
	payWayName?: string;
	saleAmount?: number;
}

interface TrendPoint {
	saleAmount?: number;
	saleNum?: number;
	infoDate?: string;
}

interface TooltipItem {
	axisValue: string;
	marker: string;
	value?: number;
	seriesName: string;
}

const searchDateTime = ref<Dayjs>(nowDayjs());
const loading = ref<boolean>(false);
const pieShopData = ref<ItemInfo[]>([]);
const piePayWayData = ref<ItemInfo[]>([]);
const dayData = ref<number[][]>([]);
const monthData = ref<number[][]>([]);

const currentMonthLabel = computed(() =>
	searchDateTime.value ? searchDateTime.value.format(dateFormatYYYYMM) : '--',
);

const monthTotalRevenue = computed(() => {
	const total = pieShopData.value.reduce(
		(sum, item) => sum + Number(item.value || 0),
		0,
	);
	return total.toFixed(2);
});

const monthTotalPieces = computed(() => {
	const piecesArr = dayData.value?.[1] || [];
	return piecesArr.reduce((sum, val) => sum + Number(val || 0), 0);
});

const activeSaleDays = computed(() => {
	const amountArr = dayData.value?.[0] || [];
	return amountArr.filter((val) => Number(val) > 0).length;
});

const topShopItem = computed(() => {
	if (!pieShopData.value.length) {
		return { name: '暂无数据', amount: '0.00' };
	}
	const sorted = [...pieShopData.value].sort(
		(a, b) => Number(b.value || 0) - Number(a.value || 0),
	);
	return {
		name: sorted[0]?.name || '未命名商品',
		amount: Number(sorted[0]?.value || 0).toFixed(2),
	};
});

const topPayWayItem = computed(() => {
	if (!piePayWayData.value.length) {
		return { name: '暂无数据', amount: '0.00' };
	}
	const sorted = [...piePayWayData.value].sort(
		(a, b) => Number(b.value || 0) - Number(a.value || 0),
	);
	return {
		name: sorted[0]?.name || '默认渠道',
		amount: Number(sorted[0]?.value || 0).toFixed(2),
	};
});

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

const buildTooltipFormatter = (dateUnit: string) => {
	return (param: TooltipItem[]) => {
		const axisValue = param[0]?.axisValue || '';
		let tip = `<p style="margin: 0;text-align: left">${axisValue}${dateUnit}</p>`;
		param.forEach((item) => {
			const value = item.value ?? 0;
			const unit = item.seriesName === '销售额' ? '元' : '件';
			tip += `<p style="margin: 0;text-align: left">${item.marker}${item.seriesName}: ${value}${unit}</p>`;
		});
		return tip;
	};
};

const dayConfig = ref<barItem>({
	xAxis: [],
	series: [[]],
	xTile: '天数',
	yTitle: ['销售额', '件数'],
	yNameGap: 30,
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter: buildTooltipFormatter('日'),
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#2563eb',
});

const monthConfig = ref<barItem>({
	xAxis: [],
	series: [[]],
	xTile: '月份',
	yTitle: ['销售额', '件数'],
	yNameGap: 30,
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter: buildTooltipFormatter('月'),
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#7c3aed',
});

const buildSeriesData = (
	data: TrendPoint[],
	getXAxisLabel: (item: TrendPoint) => string,
) => {
	const saleAmountSeries: number[] = [];
	const saleNumSeries: number[] = [];
	const xAxis: string[] = [];

	data.forEach((item) => {
		saleAmountSeries.push(item.saleAmount || 0);
		saleNumSeries.push(item.saleNum || 0);
		xAxis.push(getXAxisLabel(item));
	});

	return {
		xAxis,
		seriesAll: [saleAmountSeries, saleNumSeries] as number[][],
	};
};

const getShopNameInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getShopNameInfo(dateStr)) as ApiResult<ShopFinanceData[]>;
	if (code === '200') {
		pieShopData.value = (data || []).map((item) => ({
			name: item.shopName || '',
			value: item.saleAmount || 0,
		}));
		return;
	}
	message.error(messageInfo || '查询商品收入构成失败！');
};

const getPayWayInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getPayWayInfo(dateStr)) as ApiResult<PayWayInfoItem[]>;
	if (code === '200') {
		piePayWayData.value = (data || []).map((item) => ({
			name: item.payWayName || '',
			value: item.saleAmount || 0,
		}));
		return;
	}
	message.error(messageInfo || '查询支付方式分布失败！');
};

const getDayShopFinanceInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getDayShopFinanceInfo(dateStr)) as ApiResult<TrendPoint[]>;
	if (code === '200') {
		const { xAxis, seriesAll } = buildSeriesData(data || [], (item) =>
			formatTime(item.infoDate),
		);
		dayConfig.value.xAxis = xAxis;
		dayConfig.value.series = seriesAll as unknown as string[][];
		dayData.value = seriesAll;
		return;
	}
	message.error(messageInfo || '查询日度趋势失败！');
};

const getMonthShopFinanceInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getMonthShopFinanceInfo(dateStr)) as ApiResult<TrendPoint[]>;
	if (code === '200') {
		const { xAxis, seriesAll } = buildSeriesData(
			data || [],
			(item) => item.infoDate || '',
		);
		monthConfig.value.xAxis = xAxis;
		monthConfig.value.series = seriesAll as unknown as string[][];
		monthData.value = seriesAll;
		return;
	}
	message.error(messageInfo || '查询月度趋势失败！');
};

const getInfo = async () => {
	loading.value = true;
	try {
		const dateStr = searchDateTime.value.format(dateFormatYYYYMM);
		await Promise.all([
			getShopNameInfoInfo(dateStr),
			getPayWayInfoInfo(dateStr),
			getDayShopFinanceInfoInfo(dateStr),
			getMonthShopFinanceInfoInfo(dateStr),
		]);
	} finally {
		loading.value = false;
	}
};

const changeMonth = () => {
	void getInfo();
};

onMounted(() => {
	void getInfo();
});
</script>

<style lang="scss" scoped>
.shop-finance-analysis-screen {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px 24px 28px;
	background: #f8fafc;
	min-height: 100%;
}

.screen-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	padding: 20px 24px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

	.title-block {
		.eyebrow {
			display: inline-block;
			font-size: 11px;
			font-weight: 700;
			letter-spacing: 0.08em;
			color: #2563eb;
			background: #eff6ff;
			padding: 2px 8px;
			border-radius: 999px;
			margin-bottom: 6px;
		}

		h1 {
			margin: 0 0 4px;
			font-size: 20px;
			font-weight: 700;
			color: #0f172a;
		}

		.subtitle {
			margin: 0;
			font-size: 13px;
			color: #64748b;
		}
	}
}

.kpi-row-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;

	.kpi-card {
		padding: 16px 20px;
		border-radius: 14px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
		display: flex;
		flex-direction: column;
		gap: 6px;

		&.primary {
			background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
			border-color: #bfdbfe;

			.kpi-value {
				color: #1d4ed8;
			}
		}

		.kpi-label {
			font-size: 12px;
			font-weight: 600;
			color: #64748b;
		}

		.kpi-value {
			font-size: 22px;
			font-weight: 800;
			color: #0f172a;
			font-variant-numeric: tabular-nums;
		}

		.kpi-sub {
			font-size: 12px;
			color: #64748b;
		}
	}
}

.text-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.analysis-charts-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;

	.chart-panel-card {
		padding: 18px 20px;
		border-radius: 14px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
		display: flex;
		flex-direction: column;
		gap: 12px;

		.panel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;

			h3 {
				margin: 0 0 2px;
				font-size: 15px;
				font-weight: 700;
				color: #0f172a;
			}

			.panel-sub {
				font-size: 12px;
				color: #64748b;
			}
		}

		.chart-body {
			width: 100%;
			height: 340px;
		}
	}
}
</style>
