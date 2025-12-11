interface ItemInfo {
	name: string;
	value: number | string;
}

interface resultType {
	typeCode?: string;
	typeName?: string;
	incomeAndExpenses?: string;
	amount?: number;
	infoDate?: string;
	userId?: number;
	username?: string;
}

// 日期格式化
const dateFormatter = 'YYYY-MM';

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

export { dateFormatter, tooltip, type ItemInfo, type resultType };
