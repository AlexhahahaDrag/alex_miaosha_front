<template>
	<div
		class="relative w-full h-full"
		:style="{ width: props.width, height: props.height }"
	>
		<div
			v-if="!hasData"
			class="relative w-full h-full flex flex-col items-center justify-center"
		>
			<a-empty :description="`${props.title}暂无数据`" :image="simpleImage" />
		</div>
		<chart
			v-else
			:options="options"
			:width="props.width"
			:height="props.height"
		/>
	</div>
</template>

<script setup lang="ts">
import { Empty } from 'ant-design-vue';
import type { barItem } from '@/views/selfFinance/financeAnalysis/chart/bar';

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
	const hasIncome =
		props.incomeData && props.incomeData.some((v) => Number(v) > 0);
	const hasExpense =
		props.expenseData && props.expenseData.some((v) => Number(v) > 0);
	return Boolean(hasIncome || hasExpense);
});

const options = computed(() => {
	const { xAxis } = props.config || {};
	const incomeColor = '#10b981'; // Tailwind emerald-500
	const expenseColor = '#f43f5e'; // Tailwind rose-500

	return {
		legend: {
			data: ['收入', '支出'],
			right: 8,
			top: 0,
			itemWidth: 12,
			itemHeight: 8,
			textStyle: {
				color: '#64748b',
				fontSize: 12,
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'line',
				lineStyle: {
					color: '#cbd5e1',
					type: 'dashed',
				},
			},
			formatter: (params: any[]) => {
				if (!params?.length) return '';
				const title = params[0]?.axisValue || '';
				let res = `<div style="font-weight:600;margin-bottom:6px;color:#0f172a;">${title}</div>`;
				let inc = 0;
				let exp = 0;
				params.forEach((p) => {
					const val = Number(p.value || 0);
					const formatted = val.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					});
					res += `<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:3px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
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
				const netColor = net >= 0 ? '#059669' : '#e11d48';
				res += `<div style="margin-top:6px;padding-top:4px;border-top:1px dashed #e2e8f0;display:flex;justify-content:space-between;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
					<span style="color:#64748b;">当期净结余:</span>
					<b style="color:${netColor};">${net >= 0 ? '+' : '-'}¥${netFormatted}</b>
				</div>`;
				return res;
			},
		},
		grid: {
			left: '2%',
			right: '3%',
			top: 32,
			bottom: '6%',
			outerBoundsMode: 'same',
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
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
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: '#94a3b8',
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
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				data: props.incomeData || [],
				itemStyle: {
					color: incomeColor,
				},
				lineStyle: {
					width: 2.5,
					color: incomeColor,
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(16, 185, 129, 0.22)' },
							{ offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
						],
					},
				},
			},
			{
				name: '支出',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				data: props.expenseData || [],
				itemStyle: {
					color: expenseColor,
				},
				lineStyle: {
					width: 2.5,
					color: expenseColor,
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(244, 63, 94, 0.20)' },
							{ offset: 1, color: 'rgba(244, 63, 94, 0.01)' },
						],
					},
				},
			},
		],
	};
});
</script>
