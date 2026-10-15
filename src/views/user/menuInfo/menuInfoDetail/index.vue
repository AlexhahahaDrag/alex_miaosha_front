<template>
	<a-modal
		v-model:open="modelInfo.open"
		:width="'640px'"
		:title="modalTitle"
		:confirm-loading="loading"
		:destroy-on-close="true"
		class="modern-menu-detail-modal"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<template #footer>
			<a-button key="back" @click="handleCancel">取消</a-button>
			<a-button
				key="submit"
				type="primary"
				:loading="loading"
				data-testid="rbac-menu-detail-btn-submit"
				@click="handleOk"
			>
				保存
			</a-button>
		</template>

		<a-form
			ref="formRef"
			name="MenuInfoForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
			class="py-1"
		>
			<!-- 1. 核心属性卡片 -->
			<div class="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 mb-4">
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>基础与路由定义</span>
				</div>

				<!-- 父级菜单选择 -->
				<a-form-item label="上级菜单" name="parentId" class="mb-3">
					<a-tree-select
						v-model:value="formState.parentId"
						:tree-data="treeSelectData"
						:field-names="{ label: 'title', value: 'id', children: 'children' }"
						placeholder="请选择上级菜单（留空或选根目录则为一级菜单）"
						allow-clear
						show-search
						tree-default-expand-all
						class="w-full rounded-lg"
						data-testid="rbac-menu-field-parent"
					/>
				</a-form-item>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="菜单标题" name="title" class="mb-3">
						<a-input
							v-model:value="formState.title"
							placeholder="如：礼金记录"
							allow-clear
							data-testid="rbac-menu-field-title"
						/>
					</a-form-item>

					<a-form-item label="路由名称 (Name)" name="name" class="mb-3">
						<a-input
							v-model:value="formState.name"
							placeholder="如：financeGiftRecord"
							allow-clear
							data-testid="rbac-menu-field-name"
						/>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="路由路径 (Path)" name="path" class="mb-3">
						<a-input
							v-model:value="formState.path"
							placeholder="如：/finance/gift/record"
							allow-clear
							data-testid="rbac-menu-field-path"
						/>
					</a-form-item>

					<a-form-item label="组件路径 (Component)" name="component" class="mb-3">
						<a-input
							v-model:value="formState.component"
							placeholder="Layout 或视图组件路径"
							allow-clear
							data-testid="rbac-menu-field-component"
						/>
						<div class="flex items-center gap-1.5 mt-1">
							<span class="text-[11px] text-slate-400">预设:</span>
							<button
								type="button"
								class="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 cursor-pointer"
								@click="formState.component = 'Layout'"
							>
								Layout
							</button>
							<button
								type="button"
								class="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer"
								@click="formState.component = formState.path ? `/src/views${formState.path}/index.vue` : '/src/views/'"
							>
								Auto /src/views
							</button>
						</div>
					</a-form-item>
				</div>

				<a-form-item label="权限标识 (PermissionCode)" name="permissionCode" class="mb-0">
					<a-input
						v-model:value="formState.permissionCode"
						placeholder="如：finance:gift:record 或 *"
						allow-clear
						data-testid="rbac-menu-field-permission-code"
					/>
				</a-form-item>
			</div>

			<!-- 2. 高级与导航行为卡片 (可收起) -->
			<div class="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
				<div
					class="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer select-none hover:bg-slate-100/50"
					@click="isAdvancedExpanded = !isAdvancedExpanded"
				>
					<span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
						<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
						<span>导航展示与高级选项</span>
					</span>
					<span class="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
						<span>{{ isAdvancedExpanded ? '收起 ∧' : '展开更多 ∨' }}</span>
					</span>
				</div>

				<div v-show="isAdvancedExpanded" class="p-4 bg-[var(--card-bg)] space-y-3">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
						<a-form-item label="菜单图标 (AntD Icon)" name="icon" class="mb-3">
							<a-input
								v-model:value="formState.icon"
								placeholder="如：AppstoreOutlined"
								allow-clear
							/>
						</a-form-item>

						<a-form-item label="显示排序 (越小越靠前)" name="orderBy" class="mb-3">
							<a-input
								v-model:value="formState.orderBy"
								placeholder="如：1"
								allow-clear
							/>
						</a-form-item>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
						<div class="border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
							<span class="text-xs text-slate-600 dark:text-slate-300">状态</span>
							<a-switch
								:checked="String(formState.status) === '1'"
								checked-children="启用"
								un-checked-children="禁用"
								@change="(val: boolean) => (formState.status = val ? '1' : '0')"
							/>
						</div>

						<div class="border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
							<span class="text-xs text-slate-600 dark:text-slate-300">导航栏显示</span>
							<a-switch
								:checked="String(formState.hideInMenu) !== '1' && String(formState.hideInMenu) !== 'true'"
								checked-children="显示"
								un-checked-children="隐藏"
								@change="(val: boolean) => (formState.hideInMenu = val ? '0' : '1')"
							/>
						</div>

						<div class="border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
							<span class="text-xs text-slate-600 dark:text-slate-300">首页展示</span>
							<a-switch
								:checked="String(formState.showInHome) === '1' || String(formState.showInHome) === 'true'"
								checked-children="是"
								un-checked-children="否"
								@change="(val: boolean) => (formState.showInHome = val ? '1' : '0')"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 pt-2">
						<a-form-item label="重定向 (Redirect)" name="redirect" class="mb-2">
							<a-input
								v-model:value="formState.redirect"
								placeholder="如：/finance/gift/record"
								allow-clear
							/>
						</a-form-item>

						<a-form-item label="功能备注" name="summary" class="mb-2">
							<a-input
								v-model:value="formState.summary"
								placeholder="业务描述或说明"
								allow-clear
							/>
						</a-form-item>
					</div>
				</div>
			</div>
		</a-form>
	</a-modal>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	getMenuInfoDetail,
	addMenuInfo,
	editMenuInfo,
	getMenuInfoTree,
} from '@/views/user/menuInfo/api';
import { rulesRef } from '@/views/user/menuInfo/config';
import type { ModelInfo } from '@/types/modal';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 3. Hooks
const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

