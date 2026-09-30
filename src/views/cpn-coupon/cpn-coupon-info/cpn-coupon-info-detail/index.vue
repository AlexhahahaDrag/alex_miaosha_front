<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || 'min(800px, 60%)'"
			okText="保存"
			:confirmLoading="loading"
			:destroyOnClose="true"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<!-- AI Agent: 参照 cpn-coupon-redeem-quantity-detail 升级标题样式（局部生效，不影响全局 Modal） -->
			<template #title>
				<div class="ai-agent-modal-title-wrap">
					<span class="ai-agent-modal-title">
						{{ modelInfo?.title || 'Basic Modal' }}
					</span>
					<!-- AI Agent: 标题下方横线（顶到两端） -->
					<div class="ai-agent-modal-title-divider"></div>
				</div>
			</template>
			<template #footer>
				<a-button key="back" @click="handleCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					@click="handleOk"
				>
					保存
				</a-button>
			</template>

			<!-- AI 营销策划助手面板（仅在新增时展示） -->
			<div v-if="!formState.id" class="ai-plan-bar" data-testid="ai-plan-bar">
				<div class="ai-plan-bar-header">
					<span class="ai-tag">✨ AI 营销策划助手</span>
					<span class="ai-tip">输入预算与目标，一键生成最优满减/折扣券方案</span>
				</div>
				<a-space :size="8" class="ai-plan-inputs" wrap>
					<a-input-number
						v-model:value="aiPlanParams.budget"
						:min="100"
						:step="500"
						placeholder="预算(元)"
						style="width: 110px"
						data-testid="ai-plan-input-budget"
					/>
					<a-select
						v-model:value="aiPlanParams.targetGoal"
						placeholder="营销目标"
						style="width: 120px"
						data-testid="ai-plan-select-goal"
						:options="[
							{ label: '拉新获客', value: '拉新获客' },
							{ label: '老客促活', value: '老客促活' },
							{ label: '清仓冲量', value: '清仓冲量' },
							{ label: '节日特惠', value: '节日特惠' },
						]"
					/>
					<a-input
						v-model:value="aiPlanParams.industryCategory"
						placeholder="适用品类(如美食)"
						style="width: 130px"
						data-testid="ai-plan-input-category"
					/>
					<a-button
						type="primary"
						ghost
						size="middle"
						:loading="aiPlanning"
						data-testid="btn-generate-ai-plan"
						@click="handleAiPlan"
					>
						智能生成方案
					</a-button>
				</a-space>
				<div v-if="aiPlanResult" class="ai-plan-result-card" data-testid="ai-plan-result">
					<div class="ai-plan-reason">
						<strong>💡 策略考量：</strong>{{ aiPlanResult.strategyReasoning }} <span class="discount-badge">{{ aiPlanResult.discountRate }}</span>
					</div>
					<div class="ai-plan-copy">
						<strong>📢 推荐文案：</strong>{{ aiPlanResult.marketingCopy }}
					</div>
				</div>
			</div>

			<a-form
				ref="formRef"
				name="CouponInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
				:disabled="loading"
				style="margin-top: 16px"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['couponName'].name"
							:label="labelMap['couponName'].label"
						>
							<a-input
								v-model:value="formState.couponName"
								:placeholder="'请填写' + labelMap['couponName'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['totalQuantity'].name"
							:label="labelMap['totalQuantity'].label"
						>
							<a-input
								v-model:value="formState.totalQuantity"
								:placeholder="'请填写' + labelMap['totalQuantity'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['endDate'].name"
							:label="labelMap['endDate'].label"
						>
							<a-date-picker
								v-model:value="formState.endDate"
								:show-time="{ format: 'HH:mm' }"
								format="YYYY-MM-DD HH:mm"
								:getPopupContainer="
									(triggerNode: HTMLElement) => {
										return triggerNode.parentNode as HTMLElement;
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['unitValue'].name"
							:label="labelMap['unitValue'].label"
						>
							<a-input
								v-model:value="formState.unitValue"
								:placeholder="'请填写' + labelMap['unitValue'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['paymentStatus'].name"
							:label="labelMap['paymentStatus'].label"
						>
							<!-- AI Agent：支付状态选择（1：已支付，0：未支付） -->
							<a-select
								v-model:value="formState.paymentStatus"
								:placeholder="'请选择' + labelMap['paymentStatus'].label"
								:allowClear="true"
							>
								<a-select-option :value="1">已支付</a-select-option>
								<a-select-option :value="0">未支付</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import { message, type FormInstance } from 'ant-design-vue';
import {
	getCpnCouponInfoDetail,
	addCpnCouponInfo,
	editCpnCouponInfo,
	aiPlanCpnCoupon,
	type CpnCouponAiPlanReq,
	type CpnCouponAiPlanVo,
} from '@/views/cpn-coupon/cpn-coupon-info/api';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from '../config';
import { labelMap } from '@/views/cpn-coupon/cpn-coupon-info/config';
import {
	rulesRef,
	labelCol,
	wrapperCol,
} from '@/views/cpn-coupon/cpn-coupon-info/config';
import dayjs from 'dayjs';
import { formatDayjs } from '@/utils/dayjs';
import type { ResponseBody } from '@/types/api';

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

let formState = ref<CpnCouponInfoData>({});

// ── AI 营销策划助手
const aiPlanning = ref(false);
const aiPlanParams = ref<CpnCouponAiPlanReq>({
	budget: 5000,
	targetGoal: '拉新获客',
	industryCategory: '',
});
const aiPlanResult = ref<CpnCouponAiPlanVo | null>(null);

const handleAiPlan = async () => {
	aiPlanning.value = true;
	try {
		const { code, data, message: msg } = await aiPlanCpnCoupon(aiPlanParams.value);
		if (code === '200' && data) {
			aiPlanResult.value = data;
			if (data.couponName) formState.value.couponName = data.couponName;
			if (data.totalQuantity) formState.value.totalQuantity = data.totalQuantity;
			if (data.unitValue) formState.value.unitValue = data.unitValue;
			if (data.minSpend) formState.value.minSpend = data.minSpend;
			if (data.validDays) {
				formState.value.startDate = dayjs();
				formState.value.endDate = dayjs().add(data.validDays, 'day');
			}
			if (data.marketingCopy) formState.value.description = data.marketingCopy;
			message.success('已智能应用 AI 营销方案');
		} else {
			message.error(msg || 'AI方案生成失败');
		}
	} catch (e) {
		console.error(e);
		message.error('AI方案生成异常');
	} finally {
		aiPlanning.value = false;
	}
};

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveCpnCouponInfo())
			.catch(() => (loading.value = false));
	}
};
const handleCancel = () => {
	modelInfo.value.open = false;
};

