<template>
	<BaseRbacDrawer
		v-model:open="modelInfo.open"
		:title="modelInfo?.title || '账户记录详情'"
		:subtitle="drawerSubtitle"
		width="560px"
		:confirm-loading="loading"
		:readonly="isReadonly"
		ok-text="保存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：账户资产凭证阅读卡片 -->
		<div v-if="isReadonly" class="detail-readonly-view">
			<div class="account-hero-card">
				<div class="hero-left">
					<div class="hero-icon-box">
						<AccountBookOutlined />
					</div>
					<div class="hero-meta">
						<h3 class="hero-title">{{ formState.name || '未命名账户记录' }}</h3>
						<div class="hero-tags">
							<span class="account-tag">
								<CreditCardOutlined class="mr-1" />
								{{ resolvedAccountName }}
							</span>
							<span
								class="status-tag"
								:class="
									Number(formState.status) === 0 ? 'is-expired'
									: Number(formState.status) === 1 ? 'is-expiring'
									: 'is-valid'
								"
							>
								<span class="dot"></span>
								{{
									Number(formState.status) === 0 ? '已过期'
									: Number(formState.status) === 1 ? '待过期'
									: '有效期内'
								}}
							</span>
						</div>
					</div>
				</div>
				<div class="hero-right">
					<span class="balance-label">面额 / 余额</span>
					<span class="balance-value">
						¥{{ formatAmount(formState.amount || 0) }}
					</span>
				</div>
			</div>

			<div class="detail-section-card">
				<div class="section-header">
					<CalendarOutlined class="section-icon" />
					<span>有效期与提醒状态</span>
				</div>
				<div class="detail-grid">
					<div class="detail-cell">
						<span class="cell-label">关联账号</span>
						<span class="cell-value font-semibold text-slate-800">
							{{ resolvedAccountName }}
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">有效期至</span>
						<span class="cell-value font-mono text-slate-800">
							{{ formattedAvliDate }}
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">到期提醒通知</span>
						<span class="cell-value">
							<span
								class="notify-pill"
								:class="Number(formState.isSend) === 1 ? 'is-sent' : 'is-unsent'"
							>
								<BellOutlined class="mr-1" />
								{{ Number(formState.isSend) === 1 ? '已发送提醒' : '暂未发送' }}
							</span>
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">记录状态</span>
						<span class="cell-value font-medium">
							{{
								Number(formState.status) === 0 ? '已过期'
								: Number(formState.status) === 1 ? '待过期预警'
								: '正常有效'
							}}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：现代垂直表单 -->
		<a-form
			v-else
			ref="formRef"
			name="AccountRecordInfoForm"
			layout="vertical"
			class="modern-form"
			:model="formState"
			:rules="rulesRef"
		>
			<div class="form-grid-2">
				<a-form-item name="name" label="账户/卡券名称">
					<a-input
						id="form_name"
						name="name"
						v-model:value="formState.name"
						placeholder="如：猫超享淘卡、京东E卡"
						allow-clear
					/>
				</a-form-item>

				<a-form-item name="account" label="关联账号">
					<a-select
						id="form_account"
						name="account"
						v-model:value="formState.account"
						placeholder="请选择关联账号"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="accountTypeList"
						:allowClear="true"
					/>
				</a-form-item>
			</div>

			<div class="form-grid-2">
				<a-form-item name="amount" label="面额 / 余额">
					<a-input
						id="form_amount"
						name="amount"
						v-model:value="formState.amount"
						type="number"
						prefix="￥"
						suffix="RMB"
						placeholder="请填写面额或当前余额"
					/>
				</a-form-item>

				<a-form-item name="avliDate" label="有效期至">
					<a-date-picker
						id="form_avliDate"
						name="avliDate"
						v-model:value="formState.avliDate"
						class="w-full"
						:format="defaultTimeFormat"
						:getPopupContainer="
							(triggerNode: HTMLElement) => {
								return triggerNode.parentNode as HTMLElement;
							}
						"
					/>
				</a-form-item>
			</div>
		</a-form>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	AccountBookOutlined,
	CreditCardOutlined,
	CalendarOutlined,
	BellOutlined,
} from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import { rulesRef } from '@/views/selfFinance/accountRecordInfo/accountRecordInfoDetail/config';
import type { ModelInfo } from '@/types/modal';
import type { AccountRecordInfo } from '@/views/selfFinance/accountRecordInfo/config';
import { defaultTimeFormat, formatDayjs, formatDate } from '@/utils/dayjs';
import { formatAmount } from '@/utils/amountInfo';
import {
	getAccountRecordInfoDetail,
	addAccountRecordInfo,
	editAccountRecordInfo,
} from '@/views/selfFinance/accountRecordInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('account_type');
const accountTypeList = computed(() => getDictByType('account_type'));

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const formState = ref<AccountRecordInfo>({});

