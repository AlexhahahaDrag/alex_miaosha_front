<template>
	<div class="calendar-heatmap-container" data-testid="gift-calendar-heatmap">
		<div class="heatmap-toolbar">
			<div class="toolbar-title">
				<h4>📅 年度人情往来日历热力图</h4>
				<span class="sub-text">全年 365 天人情收支密度分布 · 发现节庆婚嫁高频时段</span>
			</div>
			<div class="toolbar-actions">
				<a-radio-group v-model:value="displayType" size="small" button-style="solid">
					<a-radio-button value="net">净额走势</a-radio-button>
					<a-radio-button value="receive">收礼密集度</a-radio-button>
					<a-radio-button value="give">随礼密集度</a-radio-button>
				</a-radio-group>
				<a-select v-model:value="selectedYear" size="small" style="width: 100px" @change="renderChart">
					<a-select-option :value="2026">2026 年</a-select-option>
					<a-select-option :value="2025">2025 年</a-select-option>
					<a-select-option :value="2024">2024 年</a-select-option>
				</a-select>
			</div>
		</div>

		<div ref="chartRef" class="heatmap-canvas" />

		<div v-if="selectedDayInfo" class="day-detail-banner" data-testid="heatmap-selected-banner">
			<span class="day-badge">{{ selectedDayInfo.date }}</span>
			<span class="day-stat">
				当日往来：
				<strong class="text-green">+¥{{ selectedDayInfo.receive.toFixed(2) }} (收)</strong>
				/
				<strong class="text-orange">-¥{{ selectedDayInfo.give.toFixed(2) }} (送)</strong>
				· 净差额：
				<span :class="selectedDayInfo.net >= 0 ? 'text-green font-bold' : 'text-orange font-bold'">
					{{ selectedDayInfo.net >= 0 ? '+' : '' }}¥{{ selectedDayInfo.net.toFixed(2) }}
				</span>
			</span>
			<a-button type="link" size="small" @click="selectedDayInfo = null">关闭</a-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';

export interface DailyHeatmapItem {
	date: string;
	receive: number;
	give: number;
	net: number;
	count: number;
}

const props = withDefaults(
	defineProps<{
		dailyData?: DailyHeatmapItem[];
	}>(),
	{
		dailyData: () => [],
	},
);

const emit = defineEmits<{
	(e: 'select-date', date: string): void;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: EChartsType | null = null;

const selectedYear = ref<number>(2026);
const displayType = ref<'net' | 'receive' | 'give'>('net');
const selectedDayInfo = ref<DailyHeatmapItem | null>(null);

// 依据展示类型提取热力数值
const getHeatmapSeriesData = (year: number) => {
	const map = new Map<string, DailyHeatmapItem>();
	(props.dailyData || []).forEach((item) => {
		map.set(item.date, item);
	});

	// 构建全年的日期散点
	const startDate = new Date(`${year}-01-01`);
	const endDate = new Date(`${year}-12-31`);
	const seriesData: [string, number][] = [];

	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().split('T')[0];
		const item = map.get(dateStr);
		let val = 0;
		if (item) {
			if (displayType.value === 'receive') {
				val = item.receive;
			} else if (displayType.value === 'give') {
				val = item.give;
			} else {
				val = Math.abs(item.net);
			}
		}
		seriesData.push([dateStr, val]);
	}
	return seriesData;
};

