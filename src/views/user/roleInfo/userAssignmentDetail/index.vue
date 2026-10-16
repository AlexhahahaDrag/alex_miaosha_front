<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="680"
		:title="modelInfo.title || '角色用户分配'"
		:subtitle="drawerSubtitle"
		:loading="loading || pageLoading"
		:destroy-on-close="true"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<div class="space-y-4">
			<div
				class="px-3.5 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/70 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between"
			>
				<span>
					保存后将同步更新该角色关联的用户列表（仅允许分配与该角色绑定机构有交集的成员）。
				</span>
				<span class="font-mono font-semibold shrink-0 ml-2">
					已选 {{ selectedUserIds.length }} 人
				</span>
			</div>

			<div class="flex justify-center">
				<a-transfer
					v-model:target-keys="selectedUserIds"
					:data-source="userOptions"
					:field-names="{
						title: 'nickName',
						key: 'id',
						description: 'username',
					}"
					:render="
						(item: UserManagerInfo) =>
							`${item.nickName || item.username}（${item.username}）`
					"
					:titles="['未分配用户', '已分配用户']"
					:list-style="{
						width: '285px',
						height: '420px',
					}"
					show-search
				/>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<a-button :disabled="loading" @click="handleCancel">取消</a-button>
				<a-button type="primary" :loading="loading" @click="handleOk">
					保存
				</a-button>
			</div>
		</template>
	</base-rbac-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { assignRoleUsers, getRoleInfoDetail } from '@/views/user/roleInfo/api';
import type { RoleInfoData, RoleUserItem } from '@/views/user/roleInfo/config';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});
const emit = defineEmits(['success']);

const loading = ref<boolean>(false);
const pageLoading = ref<boolean>(false);
const roleDetail = ref<RoleInfoData>({});
const userOptions = ref<UserManagerInfo[]>([]);
const selectedUserIds = ref<string[]>([]);

const drawerSubtitle = computed(() => {
	if (roleDetail.value.roleName || roleDetail.value.roleCode) {
		return `${roleDetail.value.roleName || ''} (${roleDetail.value.roleCode || ''})`;
	}
	return '调整当前角色下的绑定成员';
});

const handleCancel = () => {
	modelInfo.value.open = false;
};

const handleOk = async () => {
	if (!modelInfo.value.id) return;
	loading.value = true;
	const { code, message: messageInfo } = await assignRoleUsers(
		String(modelInfo.value.id),
		selectedUserIds.value.map(String),
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
	roleDetail.value = {};
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
		if (roleResult.code === '200' && roleResult.data) {
			roleDetail.value = roleResult.data;
			selectedUserIds.value = (roleResult.data.roleUserInfoVoList || [])
				.map((item: RoleUserItem) => String(item.userId || item.id || ''))
				.filter(Boolean);
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
	{ immediate: true },
);
</script>
