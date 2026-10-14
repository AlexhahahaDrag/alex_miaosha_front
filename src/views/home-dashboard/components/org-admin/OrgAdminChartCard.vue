<template>
	<a-card
		:title="chartCardTitle"
		:bordered="false"
		class="chart-card"
		data-testid="dash-org-chart-card"
	>
		<template #extra v-if="isFamilyContext">
			<a-radio-group
				v-model:value="activeChartTab"
				size="small"
				button-style="solid"
				data-testid="dash-org-chart-tabs"
				@change="onChartTabChange"
			>
				<a-radio-button value="trend">综合走势</a-radio-button>
				<a-radio-button value="category">支出分类</a-radio-button>
				<a-radio-button value="gift">人情专线</a-radio-button>
			</a-radio-group>
		</template>
		<div
			ref="chartContainer"
			class="chart-container-box"
		/>
	</a-card>
</template>

<script setup lang="ts">
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import { formatMonth } from '@/utils/dayjs';

interface Props {
	isFamilyContext: boolean;
	trendData: any[];
	categoryData: any[];
	monthExpenseList: any[];
}

const props = defineProps<Props>();

const activeChartTab = ref<'trend' | 'category' | 'gift'>('trend');

const chartCardTitle = computed(() => {
	if (!props.isFamilyContext) return '本机构月度销售与礼金往来走势';
	switch (activeChartTab.value) {
		case 'category':
			return '家庭本月日常支出分类占比构成';
		case 'gift':
			return '家庭月度人情礼金收支走势';
		case 'trend':
		default:
			return '家庭月度综合收支走势 (日常+人情)';
	}
});

const chartContainer = ref<HTMLElement>();
let chartInstance: EChartsType | null = null;

const onChartResize = () => {
	chartInstance?.resize();
};

const renderComprehensiveTrend = () => {
	if (!chartInstance) return;
	const months = props.trendData.map((item) => item.label || '');
	const giftGives = props.trendData.map((item) => item.giveAmount || 0);
	const giftReceives = props.trendData.map((item) => item.receiveAmount || 0);

	const expenseMap = new Map<string, number>();
	props.monthExpenseList.forEach((e) => {
		if (e.infoDate) {
			const mKey = formatMonth(e.infoDate);
			expenseMap.set(mKey, (expenseMap.get(mKey) || 0) + Number(e.amount || 0));
		}
	});

	const totalExpenseSeries = months.map((m, idx) => {
		const dailyVal = expenseMap.get(m) || 0;
		return (giftGives[idx] || 0) + dailyVal;
	});

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
			},
			legend: {
				data: ['综合总支出 (元)', '综合总收入 (元)'],
				top: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '40px',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				data:
					months.length ? months : ['4月', '5月', '6月', '7月', '8月', '9月'],
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			series: [
				{
					name: '综合总支出 (元)',
					type: 'bar',
					data: totalExpenseSeries.length ? totalExpenseSeries : [0],
					itemStyle: {
						color: '#f97316',
						borderRadius: [4, 4, 0, 0],
					},
				},
				{
					name: '综合总收入 (元)',
					type: 'bar',
					data: giftReceives.length ? giftReceives : [0],
					itemStyle: {
						color: '#10b981',
						borderRadius: [4, 4, 0, 0],
					},
				},
			],
		},
		true,
	);
};

const renderCategoryPie = () => {
	if (!chartInstance) return;
	const pieData = (props.categoryData || []).map((item) => ({
		name: item.categoryName || item.name || '其他',
		value: Number(item.amount || item.value || 0),
	}));

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'item',
				formatter: '{b}: ¥{c} ({d}%)',
			},
			legend: {
				orient: 'vertical',
				left: 'left',
				top: 'center',
			},
			series: [
				{
					name: '支出分类',
					type: 'pie',
					radius: ['45%', '70%'],
					center: ['60%', '50%'],
					avoidLabelOverlap: true,
					itemStyle: {
						borderRadius: 6,
						borderColor: '#fff',
						borderWidth: 2,
					},
					label: {
						show: false,
					},
					data:
						pieData.length ? pieData : [{ name: '暂无分类数据', value: 0 }],
				},
			],
		},
		true,
	);
};

const renderGiftTrend = () => {
	if (!chartInstance) return;
	const months = props.trendData.map((item) => item.label || '');
	const gives = props.trendData.map((item) => item.giveAmount || 0);
	const receives = props.trendData.map((item) => item.receiveAmount || 0);

	chartInstance.setOption(
		{
			tooltip: {
				trigger: 'axis',
			},
			legend: {
				data: ['人情随礼 (元)', '人情收礼 (元)'],
				top: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '40px',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data:
					months.length ? months : ['4月', '5月', '6月', '7月', '8月', '9月'],
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			series: [
				{
					name: '人情随礼 (元)',
					type: 'line',
					smooth: true,
					data: gives.length ? gives : [0],
					itemStyle: { color: '#ef4444' },
				},
				{
					name: '人情收礼 (元)',
					type: 'line',
					smooth: true,
					data: receives.length ? receives : [0],
					itemStyle: { color: '#3b82f6' },
				},
			],
		},
		true,
	);
};

const renderOrgAdminDefault = () => {
	if (!chartInstance) return;
	chartInstance.setOption(
		{
			tooltip: { trigger: 'axis' },
			legend: {
				data: ['部门销售额 (元)', '礼金往来流转 (元)'],
				top: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '40px',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				data: ['4月', '5月', '6月', '7月', '8月', '9月'],
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			series: [
				{
					name: '部门销售额 (元)',
					type: 'bar',
					data: [120000, 132000, 101000, 134000, 190000, 230000],
					itemStyle: {
						color: '#3b82f6',
						borderRadius: [4, 4, 0, 0],
					},
				},
				{
					name: '礼金往来流转 (元)',
					type: 'bar',
					data: [22000, 18200, 19100, 23400, 29000, 33000],
					itemStyle: {
						color: '#10b981',
						borderRadius: [4, 4, 0, 0],
					},
				},
			],
		},
		true,
	);
};

const refreshChart = () => {
	if (!props.isFamilyContext) {
		renderOrgAdminDefault();
		return;
	}
	switch (activeChartTab.value) {
		case 'category':
			renderCategoryPie();
			break;
		case 'gift':
			renderGiftTrend();
			break;
		case 'trend':
		default:
			renderComprehensiveTrend();
			break;
	}
};

const onChartTabChange = () => {
	refreshChart();
};

const initChart = async () => {
	if (!chartContainer.value) return;
	const echarts = await loadEcharts();
	chartInstance = echarts.init(chartContainer.value);
	window.addEventListener('resize', onChartResize);
	refreshChart();
};

const disposeChart = () => {
	window.removeEventListener('resize', onChartResize);
	chartInstance?.dispose();
	chartInstance = null;
};

watch(
	() => [props.isFamilyContext, props.trendData, props.categoryData, props.monthExpenseList],
	() => {
		refreshChart();
	},
	{ deep: true },
);

onMounted(() => {
	void initChart();
});

onUnmounted(() => {
	disposeChart();
});

defineExpose({
	refreshChart,
});
</script>

<style scoped lang="scss">
.chart-card {
	border-radius: 16px;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;
	background: #ffffff;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f1f5f9;
		font-weight: 700;
		color: #0f172a;
		font-size: 15px;
		letter-spacing: -0.2px;
		padding: 0 20px;
	}

	.chart-container-box {
		height: 320px;
		width: 100%;
	}
}
</style>
