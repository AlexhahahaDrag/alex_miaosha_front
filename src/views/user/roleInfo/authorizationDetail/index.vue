<template>
	<a-drawer
		:width="500"
		:title="modelInfo.title || '角色权限配置'"
		placement="right"
		v-model:open="modelInfo.open"
		:footer-style="{ textAlign: 'right' }"
		@close="handleCancel"
	>
		<template #footer>
			<a-button style="margin-right: 8px" key="back" @click="handleCancel">
				取消
			</a-button>
			<a-button
				key="submit"
				type="primary"
				:loading="loading"
				@click="handleOk"
			>
				保存
			</a-button>
		</template>
		<menu-tree
			:treeData="permissionTree"
			v-model:selectedKeys="selectPermission"
		></menu-tree>
	</a-drawer>
</template>
<script lang="ts" setup>
import type { RoleInfoData } from '../config';

// 字典数据已通过 useDictInfo 自动加载
import {
	getRoleInfoDetail,
	addRoleInfo,
	editRoleInfo,
} from '@/views/user/roleInfo/api';
import { message } from 'ant-design-vue';
const loading = ref<boolean>(false);

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

const permissionTree = ref<unknown[]>([]);

const selectPermission = ref<string[]>([]);

const handleOk = () => {
	loading.value = true;
	saveRoleInfoManager();
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveRoleInfoManager = async () => {
	let api = addRoleInfo;
	if (formState.value?.id) {
		api = editRoleInfo;
	}
	formState.value.permissionList = selectPermission.value.map(
		(id) => ({ id: Number(id) }) as any,
	);
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
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
					(data as { permissionList?: unknown[] })?.permissionList || [];
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
