<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商店销售订单凭证' : '配置商店销售订单')"
		:width="560"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存订单"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：订单电子凭证卡片 -->
		<div v-if="isReadonly" class="shop-order-voucher">
			<div class="order-hero-card">
				<div class="order-top">
					<span class="order-code-pill">
						单号：{{ formState.saleOrderCode || '--' }}
					</span>
					<span
						class="status-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '有效订单' : '已作废' }}
					</span>
				</div>
				<h3 class="order-name">{{ formState.saleOrderName || '未命名销售订单' }}</h3>
				<div class="order-amount-row">
					<span class="amount-label">订单成交总额</span>
					<strong class="amount-value">
						¥{{ Number(formState.saleAmount ?? 0).toFixed(2) }}
					</strong>
				</div>
			</div>

			<div class="order-meta-grid">
				<div class="meta-item">
					<span class="meta-label">销售数量</span>
					<strong class="meta-value">{{ formState.saleCount ?? 0 }} 件</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">支付方式</span>
					<strong class="meta-value">{{ formState.payWay || '--' }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">销售日期</span>
					<strong class="meta-value">{{ formState.saleDate || '--' }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">订单备注描述</span>
					<strong class="meta-value">{{ formState.description || '无备注' }}</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="ShopOrderForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleOrderCode.name"
						:label="labelMap.saleOrderCode.label"
					>
						<a-input
							id="shop-order-code"
							v-model:value="formState.saleOrderCode"
							name="saleOrderCode"
							placeholder="请输入订单编码"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleOrderName.name"
						:label="labelMap.saleOrderName.label"
					>
						<a-input
							id="shop-order-name"
							v-model:value="formState.saleOrderName"
							name="saleOrderName"
							placeholder="请输入订单名称"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleAmount.name"
						:label="labelMap.saleAmount.label"
					>
						<a-input-number
							id="shop-order-amount"
							v-model:value="formState.saleAmount"
							name="saleAmount"
							:min="0"
							:precision="2"
							style="width: 100%"
							placeholder="请输入总销售金额"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleCount.name"
						:label="labelMap.saleCount.label"
					>
						<a-input-number
							id="shop-order-count"
							v-model:value="formState.saleCount"
							name="saleCount"
							:min="1"
							style="width: 100%"
							placeholder="请输入销售数量"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.payWay.name"
						:label="labelMap.payWay.label"
					>
						<a-input
							id="shop-order-pay-way"
							v-model:value="formState.payWay"
							name="payWay"
							placeholder="如：微信支付 / 支付宝"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.isValid.name"
						:label="labelMap.isValid.label"
					>
						<a-select
							id="shop-order-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择订单状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleDate.name"
						:label="labelMap.saleDate.label"
					>
						<a-input
							id="shop-order-sale-date"
							v-model:value="formState.saleDate"
							name="saleDate"
							placeholder="如：2026-10-19"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.description.name"
						:label="labelMap.description.label"
					>
						<a-input
							id="shop-order-description"
							v-model:value="formState.description"
							name="description"
							placeholder="请输入订单备注描述"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	DEFAULT_VALID_OPTIONS,
	type ShopOrderData,
} from '@/views/finance/shopOrder/config';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	getShopOrderDetail,
	addShopOrder,
	editShopOrder,
} from '@/views/finance/shopOrder/api';
import type { ModelInfo } from '@/types/modal';

const props = withDefaults(
	defineProps<{
		isReadonly?: boolean;
	}>(),
	{
		isReadonly: false,
	},
);

const { getDictByType } = useDictInfo('is_valid');

const isValidList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
});

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const openModel = defineModel<boolean>('open', { default: false });

const drawerOpen = computed({
	get: () => Boolean(modelInfo.value?.open ?? openModel.value),
	set: (val: boolean) => {
		if (modelInfo.value) {
			modelInfo.value.open = val;
		}
		openModel.value = val;
	},
});

const emit = defineEmits(['success']);

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const formState = ref<ShopOrderData>({});

const labelMap = {
	saleOrderCode: { name: 'saleOrderCode', label: '订单编码' },
	saleOrderName: { name: 'saleOrderName', label: '订单名称' },
	saleAmount: { name: 'saleAmount', label: '总销售金额 (元)' },
	isValid: { name: 'isValid', label: '有效状态' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	description: { name: 'description', label: '订单描述' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleCount: { name: 'saleCount', label: '销售数量' },
} as const;

const rulesRef = reactive({
	saleOrderCode: [{ required: true, message: '订单编码不能为空！' }],
	saleOrderName: [{ required: true, message: '订单名称不能为空！' }],
	saleAmount: [{ required: true, message: '总销售金额不能为空！' }],
	isValid: [{ required: true, message: '状态不能为空！' }],
	saleDate: [{ required: true, message: '销售日期不能为空！' }],
	description: [{ required: true, message: '订单描述不能为空！' }],
	payWay: [{ required: true, message: '支付方式不能为空！' }],
	saleCount: [{ required: true, message: '销售数量不能为空！' }],
});

const handleOk = (): void => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopOrderManager())
			.catch(() => {
				loading.value = false;
			});
	} else {
		loading.value = false;
	}
};

const handleCancel = (): void => {
	drawerOpen.value = false;
};

const saveShopOrderManager = async (): Promise<void> => {
	const api = modelInfo.value?.id ? editShopOrder : addShopOrder;
	try {
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			drawerOpen.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} catch (error: unknown) {
		const responseData = (
			error as { response?: { data?: { message?: string } } }
		)?.response?.data;
		message.error(responseData?.message || '保存失败！');
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopOrderDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
			};
		} else {
			message.error(messageInfo || '查询订单详情失败！');
		}
	} else {
		formState.value = {
			isValid: '1',
		};
	}
};

watch(
	() => drawerOpen.value,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	},
);
</script>

<style lang="scss" scoped>
.shop-order-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.order-hero-card {
	padding: 20px;
	border-radius: 14px;
	background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
	border: 1px solid #bfdbfe;
	display: flex;
	flex-direction: column;
	gap: 10px;

	.order-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.order-code-pill {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			font-weight: 600;
			color: #1e40af;
			background: rgba(255, 255, 255, 0.8);
			padding: 2px 8px;
			border-radius: 6px;
		}

		.status-pill {
			padding: 2px 10px;
			border-radius: 999px;
			font-size: 12px;
			font-weight: 600;

			&.is-valid {
				background: #dcfce7;
				color: #15803d;
			}

			&.is-invalid {
				background: #f1f5f9;
				color: #64748b;
			}
		}
	}

	.order-name {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}

	.order-amount-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding-top: 8px;
		border-top: 1px dashed #93c5fd;

		.amount-label {
			font-size: 12px;
			color: #475569;
		}

		.amount-value {
			font-size: 24px;
			font-weight: 800;
			color: #1d4ed8;
			font-variant-numeric: tabular-nums;
		}
	}
}

.order-meta-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;

	.meta-item {
		padding: 12px 14px;
		border-radius: 10px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 4px;

		.meta-label {
			font-size: 12px;
			color: #64748b;
		}

		.meta-value {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;
		}
	}
}
</style>
