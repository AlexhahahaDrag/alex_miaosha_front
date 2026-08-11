<template>
	<div class="page-info">
		<a-alert
			message="角色-用户关系配置"
			description="选择角色后，在下方双栏中调整已分配用户，保存前可预览本次新增/移除的差异。"
			type="info"
			show-icon
			style="margin-bottom: 16px"
		/>
		<div class="toolbar">
			<a-space>
				<span class="toolbar__label">选择角色：</span>
				<a-select
					v-model:value="selectedRoleId"
					:options="roleOptions"
					placeholder="请选择角色"
					show-search
					:filter-option="filterOption"
					style="width: 260px"
					data-testid="rbac-role-user-select-role"
					@change="onRoleChange"
				/>
			</a-space>
		</div>

		<a-empty v-if="!selectedRoleId" description="请先选择角色" />
		<template v-else>
			<rbac-dual-list-selector
				available-title="全部用户"
				assigned-title="已分配用户"
				:available-items="availableItems"
				:assigned-items="assignedItems"
				v-model:selected-available-keys="selectedAvailableKeys"
				v-model:selected-assigned-keys="selectedAssignedKeys"
				v-model:available-keyword="availableKeyword"
				v-model:assigned-keyword="assignedKeyword"
				:loading="pageLoading"
				@search-available="(value) => (availableKeyword = value)"
				@search-assigned="(value) => (assignedKeyword = value)"
				@add="handleAdd"
				@remove="handleRemove"
			/>

			<rbac-diff-preview
				title="本次变更预览"
				description="保存后将全量替换该角色的用户关系"
				:added="diffAdded"
				:removed="diffRemoved"
				:unchanged="diffUnchanged"
				style="margin-top: 16px"
			/>

			<div class="footer-bar">
				<a-space>
					<a-button
						:disabled="!hasChanges"
						data-testid="rbac-role-user-btn-reset"
						@click="resetDraft"
					>
						重置
					</a-button>
					<a-button
						type="primary"
						:disabled="!hasChanges"
						:loading="saving"
						data-testid="rbac-role-user-btn-save"
						@click="handleSave"
					>
						保存
					</a-button>
				</a-space>
			</div>
		</template>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { RbacDiffItem, RbacSelectableItem } from '@/components/rbac';
import { getRoleInfoPage, getRoleInfoDetail, assignRoleUsers } from '@/views/user/roleInfo/api';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';

interface RoleOption {
	label: string;
	value: string;
}

const roleOptions = ref<RoleOption[]>([]);
const selectedRoleId = ref<string>();
const allUsers = ref<UserManagerInfo[]>([]);
const userMap = computed(() => {
	const map = new Map<string, UserManagerInfo>();
	allUsers.value.forEach((user) => {
		if (user.id) map.set(String(user.id), user);
	});
	return map;
});

const initialAssignedUserIds = ref<string[]>([]);
const draftAssignedUserIds = ref<string[]>([]);

const availableKeyword = ref('');
const assignedKeyword = ref('');
const selectedAvailableKeys = ref<string[]>([]);
const selectedAssignedKeys = ref<string[]>([]);

const pageLoading = ref(false);
const saving = ref(false);

