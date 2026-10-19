<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || '消费券核销'"
		subtitle="按数量核销选定消费券库存，核销后将实时生成核销流水记录"
		width="480px"
		:confirm-loading="loading"
		ok-text="确认核销"
		@ok="onOk"
		@cancel="onCancel"
	>
		<!-- 1. 消费券票面与剩余库存联动预览卡 -->
		<div class="redeem-voucher-card">
			<div class="voucher-top">
				<div class="voucher-title-group">
					<span class="voucher-icon">
						<GiftOutlined />
					</span>
					<div class="voucher-meta">
						<h4 class="voucher-name">{{ formState.couponName || '—' }}</h4>
						<span class="voucher-sub">
							核销前可用：{{ formState.remainingQuantity ?? 0 }} 张
						</span>
					</div>
				</div>
				<div class="voucher-remain-box">
					<span class="remain-label">核销后剩余</span>
					<span class="remain-value">{{ linkedRemainingQuantity }} 张</span>
				</div>
			</div>
		</div>

		<!-- 2. 核销表单 -->
		<a-form
			ref="formRef"
			name="CpnCouponRedeemQuantityForm"
			layout="vertical"
			class="modern-redeem-form"
			:model="formState"
			:rules="rulesRef"
			:disabled="loading"
		>
			<a-form-item
				:name="labelMap.redemptionQuantity.name"
				label="本次核销数量"
			>
				<div class="stepper-row">
					<a-space-compact class="stepper-compact">
						<a-button
							class="step-btn"
							:disabled="isMinusDisabled"
							@click="onMinusQuantity"
						>
							-
						</a-button>
						<a-input-number
							id="form_redemptionQuantity"
							name="redemptionQuantity"
							v-model:value="formState.redemptionQuantity"
							:min="1"
							:max="maxRedeemQuantity"
							:precision="0"
							:controls="false"
							class="step-input"
						/>
						<a-button
							class="step-btn"
							:disabled="isPlusDisabled"
							@click="onPlusQuantity"
						>
							+
						</a-button>
					</a-space-compact>
					<a-button
						v-if="maxRedeemQuantity > 1"
						type="link"
						size="small"
						@click="formState.redemptionQuantity = maxRedeemQuantity"
					>
						全部核销 ({{ maxRedeemQuantity }})
					</a-button>
				</div>
				<div class="hint-text">
					⚠️ 核销成功后库存将实时扣减，如需回退可在「用户领券管理」中取消核销
				</div>
			</a-form-item>

			<a-form-item :name="labelMap.remarks.name" label="核销备注">
				<a-textarea
					id="form_remarks"
					name="remarks"
					v-model:value="formState.remarks"
					placeholder="请输入核销备注（如：线下门店核销、人工补录）"
					allow-clear
					:rows="3"
				/>
			</a-form-item>
		</a-form>
	</BaseRbacDrawer>
</template>

<script setup lang="ts">
import { message, type FormInstance } from 'ant-design-vue';
import { GiftOutlined } from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import type { ModelInfo } from '@/types/modal';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import {
	labelMap,
	createRulesRef,
	type RedeemFormState,
} from '@/views/cpn-coupon/cpn-coupon-info/cpn-coupon-redeem-quantity-detail/config';
import { redeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import type { CpnUserCouponRedeemReq } from '@/views/cpn-coupon/cpn-user-coupon-info/config';
import { useUserStore } from '@/store/modules/user/user';

const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

interface Props {
	couponInfo?: CpnCouponInfoData;
	open?: boolean;
}

const props = defineProps<Props>();
const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
	(e: 'success'): void;
}>();

// 同时兼容 v-model:modelInfo 与 v-model:open
const drawerOpen = computed({
	get: () => Boolean(modelInfo.value?.open ?? props.open),
	set: (val: boolean) => {
		if (modelInfo.value) {
			modelInfo.value.open = val;
		}
		emit('update:open', val);
	},
});

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const formState = ref<RedeemFormState>({});

