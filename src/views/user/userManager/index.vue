<template>
	<div
		class="user-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
	>
		<!-- 1. 页面头部、现代概览指标与数据范围提示 -->
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

			<!-- 顶部现代统计指标卡与数据范围提示 -->
			<div class="flex items-center gap-2.5 flex-wrap">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<TeamOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">总用户数</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
							{{ pagination?.total ?? dataSource.length }}
						</span>
					</div>
				</div>

				<span
					class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--card-bg)] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 shadow-2xs"
					data-testid="rbac-data-scope-hint"
				>
					{{ scopeHintText }}
				</span>
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
						placeholder="搜索用户名"
						data-testid="rbac-user-search-username"
						class="rounded-lg w-44"
						allow-clear
						@press-enter="() => query(true)"
					>
						<template #prefix>
							<UserOutlined class="text-slate-400 text-xs mr-1" />
						</template>
					</a-input>
				</a-form-item>

				<a-form-item label="状态" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.status"
						placeholder="全部状态"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="statusOptions"
						class="rounded-lg w-28"
						allow-clear
						@change="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="所属机构" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.orgId"
						placeholder="全部机构"
						:options="orgOptions"
						show-search
						:filter-option="filterOption"
						class="rounded-lg w-48"
						allow-clear
						@change="() => query(true)"
					/>
				</a-form-item>

				<!-- 操作按钮组 -->
				<div class="flex items-center gap-2.5 ml-auto">
					<a-button
						type="primary"
						data-testid="rbac-user-btn-query"
						class="rounded-lg px-4"
						@click="query(true)"
					>
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button
						data-testid="rbac-user-btn-reset"
						class="rounded-lg px-4"
						@click="cancelQuery"
					>
						<template #icon><ReloadOutlined /></template>
						清空
					</a-button>
				</div>
			</a-form>
		</div>

		<!-- 3. 一体化现代 SaaS 表格面板 -->
		<div
			class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
		>
			<!-- 工具栏 -->
			<div
				class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
			>
				<div class="flex items-center gap-2 flex-wrap">
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
							:disabled="!selectedRowKeys.length"
							:title="`确认批量删除选中的 ${selectedRowKeys.length} 位用户?`"
							ok-text="确认删除"
							cancel-text="取消"
							@confirm="batchDelUserManager"
						>
							<a-button
								danger
								:disabled="!selectedRowKeys.length"
								data-testid="rbac-user-btn-batch-delete"
								class="rounded-lg"
							>
								批量删除
								<span v-if="selectedRowKeys.length" class="ml-1 font-mono">
									({{ selectedRowKeys.length }})
								</span>
							</a-button>
						</a-popconfirm>
					</span>
				</div>

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden md:flex items-center gap-1.5">
					<InfoCircleOutlined class="text-blue-500" />
					<span>提示：点击状态开关可即时启用/禁用账号，支持兼任多机构与多角色</span>
				</div>
			</div>

			<!-- 表格 -->
			<div class="px-2 pt-2 pb-4">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: UserManagerInfo) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 1200 }"
					data-testid="rbac-user-table"
					class="modern-user-table"
					@change="handleTableChange"
				>
					<template #emptyText>
						<a-empty description="暂无符合条件的用户数据" />
					</template>

					<template #bodyCell="{ column, record }">
						<!-- 1. 复合用户信息（头像 + 昵称 + 账号药丸一键复制） -->
						<template v-if="column.key === 'userInfo'">
							<div class="flex items-center gap-2.5 py-1">
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
										class="text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate"
										:title="record.nickName || record.username"
									>
										{{ record.nickName || record.username || '-' }}
									</span>
									<div class="flex items-center gap-1 mt-0.5">
										<a-tooltip title="点击复制用户名">
											<span
												v-if="record.username"
												class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-mono text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 cursor-pointer transition-colors"
												@click="copyUsername(record.username)"
											>
												<span>@{{ record.username }}</span>
												<CopyOutlined class="text-[9px] opacity-70" />
											</span>
											<span v-else class="text-xs text-slate-300 dark:text-slate-600">-</span>
										</a-tooltip>
									</div>
								</div>
							</div>
						</template>

						<!-- 2. 所属机构（主机构 + 兼职机构徽标） -->
						<template v-else-if="column.key === 'orgName'">
							<div class="flex flex-col gap-1 items-start py-0.5">
								<span
									v-if="record.orgName"
									class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60"
								>
									<span
										class="text-[10px] bg-blue-600 text-white rounded px-1 leading-tight font-medium"
										>主</span
									>
									{{ record.orgName }}
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600 text-xs">-</span>

								<template v-if="record.auxiliaryOrgNames">
									<div class="flex flex-wrap gap-1 mt-0.5">
										<span
											v-for="auxOrg in record.auxiliaryOrgNames.split(',')"
											:key="auxOrg.trim()"
											class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
										>
											<span class="text-[10px] text-slate-400 font-medium">兼:</span>
											{{ auxOrg.trim() }}
										</span>
									</div>
								</template>
							</div>
						</template>

						<!-- 3. 角色名称 -->
						<template v-else-if="column.key === 'roleName'">
							<div
								v-if="record.roleInfoVoList && record.roleInfoVoList.length > 0"
								class="flex flex-wrap gap-1"
							>
								<span
									v-for="role in record.roleInfoVoList"
									:key="role.id || role.roleCode || role.roleName"
									class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70"
								>
									{{ role.roleName || role.roleCode }}
								</span>
							</div>
							<div v-else-if="record.roleName" class="flex flex-wrap gap-1">
								<span
									v-for="role in record.roleName.split(',')"
									:key="role.trim()"
									class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70"
								>
									{{ role.trim() }}
								</span>
							</div>
							<span v-else class="text-slate-300 dark:text-slate-600">-</span>
						</template>

						<!-- 4. 状态开关 -->
						<template v-else-if="column.key === 'status'">
							<a-switch
								:checked="String(record.status) === '1'"
								:loading="!!statusLoadingMap[String(record.id)]"
								:disabled="record.username === 'superman'"
								checked-children="启用"
								un-checked-children="禁用"
								data-testid="rbac-user-status-switch"
								@change="
									(checked) => handleStatusChange(record, Boolean(checked))
								"
							/>
						</template>

						<!-- 5. 性别 -->
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
							<span v-else class="text-slate-300 dark:text-slate-600">-</span>
						</template>

						<!-- 6. 生日 -->
						<template v-else-if="column.key === 'birthday'">
							<span
								v-if="record.birthday"
								class="text-xs text-slate-600 dark:text-slate-300 font-mono"
							>
								{{ formatDate(record.birthday) }}
							</span>
							<span v-else class="text-slate-300 dark:text-slate-600">-</span>
						</template>

						<!-- 7. 操作列 -->
						<template v-else-if="column.key === 'operation'">
							<div class="flex items-center justify-center gap-1">
								<a-button
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
									data-testid="rbac-user-row-view"
									@click="viewUser(String(record.id))"
								>
									<template #icon><EyeOutlined /></template>
									查看
								</a-button>

								<a-button
									v-permission="'user:edit'"
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400"
									data-testid="rbac-user-row-edit"
									@click="editUser('update', String(record.id))"
								>
									<template #icon><EditOutlined /></template>
									编辑
								</a-button>

								<span
									v-if="record.username !== 'superman'"
									v-permission="'user:delete'"
								>
									<a-popconfirm
										:title="`确认删除【${record.nickName || record.username}】?`"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delUser(String(record.id))"
									>
										<a-button
											type="link"
											size="small"
											danger
											class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400"
											data-testid="rbac-user-row-delete"
										>
											<template #icon><DeleteOutlined /></template>
											删除
										</a-button>
									</a-popconfirm>
								</span>
							</div>
						</template>
					</template>
				</a-table>
			</div>

			<!-- 详情抽屉/弹窗 -->
			<user-manager-detail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			/>
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
import { formatDate } from '@/utils/dayjs';
import {
	getUserManagerPage,
	deleteUserManager,
	updateUserStatus,
} from '@/views/user/userManager/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import { useDataScopeHint } from '@/composables/useDataScopeHint';
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
	CopyOutlined,
	InfoCircleOutlined,
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