const filterOption = (input: string, option?: RoleOption) =>
	(option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const toSelectableItem = (user: UserManagerInfo): RbacSelectableItem => ({
	key: String(user.id),
	title: user.nickName || user.username || String(user.id),
	description: user.username,
	meta: user.orgName,
});

const availableItems = computed<RbacSelectableItem[]>(() => {
	const assignedSet = new Set(draftAssignedUserIds.value);
	const keyword = availableKeyword.value.trim().toLowerCase();
	return allUsers.value
		.filter((user) => user.id && !assignedSet.has(String(user.id)))
		.filter(
			(user) =>
				!keyword ||
				(user.nickName || '').toLowerCase().includes(keyword) ||
				(user.username || '').toLowerCase().includes(keyword),
		)
		.map(toSelectableItem);
});

const assignedItems = computed<RbacSelectableItem[]>(() => {
	const keyword = assignedKeyword.value.trim().toLowerCase();
	return draftAssignedUserIds.value
		.map((id) => userMap.value.get(id))
		.filter((user): user is UserManagerInfo => !!user)
		.filter(
			(user) =>
				!keyword ||
				(user.nickName || '').toLowerCase().includes(keyword) ||
				(user.username || '').toLowerCase().includes(keyword),
		)
		.map(toSelectableItem);
});

const hasChanges = computed(() => {
	const initial = new Set(initialAssignedUserIds.value);
	const draft = new Set(draftAssignedUserIds.value);
	if (initial.size !== draft.size) return true;
	return [...initial].some((id) => !draft.has(id));
});

const buildDiffItem = (id: string): RbacDiffItem => {
	const user = userMap.value.get(id);
	return {
		key: id,
		label: user ? `${user.nickName || user.username}（${user.username}）` : id,
	};
};

const diffAdded = computed<RbacDiffItem[]>(() => {
	const initial = new Set(initialAssignedUserIds.value);
	return draftAssignedUserIds.value
		.filter((id) => !initial.has(id))
		.map(buildDiffItem);
});

const diffRemoved = computed<RbacDiffItem[]>(() => {
	const draft = new Set(draftAssignedUserIds.value);
	return initialAssignedUserIds.value
		.filter((id) => !draft.has(id))
		.map(buildDiffItem);
});

const diffUnchanged = computed<RbacDiffItem[]>(() => {
	const draft = new Set(draftAssignedUserIds.value);
	return initialAssignedUserIds.value
		.filter((id) => draft.has(id))
		.map(buildDiffItem);
});

const handleAdd = () => {
	const merged = new Set([
		...draftAssignedUserIds.value,
		...selectedAvailableKeys.value.map(String),
	]);
	draftAssignedUserIds.value = Array.from(merged);
	selectedAvailableKeys.value = [];
};

const handleRemove = () => {
	const removeSet = new Set(selectedAssignedKeys.value.map(String));
	draftAssignedUserIds.value = draftAssignedUserIds.value.filter(
		(id) => !removeSet.has(id),
	);
	selectedAssignedKeys.value = [];
};

const resetDraft = () => {
	draftAssignedUserIds.value = [...initialAssignedUserIds.value];
	selectedAvailableKeys.value = [];
	selectedAssignedKeys.value = [];
};

const handleSave = async () => {
	if (!selectedRoleId.value) return;
	saving.value = true;
	try {
		const { code, message: messageInfo } = await assignRoleUsers(
			selectedRoleId.value,
			draftAssignedUserIds.value,
		);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			initialAssignedUserIds.value = [...draftAssignedUserIds.value];
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		saving.value = false;
	}
};

const loadRoleUsers = async (roleId: string) => {
	pageLoading.value = true;
	try {
		const { code, data, message: messageInfo } = await getRoleInfoDetail(roleId);
		if (code === '200') {
			const list =
				(data as unknown as { roleUserInfoVoList?: { userId?: string; id?: string }[] })
					?.roleUserInfoVoList || [];
			const ids = list.map((item) => String(item.userId || item.id));
			initialAssignedUserIds.value = ids;
			draftAssignedUserIds.value = [...ids];
		} else {
			message.error(messageInfo || '加载角色用户关系失败！');
		}
	} finally {
		pageLoading.value = false;
		selectedAvailableKeys.value = [];
		selectedAssignedKeys.value = [];
	}
};

const onRoleChange = (roleId: string) => {
	if (roleId) loadRoleUsers(roleId);
};

const loadRoleOptions = async () => {
	const { code, data, message: messageInfo } = await getRoleInfoPage(
		{ status: '1' },
		1,
		1000,
	);
	if (code === '200') {
		roleOptions.value = (data?.records || []).map((role: RoleInfoData) => ({
			label: role.roleName || '',
			value: String(role.id),
		}));
	} else {
		message.error(messageInfo || '加载角色列表失败！');
	}
};

const loadUsers = async () => {
	const { code, data, message: messageInfo } = await getUserManagerList({
		status: '1',
	});
	if (code === '200') {
		allUsers.value = (data || []).map((user) => ({
			...user,
			id: String(user.id),
		}));
	} else {
		message.error(messageInfo || '加载用户列表失败！');
	}
};

const init = async () => {
	await Promise.all([loadRoleOptions(), loadUsers()]);
};

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.page-info {
	background: #fff;
	padding: 24px;
	border-radius: 8px;

	.toolbar {
		margin-bottom: 16px;

		.toolbar__label {
			color: #333;
			font-weight: 500;
		}
	}

	.footer-bar {
		margin-top: 16px;
		text-align: right;
	}
}
</style>
