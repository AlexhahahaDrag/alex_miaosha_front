import type { Rule } from 'ant-design-vue/es/form';

// 表单验证规则
export const rulesRef: Record<string, Rule[]> = {
	name: [
		{
			required: true,
			message: '联系人姓名不能为空！',
		},
	],
	phone: [
		{
			required: true,
			message: '联系电话不能为空！',
		},
		{
			pattern: /^1[3-9]\d{9}$/,
			message: '请输入正确的手机号码！',
		},
	],
	relationship: [
		{
			required: true,
			message: '关系类型不能为空！',
		},
	],
	email: [
		{
			pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			message: '请输入正确的邮箱地址！',
		},
	],
};
