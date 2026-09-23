import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DatasetComponent,
	TransformComponent,
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
	BarChart,
	LineChart,
	PieChart,
	LabelLayout,
	UniversalTransition,
	LegacyGridContainLabel,
	CanvasRenderer,
]);

export function loadEcharts(): Promise<typeof echarts> {
	return Promise.resolve(echarts);
}

export type { EChartsType };
