import type { EChartsType } from 'echarts/core';

type EChartsCore = typeof import('echarts/core');

let loadPromise: Promise<EChartsCore> | null = null;

async function loadEchartsModules(): Promise<EChartsCore> {
	const echarts = await import('echarts/core');
	const [
		{ BarChart, LineChart, PieChart },
		{
			TitleComponent,
			TooltipComponent,
			GridComponent,
			LegendComponent,
			DatasetComponent,
			TransformComponent,
		},
		{ LabelLayout, UniversalTransition },
		{ CanvasRenderer },
	] = await Promise.all([
		import('echarts/charts'),
		import('echarts/components'),
		import('echarts/features'),
		import('echarts/renderers'),
	]);

	echarts.use([
		TitleComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DatasetComponent,
		TransformComponent,
		BarChart,
		LineChart,
		PieChart,
		LabelLayout,
		UniversalTransition,
		CanvasRenderer,
	]);

	return echarts;
}

export function loadEcharts(): Promise<EChartsCore> {
	if (!loadPromise) {
		loadPromise = loadEchartsModules();
	}
	return loadPromise;
}

export type { EChartsType };
