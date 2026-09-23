<template>
	<div class="gift-metric-card" :class="`gift-metric-card-${tone}`">
		<div class="gift-metric-card__top">
			<span class="gift-metric-card__title">{{ title }}</span>
			<span
				class="gift-metric-card__icon"
				:class="`gift-metric-card__icon-${tone}`"
			>
				<component :is="icon" />
			</span>
		</div>
		<div class="gift-metric-card__body">
			<div class="gift-metric-card__main">
				<div class="gift-metric-card__value">{{ value }}</div>
				<div
					class="gift-metric-card__trend"
					:class="`gift-metric-card__trend-${trendDirection}`"
				>
					<arrow-up-outlined v-if="trendDirection === 'up'" />
					<arrow-down-outlined v-else-if="trendDirection === 'down'" />
					<span>{{ trendText }}</span>
				</div>
				<div v-if="sub" class="gift-metric-card__sub">{{ sub }}</div>
			</div>
			<div
				v-if="sparklineData && sparklineData.values && sparklineData.values.length > 0"
				ref="chartRef"
				class="gift-metric-card__chart"
				data-testid="gift-metric-card-chart"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, type Component } from 'vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import type { TrendDirection } from '@/views/finance/gift/gift-dashboard/utils/metrics';

export interface SparklineData {
	labels: string[];
	values: number[];
}

interface Props {
	title: string;
	value: string;
	tone: 'income' | 'expense' | 'balance' | 'todo';
	icon: Component;
	trendText: string;
	trendDirection?: TrendDirection;
	sparklineData?: SparklineData;
	sub?: string;
}

const props = withDefaults(defineProps<Props>(), {
	trendDirection: 'none',
	sub: '',
});

const chartRef = ref<HTMLDivElement>();
let chartInstance: EChartsType | null = null;

const colorMap = {
	income: '#10b981',
	expense: '#f43f5e',
	balance: '#3b82f6',
	todo: '#f59e0b',
};

const renderChart = async () => {
	if (!chartRef.value) return;
	const data = props.sparklineData;
	if (!data || !data.values || data.values.length === 0) {
		if (chartInstance) {
			chartInstance.clear();
		}
		return;
	}

	const echarts = await loadEcharts();
	if (!chartInstance) {
		chartInstance = echarts.init(chartRef.value);
	}

	const themeColor = colorMap[props.tone] || '#3b82f6';
	const hasNegative = data.values.some((v) => v < 0);
	const minVal = Math.min(...data.values);
	const maxVal = Math.max(...data.values);
	const padding = Math.max(1, (maxVal - minVal) * 0.1);

	const option: any = {
		animation: true,
		animationDuration: 400,
		grid: {
			top: 6,
			right: 6,
			bottom: 6,
			left: 6,
			containLabel: false,
		},
		tooltip: {
			trigger: 'axis',
			appendToBody: true,
			position: (point: any, _params: any, _dom: any, _rect: any, size: any) => {
				return [point[0] - size.viewSize[0] / 2, point[1] - size.viewSize[1] - 12];
			},
			axisPointer: {
				type: 'line',
				lineStyle: {
					color: themeColor,
					type: 'dashed',
					width: 1.2,
				},
			},
			backgroundColor: 'rgba(15, 23, 42, 0.92)',
			borderColor: 'transparent',
			borderRadius: 8,
			padding: [6, 10],
			textStyle: {
				color: '#fff',
				fontSize: 12,
			},
			extraCssText: 'box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28); pointer-events: none; z-index: 99999;',
			formatter: (params: any) => {
				const item = params[0];
				if (!item) return '';
				const rawVal = Number(item.value ?? 0);
				const formattedVal = rawVal.toLocaleString('zh-CN', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				return `<div style="font-weight:600;margin-bottom:2px;color:#94a3b8">${item.name}</div><div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${themeColor}"></span><span>${props.title}: <strong style="color:#fff">¥${formattedVal}</strong></span></div>`;
			},
		},
		xAxis: {
			type: 'category',
			data: data.labels,
			show: false,
			boundaryGap: false,
		},
		yAxis: {
			type: 'value',
			show: false,
			min: hasNegative ? minVal - padding : 0,
			max: maxVal + padding,
		},
		series: [
			{
				name: props.title,
				type: 'line',
				data: data.values,
				smooth: 0.35,
				symbol: 'circle',
				symbolSize: 6,
				showSymbol: false,
				emphasis: {
					scale: true,
					itemStyle: {
						color: themeColor,
						borderColor: '#fff',
						borderWidth: 2,
						shadowColor: 'rgba(0, 0, 0, 0.2)',
						shadowBlur: 4,
					},
				},
				lineStyle: {
					color: themeColor,
					width: 2.2,
				},
				itemStyle: {
					color: themeColor,
					borderColor: '#fff',
					borderWidth: 1.5,
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: `${themeColor}38` },
						{ offset: 1, color: `${themeColor}04` },
					]),
				},
			},
		],
	};

	chartInstance.setOption(option);
};

const handleResize = () => {
	chartInstance?.resize();
};

watch(
	() => [props.sparklineData, props.tone, props.title],
	() => {
		void nextTick(() => {
			void renderChart();
		});
	},
	{ deep: true },
);

onMounted(() => {
	void nextTick(() => {
		void renderChart();
	});
	window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
	if (chartInstance) {
		chartInstance.dispose();
		chartInstance = null;
	}
});
</script>

<style scoped lang="less">
.gift-metric-card {
	min-height: 132px;
	padding: 20px 18px 16px;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
		border-color: #cbd5e1;
	}
}

.gift-metric-card__top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.gift-metric-card__title {
	font-size: 13px;
	font-weight: 500;
	color: #64748b;
}

.gift-metric-card__icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	font-size: 16px;
}

.gift-metric-card__body {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 12px;
	margin-top: 14px;
}

.gift-metric-card__value {
	font-size: 30px;
	font-weight: 800;
	line-height: 1.1;
	letter-spacing: -0.5px;
}

.gift-metric-card__trend {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin-top: 8px;
	font-size: 12px;
	font-weight: 600;
}

.gift-metric-card__trend-up {
	color: #059669;
}

.gift-metric-card__trend-down {
	color: #e11d48;
}

.gift-metric-card__trend-flat,
.gift-metric-card__trend-none {
	color: #94a3b8;
}

.gift-metric-card__sub {
	margin-top: 6px;
	font-size: 12px;
	color: #64748b;
}

.gift-metric-card__chart {
	width: 105px;
	height: 48px;
	flex-shrink: 0;
}

.gift-metric-card-income {
	.gift-metric-card__value {
		color: #059669;
	}

	.gift-metric-card__icon-income {
		color: #059669;
		background: #ecfdf5;
		border: 1px solid #a7f3d0;
	}
}

.gift-metric-card-expense {
	.gift-metric-card__value {
		color: #e11d48;
	}

	.gift-metric-card__icon-expense {
		color: #e11d48;
		background: #fff1f2;
		border: 1px solid #fecdd3;
	}
}

.gift-metric-card-balance {
	.gift-metric-card__value {
		color: #2563eb;
	}

	.gift-metric-card__icon-balance {
		color: #2563eb;
		background: #eff6ff;
		border: 1px solid #dbeafe;
	}
}

.gift-metric-card-todo {
	.gift-metric-card__value {
		color: #d97706;
		font-size: 28px;
	}

	.gift-metric-card__icon-todo {
		color: #d97706;
		background: #fffbeb;
		border: 1px solid #fde68a;
	}
}
</style>
