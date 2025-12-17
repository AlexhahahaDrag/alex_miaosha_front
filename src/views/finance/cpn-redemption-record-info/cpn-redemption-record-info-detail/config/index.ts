import type { Rule } from 'ant-design-vue/es/form/interface';

export const rulesRef: Record<string, Rule[]> = {
	userCouponId: [
		{
			required: true,
			message:
				'被核销的券实例ID (外键关联 cpn_user_coupon_info_t.id)不能为空！',
		},
	],
	userId: [
		{
			required: true,
			message: '核销用户ID不能为空！',
		},
	],
	orderId: [
		{
			required: true,
			message: '关联的订单ID不能为空！',
		},
	],
	redemptionQuantity: [
		{
			required: true,
			message: '本次核销数量 (固定为1)不能为空！',
		},
	],
	redemptionValue: [
		{
			required: true,
			message: '核销券的面值（参考）不能为空！',
		},
	],
	redemptionTime: [
		{
			required: true,
			message: '核销时间不能为空！',
		},
	],
	merchantId: [
		{
			required: true,
			message: '核销商家ID不能为空！',
		},
	],
};

export const labelCol = ref<{ span: number }>({ span: 5 });
export const wrapperCol = ref<{ span: number }>({ span: 19 });
