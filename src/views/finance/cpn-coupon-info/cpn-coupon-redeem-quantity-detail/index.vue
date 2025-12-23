<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props.modelInfo?.width || 'min(1000px, 80%)'"
			:title="props.modelInfo?.title || '消费券核销'"
			okText="保存"
			:confirmLoading="loading"
			:destroyOnClose="true"
			@ok="onOk"
			@cancel="onCancel"
		>
			<template #footer>
				<a-button key="back" @click="onCancel">取消</a-button>
				<a-button key="submit" type="primary" :loading="loading" @click="onOk">
					保存
				</a-button>
			</template>

			<a-form
				ref="formRef"
				name="CpnCouponRedeemQuantityForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap.userId.name"
							:label="labelMap.userId.label"
						>
							<a-input-number
								v-model:value="formState.userId"
								:min="1"
								:precision="0"
								style="width: 100%"
								placeholder="请输入用户ID"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap.couponName.name"
							:label="labelMap.couponName.label"
						>
							<a-input v-model:value="formState.couponName" disabled />
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap.remainingQuantity.name"
							:label="labelMap.remainingQuantity.label"
						>
							<a-input v-model:value="formState.remainingQuantity" disabled />
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap.redemptionQuantity.name"
							:label="labelMap.redemptionQuantity.label"
						>
							<a-input-number
								v-model:value="formState.redemptionQuantity"
								:min="1"
								:max="formState.remainingQuantity || 0"
								:precision="0"
								style="width: 100%"
								placeholder="请输入核销数量"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap.remarks.name"
							:label="labelMap.remarks.label"
						>
							<a-input
								v-model:value="formState.remarks"
								placeholder="请输入备注（可选）"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { message, type FormInstance } from 'ant-design-vue';
import { computed } from 'vue';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from '../config';
import {
	redeemCpnUserCouponInfo,
	type CpnUserCouponRedeemReq,
} from '@/views/finance/cpn-user-coupon-info/api';

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
	// AI Agent：从列表行传入，用于初始化弹窗展示/校验
	couponInfo?: CpnCouponInfoData | null;
}

const props = defineProps<Props>();

const emits = defineEmits(['handleOk', 'handleCancel']);

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

// AI Agent：保持和 `cpn-coupon-info-detail` 一致的表单布局
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const labelMap = {
	userId: { name: 'userId', label: '用户ID' },
	couponName: { name: 'couponName', label: '消费券名称' },
	remainingQuantity: { name: 'remainingQuantity', label: '剩余数量' },
	redemptionQuantity: { name: 'redemptionQuantity', label: '核销数量' },
	remarks: { name: 'remarks', label: '备注' },
} as const;

type RedeemFormState = {
	userId?: number;
	couponId?: number;
	couponName?: string;
	remainingQuantity?: number;
	redemptionQuantity?: number;
	remarks?: string;
};

const formState = ref<RedeemFormState>({});

// AI Agent：校验规则（不要在模板里直接写 Promise，否则 Vue 模板类型推断会报错）
const rulesRef = computed(() => {
	return {
		[labelMap.userId.name]: [{ required: true, message: '请输入用户ID' }],
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
});

const onOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => onSubmit())
			.catch(() => (loading.value = false));
	}
};

const onCancel = () => {
	emits('handleCancel', false);
};

// AI Agent：提交（调用后端“消费券核销数量（按数量核销）”接口）
const onSubmit = async () => {
	try {
		if (!formState.value.userId || !formState.value.couponId) {
			message.error('用户ID或消费券信息不完整');
			return;
		}
		if (!formState.value.redemptionQuantity) {
			message.error('请输入核销数量');
			return;
		}

		const req: CpnUserCouponRedeemReq = {
			userId: formState.value.userId,
			couponId: formState.value.couponId,
			redemptionQuantity: formState.value.redemptionQuantity,
			remarks: formState.value.remarks,
		};

		const { code, message: messageInfo } = await redeemCpnUserCouponInfo(req);
		if (code === '200') {
			message.success(messageInfo || '核销成功！');
			emits('handleOk', false);
		} else {
			message.error(messageInfo || '核销失败！');
		}
	} finally {
		loading.value = false;
	}
};

const initDetail = () => {
	// AI Agent：弹窗打开时用传入行数据初始化
	const coupon = props.couponInfo;
	formState.value = {
		userId: undefined,
		couponId: coupon?.id,
		couponName: coupon?.couponName,
		remainingQuantity: coupon?.remainingQuantity ?? 0,
		redemptionQuantity: undefined,
		remarks: undefined,
	};
};

watch(
	() => props.open,
	(newVal) => {
		if (newVal) {
			initDetail();
		}
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped></style>
