<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商品属性规格详情' : '配置商品属性规格')"
		:width="560"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存属性"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：商品属性规格档案卡 -->
		<div v-if="isReadonly" class="attr-readonly-card">
			<div class="attr-card-header">
				<div class="attr-title-group">
					<span class="attr-icon-badge">{{ formState.icon || '🏷️' }}</span>
					<div>
						<h3 class="attr-title">{{ formState.attrName || '未命名属性' }}</h3>
						<span class="attr-sub">
							所属分类 ID：{{ formState.catelogId || '--' }}
						</span>
					</div>
				</div>
				<span
					class="status-pill"
					:class="formState.enable === 1 ? 'is-enabled' : 'is-disabled'"
				>
					{{ formState.enable === 1 ? '已启用' : '已禁用' }}
				</span>
			</div>

			<div class="attr-section">
				<span class="section-label">可选规格值列表</span>
				<div v-if="valueSelectList.length" class="value-tags-wrap">
					<span
						v-for="(val, idx) in valueSelectList"
						:key="idx"
						class="value-chip"
					>
						{{ val }}
					</span>
				</div>
				<span v-else class="text-muted">未配置可选值</span>
			</div>

			<div class="attr-meta-grid">
				<div class="meta-item">
					<span class="meta-label">属性类型</span>
					<strong class="meta-value">{{ attrTypeLabel }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">检索支持</span>
					<strong class="meta-value">
						{{ formState.searchType === 1 ? '支持检索 (1)' : '无需检索 (0)' }}
					</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">详情页快速展示</span>
					<strong class="meta-value">
						{{ formState.showDesc === 1 ? '快速展示 (1)' : '默认隐藏 (0)' }}
					</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">属性图标标识</span>
					<strong class="meta-value mono">{{ formState.icon || '--' }}</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列现代表单 -->
		<a-form
			v-else
			ref="formRef"
			name="PmsAttrForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.attrName.name"
						:label="labelMap.attrName.label"
					>
						<a-input
							id="pms-attr-name"
							v-model:value="formState.attrName"
							name="attrName"
							placeholder="如：机身颜色、运行内存"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.catelogId.name"
						:label="labelMap.catelogId.label"
					>
						<a-input
							id="pms-attr-catelog-id"
							v-model:value="formState.catelogId"
							name="catelogId"
							placeholder="请输入所属分类 ID"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.attrType.name"
						:label="labelMap.attrType.label"
					>
						<a-select
							id="pms-attr-type"
							v-model:value="formState.attrType"
							placeholder="请选择属性类型"
							:options="ATTR_TYPE_OPTIONS"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.enable.name"
						:label="labelMap.enable.label"
					>
						<a-select
							id="pms-attr-enable"
							v-model:value="formState.enable"
							placeholder="请选择启用状态"
							:options="ENABLE_STATUS_OPTIONS"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.searchType.name"
						:label="labelMap.searchType.label"
					>
						<a-select
							id="pms-attr-search-type"
							v-model:value="formState.searchType"
							placeholder="请选择是否支持检索"
							:options="SEARCH_TYPE_OPTIONS"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.showDesc.name"
						:label="labelMap.showDesc.label"
					>
						<a-select
							id="pms-attr-show-desc"
							v-model:value="formState.showDesc"
							placeholder="请选择是否快速展示"
							:options="SHOW_DESC_OPTIONS"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item
						:name="labelMap.icon.name"
						:label="labelMap.icon.label"
					>
						<a-input
							id="pms-attr-icon"
							v-model:value="formState.icon"
							name="icon"
							placeholder="请输入属性图标编码或标识"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item
						:name="labelMap.valueSelect.name"
						:label="labelMap.valueSelect.label"
					>
						<a-input
							id="pms-attr-value-select"
							v-model:value="formState.valueSelect"
							name="valueSelect"
							placeholder="多个可选值请用英文或中文逗号分隔，如：8GB,12GB,16GB"
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
	ATTR_TYPE_OPTIONS,
	ENABLE_STATUS_OPTIONS,
	SEARCH_TYPE_OPTIONS,
	SHOW_DESC_OPTIONS,
	type PmsAttrDetail,
} from '@/views/product/pmsAttr/config';
import {
	getPmsAttrDetail,
	addPmsAttr,
	editPmsAttr,
} from '@/views/product/pmsAttr/api';
import type { ModelInfo } from '@/types/modal';

const props = withDefaults(
	defineProps<{
		isReadonly?: boolean;
	}>(),
	{
		isReadonly: false,
	},
);

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

