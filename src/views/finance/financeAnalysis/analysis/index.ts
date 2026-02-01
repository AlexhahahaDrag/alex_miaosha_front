interface ItemInfo {
	name: string;
	value: number | string;
}

// 分析数据
export interface AnalysisData {
	typeCode?: string;
	typeName?: string;
	incomeAndExpenses?: string;
	amount: number;
	infoDate: string;
	userId?: string;
	username?: string;
	yoyTrend?: string;
	momTrend?: string;
}

// 提示框参数
export interface TooltipParam {
	axisValue: string;
	marker: string;
	value: number;
	seriesName: string;
}

// 日期格式化
const dateFormatter = 'YYYY-MM';

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

export { dateFormatter, tooltip, type ItemInfo };