const renderChart = async () => {
	if (!chartRef.value) return;

	if (!chartInstance) {
		const echarts = await loadEcharts();
		if (!chartRef.value) return;
		chartInstance = echarts.init(chartRef.value);

		chartInstance.on('click', (params: any) => {
			if (params && params.data && params.data[0]) {
				const dateStr = params.data[0] as string;
				const found = (props.dailyData || []).find((d) => d.date === dateStr) || {
					date: dateStr,
					receive: 0,
					give: 0,
					net: 0,
					count: 0,
				};
				selectedDayInfo.value = found;
				emit('select-date', dateStr);
			}
		});
	}

	const year = selectedYear.value;
	const data = getHeatmapSeriesData(year);

	// 渐变色阶配置
	const inRangeColors =
		displayType.value === 'receive'
			? ['#f0fdf4', '#bbf7d0', '#4ade80', '#16a34a', '#14532d']
			: displayType.value === 'give'
			? ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c', '#7c2d12']
			: ['#f8fafc', '#bae6fd', '#38bdf8', '#0284c7', '#0369a1'];

	const option = {
		tooltip: {
			position: 'top',
			formatter: (p: any) => {
				const d = p.data[0];
				const found = (props.dailyData || []).find((item) => item.date === d);
				if (!found || (found.receive === 0 && found.give === 0)) {
					return `<div style="font-size:12px;padding:2px"><strong>${d}</strong><br/>暂无人情往来记录</div>`;
				}
				return `
					<div style="font-size:12px;padding:2px">
						<strong>${d}</strong><br/>
						收礼：<span style="color:#52c41a">¥${found.receive.toFixed(2)}</span><br/>
						随礼：<span style="color:#fa8c16">¥${found.give.toFixed(2)}</span><br/>
						净差额：<span style="color:${found.net >= 0 ? '#52c41a' : '#fa8c16'}">¥${found.net.toFixed(2)}</span><br/>
						流水笔数：${found.count} 笔
					</div>
				`;
			},
		},
		visualMap: {
			min: 0,
			max: 3000,
			calculable: true,
			orient: 'horizontal',
			left: 'center',
			bottom: 10,
			inRange: {
				color: inRangeColors,
			},
			text: ['重礼', '无/轻'],
			textStyle: {
				color: '#64748b',
				fontSize: 11,
			},
		},
		calendar: {
			top: 30,
			left: 50,
			right: 30,
			cellSize: ['auto', 16],
			range: year,
			itemStyle: {
				borderWidth: 1,
				borderColor: '#e2e8f0',
				borderRadius: 3,
			},
			yearLabel: { show: false },
			dayLabel: {
				firstDay: 1,
				nameMap: ['日', '一', '二', '三', '四', '五', '六'],
				color: '#94a3b8',
				fontSize: 11,
			},
			monthLabel: {
				nameMap: 'cn',
				color: '#64748b',
				fontSize: 11,
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: '#cbd5e1',
					width: 1.5,
				},
			},
		},
		series: {
			type: 'heatmap',
			coordinateSystem: 'calendar',
			data,
		},
	};

	chartInstance.setOption(option);
};

const handleResize = () => {
	chartInstance?.resize();
};

watch(
	() => [props.dailyData, displayType.value, selectedYear.value],
	() => {
		nextTick(() => {
			renderChart();
		});
	},
	{ deep: true },
);

onMounted(() => {
	renderChart();
	window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
	chartInstance?.dispose();
	chartInstance = null;
});
</script>

<style scoped lang="less">
.calendar-heatmap-container {
	background: #ffffff;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	padding: 16px 20px;
	margin-bottom: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

	.heatmap-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;

		.toolbar-title {
			h4 {
				margin: 0;
				font-size: 15px;
				font-weight: 700;
				color: #0f172a;
			}
			.sub-text {
				font-size: 12px;
				color: #94a3b8;
			}
		}

		.toolbar-actions {
			display: flex;
			align-items: center;
			gap: 12px;
		}
	}

	.heatmap-canvas {
		width: 100%;
		height: 200px;
	}

	.day-detail-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 8px 12px;
		margin-top: 10px;
		font-size: 12px;

		.day-badge {
			background: #2563eb;
			color: #fff;
			padding: 2px 8px;
			border-radius: 6px;
			font-weight: 600;
		}

		.day-stat {
			color: #475569;
			flex: 1;

			.text-green {
				color: #16a34a;
			}
			.text-orange {
				color: #ea580c;
			}
			.font-bold {
				font-weight: 700;
			}
		}
	}
}
</style>