const labelMap = {
	attrName: { name: 'attrName', label: '属性名称' },
	searchType: { name: 'searchType', label: '是否需要检索' },
	icon: { name: 'icon', label: '属性图标' },
	valueSelect: { name: 'valueSelect', label: '可选值列表（逗号分隔）' },
	attrType: { name: 'attrType', label: '属性类型' },
	enable: { name: 'enable', label: '启用状态' },
	catelogId: { name: 'catelogId', label: '所属分类 ID' },
	showDesc: { name: 'showDesc', label: '详情页快速展示' },
} as const;

const rulesRef = reactive({
	attrName: [{ required: true, message: '属性名称不能为空！' }],
	searchType: [{ required: true, message: '请选择是否需要检索！' }],
	icon: [{ required: true, message: '属性图标不能为空！' }],
	valueSelect: [{ required: true, message: '可选值列表不能为空！' }],
	attrType: [{ required: true, message: '请选择属性类型！' }],
	enable: [{ required: true, message: '请选择启用状态！' }],
	catelogId: [{ required: true, message: '所属分类 ID 不能为空！' }],
	showDesc: [{ required: true, message: '请选择是否快速展示！' }],
});

const getDefaultFormState = (): PmsAttrDetail => ({
	attrType: 1,
	enable: 1,
	searchType: 1,
	showDesc: 0,
});

const formState = ref<PmsAttrDetail>(getDefaultFormState());

const attrTypeLabel = computed(() => {
	const matched = ATTR_TYPE_OPTIONS.find(
		(item) => item.value === Number(formState.value.attrType),
	);
	return matched?.label || '--';
});

const valueSelectList = computed(() => {
	const raw = formState.value.valueSelect?.trim();
	if (!raw) return [];
	return raw
		.split(/[,，;；]+/)
		.map((s) => s.trim())
		.filter(Boolean);
});

const handleOk = () => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePmsAttrManager())
			.catch(() => {
				loading.value = false;
			});
	} else {
		loading.value = false;
	}
};

const handleCancel = () => {
	drawerOpen.value = false;
};

async function savePmsAttrManager() {
	try {
		const api = formState.value.id ? editPmsAttr : addPmsAttr;
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			drawerOpen.value = false;
			emit('success');
			formState.value = getDefaultFormState();
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} catch {
		message.error('保存失败，请稍后重试！');
	} finally {
		loading.value = false;
	}
}

const init = async () => {
	const id = modelInfo.value?.id;
	if (!id) {
		formState.value = getDefaultFormState();
		return;
	}
	const {
		code,
		data,
		message: messageInfo,
	} = await getPmsAttrDetail(String(id));
	if (code === '200' && data) {
		formState.value = {
			...data,
			id: data.id !== undefined ? String(data.id) : undefined,
			catelogId:
				data.catelogId !== undefined ? String(data.catelogId) : undefined,
		};
	} else {
		formState.value = getDefaultFormState();
		message.error(messageInfo || '查询属性详情失败！');
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
.attr-readonly-card {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 18px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border: 1px solid #e2e8f0;

	.attr-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 14px;
		border-bottom: 1px dashed #cbd5e1;

		.attr-title-group {
			display: flex;
			align-items: center;
			gap: 12px;

			.attr-icon-badge {
				width: 42px;
				height: 42px;
				border-radius: 10px;
				background: #eff6ff;
				color: #2563eb;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
				font-weight: 700;
				border: 1px solid #bfdbfe;
			}

			.attr-title {
				margin: 0 0 2px;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
			}

			.attr-sub {
				font-size: 12px;
				color: #64748b;
				font-family: 'JetBrains Mono', monospace;
			}
		}

		.status-pill {
			padding: 3px 10px;
			border-radius: 999px;
			font-size: 12px;
			font-weight: 600;

			&.is-enabled {
				background: #dcfce7;
				color: #15803d;
			}

			&.is-disabled {
				background: #f1f5f9;
				color: #64748b;
			}
		}
	}

	.attr-section {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.section-label {
			font-size: 12px;
			font-weight: 600;
			color: #475569;
		}

		.value-tags-wrap {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;

			.value-chip {
				padding: 3px 10px;
				border-radius: 6px;
				background: #ffffff;
				border: 1px solid #cbd5e1;
				font-size: 12px;
				font-weight: 600;
				color: #1e293b;
			}
		}
	}

	.attr-meta-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;

		.meta-item {
			padding: 12px;
			border-radius: 10px;
			background: #ffffff;
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
}

.text-muted {
	font-size: 12px;
	color: #94a3b8;
}
</style>
