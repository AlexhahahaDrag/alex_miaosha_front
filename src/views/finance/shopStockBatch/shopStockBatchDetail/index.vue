<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商店进货批次核算卡' : '配置商店进货批次')"
		:width="560"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存批次"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：进货批次成本核算卡 -->
		<div v-if="isReadonly" class="batch-readonly-voucher">
			<div class="batch-hero">
				<div class="batch-top">
					<span class="batch-code-pill">
						📦 批次号：{{ formState.batchCode || '--' }}
					</span>
					<span
						class="status-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '有效批次' : '已归档' }}
					</span>
				</div>
				<h3 class="batch-name">{{ formState.batchName || '未命名进货批次' }}</h3>
				<div class="batch-cost-grid">
					<div class="cost-item">
						<span class="cost-label">货品采购成本</span>
						<strong class="cost-val">
							¥{{ Number(formState.cost ?? 0).toFixed(2) }}
						</strong>
					</div>
					<div class="cost-item">
						<span class="cost-label">采购差旅费用</span>
						<strong class="cost-val">
							¥{{ Number(formState.travelExpense ?? 0).toFixed(2) }}
						</strong>
					</div>
					<div class="cost-item total">
						<span class="cost-label">批次综合总成本</span>
						<strong class="cost-val">¥{{ batchTotalCost }}</strong>
					</div>
				</div>
			</div>

			<div class="batch-meta-grid">
				<div class="meta-item">
					<span class="meta-label">进货日期</span>
					<strong class="meta-value">{{ purchaseDateText }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">批次备注说明</span>
					<strong class="meta-value">
						{{ formState.description || '无备注说明' }}
					</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="ShopStockBatchForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['batchCode'].name"
						:label="labelMap['batchCode'].label"
					>
						<a-input
							id="stock-batch-code"
							v-model:value="formState.batchCode"
							name="batchCode"
							placeholder="请输入批次编码"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['batchName'].name"
						:label="labelMap['batchName'].label"
					>
						<a-input
							id="stock-batch-name"
							v-model:value="formState.batchName"
							name="batchName"
							placeholder="请输入批次名称"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['cost'].name"
						:label="labelMap['cost'].label"
					>
						<a-input-number
							id="stock-batch-cost"
							v-model:value="formState.cost"
							name="cost"
							placeholder="请输入货品成本"
							:min="0"
							:precision="2"
							style="width: 100%"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['travelExpense'].name"
						:label="labelMap['travelExpense'].label"
					>
						<a-input-number
							id="stock-batch-travel-expense"
							v-model:value="formState.travelExpense"
							name="travelExpense"
							placeholder="请输入差旅费用"
							:min="0"
							:precision="2"
							style="width: 100%"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['purchaseDate'].name"
						:label="labelMap['purchaseDate'].label"
					>
						<a-date-picker
							id="stock-batch-purchase-date"
							v-model:value="formState.purchaseDate"
							name="purchaseDate"
							placeholder="请选择进货日期"
							style="width: 100%"
							:format="defaultDateFormat"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['isValid'].name"
						:label="labelMap['isValid'].label"
					>
						<a-select
							id="stock-batch-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item
						:name="labelMap['description'].name"
						:label="labelMap['description'].label"
					>
						<a-input
							id="stock-batch-description"
							v-model:value="formState.description"
							name="description"
							placeholder="请输入批次采购备注说明"
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
	labelMap,
	rulesRef,
	type ShopStockBatchData,
} from '@/views/finance/shopStockBatch/config';
import {
	getShopStockBatchDetail,
	addShopStockBatch,
	editShopStockBatch,
} from '@/views/finance/shopStockBatch/api';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ResponseBody } from '@/types/api';
import {
	defaultDateFormat,
	formatDate,
	formatDayjs,
	nowDayjs,
} from '@/utils/dayjs';

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
const formState = ref<ShopStockBatchData>({});

const batchTotalCost = computed(() => {
	const cost = Number(formState.value.cost ?? 0);
	const travel = Number(formState.value.travelExpense ?? 0);
	return (cost + travel).toFixed(2);
});

const purchaseDateText = computed(() => {
	if (!formState.value.purchaseDate) return '--';
	return formatDate(formState.value.purchaseDate) || '--';
});

const handleOk = async (): Promise<void> => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		try {
			await formRef.value.validateFields();
			await saveShopStockBatchManager();
		} catch {
			loading.value = false;
		}
	} else {
		loading.value = false;
	}
};

const handleCancel = (): void => {
	drawerOpen.value = false;
};

const saveShopStockBatchManager = async (): Promise<void> => {
	const api = formState.value.id ? editShopStockBatch : addShopStockBatch;
	try {
		const payload: ShopStockBatchData = {
			...formState.value,
			purchaseDate:
				formState.value.purchaseDate ?
					formatDate(formState.value.purchaseDate) || undefined
				:	undefined,
		};
		const { code, message: msg } = await api(payload);
		if (code === '200') {
			message.success(msg || '保存成功！');
			drawerOpen.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(msg || '保存失败！');
		}
	} catch (error: unknown) {
		const errorMsg = (error as ResponseBody)?.message || '保存失败！';
		message.error(errorMsg);
	} finally {
		loading.value = false;
	}
};

const init = async (): Promise<void> => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopStockBatchDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
				purchaseDate: formatDayjs(data.purchaseDate),
			};
		} else {
			message.error(messageInfo || '查询批次详情失败！');
		}
	} else {
		formState.value = {
			isValid: '1',
			purchaseDate: nowDayjs(),
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
.batch-readonly-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.batch-hero {
	padding: 20px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	border: 1px solid #bfdbfe;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.batch-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.batch-code-pill {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			font-weight: 700;
			color: #1e40af;
			background: #ffffff;
			padding: 3px 10px;
			border-radius: 6px;
			border: 1px solid #dbeafe;
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

	.batch-name {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}

	.batch-cost-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		padding-top: 10px;
		border-top: 1px dashed #93c5fd;

		.cost-item {
			display: flex;
			flex-direction: column;
			gap: 2px;

			.cost-label {
				font-size: 11px;
				color: #64748b;
			}

			.cost-val {
				font-size: 15px;
				font-weight: 800;
				color: #0f172a;
				font-variant-numeric: tabular-nums;
			}

			&.total .cost-val {
				color: #2563eb;
			}
		}
	}
}

.batch-meta-grid {
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
