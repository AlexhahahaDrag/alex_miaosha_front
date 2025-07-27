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
			<a-button key="back" style="margin-right: 8px" @click="handleCancel"
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
import {
	getRoleInfoDetail,
	addOrEditRoleInfo,
} from '@/api/user/roleInfo/roleInfoTs';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { dictInfo } from '@/views/finance/dict/dict';
import { getDictList } from '@/api/finance/dict/dictManager';

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	data?: any;
}
const props = defineProps<Props>();

let formState = ref<RoleInfoDetail>({});

let statusList = ref<dictInfo[]>([]);

const permissionTree = ref<any[]>([]);

const selectPermission = ref<string[]>([]);

const getDictInfoList = () => {
	getDictList('is_valid').then((res) => {
		if (res.code == '200') {
			statusList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

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
		.catch((error: any) => {
			let data = error?.response?.data;
			if (data) {
				message.error(data?.message || '保存失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

function init() {
	getDictInfoList();
	if (props.data) {
		if (props.data.id) {
			getRoleInfoDetail(props.data.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						permissionTree.value = res?.data?.permissionList || [];
						selectPermission.value = res?.data?.rolePermissionInfoVoList?.map(
							(item: any) => item.id,
						);
						modelConfig.confirmLoading = false;
					} else {
						message.error((res && res.message) || '查询失败！');
					}
				})
				.catch((error: any) => {
					let data = error?.response?.data;
					if (data) {
						message.error(data?.message || '查询失败！');
					}
				});
		} else {
			modelConfig.confirmLoading = false;
			formState.value = {};
			permissionTree.value = [];
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