const rulesRef = createRulesRef(formState);

const maxRedeemQuantity = computed(
	() => formState.value.remainingQuantity || 0,
);

const linkedRemainingQuantity = computed(() => {
	return Math.max(
		0,
		(formState.value.remainingQuantity || 0) -
			(formState.value.redemptionQuantity || 0),
	);
});

const isMinusDisabled = computed(
	() => (formState.value.redemptionQuantity || 1) <= 1,
);

const isPlusDisabled = computed(() => {
	const cur = formState.value.redemptionQuantity || 1;
	return cur >= maxRedeemQuantity.value;
});

const onMinusQuantity = () => {
	const cur = formState.value.redemptionQuantity || 1;
	formState.value.redemptionQuantity = Math.max(1, cur - 1);
};

const onPlusQuantity = () => {
	const cur = formState.value.redemptionQuantity || 1;
	formState.value.redemptionQuantity = Math.min(
		maxRedeemQuantity.value,
		cur + 1,
	);
};

const onOk = () => {
	if (maxRedeemQuantity.value <= 0) {
		message.warning('当前消费券无可核销数量');
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => onSubmit())
			.catch(() => (loading.value = false));
	}
};

const onCancel = () => {
	drawerOpen.value = false;
};

const onSubmit = async () => {
	try {
		if (!formState.value.couponId) {
			message.error('消费券信息不完整，请刷新列表后重试');
			return;
		}

		const req: CpnUserCouponRedeemReq = {
			userId: String(userInfo.value?.id ?? '0'),
			couponId: String(formState.value.couponId),
			redemptionQuantity: formState.value.redemptionQuantity ?? 0,
			remarks: formState.value.remarks,
		};

		const { code, message: messageInfo } = await redeemCpnUserCouponInfo(req);
		if (code === '200') {
			message.success(messageInfo || '核销成功！');
			drawerOpen.value = false;
			emit('success');
		} else {
			message.error(messageInfo || '核销失败！');
		}
	} finally {
		loading.value = false;
	}
};

const initDetail = () => {
	const coupon = props.couponInfo;
	const remain = coupon?.remainingQuantity ?? 0;
	formState.value = {
		couponId: coupon?.id ? String(coupon.id) : undefined,
		couponName: coupon?.couponName,
		remainingQuantity: remain,
		redemptionQuantity: remain > 0 ? 1 : 0,
		remarks: undefined,
	};
};

watch(
	() => drawerOpen.value,
	(newVal) => {
		if (newVal) {
			initDetail();
		}
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped>
.redeem-voucher-card {
	margin-bottom: 20px;
	padding: 16px 18px;
	border-radius: 12px;
	border: 1px solid #fed7aa;
	background: linear-gradient(135deg, #fff7ed 0%, #ffffff 75%);

	.voucher-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.voucher-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.voucher-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: #ffffff;
		border: 1px solid #fed7aa;
		color: #ea580c;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.voucher-meta {
		display: flex;
		flex-direction: column;
		gap: 3px;

		.voucher-name {
			margin: 0;
			font-size: 15px;
			font-weight: 700;
			color: #0f172a;
		}

		.voucher-sub {
			font-size: 12px;
			color: #64748b;
		}
	}

	.voucher-remain-box {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;

		.remain-label {
			font-size: 11px;
			color: #64748b;
		}

		.remain-value {
			font-size: 20px;
			font-weight: 800;
			color: #ea580c;
			font-variant-numeric: tabular-nums;
		}
	}
}

.modern-redeem-form {
	:deep(.ant-form-item-label > label) {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	.stepper-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.step-btn {
		width: 38px;
		height: 36px;
		font-weight: 700;
	}

	.step-input {
		width: 120px;
		height: 36px;
		:deep(.ant-input-number-input) {
			text-align: center;
			font-weight: 700;
			font-variant-numeric: tabular-nums;
		}
	}

	.hint-text {
		margin-top: 8px;
		font-size: 12px;
		color: #64748b;
	}
}
</style>
