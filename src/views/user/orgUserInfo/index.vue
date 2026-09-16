<template>
	<div class="page-info">
		<a-alert
			message="机构-用户关系配置"
			description="选择机构后，在下方双栏中调整已分配用户；单个用户仅能拥有一个有效机构，添加即会覆盖其原机构归属。"
			type="info"
			show-icon
			style="margin-bottom: 16px"
		/>
		<div class="toolbar">
			<a-space>
				<span class="toolbar__label">选择机构：</span>
				<a-select
					v-model:value="selectedOrgId"
					:options="orgOptions"
					placeholder="请选择机构"
					show-search
					:filter-option="filterOption"
					style="width: 260px"
					data-testid="rbac-org-user-select-org"
					@change="onOrgChange"
				/>
			</a-space>
		</div>

		<a-empty v-if="!selectedOrgId" description="请先选择机构" />
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
				description="保存后按单用户唯一有效机构规则同步新增/移除关系"
				:added="diffAdded"
				:removed="diffRemoved"
				:unchanged="diffUnchanged"
				style="margin-top: 16px"
			/>

			<div class="footer-bar">
				<a-space>
					<a-button
						:disabled="!hasChanges"
						data-testid="rbac-org-user-btn-reset"
						@click="resetDraft"
					>
						重置
					</a-button>
					<a-button
						type="primary"
						:disabled="!hasChanges"
						:loading="saving"
						data-testid="rbac-org-user-btn-save"
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
import {
	getOrgUserInfoPage,
	addOrgUserInfo,
	deleteOrgUserInfo,
} from '@/views/user/orgUserInfo/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';

interface OrgOption {
	label: string;
	value: string;
}

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

// 已存在的机构-用户关系：userId -> 关系记录 id（用于保存时精确删除）
const initialRelationMap = ref<Record<string, string>>({});
const draftAssignedUserIds = ref<string[]>([]);

const availableKeyword = ref('');
const assignedKeyword = ref('');
const selectedAvailableKeys = ref<string[]>([]);
const selectedAssignedKeys = ref<string[]>([]);

const pageLoading = ref(false);
const saving = ref(false);

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
	const initialIds = new Set(Object.keys(initialRelationMap.value));
	const draftIds = new Set(draftAssignedUserIds.value);
	const toAdd = [...draftIds].filter((id) => !initialIds.has(id));
	const toRemoveRelationIds = [...initialIds]
		.filter((id) => !draftIds.has(id))
		.map((id) => initialRelationMap.value[id])
		.filter((relationId): relationId is string => !!relationId);

	saving.value = true;
	try {
		const tasks: Promise<{ code: string; message: string }>[] = [];
		if (toAdd.length) {
			toAdd.forEach((userId) => {
				tasks.push(
					addOrgUserInfo({
						orgId: selectedOrgId.value,
						userId,
						status: '1',
					}),
				);
			});
		}
		if (toRemoveRelationIds.length) {
			tasks.push(deleteOrgUserInfo(toRemoveRelationIds.join(',')));
		}
		const results = await Promise.all(tasks);
		const failed = results.find((result) => result.code !== '200');
		if (failed) {
			message.error(failed.message || '保存失败！');
		} else {
			message.success('保存成功！');
		}
	} finally {
		saving.value = false;
		await loadOrgUsers(selectedOrgId.value);
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
	if (orgId) loadOrgUsers(orgId);
};

const loadOrgOptions = async () => {
	const { code, data, message: messageInfo } = await getOrgInfoPage(
		{ status: '1' },
		1,
		1000,
	);
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
	await Promise.all([loadOrgOptions(), loadUsers()]);
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
