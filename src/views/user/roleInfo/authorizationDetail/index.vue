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
			<a-button style="margin-right: 8px" key="back" @click="handleCancel"
				>取消</a-button
			>
			<a-button key="submit" type="primary" :loading="loading" @click="handleOk"
				>保存</a-button
			>
		</template>
		<menu-tree
			:treeData="permissionTree"
			:selectedKeys="selectPermission"
		></menu-tree>
	</a-drawer>
</template>
<script lang="ts" setup>
import type { RoleInfoDetail } from './roleInfoDetailTs';

// 字典数据已通过 useDictInfo 自动加载
import {
	getRoleInfoDetail,
	addOrEditRoleInfo,
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

let formState = ref<RoleInfoDetail>({});

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
function saveRoleInfoManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditRoleInfo(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: unknown) => {
			const data = (error as { response?: { data?: { message?: string } } })
				?.response?.data;
			if (data) {
				message.error(data?.message || '保存失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

const init = async () => {
	if ((props.data as { id: string })?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoDetail(Number((props.data as { id: string }).id));
		if (code == '200') {
			formState.value = data as RoleInfoDetail;
			permissionTree.value =
				(data as { permissionList?: unknown[] })?.permissionList || [];
			selectPermission.value =
				(
					data as { rolePermissionInfoVoList?: { id: string }[] }
				)?.rolePermissionInfoVoList?.map((item: { id: string }) => item.id) ||
				[];
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	}
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
