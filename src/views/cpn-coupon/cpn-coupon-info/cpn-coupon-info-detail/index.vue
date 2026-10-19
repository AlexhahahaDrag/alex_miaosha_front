<template>
	<BaseRbacDrawer
		v-model:open="modelInfo.open"
		:title="modelInfo?.title || '消费券信息'"
		:subtitle="drawerSubtitle"
		width="560px"
		:confirm-loading="loading"
		:readonly="isReadonly"
		ok-text="保存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：消费券电子票面卡片 -->
		<div v-if="isReadonly" class="detail-readonly-view">
			<div class="coupon-hero-card">
				<div class="hero-left">
					<div class="hero-icon-box">
						<GiftOutlined />
					</div>
					<div class="hero-meta">
						<h3 class="hero-title">{{ formState.couponName || '未命名消费券' }}</h3>
						<div class="hero-badges">
							<span
								class="pay-badge"
								:class="formState.paymentStatus === 1 ? 'is-paid' : 'is-unpaid'"
							>
								<span class="dot"></span>
								{{ formState.paymentStatus === 1 ? '已支付生效' : '未支付' }}
							</span>
							<span v-if="formState.minSpend" class="threshold-badge">
								满 ¥{{ formState.minSpend }} 可用
							</span>
						</div>
					</div>
				</div>
				<div class="hero-right">
					<span class="face-label">票面金额</span>
					<span class="face-value">
						¥{{ formatAmount(formState.unitValue || 0) }}
					</span>
				</div>
			</div>

			<div class="detail-section-card">
				<div class="section-header">
					<CalendarOutlined class="section-icon" />
					<span>发行库存与有效期规则</span>
				</div>
				<div class="detail-grid">
					<div class="detail-cell">
						<span class="cell-label">发行总数量</span>
						<span class="cell-value font-mono font-bold text-slate-800">
							{{ formState.totalQuantity ?? 0 }} 张
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">当前可用余量</span>
						<span class="cell-value font-mono font-bold text-blue-600">
							{{
								formState.remainingQuantity ?? formState.totalQuantity ?? 0
							}}
							张
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">生效起始时间</span>
						<span class="cell-value font-mono text-slate-700">
							{{ formattedStartDate }}
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">有效期截止</span>
						<span class="cell-value font-mono text-slate-700">
							{{ formattedEndDate }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式 -->
		<template v-else>
			<!-- AI 营销策划助手面板（仅在新增时展示，完整保留 E2E data-testid） -->
			<div v-if="!formState.id" class="ai-plan-bar" data-testid="ai-plan-bar">
				<div class="ai-plan-bar-header">
					<span class="ai-tag">✨ AI 营销策划助手</span>
					<span class="ai-tip">
						输入预算与目标，一键生成最优满减/折扣券方案
					</span>
				</div>
				<a-space :size="8" class="ai-plan-inputs" wrap>
					<a-input-number
						id="ai_plan_budget"
						name="aiPlanBudget"
						v-model:value="aiPlanParams.budget"
						:min="100"
						:step="500"
						placeholder="预算(元)"
						style="width: 110px"
						data-testid="ai-plan-input-budget"
					/>
					<a-select
						id="ai_plan_goal"
						name="aiPlanGoal"
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
						id="ai_plan_category"
						name="aiPlanCategory"
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
				<div
					v-if="aiPlanResult"
					class="ai-plan-result-card"
					data-testid="ai-plan-result"
				>
					<div class="ai-plan-reason">
						<strong>💡 策略考量：</strong>{{ aiPlanResult.strategyReasoning }}
						<span class="discount-badge">{{ aiPlanResult.discountRate }}</span>
					</div>
					<div class="ai-plan-copy">
						<strong>📢 推荐文案：</strong>{{ aiPlanResult.marketingCopy }}
					</div>
				</div>
			</div>

			<a-form
				ref="formRef"
				name="CouponInfoForm"
				layout="vertical"
				class="modern-form"
				:model="formState"
				:rules="rulesRef"
				:disabled="loading"
			>
				<div class="form-grid-2">
					<a-form-item
						:name="labelMap['couponName'].name"
						:label="labelMap['couponName'].label"
					>
						<a-input
							id="form_couponName"
							name="couponName"
							v-model:value="formState.couponName"
							:placeholder="'请填写' + labelMap['couponName'].label"
							allow-clear
						/>
					</a-form-item>

					<a-form-item
						:name="labelMap['totalQuantity'].name"
						:label="labelMap['totalQuantity'].label"
					>
						<a-input
							id="form_totalQuantity"
							name="totalQuantity"
							v-model:value="formState.totalQuantity"
							type="number"
							suffix="张"
							:placeholder="'请填写' + labelMap['totalQuantity'].label"
						/>
					</a-form-item>
				</div>

				<div class="form-grid-2">
					<a-form-item
						:name="labelMap['unitValue'].name"
						:label="labelMap['unitValue'].label"
					>
						<a-input
							id="form_unitValue"
							name="unitValue"
							v-model:value="formState.unitValue"
							type="number"
							prefix="￥"
							:placeholder="'请填写' + labelMap['unitValue'].label"
						/>
					</a-form-item>

					<a-form-item
						:name="labelMap['minSpend'].name"
						:label="labelMap['minSpend'].label"
					>
						<a-input
							id="form_minSpend"
							name="minSpend"
							v-model:value="formState.minSpend"
							type="number"
							prefix="￥"
							placeholder="选填：如满100减20填100"
						/>
					</a-form-item>
				</div>

				<div class="form-grid-2">
					<a-form-item
						:name="labelMap['endDate'].name"
						:label="labelMap['endDate'].label"
					>
						<a-date-picker
							id="form_endDate"
							name="endDate"
							v-model:value="formState.endDate"
							class="w-full"
							:show-time="{ format: 'HH:mm' }"
							format="YYYY-MM-DD HH:mm"
							:getPopupContainer="
								(triggerNode: HTMLElement) => {
									return triggerNode.parentNode as HTMLElement;
								}
							"
						/>
					</a-form-item>

					<a-form-item
						:name="labelMap['paymentStatus'].name"
						:label="labelMap['paymentStatus'].label"
					>
						<a-select
							id="form_paymentStatus"
							name="paymentStatus"
							v-model:value="formState.paymentStatus"
							:placeholder="'请选择' + labelMap['paymentStatus'].label"
							:allowClear="true"
						>
							<a-select-option :value="1">已支付</a-select-option>
							<a-select-option :value="0">未支付</a-select-option>
						</a-select>
					</a-form-item>
				</div>
			</a-form>
		</template>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import { message, type FormInstance } from 'ant-design-vue';
import { GiftOutlined, CalendarOutlined } from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import {
	getCpnCouponInfoDetail,
	addCpnCouponInfo,
	editCpnCouponInfo,
	aiPlanCpnCoupon,
	type CpnCouponAiPlanReq,
	type CpnCouponAiPlanVo,
} from '@/views/cpn-coupon/cpn-coupon-info/api';
import type { ModelInfo } from '@/types/modal';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import {
	rulesRef,
	labelMap,
} from '@/views/cpn-coupon/cpn-coupon-info/config';
import { formatDayjs, formatTime, addDays, nowDayjs } from '@/utils/dayjs';
import { formatAmount } from '@/utils/amountInfo';
import type { ResponseBody } from '@/types/api';

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const formState = ref<CpnCouponInfoData>({});

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const drawerSubtitle = computed(() => {
	if (isReadonly.value) {
		return '查看消费券票面金额、发行库存与有效期规则';
	}
	return formState.value?.id ?
			'更新消费券面值、发行总量、有效期或支付状态'
		:	'创建消费券批次，支持通过 AI 营销策划助手一键生成最优满减方案';
});

const formattedStartDate = computed(() => {
	if (!formState.value?.startDate) return '—';
	return formatTime(formState.value.startDate, 'YYYY-MM-DD HH:mm');
});

const formattedEndDate = computed(() => {
	if (!formState.value?.endDate) return '—';
	return formatTime(formState.value.endDate, 'YYYY-MM-DD HH:mm');
});

// ── AI 营销策划助手
const aiPlanning = ref<boolean>(false);
const aiPlanParams = ref<CpnCouponAiPlanReq>({
	budget: 5000,
	targetGoal: '拉新获客',
	industryCategory: '',
});
const aiPlanResult = ref<CpnCouponAiPlanVo | null>(null);

const handleAiPlan = async () => {
	aiPlanning.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await aiPlanCpnCoupon(aiPlanParams.value);
		if (code === '200' && data) {
			aiPlanResult.value = data;
			if (data.couponName) formState.value.couponName = data.couponName;
			if (data.totalQuantity)
				formState.value.totalQuantity = data.totalQuantity;
			if (data.unitValue) formState.value.unitValue = data.unitValue;
			if (data.minSpend) formState.value.minSpend = data.minSpend;
			if (data.validDays) {
				formState.value.startDate = nowDayjs();
				formState.value.endDate = addDays(data.validDays);
			}
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
	if (isReadonly.value) {
		handleCancel();
		return;
	}
	if (formRef.value) {
		loading.value = true;
		formRef.value
			.validateFields()
			.then(() => saveCpnCouponInfo())
			.catch(() => (loading.value = false));
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveCpnCouponInfo = async () => {
	let api = addCpnCouponInfo;
	if (formState.value.id) {
		api = editCpnCouponInfo;
	}
	loading.value = true;
	const submitData = {
		...formState.value,
		startDate:
			formState.value.startDate ?
				formatDayjs(formState.value.startDate)
			:	undefined,
		endDate:
			formState.value.endDate ?
				formatDayjs(formState.value.endDate)
			:	undefined,
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
		} = await getCpnCouponInfoDetail(String(modalData.id));
		if (code === '200') {
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
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		aiPlanResult.value = null;
		formState.value = { startDate: nowDayjs(), paymentStatus: 0 };
	}
};

const init = async () => {
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
	},
);

const emit = defineEmits(['success']);
</script>

<style lang="scss" scoped>
.detail-readonly-view {
	display: flex;
	flex-direction: column;
	gap: 16px;

	.coupon-hero-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 20px;
		border-radius: 12px;
		border: 1px solid #fecdd3;
		background: linear-gradient(135deg, #fff1f2 0%, #ffffff 70%);
		flex-wrap: wrap;

		.hero-left {
			display: flex;
			align-items: center;
			gap: 14px;
		}

		.hero-icon-box {
			width: 44px;
			height: 44px;
			border-radius: 12px;
			background: #ffffff;
			border: 1px solid #fecdd3;
			color: #e11d48;
			font-size: 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}

		.hero-meta {
			display: flex;
			flex-direction: column;
			gap: 6px;

			.hero-title {
				margin: 0;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
			}

			.hero-badges {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}
		}

		.pay-badge {
			display: inline-flex;
			align-items: center;
			gap: 5px;
			padding: 2px 8px;
			border-radius: 999px;
			font-size: 11px;
			font-weight: 600;

			.dot {
				width: 6px;
				height: 6px;
				border-radius: 50%;
			}

			&.is-paid {
				background: #ecfdf5;
				color: #047857;
				border: 1px solid #a7f3d0;
				.dot {
					background: #10b981;
				}
			}

			&.is-unpaid {
				background: #f1f5f9;
				color: #64748b;
				border: 1px solid #cbd5e1;
				.dot {
					background: #94a3b8;
				}
			}
		}

		.threshold-badge {
			padding: 2px 8px;
			border-radius: 6px;
			background: #ffffff;
			border: 1px solid #cbd5e1;
			font-size: 11px;
			font-weight: 600;
			color: #475569;
		}

		.hero-right {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 2px;

			.face-label {
				font-size: 11px;
				color: #64748b;
			}

			.face-value {
				font-size: 24px;
				font-weight: 800;
				color: #e11d48;
				font-variant-numeric: tabular-nums;
			}
		}
	}

	.detail-section-card {
		padding: 16px 18px;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		background: #ffffff;

		.section-header {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 13px;
			font-weight: 600;
			color: #334155;
			margin-bottom: 14px;
			padding-bottom: 10px;
			border-bottom: 1px solid #f1f5f9;

			.section-icon {
				color: #3b82f6;
			}
		}

		.detail-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 14px;

			.detail-cell {
				display: flex;
				flex-direction: column;
				gap: 6px;
				padding: 10px 12px;
				border-radius: 8px;
				background: #f8fafc;
				border: 1px solid #f1f5f9;

				.cell-label {
					font-size: 12px;
					color: #64748b;
				}

				.cell-value {
					font-size: 13px;
					color: #1e293b;
				}
			}
		}
	}
}

.ai-plan-bar {
	margin-bottom: 18px;
	padding: 14px 16px;
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
		border: 1px solid #bfdbfe;
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

.modern-form {
	.form-grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 16px;
	}

	:deep(.ant-form-item-label > label) {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	:deep(.ant-input),
	:deep(.ant-input-affix-wrapper),
	:deep(.ant-select-selector),
	:deep(.ant-picker) {
		border-radius: 8px;
	}
}
</style>
