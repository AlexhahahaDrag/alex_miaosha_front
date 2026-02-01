<template>
	<a-drawer
		:width="500"
		title="角色权限配置"
		placement="right"
		:open="props.open"
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
			:selectedKeys="selectPermission"
		></menu-tree>
	</a-drawer>
</template>
<script lang="ts" setup>
import type { RoleInfoData } from '../roleInfo';

// 字典数据已通过 useDictInfo 自动加载
import {
	getRoleInfoDetail,
	addRoleInfo,
	editRoleInfo,
} from '@/views/user/roleInfo/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	data?: unknown;
}
const props = defineProps<Props>();

let formState = ref<RoleInfoData>({});

// 字典数据已通过 useDictInfo 自动加载

const permissionTree = ref<unknown[]>([]);

const selectPermission = ref<string[]>([]);

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveRoleInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存角色信息表信息
const saveRoleInfoManager = async () => {
	let api = addRoleInfo;
	if (formState.value?.id) {
		api = editRoleInfo;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		emit('handleOk', false);
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

// 获取所有权限列表和已选权限
const getAllPermissions = async () => {
	try {
		const roleId = (props.data as { id: string | number })?.id;

		if (roleId) {
			// 如果有角色ID，获取该角色的详情（包含所有权限列表和已选权限）
			const {
				code,
				data,
				message: messageInfo,
			} = await getRoleInfoDetail(Number(roleId));
			if (code == '200') {
				formState.value = data as RoleInfoData;
				// 设置所有权限列表（permissionList 包含所有权限）
				permissionTree.value =
					(data as { permissionList?: unknown[] })?.permissionList || [];
				// 设置已选中的权限（rolePermissionInfoVoList 包含该角色已选中的权限）
				selectPermission.value =
					(
						data as { rolePermissionInfoVoList?: { id: string }[] }
					)?.rolePermissionInfoVoList?.map((item: { id: string }) =>
						String(item.id),
					) || [];
				modelConfig.confirmLoading = false;
			} else {
				message.error(messageInfo || '查询失败！');
				modelConfig.confirmLoading = false;
			}
		} else {
			// 如果没有角色ID，也需要获取所有权限列表
			// 假设可以通过一个存在的角色ID获取所有权限列表（permissionList 包含所有权限）
			// 这里使用角色ID为1，如果后端不支持，需要调用专门的获取所有权限的API
			// 注意：这里只获取权限列表，不设置已选权限
			const { code, data, message: messageInfo } = await getRoleInfoDetail(1);
			if (code == '200') {
				// 只获取权限列表，不设置已选权限
				permissionTree.value =
					(data as { permissionList?: unknown[] })?.permissionList || [];
				selectPermission.value = [];
				modelConfig.confirmLoading = false;
			} else {
				// 如果获取失败，尝试清空权限列表
				permissionTree.value = [];
				selectPermission.value = [];
				modelConfig.confirmLoading = false;
				message.error(messageInfo || '获取权限列表失败！');
			}
		}
	} catch (error) {
		console.error('获取权限列表失败:', error);
		message.error('获取权限列表失败！');
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
	() => props.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
		deep: true,
	},
);
</script>
<style lang="scss" scoped></style>
