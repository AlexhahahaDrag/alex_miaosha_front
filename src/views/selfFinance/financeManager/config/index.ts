import type { TableColumnsType } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form/interface';
import type { Dayjs } from '@/utils/dayjs';

export const columns: TableColumnsType = [
	{
		title: '账目与归属',
		dataIndex: 'name',
		key: 'name',
		minWidth: 240,
	},
	{
		title: '类别',
		dataIndex: 'typeCode',
		key: 'typeCode',
		width: '20%',
		minWidth: 120,
		align: 'center',
	},
	{
		title: '支付方式',
		dataIndex: 'fromSource',
		key: 'fromSource',
		width: '20%',
		minWidth: 130,
		align: 'center',
	},
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
		align: 'right',
		width: '16%',
		minWidth: 140,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 230,
		minWidth: 220,
	},
];

export interface FinanceManagerData {
	id?: string;
	orgId?: string;
	name?: string;
	typeCode?: string;
	typeName?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	infoDate?: Dayjs | string;
	incomeAndExpenses?: string;
	belongTo?: string;
	belongToName?: string;
	infoDateStart?: Dayjs | string;
	infoDateEnd?: Dayjs | string;
	typeCodes?: string[];
}

export type FinanceManagerParams = FinanceManagerData;

export interface FinanceSummary {
	totalExpense?: number;
	totalIncome?: number;
	totalBalance?: number;
	totalCount?: number;
}

export type FinanceBudgetStatus = FinanceBudgetStatusVo;

export interface FinanceBudgetStatusVo {
	id?: string;
	orgId?: string;
	belongTo?: string;
	budgetMonth?: string;
	yearMonth?: string;
	incomeAndExpenses?: string;
	budgetAmount: number;
	categoryCodes: string[];
	categoryNames: string[];
	actualExpense: number;
	remainingAmount: number;
	usagePercent: number;
	isOverBudget: boolean;
	isInherited: boolean;
}

export interface FinanceBudgetSaveReq {
	id?: string;
	orgId?: string;
	budgetMonth?: string;
	yearMonth?: string;
	incomeAndExpenses?: string;
	belongTo?: string;
	budgetAmount: number;
	categoryCodes: string[];
}

export interface FinanceBudgetAiRecommendReq {
	budgetMonth?: string;
	belongTo?: string;
	targetMode?: string;
}

export interface FinanceBudgetAiRecommendVo {
	budgetMonth?: string;
	avgMonthlyExpense?: number;
	recommendAmount?: number;
	savingAmount?: number;
	moderateAmount?: number;
	relaxedAmount?: number;
	recommendedCategories?: string[];
	healthAdvice?: string;
	dailyLimitSuggest?: number;
	isFallback?: boolean;
}

export interface FinanceBudgetAiParseReq {
	command: string;
	budgetMonth?: string;
}

export interface FinanceBudgetAiParseVo {
	hasBudget?: boolean;
	amount?: number;
	hasCategories?: boolean;
	categories?: string[];
	isFallback?: boolean;
	reasoning?: string;
}

export interface UniversalFinanceAiParseReq {
	scene?: 'AUTO_DETECT' | 'DAILY_EXPENSE' | 'SHOP_RECEIPT' | 'PREPAID_CARD';
	text: string;
	belongTo?: string;
}

export interface UniversalFinanceReceiptItem {
	itemName?: string;
	unitPrice?: number;
	quantity?: number;
	subtotal?: number;
}

export interface UniversalFinanceAiParseVo {
	targetScene?: string;
	incomeAndExpenses?: string;
	amount?: number;
	name?: string;
	typeCode?: string;
	typeName?: string;
	fromSource?: string;
	fromSourceName?: string;
	infoDate?: string;
	belongTo?: string;
	belongToName?: string;
	description?: string;
	prepaidCardId?: string;
	prepaidCardName?: string;
	prepaidCardBalance?: number;
	receiptItems?: UniversalFinanceReceiptItem[];
	attachments?: Array<{
		id?: string;
		name?: string;
		url?: string;
		preUrl?: string;
	}>;
	parseEngine?: string;
	reasoning?: string;
}

