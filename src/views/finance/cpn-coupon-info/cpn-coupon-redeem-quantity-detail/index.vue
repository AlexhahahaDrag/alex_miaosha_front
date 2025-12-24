<template>
	<div>
		<a-modal
			:open="props.open"
			:width="'min(600px, 60%)'"
			:confirmLoading="loading"
			:destroyOnClose="true"
			@ok="onOk"
			@cancel="onCancel"
		>
			<!-- AI Agent: 使用 title 插槽定制标题样式，避免影响全局 Modal 标题 -->
			<template #title>
				<div class="ai-agent-modal-title-wrap">
					<span class="ai-agent-modal-title">
						{{ props.modelInfo?.title || '消费券核销' }}
					</span>
					<!-- AI Agent: 标题下方横线（如截图红框） -->
					<div class="ai-agent-modal-title-divider"></div>
				</div>
			</template>
			<template #footer>
				<a-button key="back" @click="onCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					class="btn-confirm"
					@click="onOk"
				>
					确认核销
				</a-button>
			</template>

			<a-form
				ref="formRef"
				name="CpnCouponRedeemQuantityForm"
				class="cpn-coupon-redeem-form"
				:model="formState"
				:rules="rulesRef"
				:disabled="loading"
				layout="vertical"
			>
				<!-- 消费券信息 -->
				<div class="section-title">
					<span class="section-bar"></span>
					<span class="section-text">消费券信息</span>
				</div>
				<div class="info-box">
					<div class="info-row">
						<div class="info-item">
							<span class="info-label">消费券名称：</span>
							<span class="info-value">{{ formState.couponName || '-' }}</span>
						</div>
						<div class="info-item info-item-right">
							<span class="info-label">剩余数量：</span>
							<span class="info-value info-value-warn">
								<!-- 与核销数量联动展示：剩余数量 = 原剩余 - 核销数量（不小于0） -->
								{{ linkedRemainingQuantity }}
							</span>
						</div>
					</div>
				</div>

				<!-- 核销设置 -->
				<div class="section-title section-title-gap">
					<span class="section-bar"></span>
					<span class="section-text">
						核销设置 <span class="required-star">*</span>
					</span>
				</div>
				<a-form-item
					:name="labelMap.redemptionQuantity.name"
					class="form-item-no-label"
				>
					<a-space-compact style="width: 280px">
						<a-button :disabled="isMinusDisabled" @click="onMinusQuantity">
							-
						</a-button>
						<a-input-number
							v-model:value="formState.redemptionQuantity"
							:min="1"
							:max="maxRedeemQuantity"
							:precision="0"
							:controls="false"
							style="width: 120px; text-align: center"
						/>
						<a-button :disabled="isPlusDisabled" @click="onPlusQuantity">
							+
						</a-button>
					</a-space-compact>
					<div class="hint-text">核销后将不可撤回，请确认数量</div>
				</a-form-item>

				<!-- 备注 -->
				<div class="section-title section-title-gap">
					<span class="section-bar"></span>
					<span class="section-text">备注</span>
				</div>
				<a-form-item :name="labelMap.remarks.name" class="form-item-no-label">
					<a-textarea
						v-model:value="formState.remarks"
						placeholder="请输入备注（如：人工核销、异常补录）"
						allow-clear
						:auto-size="{ minRows: 2, maxRows: 4 }"
					/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { message, type FormInstance } from 'ant-design-vue';
import { computed } from 'vue';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from '../config';
import { labelMap, createRulesRef, type RedeemFormState } from './config';
import {
	redeemCpnUserCouponInfo,
	type CpnUserCouponRedeemReq,
} from '@/views/finance/cpn-user-coupon-info/api';
import { useUserStore } from '@/store/modules/user/user';

const userStore = useUserStore();

const userInfo = computed(() => userStore.getUserInfo);

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
	// 从列表行传入，用于初始化弹窗展示/校验
	couponInfo?: CpnCouponInfoData;
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const formState = ref<RedeemFormState>({});

// 表单校验规则（与 formState 关联，尤其是 remainingQuantity 动态上限）
const rulesRef = createRulesRef(formState);

