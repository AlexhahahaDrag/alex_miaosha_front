<template>
	<a-drawer
		:width="500"
		:title="modelInfo.title || '角色权限配置'"
		placement="right"
		v-model:open="modelInfo.open"
		:footer-style="{ textAlign: 'right' }"
		data-testid="rbac-relation-drawer"
		@close="handleCancel"
	>
		<template #footer>
			<a-button
				style="margin-right: 8px"
				key="back"
				data-testid="rbac-relation-btn-cancel"
				@click="handleCancel"
			>
				取消
			</a-button>
			<a-button
				key="submit"
				type="primary"
				:loading="loading"
				data-testid="rbac-relation-btn-submit"
				@click="handleOk"
			>
				保存
			</a-button>
		</template>
		<rbac-permission-tree-panel
			title="菜单权限树"
			description="勾选角色可访问的菜单/按钮权限，支持批量展开收起"
			:tree-data="rbacTreeData"
			:checked-keys="selectPermission"
			:expanded-keys="expandedKeys"
			:half-checked-keys="halfCheckedKeys"
			@update:checkedKeys="(keys) => (selectPermission = keys.map(String))"
			@update:expandedKeys="(keys) => (expandedKeys = keys.map(String))"
			@select-all="selectPermission = allPermissionKeys"
			@clear="selectPermission = []"
			@expand-all="expandedKeys = allPermissionKeys"
			@collapse-all="expandedKeys = []"
		/>
	</a-drawer>
</template>
<script lang="ts" setup>
import type { RoleInfoData } from '../config';

// 字典数据已通过 useDictInfo 自动加载
import {
	getRoleInfoDetail,
	assignRolePermissions,
} from '@/views/user/roleInfo/api';
import { message } from 'ant-design-vue';
import type { RbacTreeNode } from '@/components/rbac';

interface RawPermissionNode {
	id?: string;
	permissionName?: string;
	children?: RawPermissionNode[];
}

// 将后端 id/permissionName/children 结构映射为 RbacPermissionTreePanel 所需的 key/title/children
const toRbacTree = (nodes: RawPermissionNode[]): RbacTreeNode[] =>
	(nodes || []).map((node) => ({
		key: String(node.id ?? ''),
		title: node.permissionName ?? '',
		children: node.children?.length ? toRbacTree(node.children) : undefined,
	}));

const collectAllKeys = (nodes: RbacTreeNode[]): string[] =>
	nodes.flatMap((node) => [
		String(node.key),
		...(node.children?.length ? collectAllKeys(node.children) : []),
	]);

const loading = ref<boolean>(false);
const expandedKeys = ref<string[]>([]);
const halfCheckedKeys = ref<string[]>([]);

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

import type { ModelInfo } from '@/views/common/config';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});

const formState = ref<RoleInfoData>({});

// 字典数据已通过 useDictInfo 自动加载

const permissionTree = ref<RawPermissionNode[]>([]);
const rbacTreeData = computed(() => toRbacTree(permissionTree.value));
const allPermissionKeys = computed(() => collectAllKeys(rbacTreeData.value));

const selectPermission = ref<string[]>([]);

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

// 获取所有权限列表和已选权限
const getAllPermissions = async () => {
	try {
		const roleId = modelInfo.value?.id;

		if (roleId) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getRoleInfoDetail(roleId);
			if (code === '200') {
				formState.value = data as RoleInfoData;
				permissionTree.value =
					(data as { permissionList?: RawPermissionNode[] })
						?.permissionList || [];
				selectPermission.value =
					(
						data as { rolePermissionInfoVoList?: { id: string }[] }
					)?.rolePermissionInfoVoList?.map((item: { id: string }) =>
						String(item.id),
					) || [];
			} else {
				message.error(messageInfo || '获取权限信息失败！');
			}
		}
	} catch (error) {
		console.error('获取权限列表失败:', error);
		message.error('获取权限列表失败！');
	} finally {
		modelConfig.confirmLoading = false;
	}
};

const init = async () => {
	// 重置状态
	permissionTree.value = [];
	selectPermission.value = [];
	expandedKeys.value = [];
	halfCheckedKeys.value = [];
	formState.value = {};
	modelConfig.confirmLoading = true;

	// 始终获取所有权限列表
	await getAllPermissions();
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

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped></style>
