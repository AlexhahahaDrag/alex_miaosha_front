<template>
	<section class="panel panel-secondary trend-panel">
		<div class="panel-head">
			<div>
				<h3>收支趋势（月度）</h3>
				<div v-if="trendStats" class="panel-stats">
					<span>平均收入 {{ money(trendStats.avgReceive) }}</span>
					<span>平均支出 {{ money(trendStats.avgGive) }}</span>
					<span>净增长率 {{ trendStats.netGrowthText }}</span>
				</div>
			</div>
			<a-select
				v-model:value="trendScopeModel"
				size="small"
				class="scope-select"
			>
				<a-select-option value="recent">最近6个月</a-select-option>
				<a-select-option value="year">本年度</a-select-option>
			</a-select>
		</div>
		<gift-empty-state
			v-if="scopedTrendRows.length === 0"
			title="暂无趋势数据"
			description="录入礼金记录后，这里会展示近几个月的收支变化。"
			action-text="去记一笔礼金 →"
			:to="recordPath"
			:icon="BarChartOutlined"
		/>
		<div
			v-else
			ref="trendChartRef"
			class="trend-echarts-container"
			data-testid="gift-dashboard-trend-chart"
		/>
	</section>
</template>

<script setup lang="ts">
import { BarChartOutlined } from '@ant-design/icons-vue';
import GiftEmptyState from '@/views/finance/gift/gift-dashboard/components/GiftEmptyState.vue';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import type { GiftAmountTrend } from '@/views/finance/gift/config';
import { money } from '@/views/finance/gift/config';
import { averageOf } from '@/views/finance/gift/gift-dashboard/utils/metrics';

const trendScopeModel = defineModel<'recent' | 'year'>('trendScope', {
	default: 'recent',
});

const props = defineProps<{
	trendRows: GiftAmountTrend[];
	recordPath: string;
}>();

const scopedTrendRows = computed(() => {
	if (props.trendRows.length === 0) return [];
	if (trendScopeModel.value === 'year') return props.trendRows;
	return props.trendRows.slice(-6);
});

