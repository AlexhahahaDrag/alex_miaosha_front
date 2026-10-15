<template>
	<div
		class="user-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
	>
		<!-- 1. 页面头部与现代 KPI 指标概览 -->
		<div
			class="screen-header mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="w-2.5 h-6 rounded-full bg-blue-600 flex-shrink-0 shadow-xs"
					></span>
					<h1
						class="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0"
					>
						用户管理
					</h1>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal"
				>
					集中维护组织内用户账号、归属机构与角色权限分配
				</p>
			</div>
			<!-- 顶部现代统计指标卡 -->
			<div class="flex items-center gap-3">
				<div
					class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3"
				>
					<div
						class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-sm flex-shrink-0"
					>
						<TeamOutlined />
					</div>
					<div>
						<div
							class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight"
						>
							总用户数
						</div>
						<div
							class="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight mt-0.5"
						>
							{{ pagination.total || dataSource.length }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. Tailwind 紧凑单行高效搜索栏 -->
		<div
			class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 mb-5 shadow-xs transition-colors"
		>
			<a-form
				:model="searchInfo"
				layout="inline"
				class="flex flex-wrap items-center gap-y-3 gap-x-4"
			>
				<a-form-item label="用户名" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.username"
						placeholder="输入用户名搜索"
						data-testid="rbac-user-search-username"
						class="rounded-lg w-52"
						@keyup.enter="query(true)"
						@change="initPage"
						allow-clear
					>
						<template #prefix>
							<UserOutlined class="text-slate-400 text-xs mr-1" />
						</template>
					</a-input>
				</a-form-item>

				<a-form-item label="状态" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.status"
						placeholder="请选择状态"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="statusOptions"
						class="rounded-lg w-36"
						allow-clear
					/>
				</a-form-item>

				<a-form-item label="所属机构" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.orgId"
						placeholder="请选择机构"
						:options="orgOptions"
						show-search
						:filter-option="filterOption"
						class="rounded-lg w-48"
						allow-clear
					/>
				</a-form-item>

				<!-- 操作按钮组 -->
				<div class="flex items-center gap-2.5 ml-auto">
					<a-button
						type="primary"
						data-testid="rbac-user-btn-query"
						class="inline-flex items-center gap-1.5 rounded-lg px-4 shadow-xs"
						@click="query(true)"
					>
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button
						data-testid="rbac-user-btn-reset"
						class="inline-flex items-center gap-1.5 rounded-lg px-4"
						@click="cancelQuery"
					>
						<template #icon><ReloadOutlined /></template>
						清空
					</a-button>
				</div>
			</a-form>
		</div>

		<!-- 3. 一体化表格面板 -->
		<div
			class="table-card bg-[var(--card-bg)] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
		>
			<!-- 工具栏 -->
			<div
				class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
			>
				<div class="flex items-center gap-3">
					<span class="text-base font-bold text-slate-800 dark:text-slate-100"
						>用户列表</span
					>
					<span
						class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium"
					>
						共 {{ pagination.total || dataSource.length }} 人
					</span>
					<span
						v-if="selectedRowKeys.length > 0"
						class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-medium flex items-center gap-1.5"
					>
						<span>已选择 {{ selectedRowKeys.length }} 项</span>
						<a
							class="text-blue-500 hover:text-blue-700 underline text-xs cursor-pointer ml-1"
							@click="clearSelection"
						>
							取消
						</a>
					</span>
				</div>
				<div class="flex items-center gap-2.5">
					<a-button
						v-permission="'user:add'"
						type="primary"
						data-testid="rbac-user-btn-add"
						class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
						@click="editUser('add')"
					>
						<template #icon><PlusOutlined /></template>
						新增用户
					</a-button>

					<span v-permission="'user:delete'">
						<a-popconfirm
							v-if="selectedRowKeys.length > 0"
							:title="`确认批量删除选中的 ${selectedRowKeys.length} 位用户?`"
							ok-text="确认"
							cancel-text="取消"
							@confirm="batchDelUserManager"
						>
							<a-button
								type="primary"
								danger
								data-testid="rbac-user-btn-batch-delete"
								class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
							>
								<template #icon><DeleteOutlined /></template>
								批量删除 ({{ selectedRowKeys.length }})
							</a-button>
						</a-popconfirm>
						<a-button
							v-else
							type="primary"
							danger
							disabled
							data-testid="rbac-user-btn-batch-delete"
							class="inline-flex items-center gap-1.5 opacity-50 rounded-lg font-medium"
						>
							<template #icon><DeleteOutlined /></template>
							批量删除
						</a-button>
					</span>
				</div>
			</div>

			<!-- 表格 -->
			<div class="px-2 pt-2 pb-4">
				<a-table
					:dataSource="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: any) => record.id"
					:pagination="pagination"
					@change="handleTableChange"
					:scroll="{ x: 'max-content' }"
					:row-selection="rowSelection"
					data-testid="rbac-user-table"
					class="modern-user-table"
				>
					<template #bodyCell="{ column, record }">
						<!-- 操作列 -->
						<template v-if="column.key === 'operation'">
							<div class="flex items-center gap-1.5">
								<a-button
									type="text"
									size="small"
									data-testid="rbac-user-row-view"
									class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
									@click="viewUser(record.id)"
								>
									<template #icon><EyeOutlined /></template>
									查看
								</a-button>
								<a-button
									v-permission="'user:edit'"
									type="text"
									size="small"
									data-testid="rbac-user-row-edit"
									class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
									@click="editUser('update', record.id)"
								>
									<template #icon><EditOutlined /></template>
									编辑
								</a-button>
								<span
									v-if="record.username !== 'superman'"
									v-permission="'user:delete'"
								>
									<a-popconfirm
										title="确认删除该用户?"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delUser(record.id)"
									>
										<a-button
											type="text"
											size="small"
											danger
											data-testid="rbac-user-row-delete"
											class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 transition-colors"
										>
											<template #icon><DeleteOutlined /></template>
											删除
										</a-button>
									</a-popconfirm>
								</span>
							</div>
						</template>

						<!-- 复合用户信息（头像 + 昵称 + 账号） -->
						<template v-else-if="column.key === 'userInfo'">
							<div class="flex items-center gap-2.5">
								<div
									v-if="record.avatarUrl"
									class="w-9 h-9 rounded-full overflow-hidden shadow-2xs border border-slate-200/80 dark:border-slate-700 flex-shrink-0"
								>
									<a-image
										:width="36"
										:height="36"
										:src="record.avatarThumbnailUrl || record.avatarUrl"
										:preview="{ src: record.avatarUrl }"
										class="object-cover w-full h-full"
									/>
								</div>
								<div
									v-else
									class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs flex-shrink-0"
								>
									{{
										(record.nickName || record.username || 'U')
											.charAt(0)
											.toUpperCase()
									}}
								</div>
								<div class="flex flex-col min-w-0">
									<span
										class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate"
									>
										{{ record.nickName || record.username || '-' }}
									</span>
									<span
										class="text-xs text-slate-400 dark:text-slate-500 font-mono truncate"
									>
										@{{ record.username }}
									</span>
								</div>
							</div>
						</template>

						<!-- 状态开关 -->
						<template v-else-if="column.key === 'status'">
							<a-switch
								:checked="String(record.status) === '1'"
								:loading="!!statusLoadingMap[record.id]"
								:disabled="record.username === 'superman'"
								checked-children="启用"
								un-checked-children="禁用"
								data-testid="rbac-user-status-switch"
								@change="
									(checked) => handleStatusChange(record, Boolean(checked))
								"
							/>
						</template>

						<!-- 性别 -->
						<template v-else-if="column.key === 'gender'">
							<span
								v-if="String(record.gender) === '1'"
								class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
							>
								男
							</span>
							<span
								v-else-if="String(record.gender) === '2'"
								class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
							>
								女
							</span>
							<span v-else class="text-slate-400">-</span>
						</template>

						<!-- 所属机构（主机构 + 兼职机构徽标） -->
						<template v-else-if="column.key === 'orgName'">
							<div class="flex flex-col gap-1 items-start">
								<span
									v-if="record.orgName"
									class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
								>
									<span
										class="text-[10px] bg-blue-600 text-white rounded px-1 leading-tight font-medium"
										>主</span
									>
									{{ record.orgName }}
								</span>
								<span v-else class="text-slate-400 text-xs">-</span>

								<template v-if="record.auxiliaryOrgNames">
									<div class="flex flex-wrap gap-1 mt-0.5">
										<span
											v-for="auxOrg in record.auxiliaryOrgNames.split(',')"
											:key="auxOrg.trim()"
											class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
										>
											<span class="text-[10px] text-slate-400 font-medium">兼:</span>
											{{ auxOrg.trim() }}
										</span>
									</div>
								</template>
							</div>
						</template>

						<!-- 角色名称 -->
						<template v-else-if="column.key === 'roleName'">
							<div
								v-if="record.roleInfoVoList && record.roleInfoVoList.length > 0"
								class="flex flex-wrap gap-1"
							>
								<span
									v-for="role in record.roleInfoVoList"
									:key="role.id || role.roleCode || role.roleName"
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
								>
									{{ role.roleName || role.roleCode }}
								</span>
							</div>
							<div v-else-if="record.roleName" class="flex flex-wrap gap-1">
								<span
									v-for="role in record.roleName.split(',')"
									:key="role.trim()"
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
								>
									{{ role.trim() }}
								</span>
							</div>
							<span v-else class="text-slate-400">-</span>
						</template>
					</template>
				</a-table>
			</div>

			<!-- 详情抽屉/弹窗 -->
			<user-manager-detail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			>
			</user-manager-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/types/modal';
import type { PageInfo } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { columns } from '@/views/user/userManager/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import {
	getUserManagerPage,
	deleteUserManager,
	updateUserStatus,
} from '@/views/user/userManager/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import { message } from 'ant-design-vue';
import {
	SearchOutlined,
	ReloadOutlined,
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	UserOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';

interface FilterOption {
	label: string;
	value: string;
}

// Hooks
// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getUserPage(searchInfo.value, p),
	});
