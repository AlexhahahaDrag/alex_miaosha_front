<template>
	<a-drawer
		:open="open"
		:width="720"
		placement="right"
		:destroy-on-close="true"
		class="org-user-drawer"
		@update:open="(val) => emit('update:open', val)"
	>
		<!-- 抽屉头部 -->
		<template #title>
			<div class="flex items-center justify-between pr-4">
				<div class="flex items-center gap-3">
					<div
						class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base border border-blue-100 dark:border-blue-900/60 shadow-2xs"
					>
						<TeamOutlined />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<h3 class="text-base font-bold text-slate-800 dark:text-slate-100 m-0">
								【{{ org?.orgName || '机构' }}】成员管理
							</h3>
							<span
								v-if="org?.orgCode"
								class="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
							>
								{{ org.orgCode }}
							</span>
						</div>
						<p class="text-xs text-slate-400 dark:text-slate-500 m-0 mt-0.5">
							管理该机构下的直属成员，单个用户仅能归属一个有效机构
						</p>
					</div>
				</div>
			</div>
		</template>

		<!-- 抽屉主体 -->
		<div class="p-1 flex flex-col gap-4">
			<!-- 工具栏：搜索 + 统计 + 添加成员入口 -->
			<div
				class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800"
			>
				<div class="flex items-center gap-2.5 flex-1">
					<a-input-search
						v-model:value="searchKeyword"
						placeholder="搜索成员姓名 / 账号 / 手机号..."
						allow-clear
						class="max-w-xs rounded-lg"
						@search="handleSearch"
						@pressEnter="handleSearch"
					/>
					<a-button
						type="text"
						size="small"
						class="text-slate-400 hover:text-slate-600"
						@click="handleResetSearch"
					>
						<template #icon><ReloadOutlined /></template>
					</a-button>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-xs text-slate-400 font-mono">
						共 <strong class="text-slate-700 dark:text-slate-200">{{ pagination.total }}</strong> 人
					</span>
					<a-button
						type="primary"
						class="rounded-lg shadow-xs font-medium inline-flex items-center gap-1.5"
						@click="openAddModal"
					>
						<template #icon><UserAddOutlined /></template>
						添加成员
					</a-button>
				</div>
			</div>

			<!-- 成员列表表格 -->
			<a-table
				:columns="columns"
				:data-source="dataSource"
				:loading="loading"
				:pagination="pagination"
				:row-key="(record: UserManagerInfo) => String(record.id)"
				size="middle"
				class="modern-member-table"
				@change="handleTableChange"
			>
				<!-- 空状态 -->
				<template #emptyText>
					<div class="py-12 text-center text-slate-400">
						<TeamOutlined class="text-4xl text-slate-300 dark:text-slate-700 mb-2" />
						<p class="text-sm m-0">当前机构暂无关联成员</p>
						<p class="text-xs text-slate-400 m-0 mt-1">
							点击右上角「添加成员」可分配员工至本机构
						</p>
					</div>
				</template>

				<template #bodyCell="{ column, record }">
					<!-- 用户姓名 / 账号 -->
					<template v-if="column.key === 'userInfo'">
						<div class="flex items-center gap-2.5 py-1">
							<div
								class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-100 dark:border-indigo-900/40"
							>
								{{ (record.nickName || record.username || '用').charAt(0).toUpperCase() }}
							</div>
							<div class="flex flex-col min-w-0">
								<span class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
									{{ record.nickName || '未命名' }}
								</span>
								<span class="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
									@{{ record.username }}
								</span>
							</div>
						</div>
					</template>

					<!-- 手机号 -->
					<template v-else-if="column.key === 'mobile'">
						<span class="font-mono text-xs text-slate-600 dark:text-slate-300">
							{{ record.mobile || '—' }}
						</span>
					</template>

					<!-- 状态胶囊 -->
					<template v-else-if="column.key === 'status'">
						<span
							v-if="record.status === '1'"
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							正常
						</span>
						<span
							v-else
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
							停用
						</span>
					</template>

					<!-- 操作列 -->
					<template v-else-if="column.key === 'action'">
						<a-popconfirm
							title="确定将该用户从本机构移出吗？"
							description="移出后，该用户的机构归属将被清空，需重新分配。"
							ok-text="确认移出"
							cancel-text="取消"
							ok-type="danger"
							@confirm="handleRemoveMember(record)"
						>
							<a-button type="link" danger size="small" class="!px-1">
								移出机构
							</a-button>
						</a-popconfirm>
					</template>
				</template>
			</a-table>
		</div>

		<!-- 抽屉底部关闭按钮 -->
		<template #footer>
			<div class="flex justify-end">
				<a-button @click="emit('update:open', false)">关闭</a-button>
			</div>
		</template>

		<!-- 添加成员弹窗 -->
		<a-modal
			v-model:open="addModalVisible"
			:title="`添加成员至【${org?.orgName || '当前机构'}】`"
			width="520px"
			:confirm-loading="addLoading"
			:destroy-on-close="true"
			@ok="handleConfirmAdd"
		>
			<div class="py-3 flex flex-col gap-4">
				<a-alert
					message="单用户唯一有效机构规则"
					description="系统严格保障单用户仅归属单一机构。若选择的用户已有归属机构，确认添加后系统将自动将其调整至当前机构。"
					type="info"
					show-icon
				/>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-slate-600 dark:text-slate-300">
						选择候选用户 <span class="text-red-500">*</span>
					</label>
					<a-select
						v-model:value="selectedUserId"
						show-search
						placeholder="输入姓名或账号搜索候选用户..."
						:filter-option="false"
						:options="candidateOptions"
						:loading="candidateLoading"
						style="width: 100%"
						@search="fetchCandidates"
						@change="onCandidateSelect"
					>
						<template #option="{ label, username, orgName }">
							<div class="flex items-center justify-between py-0.5">
								<span class="font-medium text-slate-800">{{ label }}</span>
								<span class="text-xs text-slate-400 font-mono">
									@{{ username }}
									<span v-if="orgName" class="ml-1 text-slate-500">({{ orgName }})</span>
								</span>
							</div>
						</template>
					</a-select>
				</div>

				<!-- 选中用户详情与调动预警 -->
				<div
					v-if="selectedCandidate"
					class="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-2"
				>
					<div class="flex items-center justify-between">
						<span class="text-xs text-slate-500">已选用户：</span>
						<span class="text-sm font-bold text-slate-800 dark:text-slate-100">
							{{ selectedCandidate.nickName || selectedCandidate.username }}
							<span class="font-normal font-mono text-xs text-slate-400">(@{{ selectedCandidate.username }})</span>
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-slate-500">当前归属机构：</span>
						<span
							v-if="selectedCandidate.orgName"
							class="text-xs font-semibold text-amber-600 dark:text-amber-400"
						>
							{{ selectedCandidate.orgName }}
						</span>
						<span v-else class="text-xs text-slate-400">
							暂无归属机构（直接调入）
						</span>
					</div>
					<div
						v-if="selectedCandidate.orgName && selectedCandidate.orgId !== String(org?.id)"
						class="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-start gap-1"
					>
						<ExclamationCircleOutlined class="mt-0.5 flex-shrink-0" />
						<span>调动提醒：添加后，该用户将从原机构【{{ selectedCandidate.orgName }}】移出并加入本机构。</span>
					</div>
					<div
						v-else-if="selectedCandidate.orgId === String(org?.id)"
						class="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-start gap-1"
					>
						<ExclamationCircleOutlined class="mt-0.5 flex-shrink-0" />
						<span>该用户已在本机构中，无需重复添加。</span>
					</div>
				</div>
			</div>
		</a-modal>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getUserManagerPage, getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { addOrgUserInfo, unassignOrgUser } from '@/views/user/orgInfo/api';