const trendStats = computed(() => {
	const rows = scopedTrendRows.value;
	if (rows.length === 0) return null;
	const receives = rows.map((x) => Number(x.receiveAmount || 0));
	const gives = rows.map((x) => Number(x.giveAmount || 0));
	const avgReceive = averageOf(receives);
	const avgGive = averageOf(gives);

	const first = rows[0];
	const last = rows[rows.length - 1];
	const firstNet =
		Number(first.receiveAmount || 0) - Number(first.giveAmount || 0);
	const lastNet =
		Number(last.receiveAmount || 0) - Number(last.giveAmount || 0);

	let netGrowthText = '持平';
	if (firstNet !== 0) {
		const rate = ((lastNet - firstNet) / Math.abs(firstNet)) * 100;
		netGrowthText = `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
	} else if (lastNet > 0) {
		netGrowthText = '+100%';
	}

	return {
		avgReceive,
		avgGive,
		netGrowthText,
	};
});

const trendChartRef = ref<HTMLDivElement>();
let trendChartInstance: EChartsType | null = null;

const renderTrendChart = async () => {
	if (!trendChartRef.value) return;
	const rows = scopedTrendRows.value;
	if (!rows || rows.length === 0) {
		if (trendChartInstance) {
			trendChartInstance.clear();
		}
		return;
	}

	const echarts = await loadEcharts();
	if (!trendChartInstance) {
		trendChartInstance = echarts.init(trendChartRef.value);
	}

	const labels = rows.map((item) => item.label || '-');
	const receiveValues = rows.map((item) => Number(item.receiveAmount || 0));
	const giveValues = rows.map((item) => Number(item.giveAmount || 0));

	const option: any = {
		animation: true,
		animationDuration: 400,
		legend: {
			bottom: 0,
			itemWidth: 10,
			itemHeight: 10,
			itemGap: 24,
			textStyle: {
				color: '#475569',
				fontSize: 12,
			},
			data: ['收入', '支出'],
		},
		grid: {
			top: 20,
			right: 16,
			bottom: 36,
			left: 16,
			containLabel: true,
		},
		tooltip: {
			trigger: 'axis',
			appendToBody: true,
			axisPointer: {
				type: 'shadow',
				shadowStyle: {
					color: 'rgba(203, 213, 225, 0.25)',
				},
			},
			backgroundColor: 'rgba(15, 23, 42, 0.94)',
			borderColor: 'transparent',
			borderRadius: 8,
			padding: [10, 14],
			textStyle: {
				color: '#fff',
				fontSize: 12,
			},
			extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 99999;',
			formatter: (params: any) => {
				if (!params || params.length === 0) return '';
				const month = params[0].name;
				const receiveItem = params.find((p: any) => p.seriesName === '收入');
				const giveItem = params.find((p: any) => p.seriesName === '支出');
				const receive = Number(receiveItem?.value ?? 0);
				const give = Number(giveItem?.value ?? 0);
				const net = receive - give;
				const netSign = net > 0 ? '+' : '';
				const netColor = net >= 0 ? '#10b981' : '#f43f5e';

				return `
					<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.12);padding-bottom:4px;">
						📅 ${month}
					</div>
					<div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:4px;">
						<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#2563eb;margin-right:6px;"></i>收入:</span>
						<strong style="color:#fff">¥${receive.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
					</div>
					<div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:4px;">
						<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#f43f5e;margin-right:6px;"></i>支出:</span>
						<strong style="color:#fff">¥${give.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
					</div>
					<div style="display:flex;justify-content:space-between;gap:20px;border-top:1px dashed rgba(255,255,255,0.15);padding-top:4px;margin-top:2px;">
						<span>净结余:</span>
						<strong style="color:${netColor}">${netSign}¥${net.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
					</div>
				`;
			},
		},
		xAxis: {
			type: 'category',
			data: labels,
			axisLine: {
				lineStyle: {
					color: '#e2e8f0',
				},
			},
			axisTick: { show: false },
			axisLabel: {
				color: '#64748b',
				fontSize: 12,
			},
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: {
				lineStyle: {
					color: '#f1f5f9',
					type: 'dashed',
				},
			},
			axisLabel: {
				color: '#94a3b8',
				fontSize: 11,
				formatter: (val: number) => {
					if (val >= 10000) return `¥${(val / 10000).toFixed(1)}w`;
					if (val >= 1000) return `¥${(val / 1000).toFixed(0)}k`;
					return `¥${val}`;
				},
			},
		},
		series: [
			{
				name: '收入',
				type: 'bar',
				barWidth: 14,
				itemStyle: {
					color: '#2563eb',
					borderRadius: [4, 4, 0, 0],
				},
				data: receiveValues,
			},
			{
				name: '支出',
				type: 'bar',
				barWidth: 14,
				itemStyle: {
					color: '#f43f5e',
					borderRadius: [4, 4, 0, 0],
				},
				data: giveValues,
			},
		],
	};

	trendChartInstance.setOption(option);
};

const handleResize = () => {
	trendChartInstance?.resize();
};

watch(
	() => [scopedTrendRows.value, trendScopeModel.value],
	async () => {
		await nextTick();
		renderTrendChart();
	},
	{ deep: true },
);

onMounted(() => {
	window.addEventListener('resize', handleResize);
	nextTick(() => {
		renderTrendChart();
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize);
	trendChartInstance?.dispose();
	trendChartInstance = null;
});
</script>

<style scoped lang="less">
.panel {
	border-radius: 16px;
	padding: 20px;
	background: #fff;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.panel-head {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}
}

.panel-stats {
	display: flex;
	gap: 12px;
	margin-top: 4px;

	span {
		font-size: 12px;
		color: #64748b;
		background: #f1f5f9;
		padding: 2px 8px;
		border-radius: 6px;
	}
}

.scope-select {
	width: 110px;
}

.trend-echarts-container {
	width: 100%;
	height: 280px;
}
</style>
