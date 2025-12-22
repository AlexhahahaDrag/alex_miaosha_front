import type { Rule } from 'ant-design-vue/es/form/interface';

export const rulesRef: Record<string, Rule[]> = {
	couponName: [
		{
			required: true,
			message: '消费券名称不能为空！',
		},
	],
	totalQuantity: [
		{
			required: true,
			message: '消费券总发行数量不能为空！',
		},
	],
	endDate: [
		{
			required: true,
			message: '有效期结束时间不能为空！',
		},
	],
};

export const labelCol = ref<{ span: number }>({ span: 5 });
export const wrapperCol = ref<{ span: number }>({ span: 19 });
