<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="640"
		:title="drawerTitle"
		:subtitle="drawerSubtitle"
		:loading="loading"
		:destroy-on-close="true"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<!-- 1. 只读模式：结构化菜单阅读卡片 (Read/Write Separation) -->
		<div v-if="isReadonly" class="menu-detail-readonly space-y-4">
			<!-- Hero 菜单概览卡片 -->
			<div
				class="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
			>
				<div
					class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/70 flex items-center justify-center text-xl shrink-0"
				>
					<AppstoreOutlined />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
							{{ formState.title || '-' }}
						</h3>
						<span
							v-if="String(formState.status) === '1'"
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							启用
						</span>
						<span
							v-else
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
							禁用
						</span>
					</div>
					<div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
						<span class="font-mono text-blue-600 dark:text-blue-400">
							路由名: {{ formState.name || '-' }}
						</span>
						<span v-if="formState.icon" class="font-mono">
							图标: {{ formState.icon }}
						</span>
						<span class="font-mono">
							排序: {{ formState.orderBy ?? '-' }}
						</span>
					</div>
				</div>
			</div>

			<!-- 路由与组件配置卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<BranchesOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						路由与组件映射
					</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">上级菜单</span>
						<span class="font-semibold text-slate-800 dark:text-slate-100">
							{{ resolvedParentMenuTitle }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">权限标识 (PermissionCode)</span>
						<span class="font-mono font-medium text-blue-600 dark:text-blue-400">
							{{ formState.permissionCode || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">路由路径 (Path)</span>
						<span class="font-mono text-slate-700 dark:text-slate-200 break-all">
							{{ formState.path || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">组件路径 (Component)</span>
						<span class="font-mono text-slate-700 dark:text-slate-200 break-all">
							{{ formState.component || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">重定向 (Redirect)</span>
						<span class="font-mono text-slate-700 dark:text-slate-200 break-all">
							{{ formState.redirect || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">显示控制</span>
						<span class="text-slate-700 dark:text-slate-200">
							{{
								String(formState.hideInMenu) === '1' || String(formState.hideInMenu) === 'true'
									? '隐藏内页'
									: '导航栏可见'
							}}
							·
							{{
								String(formState.showInHome) === '1' || String(formState.showInHome) === 'true'
									? '首页展示'
									: '非首页卡片'
							}}
						</span>
					</div>
				</div>
			</div>

			<!-- 备注说明卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<FileTextOutlined class="text-indigo-600 dark:text-indigo-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						功能备注说明
					</span>
				</div>
				<p
					v-if="formState.summary"
					class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0 whitespace-pre-wrap"
				>
					{{ formState.summary }}
				</p>
				<p v-else class="text-xs text-slate-400 italic m-0">
					暂无菜单功能备注
				</p>
			</div>
		</div>

		<!-- 2. 编辑/新增模式：标准化 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="MenuInfoForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
			class="space-y-5"
		>
			<!-- 1. 基础与路由定义（去卡片套娃，采用 Impeccable 轻量分节） -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>基础与路由定义</span>
				</div>

				<!-- 父级菜单选择 -->
				<a-form-item label="上级菜单" name="parentId" class="mb-3.5">
					<a-tree-select
						id="form_parentId"
						v-model:value="formState.parentId"
						:tree-data="treeSelectData"
						:field-names="{ label: 'title', value: 'id', children: 'children' }"
						placeholder="请选择上级菜单（选根目录则为一级菜单）"
						allow-clear
						show-search
						tree-node-filter-prop="title"
						tree-default-expand-all
						class="w-full rounded-lg"
						data-testid="rbac-menu-field-parent"
					/>
				</a-form-item>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="菜单标题" name="title" class="mb-3.5">
						<a-input
							id="form_title"
							v-model:value="formState.title"
							name="title"
							placeholder="如：礼金记录"
							allow-clear
							class="rounded-lg"
							data-testid="rbac-menu-field-title"
						/>
					</a-form-item>

					<a-form-item label="路由名称 (Name)" name="name" class="mb-3.5">
						<a-input
							id="form_name"
							v-model:value="formState.name"
							name="name"
							placeholder="如：financeGiftRecord"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-menu-field-name"
						/>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="路由路径 (Path)" name="path" class="mb-3.5">
						<a-input
							id="form_path"
							v-model:value="formState.path"
							name="path"
							placeholder="如：/finance/gift/record"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-menu-field-path"
						/>
					</a-form-item>

					<a-form-item label="组件路径 (Component)" name="component" class="mb-3.5">
						<a-input
							id="form_component"
							v-model:value="formState.component"
							name="component"
							placeholder="Layout 或视图组件路径"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-menu-field-component"
						/>
						<div class="flex items-center gap-1.5 mt-1.5">
							<span class="text-[11px] text-slate-400">快捷填入:</span>
							<button
								type="button"
								class="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800 cursor-pointer transition-colors"
								@click="formState.component = 'Layout'"
							>
								Layout
							</button>
							<button
								type="button"
								class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 cursor-pointer transition-colors"
								@click="formState.component = formState.path ? `/src/views${formState.path}/index.vue` : '/src/views/'"
							>
								Auto /src/views
							</button>
						</div>
					</a-form-item>
				</div>

				<a-form-item label="权限标识 (PermissionCode)" name="permissionCode" class="mb-0">
					<a-input
						id="form_permissionCode"
						v-model:value="formState.permissionCode"
						name="permissionCode"
						placeholder="如：finance:gift:record 或 *"
						allow-clear
						class="rounded-lg font-mono"
						data-testid="rbac-menu-field-permission-code"
					/>
				</a-form-item>
			</section>

			<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

			<!-- 2. 导航展示与高级选项 -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
					<span>导航展示与高级选项</span>
				</div>

				<!-- 单层水平开关控制条 -->
				<div class="bg-slate-50/90 dark:bg-slate-900/50 rounded-xl px-4 py-3 mb-4 grid grid-cols-3 gap-4">
					<div class="flex items-center justify-between">
						<span class="text-xs font-medium text-slate-600 dark:text-slate-300">启用状态</span>
						<a-switch
							:checked="String(formState.status) === '1'"
							checked-children="启用"
							un-checked-children="禁用"
							size="small"
							@change="(val: boolean) => (formState.status = val ? '1' : '0')"
						/>
					</div>

					<div class="flex items-center justify-between border-l border-slate-200/80 dark:border-slate-800 pl-4">
						<span class="text-xs font-medium text-slate-600 dark:text-slate-300">导航显示</span>
						<a-switch
							:checked="String(formState.hideInMenu) !== '1' && String(formState.hideInMenu) !== 'true'"
							checked-children="显示"
							un-checked-children="隐藏"
							size="small"
							@change="(val: boolean) => (formState.hideInMenu = val ? '0' : '1')"
						/>
					</div>

					<div class="flex items-center justify-between border-l border-slate-200/80 dark:border-slate-800 pl-4">
						<span class="text-xs font-medium text-slate-600 dark:text-slate-300">首页展示</span>
						<a-switch
							:checked="String(formState.showInHome) === '1' || String(formState.showInHome) === 'true'"
							checked-children="是"
							un-checked-children="否"
							size="small"
							@change="(val: boolean) => (formState.showInHome = val ? '1' : '0')"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="菜单图标 (AntD Icon)" name="icon" class="mb-3.5">
						<a-input
							id="form_icon"
							v-model:value="formState.icon"
							name="icon"
							placeholder="如：AppstoreOutlined"
							allow-clear
							class="rounded-lg font-mono"
						/>
					</a-form-item>

					<a-form-item label="显示排序 (越小越靠前)" name="orderBy" class="mb-3.5">
						<a-input-number
							id="form_orderBy"
							v-model:value="formState.orderBy"
							name="orderBy"
							:min="0"
							:max="9999"
							:precision="0"
							placeholder="如：1"
							class="!w-full rounded-lg font-mono"
						/>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="重定向 (Redirect)" name="redirect" class="mb-0">
						<a-input
							id="form_redirect"
							v-model:value="formState.redirect"
							name="redirect"
							placeholder="如：/finance/gift/record"
							allow-clear
							class="rounded-lg font-mono"
						/>
					</a-form-item>

					<a-form-item label="功能备注" name="summary" class="mb-0">
						<a-input
							id="form_summary"
							v-model:value="formState.summary"
							name="summary"
							placeholder="业务描述或说明"
							allow-clear
							class="rounded-lg"
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
					data-testid="rbac-menu-detail-btn-submit"
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
	AppstoreOutlined,
	BranchesOutlined,
	FileTextOutlined,
} from '@ant-design/icons-vue';
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

const props = withDefaults(
	defineProps<{
		treeData?: MenuInfoData[];
	}>(),
	{
		treeData: () => [],
	},
);

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formState = ref<MenuInfoData>({});
const fallbackTree = ref<MenuInfoData[]>([]);

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const drawerTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	if (isReadonly.value) return '查看菜单明细';
	return modelInfo.value?.id ? '编辑菜单明细' : '新增菜单明细';
});

const drawerSubtitle = computed(() => {
	if (formState.value.permissionCode) {
		return `权限码: ${formState.value.permissionCode}`;
	}
	return isReadonly.value ? '只读浏览模式' : '配置导航层级、路由组件与权限标识';
});

const findMenuTitleInTree = (
	nodes: MenuInfoData[],
	targetId?: string,
): string | undefined => {
	if (!targetId) return undefined;
	for (const node of nodes) {
		if (String(node.id) === String(targetId)) {
			return node.title;
		}
		if (node.children?.length) {
			const found = findMenuTitleInTree(node.children, targetId);
			if (found) return found;
		}
	}
	return undefined;
};

const resolvedParentMenuTitle = computed(() => {
	const pid = formState.value.parentId;
	if (!pid || String(pid) === '0') {
		return '根目录 (顶级菜单)';
	}
	const raw = props.treeData.length > 0 ? props.treeData : fallbackTree.value;
	return findMenuTitleInTree(raw, String(pid)) || '根目录 (顶级菜单)';
});

// 递归标准化 ID 为 string，并在编辑时禁用自身及其所有子孙节点（防止自选成环）
const normalizeAndGuardTree = (
	nodes: MenuInfoData[],
	editingId: string | undefined,
	ancestorDisabled = false,
): MenuInfoData[] => {
	if (!Array.isArray(nodes)) return [];
	return nodes.map((node) => {
		const strId = String(node.id ?? '');
		const isSelfOrDescendant = ancestorDisabled || (Boolean(editingId) && strId === editingId);
		return {
			...node,
			id: strId,
			disabled: isSelfOrDescendant,
			children: node.children
				? normalizeAndGuardTree(node.children, editingId, isSelfOrDescendant)
				: undefined,
		};
	});
};

const treeSelectData = computed<MenuInfoData[]>(() => {
	const raw = props.treeData.length > 0 ? props.treeData : fallbackTree.value;
	const editingId = modelInfo.value?.id ? String(modelInfo.value.id) : undefined;
	return [
		{
			id: '0',
			title: '根目录 (顶级菜单)',
			name: 'root',
			children: normalizeAndGuardTree(raw, editingId),
		},
	];
});

const handleOk = () => {
	if (isReadonly.value || !formRef.value) return;
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
	loading.value = true;
	formState.value = {};
	try {
		if (props.treeData.length === 0) {
			const { code, data } = await getMenuInfoTree();
			if (code === '200' && Array.isArray(data)) {
				fallbackTree.value = data;
			}
		}

		if (modelInfo.value?.id) {
			const { code, data, message: msg } = await getMenuInfoDetail(String(modelInfo.value.id));
			if (code === '200' && data) {
				formState.value = {
					...data,
					id: String(data.id),
					parentId:
						data.parentId !== undefined && data.parentId !== null
							? String(data.parentId)
							: '0',
				};
			} else {
				message.error(msg || '查询详情失败！');
			}
		} else {
			const defaultParent = modelInfo.value?.parentId ? String(modelInfo.value.parentId) : '0';
			formState.value = {
				parentId: defaultParent,
				status: '1',
				hideInMenu: '0',
				showInHome: '0',
				orderBy: 1,
			};
		}
	} finally {
		loading.value = false;
	}
};

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
