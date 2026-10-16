<template>
	<div
		class="org-user-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors flex flex-col gap-5"
	>
		<!-- 1. 顶部标题与目标机构选择工具栏 -->
		<div
			class="screen-header bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-xs transition-colors shrink-0"
		>
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-center gap-2.5">
					<span
						class="w-2.5 h-6 rounded-full bg-blue-600 flex-shrink-0 shadow-xs"
					></span>
					<div>
						<div class="flex items-center gap-2.5 flex-wrap">
							<h1
								class="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0"
							>
								机构-用户关系配置
							</h1>
							<span
								class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800"
							>
								批量调配机构归属成员与权限缓存同步
							</span>
						</div>
						<p
							class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 font-normal"
						>
							选择目标机构，在双栏穿梭面板中灵活调入或移出直属用户，实时预览变更差异
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2.5 flex-wrap">
					<div class="flex items-center gap-2">
						<span
							class="text-xs font-semibold text-slate-600 dark:text-slate-300"
						>
							目标机构:
						</span>
						<a-select
							v-model:value="selectedOrgId"
							:options="orgOptions"
							placeholder="请选择要调配成员的机构"
							show-search
							:filter-option="filterOption"
							class="w-64 rounded-lg"
							data-testid="rbac-org-user-select-org"
							@change="onOrgChange"
						/>
					</div>

					<a-button
						class="rounded-lg text-slate-600 dark:text-slate-300 px-3.5 inline-flex items-center gap-1.5"
						@click="router.back()"
					>
						<template #icon><ArrowLeftOutlined /></template>
						返回上一页
					</a-button>
				</div>
			</div>
		</div>

		<!-- 2. 主体双栏穿梭与差异预览面板 -->
		<div
			class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex-1 flex flex-col min-h-0 overflow-y-auto"
		>
			<div
				v-if="!selectedOrgId"
				class="flex-1 flex flex-col items-center justify-center py-16"
			>
				<a-empty
					description="请先在右上角选择目标机构，随后可在双栏中批量调配机构成员"
				/>
			</div>

			<div v-else class="flex flex-col gap-4 flex-1">
				<rbac-dual-list-selector
					available-title="可调入用户"
					assigned-title="当前机构成员"
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
					description="保存后将同步更新机构归属并主动刷新受影响成员的权限缓存"
					:added="diffAdded"
					:removed="diffRemoved"
					:unchanged="diffUnchanged"
				/>

				<div
					class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
				>
					<span class="text-xs text-slate-400 dark:text-slate-500">
						提示：也可在「机构管理」列表行内点击「成员」抽屉按分页管理成员。
					</span>
					<div class="flex items-center gap-2.5">
						<a-button
							:disabled="!hasChanges"
							class="rounded-lg px-4"
							data-testid="rbac-org-user-btn-reset"
							@click="resetDraft"
						>
							重置变更
						</a-button>
						<a-button
							type="primary"
							:disabled="!hasChanges"
							:loading="saving"
							class="rounded-lg px-4 font-medium shadow-xs"
							data-testid="rbac-org-user-btn-save"
							@click="handleSave"
						>
							保存调配
						</a-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { RbacDiffItem, RbacSelectableItem } from '@/components/rbac';
import {
	getOrgUserInfoPage,
	addOrgUserInfo,
	unassignOrgUser,
} from '@/views/user/orgUserInfo/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';

interface OrgOption {
	label: string;
	value: string;
}

const router = useRouter();
const route = useRoute();

const orgOptions = ref<OrgOption[]>([]);
const selectedOrgId = ref<string>();
const allUsers = ref<UserManagerInfo[]>([]);
const userMap = computed(() => {
	const map = new Map<string, UserManagerInfo>();
	allUsers.value.forEach((user) => {
		if (user.id) map.set(String(user.id), user);
	});
	return map;
});

const initialRelationMap = ref<Record<string, string>>({});
const draftAssignedUserIds = ref<string[]>([]);

