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
} from '@/api/user/roleInfo/roleInfoTs';
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

function init() {
	if (props.data && typeof props.data === 'object' && 'id' in props.data) {
		if ((props.data as { id: string }).id) {
			getRoleInfoDetail(Number((props.data as { id: string }).id))
				.then((res: unknown) => {
					if ((res as { code: string }).code == '200') {
						formState.value = (res as { data: unknown }).data as RoleInfoDetail;
						permissionTree.value =
							(res as { data?: { permissionList?: unknown[] } })?.data
								?.permissionList || [];
						selectPermission.value =
							(
								res as {
									data?: { rolePermissionInfoVoList?: { id: string }[] };
								}
							)?.data?.rolePermissionInfoVoList?.map(
								(item: { id: string }) => item.id,
							) || [];
						modelConfig.confirmLoading = false;
					} else {
						message.error(
							(res as { message?: string })?.message || '查询失败！',
						);
					}
				})
				.catch((error: unknown) => {
					const data = (error as { response?: { data?: { message?: string } } })
						?.response?.data;
					if (data) {
						message.error(data?.message || '保存失败！');
					}
					modelConfig.confirmLoading = false;
					formState.value = {};
					permissionTree.value = [];
				});
		}
	}
}

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

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
