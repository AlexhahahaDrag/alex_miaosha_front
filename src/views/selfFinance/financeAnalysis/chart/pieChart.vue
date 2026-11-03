<template>
	<div
		class="relative w-full h-full"
		:style="{ width: props.width, height: props.height }"
	>
		<div
			v-if="!hasData"
			class="relative w-full h-full flex flex-col items-center justify-center"
		>
			<div
				class="absolute top-1 left-2 text-sm font-semibold text-slate-800 flex items-center gap-1.5"
			>
				<span class="w-1.5 h-3.5 rounded-full bg-indigo-500 inline-block"></span>
				<span>{{ props.title }}</span>
			</div>
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
import { getCategoryEmoji } from '@/views/selfFinance/financeManager/config';

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const props = defineProps({
	title: {
		type: String,
		default: '收支分析',
	},
	tooltip: {
		type: Object,
		default: () => ({}),
	},
	data: {
		type: Array as PropType<Array<{ name: string; value: number | string }>>,
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
	if (!props.data || props.data.length === 0) return false;
	const total = props.data.reduce(
		(acc, item) => acc + (Number(item?.value) || 0),
		0,
	);
	return total > 0;
});

const options = computed(() => {
	const colors = [
		'#4F6AF6', // Indigo 主色
		'#10b981', // Emerald 绿
		'#f43f5e', // Rose 玫瑰红
		'#f59e0b', // Amber 琥珀
		'#8b5cf6', // Violet 紫
		'#06b6d4', // Cyan 青
		'#3b82f6', // Blue 蓝
		'#d946ef', // Fuchsia 洋红
		'#14b8a6', // Teal 蓝绿
		'#84cc16', // Lime 浅绿
	];

	return {
		title: {
			text: props.title,
			left: 8,
			top: 6,
			textStyle: {
				fontSize: 14,
				fontWeight: 600,
				color: '#1e293b',
			},
		},
		color: colors,
		tooltip: {
			trigger: 'item',
			formatter: (params: any) => {
				const val = Number(params.value || 0).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				const emoji = getCategoryEmoji(params.name);
				return `<div style="font-weight:600;margin-bottom:4px;color:#0f172a;">${params.seriesName || props.title}</div>
					<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${params.marker} ${emoji} ${params.name}: <b>¥${val}</b> (${params.percent}%)</div>`;
			},
			...props.tooltip,
		},
		legend: {
			type: 'scroll',
			orient: 'vertical',
			right: 8,
			top: 36,
			bottom: 16,
			itemWidth: 10,
			itemHeight: 10,
			textStyle: {
				color: '#475569',
				fontSize: 12,
			},
			formatter: (name: string) => {
				const item = props.data.find((d) => d.name === name);
				const emoji = getCategoryEmoji(name);
				if (!item) return `${emoji} ${name}`;
				const val = Number(item.value || 0).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				return `${emoji} ${name} (¥${val})`;
			},
		},
		series: [
			{
				name: props.title,
				type: 'pie',
				radius: ['46%', '72%'],
				center: ['38%', '56%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 6,
					borderColor: '#ffffff',
					borderWidth: 2,
				},
				label: {
					show: false,
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 13,
						fontWeight: 'bold',
						formatter: '{b}\n¥{c} ({d}%)',
					},
					itemStyle: {
						shadowBlur: 12,
						shadowOffsetX: 0,
						shadowColor: 'rgba(15, 23, 42, 0.14)',
					},
				},
				data: props.data || [],
			},
		],
	};
});
</script>
