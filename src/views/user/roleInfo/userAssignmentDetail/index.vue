<template>
	<a-drawer
		:width="640"
		:title="modelInfo.title || '角色用户分配'"
		placement="right"
		v-model:open="modelInfo.open"
		@close="handleCancel"
	>
		<template #footer>
			<a-button style="margin-right: 8px" @click="handleCancel">取消</a-button>
			<a-button type="primary" :loading="loading" @click="handleOk">保存</a-button>
		</template>
		<a-spin :spinning="pageLoading">
			<a-alert
				message="角色管理仅作为辅助入口，保存后会同步修改用户-角色关系。"
				type="info"
				show-icon
				style="margin-bottom: 16px"
			/>
			<a-transfer
				v-model:target-keys="selectedUserIds"
				:data-source="userOptions"
				:field-names="{ title: 'nickName', key: 'id', description: 'username' }"
				:render="(item: any) => `${item.nickName || item.username}（${item.username}）`"
				:titles="['未分配用户', '已分配用户']"
				show-search
			/>
		</a-spin>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { assignRoleUsers, getRoleInfoDetail } from '@/views/user/roleInfo/api';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});
const emit = defineEmits(['success']);

const loading = ref(false);
const pageLoading = ref(false);
const userOptions = ref<UserManagerInfo[]>([]);
const selectedUserIds = ref<string[]>([]);

const handleCancel = () => {
	modelInfo.value.open = false;
};

const handleOk = async () => {
	if (!modelInfo.value.id) return;
	loading.value = true;
	const { code, message: messageInfo } = await assignRoleUsers(
		modelInfo.value.id,
		selectedUserIds.value,
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

const init = async () => {
	if (!modelInfo.value.id) return;
	pageLoading.value = true;
	try {
		const [userResult, roleResult] = await Promise.all([
			getUserManagerList({ status: '1' }),
			getRoleInfoDetail(String(modelInfo.value.id)),
		]);
		if (userResult.code === '200') {
			userOptions.value = (userResult.data || []).map((user) => ({
				...user,
				id: String(user.id),
			}));
		}
		if (roleResult.code === '200') {
			selectedUserIds.value =
				(roleResult.data as any)?.roleUserInfoVoList?.map((item: any) =>
					String(item.userId || item.id),
				) || [];
		}
	} finally {
		pageLoading.value = false;
	}
};

watch(
	() => modelInfo.value.open,
	(open) => {
		if (open) {
			init();
		}
	},
);
</script>