const props = defineProps<{
	open: boolean;
	org?: OrgInfoData | null;
}>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
	(e: 'change'): void;
}>();

const loading = ref<boolean>(false);
const dataSource = ref<UserManagerInfo[]>([]);
const searchKeyword = ref<string>('');

const pagination = reactive<TablePaginationConfig>({
	current: 1,
	pageSize: 10,
	total: 0,
	showSizeChanger: true,
	showQuickJumper: true,
	showTotal: (total: number) => `共 ${total} 人`,
});

const columns: TableColumnsType = [
	{
		title: '成员信息',
		key: 'userInfo',
		width: 220,
	},
	{
		title: '手机号',
		key: 'mobile',
		width: 140,
	},
	{
		title: '状态',
		key: 'status',
		width: 90,
		align: 'center',
	},
	{
		title: '操作',
		key: 'action',
		width: 100,
		align: 'center',
		fixed: 'right',
	},
];

// 加载当前机构直属成员列表
const loadMembers = async () => {
	if (!props.org?.id) return;
	loading.value = true;
	try {
		const query: UserManagerInfo = {
			orgId: String(props.org.id),
		};
		if (searchKeyword.value.trim()) {
			query.keyword = searchKeyword.value.trim();
		}
		const res = await getUserManagerPage(
			query,
			pagination.current ?? 1,
			pagination.pageSize ?? 10,
		);
		const { code, data, message: messageInfo } = res || {};
		if (code === '200') {
			dataSource.value = (data?.records || []).map((user) => ({
				...user,
				id: String(user.id),
			}));
			pagination.total = data?.total ?? 0;
		} else {
			message.error(messageInfo || '加载机构成员列表失败！');
		}
	} catch {
		message.error('加载成员异常，请重试');
	} finally {
		loading.value = false;
	}
};

