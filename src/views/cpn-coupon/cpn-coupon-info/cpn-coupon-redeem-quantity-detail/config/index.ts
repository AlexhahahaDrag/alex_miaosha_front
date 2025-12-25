import type { Rule } from 'ant-design-vue/es/form/interface';
import type { Ref } from 'vue';

type RedeemFormState = {
	userId?: number;
	couponId?: number;
	couponName?: string;
	remainingQuantity?: number;
	redemptionQuantity?: number;
	remarks?: string;
};

const labelMap = {
	userId: { name: 'userId', label: '用户ID' },
	couponName: { name: 'couponName', label: '消费券名称' },
	remainingQuantity: { name: 'remainingQuantity', label: '剩余数量' },
	redemptionQuantity: { name: 'redemptionQuantity', label: '核销数量' },
	remarks: { name: 'remarks', label: '备注' },
};

// AI Agent：rules 里需要依赖 formState（remainingQuantity），不能在 config 文件里直接引用组件内变量
// 这里改成工厂函数，由组件传入 formState（Ref），避免 formState 未定义导致报错
const createRulesRef = (
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

export { labelMap, createRulesRef };

export type { RedeemFormState };
