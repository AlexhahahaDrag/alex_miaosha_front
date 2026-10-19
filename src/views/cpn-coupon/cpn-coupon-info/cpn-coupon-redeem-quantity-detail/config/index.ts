import type { Rule } from 'ant-design-vue/es/form/interface';
import type { Ref } from 'vue';

export type RedeemFormState = {
	userId?: string;
	couponId?: string;
	couponName?: string;
	remainingQuantity?: number;
	redemptionQuantity?: number;
	remarks?: string;
};

export const labelMap = {
	userId: { name: 'userId', label: '用户ID' },
	couponName: { name: 'couponName', label: '消费券名称' },
	remainingQuantity: { name: 'remainingQuantity', label: '剩余数量' },
	redemptionQuantity: { name: 'redemptionQuantity', label: '核销数量' },
	remarks: { name: 'remarks', label: '核销备注' },
};

export const createRulesRef = (
	formState: Ref<RedeemFormState>,
): Record<string, Rule[]> => {
	return {
		[labelMap.redemptionQuantity.name]: [
			{ required: true, message: '请输入核销数量' },
			{
				type: 'number' as const,
				min: 1,
				message: '核销数量必须大于0',
			},
			{
				validator: (_rule: unknown, value: number) => {
					const maxQuantity = formState.value.remainingQuantity || 0;
					if (value && value > maxQuantity) {
						return Promise.reject(new Error('核销数量不能超过剩余数量'));
					}
					return Promise.resolve();
				},
			},
		],
	};
};