const handleTableChange = (pag: TablePaginationConfig) => {
	pagination.current = pag.current ?? 1;
	pagination.pageSize = pag.pageSize ?? 10;
	loadMembers();
};

const handleSearch = () => {
	pagination.current = 1;
	loadMembers();
};

const handleResetSearch = () => {
	searchKeyword.value = '';
	pagination.current = 1;
	loadMembers();
};

// 移出机构
const handleRemoveMember = async (record: UserManagerInfo) => {
	if (!props.org?.id || !record.id) return;
	try {
		const res = await unassignOrgUser(String(record.id), String(props.org.id));
		const { code, message: messageInfo } = res || {};
		if (code === '200') {
			message.success(messageInfo || '已将该成员从机构中移出');
			await loadMembers();
			emit('change');
		} else {
			message.error(messageInfo || '移出成员失败！');
		}
	} catch {
		message.error('移出成员异常，请重试');
	}
};

// 添加成员弹窗状态
const addModalVisible = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const candidateLoading = ref<boolean>(false);
const selectedUserId = ref<string>();
const candidateOptions = ref<Array<{ label: string; value: string; username: string; orgName?: string; user: UserManagerInfo }>>([]);
const selectedCandidate = ref<UserManagerInfo | null>(null);

const openAddModal = () => {
	selectedUserId.value = undefined;
	selectedCandidate.value = null;
	candidateOptions.value = [];
	addModalVisible.value = true;
	fetchCandidates('');
};

// 异步搜索候选用户
let searchTimer: ReturnType<typeof setTimeout> | null = null;
const fetchCandidates = (query: string) => {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(async () => {
		candidateLoading.value = true;
		try {
			const res = await getUserManagerList({
				keyword: query.trim() || undefined,
				status: '1',
			});
			const { code, data } = res || {};
			if (code === '200') {
				candidateOptions.value = (data || []).map((user) => ({
					label: user.nickName || user.username || String(user.id),
					value: String(user.id),
					username: user.username || '',
					orgName: user.orgName,
					user: {
						...user,
						id: String(user.id),
					},
				}));
			}
		} finally {
			candidateLoading.value = false;
		}
	}, 200);
};

const onCandidateSelect = (val: string) => {
	const found = candidateOptions.value.find((opt) => opt.value === val);
	selectedCandidate.value = found?.user || null;
};

// 确认添加成员
const handleConfirmAdd = async () => {
	if (!props.org?.id || !selectedUserId.value) {
		message.warning('请选择需要添加的用户');
		return;
	}
	if (selectedCandidate.value?.orgId === String(props.org.id)) {
		message.info('该用户已是本机构成员');
		addModalVisible.value = false;
		return;
	}
	addLoading.value = true;
	try {
		const res = await addOrgUserInfo({
			orgId: String(props.org.id),
			userId: String(selectedUserId.value),
			status: '1',
		});
		const { code, message: messageInfo } = res || {};
		if (code === '200') {
			message.success(messageInfo || '添加机构成员成功！');
			addModalVisible.value = false;
			await loadMembers();
			emit('change');
		} else {
			message.error(messageInfo || '添加失败！');
		}
	} catch {
		message.error('添加成员异常，请重试');
	} finally {
		addLoading.value = false;
	}
};

watch(
	() => [props.open, props.org?.id],
	([newOpen, newOrgId]) => {
		if (newOpen && newOrgId) {
			pagination.current = 1;
			searchKeyword.value = '';
			loadMembers();
		} else {
			dataSource.value = [];
		}
	},
	{ immediate: true },
);
</script>

<style scoped>
.modern-member-table :deep(.ant-table-thead > tr > th) {
	background-color: rgb(248 250 252);
	font-weight: 600;
	font-size: 13px;
	color: rgb(71 85 105);
}
</style>