// 核销数量上下限与按钮禁用态
const maxRedeemQuantity = computed(
	() => formState.value.remainingQuantity || 0,
);

// 剩余数量联动展示（原型效果）
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

// 数量加减按钮事件（Vue 事件处理函数以 on 开头）
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

// 确认核销按钮事件
const onOk = () => {
	// 无可核销数量时直接拦截（避免 max=0 仍可点击确认）
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

// 取消按钮事件
const onCancel = () => {
	emits('handleCancel', false);
};

// 提交（调用后端“消费券核销数量（按数量核销）”接口）
const onSubmit = async () => {
	try {
		if (!formState.value.couponId) {
			message.error('消费券信息不完整，请刷新列表后重试');
			return;
		}

		const req: CpnUserCouponRedeemReq = {
			userId: userInfo.value?.id ?? 0,
			couponId: formState.value.couponId,
			redemptionQuantity: formState.value.redemptionQuantity ?? 0,
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

// 初始化弹窗数据
const initDetail = () => {
	// 弹窗打开时用传入行数据初始化
	const coupon = props.couponInfo;
	formState.value = {
		couponId: coupon?.id,
		couponName: coupon?.couponName,
		remainingQuantity: coupon?.remainingQuantity ?? 0,
		// 核销数量默认值与剩余数量联动：有剩余默认 1，否则 0（避免默认值非法）
		redemptionQuantity: coupon?.remainingQuantity ?? 0,
		remarks: undefined,
	};
};

const emits = defineEmits(['handleOk', 'handleCancel']);

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

<style lang="scss" scoped>
// 弹窗样式升级（按截图风格）
.cpn-coupon-redeem-form {
	:deep(.ant-divider-horizontal.ant-divider-with-text) {
		margin: 16px 0 12px;
	}
}

.required-star {
	color: #ff4d4f;
	margin-left: 6px;
	font-weight: 600;
}

/* AI Agent: 弹窗标题字号调大“两号”（默认约 16px -> 18px） */
.ai-agent-modal-title-wrap {
	width: 100%;
}
.ai-agent-modal-title {
	font-size: 18px;
	line-height: 24px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.88);
}

/* AI Agent: 标题下横线（不改全局 ant 样式，局部实现） */
.ai-agent-modal-title-divider {
	/* AI Agent: antd Modal header 默认左右 padding 为 24px，这里用负 margin 抵消，让线“顶到两端” */
	width: calc(100% + 48px);
	margin-left: -24px;
	height: 1px;
	margin-top: 12px;
	/* AI Agent: 分割线颜色加深（对标 Ant 边框色更清晰） */
	background: #d9d9d9;
}

.hint-text {
	margin-top: 8px;
	color: rgba(0, 0, 0, 0.45);
	font-size: 12px;
}

// 原型分组标题（左侧竖线 + 标题）
.section-title {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 6px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.85);
	margin-top: 20px;
}
.section-title-gap {
	margin-top: 18px;
}
.section-bar {
	width: 3px;
	height: 16px;
	border-radius: 2px;
	background: rgba(0, 0, 0, 0.45);
}
.section-text {
	line-height: 1;
}

// 消费券信息灰底框（原型样式）
.info-box {
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 8px;
	padding: 14px 16px;
}
.info-row {
	display: flex;
	justify-content: space-between;
	gap: 16px;
}
.info-item {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
}
.info-item-right {
	justify-content: flex-end;
}
.info-label {
	color: rgba(0, 0, 0, 0.65);
	white-space: nowrap;
}
.info-value {
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.info-value-warn {
	color: #fa8c16;
}

// 隐藏 form-item label（原型没有“核销数量/备注”字段 label）
.form-item-no-label {
	:deep(.ant-form-item-label) {
		display: none;
	}
	:deep(.ant-form-item-control) {
		margin-top: 0;
	}
}

// 确认核销按钮改成橙色（原型）
.btn-confirm {
	background: #fa8c16 !important;
	border-color: #fa8c16 !important;
}
.btn-confirm:hover,
.btn-confirm:focus {
	background: #ff9c2a !important;
	border-color: #ff9c2a !important;
}
</style>
