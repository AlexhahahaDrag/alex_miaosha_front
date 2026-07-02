<template>
	<div :id="id" :style="style" />
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';

const props = defineProps({
	options: {
		type: Object,
		default: () => {
			return {};
		},
	},
	width: {
		type: String,
		default: '600px',
	},
	height: {
		type: String,
		default: '400px',
	},
});

const id = ref(`vue-echarts-${nanoid()}`);

const style = computed(() => ({
	height: props.height,
	width: props.width,
}));

let chart: EChartsType | null = null;

const onResize = () => {
	chart?.resize();
};

const initEcharts = async () => {
	const echarts = await loadEcharts();
	const el = document.getElementById(id.value);
	if (!el || chart) {
		return;
	}
	chart = echarts.init(el);
	chart.setOption(props.options);
	window.addEventListener('resize', onResize);
};

const disposeChart = () => {
	window.removeEventListener('resize', onResize);
	chart?.dispose();
	chart = null;
};

onMounted(() => {
	watch(
		() => props.options,
		() => {
			chart?.setOption(props.options);
		},
		{ deep: true, flush: 'post' },
	);
	void initEcharts();
});

onUnmounted(() => {
	disposeChart();
});
</script>