// 4. State
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formState = ref<MenuInfoData>({});
const isAdvancedExpanded = ref<boolean>(false);
const menuTreeRaw = ref<MenuInfoData[]>([]);

const modalTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	return modelInfo.value?.id ? '编辑菜单明细' : '新增菜单明细';
});

// 构建树选择器选项（带根目录顶层选项）
const treeSelectData = computed(() => {
	const rootNode: MenuInfoData = {
		id: '0',
		title: '根目录 (顶级菜单)',
		name: 'root',
		children: menuTreeRaw.value || [],
	};
	return [rootNode];
});

// 5. Actions
const loadMenuTreeOptions = async () => {
	try {
		const { code, data } = await getMenuInfoTree();
		if (code === '200' && Array.isArray(data)) {
			menuTreeRaw.value = data;
		}
	} catch {
		// 忽略临时网络异常
	}
};

const handleOk = () => {
	if (!formRef.value) return;
	loading.value = true;
	formRef.value
		.validateFields()
		.then(() => saveMenuInfoManager())
		.catch(() => {
			loading.value = false;
		});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveMenuInfoManager = async () => {
	try {
		const payload: MenuInfoData = {
			...formState.value,
			parentId: formState.value.parentId ? String(formState.value.parentId) : '0',
		};
		const api = payload.id ? editMenuInfo : addMenuInfo;
		const { code, message: msg } = await api(payload);
		if (code === '200') {
			message.success(msg || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(msg || '保存失败！');
		}
	} catch (err: unknown) {
		message.error((err as Error)?.message || '网络异常，保存失败');
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	await loadMenuTreeOptions();

	if (modelInfo.value?.id) {
		const { code, data, message: msg } = await getMenuInfoDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				parentId: String(data.parentId ?? '0'),
			};
		} else {
			message.error(msg || '查询详情失败！');
		}
	} else {
		// 新增场景：若传递了 parentId 则自动预选，默认展开常用
		const defaultParent = modelInfo.value?.parentId ? String(modelInfo.value.parentId) : '0';
		formState.value = {
			parentId: defaultParent,
			status: '1',
			hideInMenu: '0',
			showInHome: '0',
			orderBy: '1',
		};
	}
};

// 7. Watchers
watch(
	() => modelInfo.value.open,
	(isOpen) => {
		if (isOpen) {
			init();
		}
	},
	{ immediate: true },
);
</script>

<style scoped lang="scss">
.modern-menu-detail-modal {
	:deep(.ant-modal-content) {
		border-radius: 16px;
		padding: 20px 24px;
	}
	:deep(.ant-modal-header) {
		border-bottom: 1px solid #f1f5f9;
		padding-bottom: 14px;
		margin-bottom: 16px;
	}
	:deep(.ant-form-item-label > label) {
		font-size: 12px;
		font-weight: 600;
		color: #475569;
	}
}
</style>