// 使用分页组合式函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getUserPage(searchInfo.value, p),
	});

const { scopeHintText } = useDataScopeHint();
const { getDictByType } = useDictInfo('is_valid');

// State
const searchInfo = ref<UserManagerInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<UserManagerInfo[]>([]);
const modelInfo = ref<ModelInfo>({});
const orgOptions = ref<FilterOption[]>([]);
// 记录每行状态切换的 loading，避免高频操作下的重复点击
const statusLoadingMap = ref<Record<string, boolean>>({});
const statusOptions = computed(() => getDictByType('is_valid'));

// Actions
const filterOption = (input: string, option?: FilterOption) => {
	return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
};

const copyUsername = async (username?: string) => {
	if (!username) return;
	try {
		await navigator.clipboard.writeText(username);
		message.success(`已复制用户名: ${username}`);
	} catch {
		message.info(`用户名: ${username}`);
	}
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
	const { code, message: messageInfo } = await deleteUserManager(ids);
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
	const idStr = String(record.id);
	const newStatus = checked ? '1' : '0';
	statusLoadingMap.value[idStr] = true;
	try {
		const { code, message: messageInfo } = await updateUserStatus(idStr, newStatus);
		if (code === '200') {
			record.status = newStatus;
			message.success(messageInfo || '状态更新成功！', 3);
		} else {
			message.error(messageInfo || '状态更新失败！', 3);
		}
	} finally {
		statusLoadingMap.value[idStr] = false;
	}
};

// 批量删除用户信息
const batchDelUserManager = () => {
	if (!selectedRowKeys.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delUser(selectedRowKeys.value.map((id) => String(id)).join(','));
};

// 查询用户信息分页数据
const getUserPage = async (param: UserManagerInfo, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getUserManagerPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined && item.id !== null ? String(item.id) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 查看只读详情
function viewUser(id: string) {
	modelInfo.value = {
		title: '用户详情 (只读)',
		id: String(id),
		readonly: true,
		open: true,
	};
}

// 新增和修改弹窗
function editUser(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增用户' : '编辑用户',
		id: isAdd ? undefined : id !== undefined && id !== null ? String(id) : undefined,
		readonly: false,
		confirmLoading: true,
		open: true,
	};
}

const handleSuccess = () => {
	getUserPage(searchInfo.value, pagination);
};

const loadFilterOptions = async () => {
	const { code: orgCode, data: orgData } =
		await getOrgInfoPage({ status: '1' }, 1, 1000);
	if (orgCode === '200') {
		orgOptions.value = (orgData?.records || []).map((o: OrgInfoData) => ({
			label: o.orgName || '',
			value: String(o.id),
		}));
	}
};

// Lifecycle
onMounted(async () => {
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
}

:global(html.dark) {
	.modern-user-table {
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
}
</style>
