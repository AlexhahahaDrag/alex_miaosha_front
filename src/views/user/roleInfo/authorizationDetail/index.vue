<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="560"
		:title="modelInfo.title || '角色权限配置'"
		:subtitle="drawerSubtitle"
		:loading="loading"
		:destroy-on-close="true"
		data-testid="rbac-relation-drawer"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<!-- AI 智能权限推荐栏 -->
		<div
			class="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 dark:from-blue-950/60 dark:via-indigo-950/50 dark:to-blue-950/60 border border-blue-200/80 dark:border-blue-800/80"
			data-testid="rbac-ai-recommend-bar"
		>
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<span class="text-xs font-bold text-blue-700 dark:text-blue-300">
						✨ AI 智能权限推荐
					</span>
					<span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
						根据岗位名称与职责自动匹配
					</span>
				</div>
				<a-button
					type="primary"
					size="small"
					ghost
					:loading="aiLoading"
					class="rounded-md text-xs font-medium"
					data-testid="btn-ai-recommend-permissions"
					@click="handleAiRecommendPermissions"
				>
					一键智能推荐勾选
				</a-button>
			</div>
			<div
				v-if="aiReasoning"
				class="mt-2.5 px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/80 text-xs text-blue-700 dark:text-blue-300 leading-relaxed border border-blue-100 dark:border-blue-900"
			>
				<span class="font-semibold">推荐分析：</span>
				<span>{{ aiReasoning }}</span>
			</div>
		</div>

		<!-- 菜单与按钮权限树面板 -->
		<rbac-permission-tree-panel
			title="菜单与功能权限树"
			:description="`当前已勾选 ${selectPermission.length} 项权限，支持全选、清空与一键展开`"
			:tree-data="rbacTreeData"
			:checked-keys="selectPermission"
			:expanded-keys="expandedKeys"
			:half-checked-keys="halfCheckedKeys"
			@update:checked-keys="(keys) => (selectPermission = keys.map(String))"
			@update:expanded-keys="(keys) => (expandedKeys = keys.map(String))"
			@select-all="selectPermission = allPermissionKeys"
			@clear="selectPermission = []"
			@expand-all="expandedKeys = allPermissionKeys"
			@collapse-all="expandedKeys = []"
		/>

		<template #footer>
			<div class="flex justify-end gap-2">
				<a-button
					:disabled="loading"
					data-testid="rbac-relation-btn-cancel"
					@click="handleCancel"
				>
					取消
				</a-button>
				<a-button
					type="primary"
					:loading="loading"
					data-testid="rbac-relation-btn-submit"
					@click="handleOk"
				>
					保存
				</a-button>
			</div>
		</template>
	</base-rbac-drawer>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { RbacTreeNode } from '@/components/rbac';
import type {
	RoleInfoData,
	RolePermissionItem,
} from '@/views/user/roleInfo/config';
import {
	getRoleInfoDetail,
	assignRolePermissions,
	aiRecommendRolePermissions,
} from '@/views/user/roleInfo/api';
import type { PermissionInfo } from '@/views/user/permissionInfo/config';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});
const emit = defineEmits(['success']);

const loading = ref<boolean>(false);
const expandedKeys = ref<string[]>([]);
const halfCheckedKeys = ref<string[]>([]);
const aiLoading = ref<boolean>(false);
const aiReasoning = ref<string>('');
const aiRecommendedKeys = ref<string[]>([]);

const formState = ref<RoleInfoData>({});
const permissionTree = ref<PermissionInfo[]>([]);
const selectPermission = ref<string[]>([]);

const drawerSubtitle = computed(() => {
	if (formState.value.roleName || formState.value.roleCode) {
		return `${formState.value.roleName || ''} (${formState.value.roleCode || ''})`;
	}
	return '分配角色可访问的菜单、按钮及接口权限';
});

const toRbacTree = (nodes: PermissionInfo[]): RbacTreeNode[] =>
	(nodes || []).map((node) => {
		const key = String(node.id ?? '');
		const isAiRec = aiRecommendedKeys.value.includes(key);
		return {
			key,
			title: isAiRec
				? `${node.permissionName ?? ''}  [✨ AI推荐]`
				: (node.permissionName ?? ''),
			children: node.children?.length ? toRbacTree(node.children) : undefined,
		};
	});

const collectAllKeys = (nodes: RbacTreeNode[]): string[] =>
	nodes.flatMap((node) => [
		String(node.key),
		...(node.children?.length ? collectAllKeys(node.children) : []),
	]);

const rbacTreeData = computed(() => toRbacTree(permissionTree.value));
const allPermissionKeys = computed(() => collectAllKeys(rbacTreeData.value));

const handleAiRecommendPermissions = async () => {
	aiLoading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await aiRecommendRolePermissions({
			roleName: formState.value?.roleName,
			roleCode: formState.value?.roleCode,
			description: formState.value?.summary || formState.value?.roleName,
		});
		if (code === '200' && data) {
			if (data.recommendedMenuIds && data.recommendedMenuIds.length > 0) {
				const ids = data.recommendedMenuIds.map(String);
				aiRecommendedKeys.value = ids;
				selectPermission.value = ids;
				expandedKeys.value = ids;
				aiReasoning.value =
					data.reasoning || '已根据角色岗位特征智能匹配最契合的功能权限。';
				message.success(
					`AI 已推荐并自动勾选 ${ids.length} 项权限（已在权限树高亮标记）！`,
				);
			} else {
				message.info('未匹配到特定权限，请根据需要手动勾选。');
			}
		} else {
			message.warning(msg || 'AI 权限推荐未返回结果');
		}
	} catch {
		message.error('AI 权限推荐请求失败');
	} finally {
		aiLoading.value = false;
	}
};

const handleOk = () => {
	loading.value = true;
	saveRoleInfoManager();
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveRoleInfoManager = async () => {
	const roleId = formState.value?.id != null ? String(formState.value.id) : '';
	if (!roleId) {
		loading.value = false;
		message.error('角色 ID 缺失，无法保存权限');
		return;
	}
	const permissionIds = selectPermission.value.map((id) => String(id));
	const { code, message: messageInfo } = await assignRolePermissions(
		roleId,
		permissionIds,
	).finally(() => {
		loading.value = false;
	});
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const getAllPermissions = async () => {
	loading.value = true;
	try {
		const roleId = modelInfo.value?.id;
		if (roleId) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getRoleInfoDetail(String(roleId));
			if (code === '200' && data) {
				formState.value = data;
				permissionTree.value = data.permissionList || [];
				selectPermission.value = (data.rolePermissionInfoVoList || [])
					.map((item: RolePermissionItem) =>
						String(item.permissionId || item.id || ''),
					)
					.filter(Boolean);
			} else {
				message.error(messageInfo || '获取权限信息失败！');
			}
		}
	} catch {
		message.error('获取权限列表失败！');
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	permissionTree.value = [];
	selectPermission.value = [];
	expandedKeys.value = [];
	halfCheckedKeys.value = [];
	formState.value = {};
	aiReasoning.value = '';
	aiRecommendedKeys.value = [];
	await getAllPermissions();
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{ immediate: true },
);
</script>
