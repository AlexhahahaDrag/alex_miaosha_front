<template>
	<div class="pie-chart-wrapper" :style="{ width: props.width, height: props.height }">
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
		type: Array as PropType<Array<{ name: string; value: number }>>,
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
	const total = props.data.reduce((acc, item) => acc + (Number(item?.value) || 0), 0);
	return total > 0;
});

const totalAmount = computed(() => {
	if (!props.data) return 0;
	return props.data.reduce((acc, item) => acc + (Number(item?.value) || 0), 0);
});

const options = computed(() => {
	const colors = [
		'#3b82f6', // 蓝
		'#10b981', // 绿
		'#f59e0b', // 琥珀橙
		'#ec4899', // 粉
		'#8b5cf6', // 紫
		'#06b6d4', // 青
		'#f97316', // 橙
		'#6366f1', // 靛蓝
		'#84cc16', // 浅绿
		'#14b8a6', // 蓝绿
	];

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
		color: colors,
		tooltip: {
			trigger: 'item',
			formatter: (params: any) => {
				const val = Number(params.value || 0).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				return `<div style="font-weight:600;margin-bottom:4px;">${params.seriesName || props.title}</div>
					<div>${params.marker} ${params.name}: <b>¥${val}</b> (${params.percent}%)</div>`;
			},
			...props.tooltip,
		},
		legend: {
			type: 'scroll',
			orient: 'vertical',
			right: 16,
			top: 40,
			bottom: 20,
			itemWidth: 10,
			itemHeight: 10,
			textStyle: {
				color: '#4b5563',
				fontSize: 12,
			},
			formatter: (name: string) => {
				const item = props.data.find((d) => d.name === name);
				if (!item) return name;
				const val = Number(item.value || 0).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				return `${name} (¥${val})`;
			},
		},
		series: [
			{
				name: props.title,
				type: 'pie',
				radius: ['45%', '70%'],
				center: ['40%', '56%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 5,
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
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.2)',
					},
				},
				data: props.data || [],
			},
		],
	};
});
</script>

<style lang="less" scoped>
.pie-chart-wrapper {
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
