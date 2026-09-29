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
		<div class="ai-role-recommend-bar" data-testid="rbac-ai-recommend-bar">
			<div class="ai-bar-header">
				<span class="ai-badge">✨ AI 智能权限推荐</span>
				<a-button
					type="primary"
					size="small"
					ghost
					:loading="aiLoading"
					data-testid="btn-ai-recommend-permissions"
					@click="handleAiRecommendPermissions"
				>
					一键智能推荐勾选
				</a-button>
			</div>
			<div v-if="aiReasoning" class="ai-reasoning-box">
				<span class="ai-reason-label">推荐分析：</span>
				<span>{{ aiReasoning }}</span>
			</div>
		</div>
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
	aiRecommendRolePermissions,
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
const aiLoading = ref<boolean>(false);
const aiReasoning = ref<string>('');

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

const handleAiRecommendPermissions = async () => {
	aiLoading.value = true;
	try {
		const { code, data, message: msg } = await aiRecommendRolePermissions({
			roleName: formState.value?.roleName,
			roleCode: formState.value?.roleCode,
			description: formState.value?.description || formState.value?.roleName,
		});
		if (code === '200' && data) {
			if (data.recommendedMenuIds && data.recommendedMenuIds.length > 0) {
				const ids = data.recommendedMenuIds.map(String);
				selectPermission.value = ids;
				expandedKeys.value = ids;
				aiReasoning.value =
					data.reasoning || '已根据角色岗位特征智能匹配最契合的功能权限。';
				message.success(`AI 已推荐并自动勾选 ${ids.length} 项权限！`);
			} else {
				message.info('未匹配到特定权限，请根据需要手动勾选。');
			}
		} else {
			message.warning(msg || 'AI 权限推荐未返回结果');
		}
	} catch (err) {
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
	aiReasoning.value = '';
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
<style lang="scss" scoped>
.ai-role-recommend-bar {
	margin-bottom: 12px;
	padding: 10px 14px;
	background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
	border: 1px solid #adc6ff;
	border-radius: 6px;

	.ai-bar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.ai-badge {
			font-weight: 600;
			color: #1d39c4;
			font-size: 13px;
		}
	}

	.ai-reasoning-box {
		margin-top: 8px;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 4px;
		font-size: 12px;
		color: #2f54eb;
		line-height: 1.5;

		.ai-reason-label {
			font-weight: 600;
		}
	}
}
</style>
