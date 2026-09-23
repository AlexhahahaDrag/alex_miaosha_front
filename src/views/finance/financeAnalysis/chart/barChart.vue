<template>
	<div class="bar-chart-wrapper" :style="{ width: props.width, height: props.height }">
		<div v-if="!hasData" class="empty-container">
			<div class="chart-header-title">{{ props.title }}</div>
			<a-empty :description="`${props.title}暂无数据`" :image="simpleImage" />
		</div>
		<chart v-else :options="options" :width="props.width" :height="props.height" />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Empty } from 'ant-design-vue';
import type { barItem } from './bar';

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const props = defineProps({
	config: {
		type: Object as PropType<barItem>,
		default: () => ({}),
	},
	title: {
		type: String,
		default: '收支走势',
	},
	incomeData: {
		type: Array as PropType<number[]>,
		default: () => [],
	},
	expenseData: {
		type: Array as PropType<number[]>,
		default: () => [],
	},
	width: {
		type: String,
		default: '100%',
	},
	height: {
		type: String,
		default: '100%',
	},
});

const hasData = computed(() => {
	const hasIncome = props.incomeData && props.incomeData.some((v) => Number(v) > 0);
	const hasExpense = props.expenseData && props.expenseData.some((v) => Number(v) > 0);
	const hasXAxis = props.config?.xAxis && props.config.xAxis.length > 0;
	return Boolean(hasIncome || hasExpense || hasXAxis);
});

const options = computed(() => {
	const { xAxis } = props.config || {};
	const incomeColor = '#10b981'; // 翡翠绿（收入流入）
	const expenseColor = '#f97316'; // 珊瑚橙（消费流出）

	return {
		title: {
			text: props.title,
			left: 16,
			top: 12,
			textStyle: {
				fontSize: 15,
				fontWeight: 600,
				color: '#1f2937',
			},
		},
		legend: {
			data: ['收入', '支出'],
			right: 16,
			top: 14,
			itemWidth: 10,
			itemHeight: 10,
			borderRadius: 2,
			textStyle: {
				color: '#64748b',
				fontSize: 12,
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			formatter: (params: any[]) => {
				if (!params?.length) return '';
				const title = params[0]?.axisValue || '';
				let res = `<div style="font-weight:600;margin-bottom:6px;color:#1e293b;">${title}</div>`;
				let inc = 0;
				let exp = 0;
				params.forEach((p) => {
					const val = Number(p.value || 0);
					const formatted = val.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});
					res += `<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:3px;font-size:12px;">
						<span>${p.marker} ${p.seriesName}:</span>
						<b>¥${formatted}</b>
					</div>`;
					if (p.seriesName.includes('收入')) inc = val;
					if (p.seriesName.includes('支出')) exp = val;
				});
				const net = inc - exp;
				const netFormatted = Math.abs(net).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				const netColor = net >= 0 ? '#10b981' : '#ea580c';
				res += `<div style="margin-top:6px;padding-top:4px;border-top:1px dashed #e2e8f0;display:flex;justify-content:space-between;font-size:12px;">
					<span style="color:#64748b;">当期结余:</span>
					<b style="color:${netColor};">${net >= 0 ? '+' : '-'}¥${netFormatted}</b>
				</div>`;
				return res;
			},
		},
		grid: {
			left: '3%',
			right: '4%',
			top: 55,
			bottom: '8%',
			outerBoundsMode: 'same',
		},
		xAxis: {
			type: 'category',
			boundaryGap: true,
			data: xAxis || [],
			axisLine: {
				lineStyle: { color: '#e2e8f0' },
			},
			axisTick: {
				alignWithLabel: true,
				lineStyle: { color: '#e2e8f0' },
			},
			axisLabel: {
				color: '#64748b',
				fontSize: 11,
				interval: 'auto',
			},
		},
		yAxis: {
			type: 'value',
			min: 0,
			name: '金额 (元)',
			nameTextStyle: {
				color: '#9ca3af',
				fontSize: 11,
				align: 'left',
				padding: [0, 0, 0, -20],
			},
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: '#9ca3af',
				fontSize: 11,
				formatter: (v: number) => {
					if (Math.abs(v) >= 10000) {
						return `${(v / 10000).toFixed(1)}万`;
					}
					return String(v);
				},
			},
			splitLine: {
				lineStyle: {
					type: 'dashed',
					color: '#f1f5f9',
				},
			},
		},
		series: [
			{
				name: '收入',
				type: 'bar',
				data: props.incomeData || [],
				barMaxWidth: 14,
				itemStyle: {
					borderRadius: [3, 3, 0, 0],
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: incomeColor },
							{ offset: 1, color: `${incomeColor}88` },
						],
					},
				},
			},
			{
				name: '支出',
				type: 'bar',
				data: props.expenseData || [],
				barMaxWidth: 14,
				itemStyle: {
					borderRadius: [3, 3, 0, 0],
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: expenseColor },
							{ offset: 1, color: `${expenseColor}88` },
						],
					},
				},
			},
		],
	};
});
</script>

<style lang="less" scoped>
.bar-chart-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
}

.empty-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;

	.chart-header-title {
		position: absolute;
		top: 12px;
		left: 16px;
		font-size: 15px;
		font-weight: 600;
		color: #1f2937;
	}
}
</style>
