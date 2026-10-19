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
		<!-- 1. 只读模式：结构化权限阅读卡片 (Read/Write Separation) -->
		<div v-if="isReadonly" class="permission-detail-readonly space-y-4">
			<!-- Hero 权限概览卡片 -->
			<div
				class="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
			>
				<div
					class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/70 flex items-center justify-center text-xl shrink-0"
				>
					<SafetyCertificateOutlined />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
							{{ formState.permissionName || '-' }}
						</h3>
						<span
							v-if="String(formState.status) === '1'"
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
							<KeyOutlined />
							{{ formState.permissionCode || '-' }}
						</span>
					</div>
				</div>
			</div>

			<!-- 层级归属与资源映射卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<BranchesOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						权限层级与关联资源
					</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">上级权限分组</span>
						<span class="font-semibold text-slate-800 dark:text-slate-100">
							{{ resolvedParentPermissionName }}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">权限编码 (Code)</span>
						<span class="font-mono font-medium text-blue-600 dark:text-blue-400">
							{{ formState.permissionCode || '-' }}
						</span>
					</div>
					<div class="flex flex-col gap-1 sm:col-span-2">
						<span class="text-slate-400">关联资源 (URL / Options)</span>
						<span
							v-if="formState.options"
							class="font-mono text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 break-all"
						>
							{{ formState.options }}
						</span>
						<span v-else class="text-slate-400 italic">未配置关联资源路径</span>
					</div>
				</div>
			</div>

			<!-- 职责与范围说明卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<FileTextOutlined class="text-indigo-600 dark:text-indigo-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						职责与范围说明
					</span>
				</div>
				<p
					v-if="formState.summary"
					class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0 whitespace-pre-wrap"
				>
					{{ formState.summary }}
				</p>
				<p v-else class="text-xs text-slate-400 italic m-0">
					暂无职责与控制范围说明
				</p>
			</div>
		</div>

		<!-- 2. 编辑/新增模式：标准化 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="PermissionInfoForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
			class="space-y-5"
		>
			<!-- 1. 权限标识与层级归属 -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>权限标识与层级归属</span>
				</div>

				<a-form-item label="上级权限" name="parentId" class="mb-3.5">
					<a-tree-select
						id="form_parentId"
						v-model:value="formState.parentId"
						:tree-data="treeSelectData"
						:field-names="{ label: 'permissionName', value: 'id', children: 'children' }"
						placeholder="请选择上级权限（选根目录则为顶级权限模块）"
						allow-clear
						show-search
						tree-node-filter-prop="permissionName"
						tree-default-expand-all
						class="w-full rounded-lg"
						data-testid="rbac-perm-field-parent"
					/>
				</a-form-item>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="权限名称" name="permissionName" class="mb-3.5">
						<a-input
							id="form_permissionName"
							v-model:value="formState.permissionName"
							name="permissionName"
							placeholder="如：新增权限点"
							allow-clear
							class="rounded-lg"
							data-testid="rbac-perm-field-name"
						/>
					</a-form-item>

					<a-form-item label="权限编码 (Code)" name="permissionCode" class="mb-3.5">
						<a-input
							id="form_permissionCode"
							v-model:value="formState.permissionCode"
							name="permissionCode"
							placeholder="如：permission:add"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-perm-field-code"
						/>
					</a-form-item>
				</div>

				<a-form-item label="关联资源 (URL / Options)" name="options" class="mb-0">
					<a-input
						id="form_options"
						v-model:value="formState.options"
						name="options"
						placeholder="选填，如：/api/v1/permission-info 或接口路径标识"
						allow-clear
						class="rounded-lg font-mono"
						data-testid="rbac-perm-field-options"
					/>
				</a-form-item>
			</section>

			<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

			<!-- 2. 状态与业务说明 -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
					<span>状态与业务说明</span>
				</div>

				<a-form-item label="生效状态" name="status" class="mb-3.5">
					<a-radio-group
						id="form_status"
						v-model:value="formState.status"
						name="status"
						button-style="solid"
						data-testid="rbac-perm-field-status"
					>
						<a-radio-button
							v-for="item in statusOptions"
							:key="String(item.typeCode)"
							:value="String(item.typeCode)"
						>
							{{ item.typeName }}
						</a-radio-button>
					</a-radio-group>
				</a-form-item>

				<a-form-item label="职责与范围说明" name="summary" class="mb-0">
					<a-textarea
						id="form_summary"
						v-model:value="formState.summary"
						name="summary"
						:rows="3"
						:maxlength="150"
						show-count
						placeholder="选填，描述该权限点控制的具体操作范围或适用角色..."
						class="rounded-lg"
						data-testid="rbac-perm-field-summary"
					/>
				</a-form-item>
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
					data-testid="rbac-perm-detail-btn-submit"
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
	SafetyCertificateOutlined,
	KeyOutlined,
	BranchesOutlined,
	FileTextOutlined,
} from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	getPermissionInfoDetail,
	addPermissionInfo,
	editPermissionInfo,
	getPermissionInfoList,
} from '@/views/user/permissionInfo/api';
import { rulesRef, type PermissionInfo } from '@/views/user/permissionInfo/config';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formState = ref<PermissionInfo>({});
const permissionTree = ref<PermissionInfo[]>([]);

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const statusOptions = computed(() => {
	const dict = getDictByType('is_valid');
	if (Array.isArray(dict) && dict.length > 0) {
		return dict;
	}
	return [
		{ typeCode: '1', typeName: '有效' },
		{ typeCode: '0', typeName: '失效' },
	];
});

const drawerTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	if (isReadonly.value) return '查看权限明细';
	return modelInfo.value?.id ? '编辑权限明细' : '新增权限明细';
});

const drawerSubtitle = computed(() => {
	if (formState.value.permissionCode) {
		return `编码: ${formState.value.permissionCode}`;
	}
	return isReadonly.value ? '只读浏览模式' : '配置按钮/API 权限点标识、层级与状态';
});

const findPermissionNameInTree = (
	nodes: PermissionInfo[],
	targetId?: string,
): string | undefined => {
	if (!targetId) return undefined;
	for (const node of nodes) {
		if (String(node.id) === String(targetId)) {
			return node.permissionName;
		}
		if (node.children?.length) {
			const found = findPermissionNameInTree(node.children, targetId);
			if (found) return found;
		}
	}
	return undefined;
};

const resolvedParentPermissionName = computed(() => {
	const pid = formState.value.parentId;
	if (!pid || String(pid) === '0') {
		return '根目录 (顶级权限分组)';
	}
	return (
		findPermissionNameInTree(permissionTree.value, String(pid)) ||
		'根目录 (顶级权限分组)'
	);
});

// 递归标准化 ID 为 string，并在编辑时禁用自身及其所有子孙节点（防止自选成环）
const normalizeAndGuardTree = (
	nodes: PermissionInfo[],
	editingId: string | undefined,
	ancestorDisabled = false,
): PermissionInfo[] => {
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

const treeSelectData = computed<PermissionInfo[]>(() => {
	const editingId = modelInfo.value?.id ? String(modelInfo.value.id) : undefined;
	return [
		{
			id: '0',
			permissionName: '根目录 (顶级权限分组)',
			permissionCode: 'root',
			children: normalizeAndGuardTree(permissionTree.value, editingId),
		},
	];
});

const handleOk = () => {
	if (isReadonly.value || !formRef.value) return;
	loading.value = true;
	formRef.value
		.validateFields()
		.then(() => savePermissionInfoManager())
		.catch(() => {
			loading.value = false;
		});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const savePermissionInfoManager = async () => {
	try {
		const payload: PermissionInfo = {
			...formState.value,
			parentId: formState.value.parentId ? String(formState.value.parentId) : '0',
		};
		const api = payload.id ? editPermissionInfo : addPermissionInfo;
		const { code, message: messageInfo } = await api(payload);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
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
		const { code: treeCode, data: treeData } = await getPermissionInfoList();
		if (treeCode === '200' && Array.isArray(treeData)) {
			permissionTree.value = treeData;
		}

		if (modelInfo.value?.id) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getPermissionInfoDetail(String(modelInfo.value.id));
			if (code === '200' && data) {
				formState.value = {
					...data,
					id: String(data.id),
					status: data.status !== undefined && data.status !== null ? String(data.status) : '1',
					parentId:
						data.parentId !== undefined && data.parentId !== null
							? String(data.parentId)
							: '0',
				};
			} else {
				message.error(messageInfo || '查询详情失败！');
			}
		} else {
			formState.value = {
				parentId: '0',
				status: '1',
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
