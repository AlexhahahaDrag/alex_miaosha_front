<template>
	<div
		class="role-user-page flex flex-col gap-3 h-[calc(100vh-110px)] overflow-hidden"
	>
		<!-- 顶部标题与角色选择工具栏 -->
		<div
			class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] shrink-0"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2.5">
					<div
						class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20"
					>
						<TeamOutlined class="text-base" />
					</div>
					<div>
						<div class="flex items-center gap-2 flex-wrap">
							<h2
								class="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight m-0"
							>
								角色-用户关系配置
							</h2>
							<span
								v-if="selectedRoleOrgNames"
								class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800"
							>
								角色适用机构: {{ selectedRoleOrgNames }}
							</span>
							<span
								v-else
								class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800"
							>
								批量分配角色关联成员并预览变更差异
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2.5 flex-wrap">
					<div class="flex items-center gap-2">
						<span
							class="text-xs font-semibold text-slate-600 dark:text-slate-300"
						>
							目标角色:
						</span>
						<a-select
							v-model:value="selectedRoleId"
							:options="roleOptions"
							placeholder="请选择要分配成员的角色"
							show-search
							:filter-option="filterOption"
							class="w-64"
							data-testid="rbac-role-user-select-role"
							@change="onRoleChange"
						/>
					</div>

					<a-button
						class="rounded-lg text-slate-600 dark:text-slate-300"
						@click="router.back()"
					>
						返回角色管理
					</a-button>
				</div>
			</div>
		</div>

		<!-- 主体双栏穿梭与差异预览区 -->
		<div
			class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex-1 flex flex-col min-h-0 overflow-y-auto"
		>
			<div
				v-if="!selectedRoleId"
				class="flex-1 flex flex-col items-center justify-center py-16"
			>
				<a-empty
					description="请先在右上角选择角色，随后可在双栏中批量调整该角色下的绑定成员"
				/>
			</div>

			<div v-else class="flex flex-col gap-3.5 flex-1">
				<rbac-dual-list-selector
					available-title="全部可分配用户"
					assigned-title="已分配该角色的用户"
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
					description="保存后将全量替换该角色的用户绑定关系，并刷新受影响用户的权限缓存"
					:added="diffAdded"
					:removed="diffRemoved"
					:unchanged="diffUnchanged"
				/>

				<div
					class="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
				>
					<span class="text-xs text-slate-400 dark:text-slate-500">
						提示：被分配用户的所属机构须与该角色绑定的机构存在交集。
					</span>
					<div class="flex items-center gap-2">
						<a-button
							:disabled="!hasChanges"
							class="rounded-lg"
							data-testid="rbac-role-user-btn-reset"
							@click="resetDraft"
						>
							重置变更
						</a-button>
						<a-button
							type="primary"
							:disabled="!hasChanges"
							:loading="saving"
							class="rounded-lg font-medium"
							data-testid="rbac-role-user-btn-save"
							@click="handleSave"
						>
							保存分配
						</a-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { TeamOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { RbacDiffItem, RbacSelectableItem } from '@/components/rbac';
import {
	getRoleInfoPage,
	getRoleInfoDetail,
	assignRoleUsers,
} from '@/views/user/roleInfo/api';
import type { RoleInfoData, RoleUserItem } from '@/views/user/roleInfo/config';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';

interface RoleOption {
	label: string;
	value: string;
	orgNames?: string;
}

const router = useRouter();
const route = useRoute();

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

const selectedRoleOrgNames = computed(() => {
	if (!selectedRoleId.value) return '';
	const found = roleOptions.value.find(
		(r) => r.value === String(selectedRoleId.value),
	);
	return found?.orgNames || '';
});

const initialAssignedUserIds = ref<string[]>([]);
const draftAssignedUserIds = ref<string[]>([]);

const availableKeyword = ref('');
const assignedKeyword = ref('');
const selectedAvailableKeys = ref<string[]>([]);
const selectedAssignedKeys = ref<string[]>([]);

const pageLoading = ref<boolean>(false);
const saving = ref<boolean>(false);

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
			String(selectedRoleId.value),
			draftAssignedUserIds.value.map(String),
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
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoDetail(roleId);
		if (code === '200' && data) {
			const list = data.roleUserInfoVoList || [];
			const ids = list
				.map((item: RoleUserItem) => String(item.userId || item.id || ''))
				.filter(Boolean);
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
	if (roleId) loadRoleUsers(String(roleId));
};

const loadRoleOptions = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getRoleInfoPage({ status: '1' }, 1, 1000);
	if (code === '200') {
		roleOptions.value = (data?.records || []).map((role: RoleInfoData) => ({
			label: `${role.roleName || ''}${role.roleCode ? ` (${role.roleCode})` : ''}`,
			value: String(role.id),
			orgNames: role.orgNames,
		}));
	} else {
		message.error(messageInfo || '加载角色列表失败！');
	}
};

const loadUsers = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getUserManagerList({
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

onMounted(async () => {
	await Promise.all([loadRoleOptions(), loadUsers()]);
	if (route.query.roleId) {
		selectedRoleId.value = String(route.query.roleId);
		loadRoleUsers(selectedRoleId.value);
	}
});
</script>