const { getDictByType } = useDictInfo('is_valid');

// State
const searchInfo = ref<UserManagerInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<UserManagerInfo[]>([]);
const modelInfo = ref<ModelInfo>({});
const orgOptions = ref<FilterOption[]>([]);
// 记录每行状态切换的 loading，避免秒杀高频操作下的重复点击
const statusLoadingMap = ref<Record<string, boolean>>({});
const statusOptions = computed(() => getDictByType('is_valid'));

// Actions
const filterOption = (input: string, option?: FilterOption) => {
	return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
};

const cancelQuery = () => {
	searchInfo.value = {};
	clearSelection();
	query(true);
};

const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	getUserPage(searchInfo.value, pagination);
};

const delUser = async (ids: string) => {
	const { code, message: messageInfo } = (await deleteUserManager(ids)) || {};
	if (code === '200') {
		message.success(messageInfo || '删除成功！', 3);
		clearSelection();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 启停状态切换（loading 防止连点重复提交）
const handleStatusChange = async (
	record: UserManagerInfo,
	checked: boolean,
) => {
	if (!record.id) return;
	const newStatus = checked ? '1' : '0';
	statusLoadingMap.value[record.id] = true;
	try {
		const { code, message: messageInfo } =
			(await updateUserStatus(record.id, newStatus)) || {};
		if (code === '200') {
			record.status = newStatus;
			message.success(messageInfo || '状态更新成功！', 3);
		} else {
			message.error(messageInfo || '状态更新失败！', 3);
		}
	} finally {
		statusLoadingMap.value[record.id] = false;
	}
};

// 批量删除用户信息（由外层 a-popconfirm 负责确认交互，杜绝双重弹窗）
const batchDelUserManager = () => {
	if (!selectedRowKeys.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delUser(selectedRowKeys.value.join(','));
};

// 查询用户信息分页数据
const getUserPage = async (param: UserManagerInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = (await getUserManagerPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	)) || {};
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

// 查看只读详情
function viewUser(id: string) {
	modelInfo.value = {
		title: '用户详情 (只读)',
		id,
		readonly: true,
		open: true,
	};
}

// 新增和修改弹窗
function editUser(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增用户' : '编辑用户',
		id: isAdd ? undefined : id,
		readonly: false,
		confirmLoading: true,
		open: true,
	};
}

const handleSuccess = () => {
	getUserPage(searchInfo.value, pagination);
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

const loadFilterOptions = async () => {
	const { code: orgCode, data: orgData } =
		(await getOrgInfoPage({ status: '1' }, 1, 1000)) || {};
	if (orgCode === '200') {
		orgOptions.value = (orgData?.records || []).map((o: OrgInfoData) => ({
			label: o.orgName || '',
			value: String(o.id),
		}));
	}
};

// Lifecycle
onMounted(async () => {
	initPage();
	await loadFilterOptions();
	getUserPage(searchInfo.value, pagination);
});
</script>
<style lang="scss" scoped>
.modern-user-table {
	:deep(.ant-table) {
		background: transparent;
	}

	:deep(.ant-table-thead > tr > th) {
		background: #f1f5f9;
		color: #334155;
		font-weight: 700;
		font-size: 13px;
		letter-spacing: 0.02em;
		border-bottom: 1px solid #e2e8f0;
		padding: 13px 16px;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #f1f5f9;
		padding: 12px 16px;
		transition: background-color 0.2s ease;
	}

	:deep(.ant-table-tbody > tr:hover > td) {
		background: #f8fafc !important;
	}

	:deep(.ant-pagination) {
		margin-top: 16px;
		padding-right: 12px;
	}
}

:global(html.dark) .modern-user-table {
	:deep(.ant-table-thead > tr > th) {
		background: #0f172a;
		color: #94a3b8;
		border-bottom: 1px solid #1e293b;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #1e293b;
	}

	:deep(.ant-table-tbody > tr:hover > td) {
		background: #1e293b !important;
	}
}
</style>
