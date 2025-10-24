import type { Rule } from 'ant-design-vue/es/form';

const rulesRef: Record<string, Rule[]> = {
	name: [
		{
			required: true,
			message: '名称不能为空！',
		},
	],
	avliDate: [
		{
			required: true,
			message: '有效期不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	account: [
		{
			required: true,
			message: '账号不能为空！',
		},
	],
};

const labelCol = ref({ span: 5 });

const wrapperCol = ref({ span: 19 });

export { labelCol, wrapperCol, rulesRef };
