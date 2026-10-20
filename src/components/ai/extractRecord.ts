export interface StructuredRecord {
	name: string;
	amount: number;
	incomeAndExpenses: 'expense' | 'income';
	typeCode?: string;
}

/**
 * 从文本中快速抽取记账关键要素（兼容本地规则降级与口语化识别）
 */
export function extractRecordFromText(text: string): StructuredRecord | null {
	if (!text) return null;
	const isExpense = /花|支出|付|买|购|点外卖|消费|吃|喝/i.test(text);
	const isIncome = /收|赚|入账|工资|报销|奖金|收益/i.test(text);
	if (!isExpense && !isIncome) return null;

	const numMatch = text.match(/(\d+(\.\d{1,2})?)\s*元?/);
	if (!numMatch) return null;
	const amount = parseFloat(numMatch[1]);
	if (isNaN(amount) || amount <= 0) return null;

	let typeCode = '日常';
	if (/餐|吃|喝|麦当劳|肯德基|火锅|咖啡|奶茶/i.test(text)) typeCode = '餐饮美食';
	else if (/车|打车|地铁|公交|出行|打表/i.test(text)) typeCode = '交通出行';
	else if (/超市|商场|生活|纸巾|牛奶/i.test(text)) typeCode = '日常百货';

	let name = text.replace(/(\d+(\.\d{1,2})?)\s*元?/, '').replace(/[，。！!]/g, ' ').trim();
	if (!name) name = typeCode;
	if (name.length > 20) name = name.substring(0, 20);

	return {
		name,
		amount,
		incomeAndExpenses: isIncome && !isExpense ? 'income' : 'expense',
		typeCode,
	};
}