const emit = defineEmits(['success']);

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const drawerSubtitle = computed(() => {
	if (isReadonly.value) {
		return '查看个人卡券或账户记录的面额、有效期与到期提醒状态';
	}
	return formState.value?.id ?
			'更新账户面额、关联账号或有效期信息'
		:	'新增需要跟踪有效期的个人卡券或账户资产记录';
});

const resolvedAccountName = computed(() => {
	if (formState.value?.accountName) return formState.value.accountName;
	const code = formState.value?.account;
	if (!code) return '未指定账号';
	const matched = accountTypeList.value?.find((item) => item.typeCode === code);
	return matched?.typeName || code;
});

const formattedAvliDate = computed(() => {
	if (!formState.value?.avliDate) return '—';
	return formatDate(formState.value.avliDate);
});

const handleOk = () => {
	if (isReadonly.value) {
		handleCancel();
		return;
	}
	if (formRef.value) {
		loading.value = true;
		formRef.value
			.validateFields()
			.then(() => saveAccountRecordInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveAccountRecordInfoManager = async () => {
	let api = addAccountRecordInfo;
	if (formState.value.id) {
		api = editAccountRecordInfo;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getAccountRecordInfoDetail(String(modelInfo.value.id));
		if (code === '200') {
			formState.value = data || {};
			formState.value.avliDate = formatDayjs(formState.value.avliDate);
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		formState.value = {
			name: '',
			amount: undefined,
			account: undefined,
			avliDate: undefined,
		};
	}
};

watch(
	() => modelInfo.value.open,
	(isOpen) => {
		if (isOpen) {
			init();
		}
	},
	{
		immediate: true,
	},
);
</script>

<style lang="scss" scoped>
.detail-readonly-view {
	display: flex;
	flex-direction: column;
	gap: 16px;

	.account-hero-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 20px;
		border-radius: 12px;
		border: 1px solid #bfdbfe;
		background: linear-gradient(135deg, #eff6ff 0%, #ffffff 70%);
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
			border: 1px solid #bfdbfe;
			color: #2563eb;
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

			.hero-tags {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}
		}

		.account-tag {
			display: inline-flex;
			align-items: center;
			padding: 2px 8px;
			border-radius: 6px;
			background: #ffffff;
			border: 1px solid #cbd5e1;
			font-size: 11px;
			font-weight: 600;
			color: #334155;
		}

		.status-tag {
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

			&.is-valid {
				background: #ecfdf5;
				color: #047857;
				border: 1px solid #a7f3d0;
				.dot {
					background: #10b981;
				}
			}

			&.is-expiring {
				background: #fffbeb;
				color: #b45309;
				border: 1px solid #fde68a;
				.dot {
					background: #f59e0b;
				}
			}

			&.is-expired {
				background: #f1f5f9;
				color: #64748b;
				border: 1px solid #cbd5e1;
				.dot {
					background: #94a3b8;
				}
			}
		}

		.hero-right {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 2px;

			.balance-label {
				font-size: 11px;
				color: #64748b;
			}

			.balance-value {
				font-size: 22px;
				font-weight: 800;
				color: #1d4ed8;
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

	.notify-pill {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 500;

		&.is-sent {
			background: #f1f5f9;
			color: #475569;
		}

		&.is-unsent {
			background: #ecfdf5;
			color: #047857;
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
