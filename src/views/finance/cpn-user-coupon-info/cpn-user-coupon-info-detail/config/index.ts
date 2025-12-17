import type { Rule } from 'ant-design-vue/es/form/interface';

export const rulesRef: Record<string, Rule[]> = {
	userId: [
		{
			required: true,
			message: '领取用户ID不能为空！',
		},
	],
	couponId: [
		{
			required: true,
			message: '对应的消费券ID (外键关联 cpn_coupon_info_t.id)不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态（UNUSED, USED, EXPIRED）不能为空！',
		},
	],
	receiveTime: [
		{
			required: true,
			message: '领取时间不能为空！',
		},
	],
	expireTime: [
		{
			required: true,
			message: '有效期截止时间不能为空！',
		},
	],
};

export const labelCol = ref<{ span: number }>({ span: 5 });
export const wrapperCol = ref<{ span: number }>({ span: 19 });