export interface UniversalFinanceAiStageVo {
	stage:
		| 'SCENE_ANALYSIS'
		| 'EXTRACTING_AMOUNT'
		| 'STRUCTURING_ITEMS'
		| 'MATCHING_ENTITIES'
		| 'COMPLETE'
		| 'ERROR';
	progress: number;
	message: string;
	partialData?: UniversalFinanceAiParseVo;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash', name: '现金' },
	{ value: 'yhk', label: 'card', name: '银行卡' },
	{ value: 'zfb', label: 'zhifubao', name: '支付宝' },
	{ value: 'wx', label: 'weChat', name: '微信' },
	{ value: 'mt', label: 'meituan', name: '美团' },
	{ value: 'hb', label: 'huabei', name: '花呗' },
	{ value: 'bt', label: 'whiteBar', name: '白条' },
	{ value: 'hf', label: 'telCharge', name: '话费' },
	{ value: 'hfw', label: 'telCharge', name: '话费(我)' },
	{ value: 'hfm', label: 'telCharge', name: '话费(妈)' },
	{ value: 'hfmj', label: 'telCharge', name: '话费(亲)' },
	{ value: 'df', label: 'electricCharge', name: '电费' },
	{ value: 'dfw', label: 'electricCharge', name: '电费(我)' },
	{ value: 'dfm', label: 'electricCharge', name: '电费(妈)' },
	{ value: 'sf', label: 'waterCharge', name: '水费' },
	{ value: 'rqf', label: 'gasCharge', name: '燃气费' },
	{ value: 'jd', label: 'jingdong', name: '京东' },
	{ value: 'mm', label: 'maimai', name: '买买/美团' },
	{ value: 'hmy', label: 'hema', name: '盒马鲜生' },
	{ value: 'other', label: 'other', name: '其他' },
];

export const categoryEmojiMap: Record<string, string> = {
	转账: '🔄',
	餐饮: '🍱',
	美食: '🍱',
	饭: '🍚',
	外卖: '🥡',
	买菜: '🥬',
	菜: '🥬',
	日常交通: '🚗',
	交通: '🚗',
	出行: '🚕',
	打车: '🚕',
	地铁: '🚇',
	加油: '⛽',
	日用百货: '🛒',
	日用: '🛒',
	杂物: '📦',
	超市: '🏪',
	购物: '🛍️',
	服饰: '👔',
	剪发: '💇',
	理发: '💇',
	美发: '💇',
	美容: '💄',
	护肤: '🧴',
	水费: '💧',
	水: '💧',
	电费: '⚡',
	燃气费: '🔥',
	取暖: '🔥',
	生活缴费: '🧾',
	物业: '🏘️',
	话费: '📱',
	通讯: '📱',
	网费: '🌐',
	零食: '🍿',
	水果: '🍎',
	饮品: '☕',
	咖啡: '☕',
	奶茶: '🧋',
	工资: '💰',
	奖金: '🧧',
	年金: '📈',
	理财: '📈',
	投资: '📈',
	保险: '🛡️',
	礼金: '🎁',
	红包: '🧧',
	房租: '🏠',
	房贷: '🏦',
	公司: '🏢',
	办公: '🏢',
	数码: '🎧',
	耳机: '🎧',
	医疗: '💊',
	看病: '🏥',
	娱乐: '🎮',
	电影: '🎬',
	运动: '🏃',
	健身: '🏋️',
	教育: '📚',
	学习: '📚',
	旅行: '✈️',
	酒店: '🏨',
	宠物: '🐾',
};

export const getCategoryEmoji = (name?: string): string => {
	if (!name) return '🏷️';
	if (categoryEmojiMap[name]) return categoryEmojiMap[name];
	for (const [key, emoji] of Object.entries(categoryEmojiMap)) {
		if (name.includes(key)) {
			return emoji;
		}
	}
	return '🏷️';
};

// Tailwind Soft UI 10% 透明底无边框配色调色板（对齐 ftc-web 风格）
export const pillColorPalette = [
	{ bg: 'rgba(79, 106, 246, 0.1)', text: '#4F6AF6' },
	{ bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
	{ bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706' },
	{ bg: 'rgba(139, 92, 246, 0.1)', text: '#7c3aed' },
	{ bg: 'rgba(6, 182, 212, 0.1)', text: '#0891b2' },
	{ bg: 'rgba(244, 63, 94, 0.1)', text: '#e11d48' },
	{ bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
	{ bg: 'rgba(217, 70, 239, 0.1)', text: '#c026d3' },
];

export const getCategoryPillStyle = (name?: string) => {
	if (!name) return {};
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + (name.codePointAt(i) ?? 0);
		hash = Math.trunc(hash);
	}
	const idx = Math.abs(hash) % pillColorPalette.length;
	const color = pillColorPalette[idx];
	return {
		backgroundColor: color.bg,
		color: color.text,
		border: 'none',
		borderRadius: '9999px',
		padding: '2px 10px',
		fontSize: '12px',
		fontWeight: '500',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		lineHeight: '1.4',
		cursor: 'pointer',
		transition: 'all 0.15s ease',
	};
};

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };

// 明细表单校验规则
export const rulesRef: Record<string, Rule[]> = {
	name: [{ required: true, message: '名称不能为空！' }],
	amount: [{ required: true, message: '金额不能为空！' }],
	typeCode: [{ required: true, message: '类别不能为空！' }],
	fromSource: [{ required: true, message: '支付方式不能为空！' }],
	incomeAndExpenses: [{ required: true, message: '收支类型不能为空！' }],
	isValid: [{ required: true, message: '状态不能为空！' }],
	infoDate: [{ required: true, message: '业务时间不能为空！' }],
	belongTo: [{ required: true, message: '属于不能为空！' }],
};
