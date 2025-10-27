import type { Rule } from 'ant-design-vue/es/form';

// 表单验证规则
export const rulesRef: Record<string, Rule[]> = {
	eventName: [
		{
			required: true,
			message: '事件名称不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	otherPerson: [
		{
			required: true,
			message: '其他人不能为空！',
		},
	],
	eventTime: [
		{
			required: true,
			message: '随礼时间不能为空！',
		},
	],
	action: [
		{
			required: true,
			message: '动作不能为空！',
		},
	],
};