//保存消费券信息表信息
const saveCpnCouponInfo = async () => {
	let api = addCpnCouponInfo;
	if (formState.value.id) {
		api = editCpnCouponInfo;
	}
	loading.value = true;
	// 将 dayjs 对象转换为字符串格式，以便后端正确接收
	const submitData = {
		...formState.value,
		startDate:
			formState.value.startDate ? dayjs(formState.value.startDate) : undefined,
		endDate:
			formState.value.endDate ? dayjs(formState.value.endDate) : undefined,
	};
	const { code, message: messageInfo } = await api(submitData)
		.catch((error: ResponseBody) => {
			return error as { code: string; message: string };
		})
		.finally(() => {
			loading.value = false;
		});
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const initDetail = async (modalData: ModelInfo | undefined) => {
	if (modalData?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getCpnCouponInfoDetail(modalData.id);
		if (code === '200') {
			// AI Agent：将后端返回的字符串日期转换为 dayjs 对象，以便日期选择器正确显示
			const formattedData = { ...(data || {}) };
			if (data?.startDate) {
				const startDate = formatDayjs(data.startDate);
				if (startDate) {
					formattedData.startDate = startDate;
				}
			}
			if (data?.endDate) {
				const endDate = formatDayjs(data.endDate);
				if (endDate) {
					formattedData.endDate = endDate;
				}
			}
			formState.value = formattedData;
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		aiPlanResult.value = null;
		// AI Agent：新增时默认支付状态为未支付（0）
		formState.value = { startDate: dayjs(), paymentStatus: 0 };
	}
};

const init = async () => {
	//初始化数据
	initDetail(modelInfo.value);
};

defineExpose({ handleOk, handleCancel });

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
		deep: true,
	},
);

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped>
/* AI Agent: 弹窗标题字号调大“两号”（默认约 16px -> 18px），并添加分割线 */
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

.ai-plan-bar {
	margin-bottom: 16px;
	padding: 12px 14px;
	border-radius: 12px;
	background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
	border: 1px solid #bae0ff;

	.ai-plan-bar-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;

		.ai-tag {
			font-weight: 700;
			font-size: 13px;
			color: #0958d9;
		}

		.ai-tip {
			font-size: 12px;
			color: #64748b;
		}
	}

	.ai-plan-result-card {
		margin-top: 10px;
		padding: 10px 12px;
		background: #ffffff;
		border-radius: 8px;
		border: 1px solid #d9d9d9;
		font-size: 12px;
		line-height: 1.6;

		.ai-plan-reason {
			color: #1e293b;
			margin-bottom: 4px;

			.discount-badge {
				display: inline-block;
				margin-left: 6px;
				padding: 0 6px;
				font-size: 11px;
				border-radius: 4px;
				background: #f6ffed;
				color: #389e0d;
				border: 1px solid #b7eb8f;
			}
		}

		.ai-plan-copy {
			color: #475569;
		}
	}
}
</style>