const availableKeyword = ref('');
const assignedKeyword = ref('');
const selectedAvailableKeys = ref<string[]>([]);
const selectedAssignedKeys = ref<string[]>([]);

const pageLoading = ref<boolean>(false);
const saving = ref<boolean>(false);

const filterOption = (input: string, option?: OrgOption) =>
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
	const initial = new Set(Object.keys(initialRelationMap.value));
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
	const initial = new Set(Object.keys(initialRelationMap.value));
	return draftAssignedUserIds.value
		.filter((id) => !initial.has(id))
		.map(buildDiffItem);
});

const diffRemoved = computed<RbacDiffItem[]>(() => {
	const draft = new Set(draftAssignedUserIds.value);
	return Object.keys(initialRelationMap.value)
		.filter((id) => !draft.has(id))
		.map(buildDiffItem);
});

const diffUnchanged = computed<RbacDiffItem[]>(() => {
	const draft = new Set(draftAssignedUserIds.value);
	return Object.keys(initialRelationMap.value)
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
	draftAssignedUserIds.value = Object.keys(initialRelationMap.value);
	selectedAvailableKeys.value = [];
	selectedAssignedKeys.value = [];
};

const handleSave = async () => {
	if (!selectedOrgId.value) return;
	const targetOrgId = String(selectedOrgId.value);
	const initialIds = new Set(Object.keys(initialRelationMap.value));
	const draftIds = new Set(draftAssignedUserIds.value);
	const toAddUserIds = [...draftIds].filter((id) => !initialIds.has(id));
	const toRemoveUserIds = [...initialIds].filter((id) => !draftIds.has(id));

	saving.value = true;
	try {
		const tasks: Promise<{ code: string; message?: string }>[] = [];
		toAddUserIds.forEach((userId) => {
			tasks.push(
				addOrgUserInfo({
					orgId: targetOrgId,
					userId: String(userId),
					status: '1',
				}),
			);
		});
		// 移除统一走 unassignOrgUser，确保置为失效态并主动清理 Redis permission_context 缓存
		toRemoveUserIds.forEach((userId) => {
			tasks.push(unassignOrgUser(String(userId), targetOrgId));
		});

		const results = await Promise.all(tasks);
		const failed = results.find((result) => result.code !== '200');
		if (failed) {
			message.error(failed.message || '保存失败！');
		} else {
			message.success('保存成功！');
		}
	} finally {
		saving.value = false;
		await Promise.all([loadOrgUsers(targetOrgId), loadUsers()]);
	}
};

const loadOrgUsers = async (orgId: string) => {
	pageLoading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getOrgUserInfoPage({ orgId, status: '1' }, 1, 1000);
		if (code === '200') {
			const relationMap: Record<string, string> = {};
			(data?.records || []).forEach((row) => {
				if (row.userId && row.id) {
					relationMap[String(row.userId)] = String(row.id);
				}
			});
			initialRelationMap.value = relationMap;
			draftAssignedUserIds.value = Object.keys(relationMap);
		} else {
			message.error(messageInfo || '加载机构用户关系失败！');
		}
	} finally {
		pageLoading.value = false;
		selectedAvailableKeys.value = [];
		selectedAssignedKeys.value = [];
	}
};

const onOrgChange = (orgId: string) => {
	if (orgId) loadOrgUsers(String(orgId));
};

const loadOrgOptions = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getOrgInfoPage({ status: '1' }, 1, 1000);
	if (code === '200') {
		orgOptions.value = (data?.records || []).map((org: OrgInfoData) => ({
			label: org.orgName || '',
			value: String(org.id),
		}));
	} else {
		message.error(messageInfo || '加载机构列表失败！');
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
	await Promise.all([loadOrgOptions(), loadUsers()]);
	if (route.query.orgId) {
		selectedOrgId.value = String(route.query.orgId);
		loadOrgUsers(selectedOrgId.value);
	}
});
</script>
