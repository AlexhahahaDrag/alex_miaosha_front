import type { Rule } from 'ant-design-vue/es/form/interface';

// 明细相关配置
export const rulesRef: Record<string, Rule[]> = {
	name: [
		{
			required: true,
			message: '名称不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	typeCode: [
		{
			required: true,
			message: '类别不能为空！',
		},
	],
	fromSource: [
		{
			required: true,
			message: '支付方式不能为空！',
		},
	],
	incomeAndExpenses: [
		{
			required: true,
			message: '收支类型不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	infoDate: [
		{
			required: true,
			message: '业务时间不能为空！',
		},
	],
	belongTo: [
		{
			required: true,
			message: '属于不能为空！',
		},
	],
};
