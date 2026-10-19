<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="560"
		:title="drawerTitle"
		:subtitle="drawerSubtitle"
		:loading="loading"
		:destroy-on-close="true"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<!-- 1. 只读模式：结构化字典阅读卡片 (Read/Write Separation) -->
		<div v-if="isReadonly" class="dict-detail-readonly space-y-4">
			<!-- Hero 概览卡 -->
			<div
				class="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
			>
				<div
					class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/70 flex items-center justify-center text-xl shrink-0"
				>
					<BookOutlined />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
							{{ formState.typeName || '-' }}
						</h3>
						<span
							v-if="String(formState.isValid) === '1'"
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							有效
						</span>
						<span
							v-else
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
							失效
						</span>
					</div>
					<div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
						<span class="inline-flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400">
							<TagOutlined />
							{{ formState.typeCode ?? '-' }}
						</span>
						<span v-if="formState.operateTime" class="inline-flex items-center gap-1 font-mono">
							<ClockCircleOutlined />
							{{ formState.operateTime }}
						</span>
					</div>
				</div>
			</div>

			<!-- 分类归属与排序信息卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<AppstoreOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						字典键值与分类映射
					</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">类别名称</span>
						<span class="font-semibold text-slate-800 dark:text-slate-100">
							{{ formState.typeName || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">类别编码 (typeCode)</span>
						<span class="font-mono font-medium text-blue-600 dark:text-blue-400">
							{{ formState.typeCode ?? '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">所属分类名称</span>
						<span class="font-semibold text-slate-800 dark:text-slate-100">
							{{ formState.belongToName || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">分类编码 (belongTo)</span>
						<span class="font-mono font-medium text-indigo-600 dark:text-indigo-400">
							{{ formState.belongTo ?? '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">展示排序号</span>
						<span class="font-mono font-semibold text-slate-700 dark:text-slate-200">
							{{ formState.orderBy ?? '-' }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. 编辑/新增模式：标准化 A11y 垂直表单 -->
		<a-form
			v-else
			ref="formRef"
			name="dictForm"
			layout="vertical"
			:model="formState"
			class="space-y-5"
		>
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>字典项标识定义</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item
						name="typeName"
						label="类别名称"
						:rules="[{ required: true, message: '类别名称必填！' }]"
						class="mb-3.5"
					>
						<a-input
							id="form_typeName"
							v-model:value="formState.typeName"
							name="typeName"
							placeholder="如：有效"
							allow-clear
							class="rounded-lg"
						/>
					</a-form-item>

					<a-form-item
						name="typeCode"
						label="类别编码 (Code)"
						:rules="[{ required: true, message: '类别编码必填！' }]"
						class="mb-3.5"
					>
						<a-input
							id="form_typeCode"
							v-model:value="formState.typeCode"
							name="typeCode"
							placeholder="如：1"
							allow-clear
							class="rounded-lg font-mono"
						/>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item
						name="belongToName"
						label="所属分类名称"
						:rules="[{ required: true, message: '所属分类名称必填！' }]"
						class="mb-3.5"
					>
						<a-input
							id="form_belongToName"
							v-model:value="formState.belongToName"
							name="belongToName"
							placeholder="如：有效状态"
							allow-clear
							class="rounded-lg"
						/>
					</a-form-item>

					<a-form-item
						name="belongTo"
						label="分类编码 (BelongTo)"
						:rules="[{ required: true, message: '分类编码必填！' }]"
						class="mb-0"
					>
						<a-input
							id="form_belongTo"
							v-model:value="formState.belongTo"
							name="belongTo"
							placeholder="如：is_valid"
							allow-clear
							class="rounded-lg font-mono"
						/>
					</a-form-item>
				</div>
			</section>

			<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
					<span>状态与排序配置</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item
						name="isValid"
						label="生效状态"
						:rules="[{ required: true, message: '请选择生效状态！' }]"
						class="mb-0"
					>
						<a-select
							id="form_isValid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="validList"
							allow-clear
							class="rounded-lg"
						/>
					</a-form-item>

					<a-form-item
						name="orderBy"
						label="排序号"
						:rules="[{ required: true, message: '排序号必填！' }]"
						class="mb-0"
					>
						<a-input-number
							id="form_orderBy"
							v-model:value="formState.orderBy"
							name="orderBy"
							:min="0"
							:max="9999"
							placeholder="请输入排序号"
							class="w-full rounded-lg font-mono"
						/>
					</a-form-item>
				</div>
			</section>
		</a-form>

		<template #footer>
			<div class="flex justify-end gap-2">
				<a-button :disabled="loading" @click="handleCancel">
					{{ isReadonly ? '关闭' : '取消' }}
				</a-button>
				<a-button
					v-if="!isReadonly"
					type="primary"
					:loading="loading"
					@click="handleOk"
				>
					保存
				</a-button>
			</div>
		</template>
	</base-rbac-drawer>
</template>

<script lang="ts" setup>
import {
	BookOutlined,
	TagOutlined,
	ClockCircleOutlined,
	AppstoreOutlined,
} from '@ant-design/icons-vue';
import type { DictInfo } from '@/views/dict/config';
import {
	getDictManagerDetail,
	addDictManager,
	editDictManager,
} from '@/views/dict/api';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { FormInstance } from 'ant-design-vue';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const validList = computed(() => {
	const list = getDictByType('is_valid');
	if (Array.isArray(list) && list.length > 0) {
		return list;
	}
	return [
		{ typeCode: 1, typeName: '有效' },
		{ typeCode: 0, typeName: '失效' },
	];
});

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

const formState = ref<DictInfo>({});

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const drawerTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	if (isReadonly.value) return '查看字典明细';
	return modelInfo.value?.id ? '编辑字典明细' : '新增字典明细';
});

const drawerSubtitle = computed(() => {
	if (formState.value.belongTo) {
		return `分类编码: ${formState.value.belongTo}`;
	}
	return isReadonly.value ? '只读浏览模式' : '配置字典键值、分类归属与排序权重';
});

const handleOk = () => {
	if (isReadonly.value) {
		handleCancel();
		return;
	}
	formRef.value
		?.validate()
		.then(() => {
			saveDict();
		})
		.catch(() => {});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveDict = async () => {
	const api = formState.value.id ? editDictManager : addDictManager;
	loading.value = true;
	try {
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	loading.value = true;
	try {
		if (modelInfo.value?.id) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getDictManagerDetail(String(modelInfo.value.id));
			if (code === '200' && data) {
				formState.value = {
					...data,
					id: data.id !== undefined && data.id !== null ? String(data.id) : undefined,
				};
			} else {
				message.error(messageInfo || '查询失败！');
			}
		} else {
			formState.value = {
				isValid: 1,
				orderBy: 1,
			};
		}
	} finally {
		loading.value = false;
	}
};

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
</script>
