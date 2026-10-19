<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '库存商品规格属性详情' : '配置库存商品规格属性')"
		:width="540"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存属性"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：库存属性规格档案卡 -->
		<div v-if="isReadonly" class="stock-attr-voucher">
			<div class="attr-hero">
				<div class="attr-top">
					<span class="code-pill">#{{ formState.attrCode || '--' }}</span>
					<span
						class="status-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '有效属性' : '已停用' }}
					</span>
				</div>
				<h3 class="attr-title">{{ formState.attrName || '未命名库存属性' }}</h3>
				<div class="attr-val-row">
					<span class="val-label">当前规格属性值</span>
					<strong class="val-chip">{{ formState.attrValue || '--' }}</strong>
				</div>
			</div>

			<div class="attr-meta-grid">
				<div class="meta-item">
					<span class="meta-label">关联库存 ID</span>
					<strong class="meta-value mono">{{ formState.stockId || '--' }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">属性备注描述</span>
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
			name="ShopStockAttrsForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.stockId.name"
						:label="labelMap.stockId.label"
					>
						<a-input
							id="stock-attr-stock-id"
							v-model:value="formState.stockId"
							name="stockId"
							placeholder="请输入关联库存 ID"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.attrCode.name"
						:label="labelMap.attrCode.label"
					>
						<a-input
							id="stock-attr-code"
							v-model:value="formState.attrCode"
							name="attrCode"
							placeholder="请输入商品属性编码"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.attrName.name"
						:label="labelMap.attrName.label"
					>
						<a-input
							id="stock-attr-name"
							v-model:value="formState.attrName"
							name="attrName"
							placeholder="请输入商品属性名称"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.attrValue.name"
						:label="labelMap.attrValue.label"
					>
						<a-input
							id="stock-attr-value"
							v-model:value="formState.attrValue"
							name="attrValue"
							placeholder="请输入商品属性值"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.isValid.name"
						:label="labelMap.isValid.label"
					>
						<a-select
							id="stock-attr-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
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
							id="stock-attr-description"
							v-model:value="formState.description"
							name="description"
							placeholder="请输入属性描述"
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
	type ShopStockAttrsDetail,
} from '@/views/finance/shopStockAttrs/config';
import {
	getShopStockAttrsDetail,
	addShopStockAttrs,
	editShopStockAttrs,
} from '@/views/finance/shopStockAttrs/api';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ResponseBody } from '@/types/api';

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
const formState = ref<ShopStockAttrsDetail>({});

const labelMap = {
	stockId: { name: 'stockId', label: '库存 ID' },
	attrCode: { name: 'attrCode', label: '属性编码' },
	attrName: { name: 'attrName', label: '属性名称' },
	attrValue: { name: 'attrValue', label: '属性值' },
	isValid: { name: 'isValid', label: '有效状态' },
	description: { name: 'description', label: '属性描述' },
} as const;

const rulesRef = reactive({
	stockId: [{ required: true, message: '库存 ID 不能为空！' }],
	attrCode: [{ required: true, message: '商品属性编码不能为空！' }],
	attrName: [{ required: true, message: '商品属性名称不能为空！' }],
	attrValue: [{ required: true, message: '商品属性值不能为空！' }],
	isValid: [{ required: true, message: '有效状态不能为空！' }],
	description: [{ required: true, message: '描述不能为空！' }],
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
			.then(() => saveShopStockAttrsManager())
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

const saveShopStockAttrsManager = async (): Promise<void> => {
	const api = formState.value.id ? editShopStockAttrs : addShopStockAttrs;
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
		const errorMsg = (error as ResponseBody)?.message || '保存失败！';
		message.error(errorMsg);
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
		} = await getShopStockAttrsDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
				stockId: data.stockId !== undefined ? String(data.stockId) : undefined,
			};
		} else {
			message.error(messageInfo || '查询属性详情失败！');
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
.stock-attr-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.attr-hero {
	padding: 20px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	border: 1px solid #bfdbfe;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.attr-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.code-pill {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			font-weight: 700;
			color: #1e40af;
			background: #ffffff;
			padding: 2px 8px;
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

	.attr-title {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}

	.attr-val-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 8px;
		border-top: 1px dashed #93c5fd;

		.val-label {
			font-size: 12px;
			color: #475569;
		}

		.val-chip {
			padding: 3px 10px;
			border-radius: 6px;
			background: #2563eb;
			color: #ffffff;
			font-size: 13px;
			font-weight: 700;
		}
	}
}

.attr-meta-grid {
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
			font-size: 13px;
			font-weight: 700;
			color: #0f172a;

			&.mono {
				font-family: 'JetBrains Mono', monospace;
			}
		}
	}
}
</style>
