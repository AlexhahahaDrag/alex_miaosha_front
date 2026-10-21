import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, HeatmapChart, GraphChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DatasetComponent,
	TransformComponent,
	CalendarComponent,
	VisualMapComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition, LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsType } from 'echarts/core';

echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DatasetComponent,
	TransformComponent,
	CalendarComponent,
	VisualMapComponent,
	BarChart,
	LineChart,
	PieChart,
	HeatmapChart,
	GraphChart,
	LabelLayout,
	UniversalTransition,
	LegacyGridContainLabel,
	CanvasRenderer,
]);

export function loadEcharts(): Promise<typeof echarts> {
	return Promise.resolve(echarts);
}

export type { EChartsType };
