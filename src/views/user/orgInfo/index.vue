<template>
	<div
		class="org-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
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
						机构管理
					</h1>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal"
				>
					维护集团多级组织拓扑架构、机构编码与层级归属关系
				</p>
			</div>

			<!-- 顶部现代统计指标与数据权限范围胶囊 -->
			<div class="flex items-center gap-2.5 flex-wrap">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<ApartmentOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">机构总数</span>
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
				<a-form-item label="机构名称" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.orgName"
						placeholder="搜索机构名称"
						data-testid="rbac-org-search-orgname"
						class="rounded-lg w-44"
						allow-clear
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="机构编码" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.orgCode"
						placeholder="搜索机构编码"
						data-testid="rbac-org-search-orgcode"
						class="rounded-lg w-44 font-mono text-xs"
						allow-clear
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="状态" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.status"
						placeholder="全部状态"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="statusList"
						allow-clear
						class="rounded-lg w-28"
						@change="() => query(true)"
					/>
				</a-form-item>

				<div class="flex items-center gap-2.5 ml-auto">
					<a-button
						type="primary"
						data-testid="rbac-org-btn-query"
						class="rounded-lg px-4"
						@click="() => query(true)"
					>
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button
						data-testid="rbac-org-btn-reset"
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
						v-permission="'org:add'"
						type="primary"
						data-testid="rbac-org-btn-add"
						class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
						@click="editOrgInfo('add')"
					>
						<template #icon><PlusOutlined /></template>
						新增机构
					</a-button>

					<span v-permission="'org:delete'">
						<a-popconfirm
							:disabled="!rowIds.length"
							:title="`确认批量删除选中的 ${rowIds.length} 个机构?`"
							ok-text="确认删除"
							cancel-text="取消"
							@confirm="batchDelOrgInfo"
						>
							<a-button
								danger
								:disabled="!rowIds.length"
								data-testid="rbac-org-batch-delete"
								class="rounded-lg"
							>
								批量删除
								<span v-if="rowIds.length" class="ml-1 font-mono">
									({{ rowIds.length }})
								</span>
							</a-button>
						</a-popconfirm>
					</span>
				</div>

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden md:flex items-center gap-1.5">
					<InfoCircleOutlined class="text-blue-500" />
					<span>提示：点击「成员」可管理该机构下绑定的系统用户</span>
				</div>
			</div>

			<!-- 表格视图 -->
			<div class="px-2 pt-2 pb-4">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: OrgInfoData) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 1050 }"
					class="modern-org-table"
					data-testid="rbac-org-table"
					@change="handleTableChange"
				>
					<template #emptyText>
						<a-empty description="暂无机构数据，请点击上方「新增机构」进行创建" />
					</template>

					<template #bodyCell="{ column, record }">
						<!-- 1. 机构名称（带组织徽标与简介提示） -->
						<template v-if="column.key === 'orgName'">
							<div class="flex items-center gap-2.5 py-1">
								<div
									class="w-8 h-8 rounded-lg bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm flex-shrink-0 border border-blue-100 dark:border-blue-900/60 shadow-2xs"
								>
									<ApartmentOutlined />
								</div>
								<div class="flex flex-col min-w-0">
									<span
										class="font-semibold text-slate-900 dark:text-slate-100 text-[13px] leading-snug truncate"
										:title="record.orgName"
									>
										{{ record.orgName || '-' }}
									</span>
									<span
										v-if="record.summary"
										class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5"
										:title="record.summary"
									>
										{{ record.summary }}
									</span>
								</div>
							</div>
						</template>

						<!-- 2. 机构编码（科技蓝药丸 + 点击一键复制） -->
						<template v-else-if="column.key === 'orgCode'">
							<a-tooltip title="点击复制机构编码">
								<span
									v-if="record.orgCode"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70 border border-blue-200/70 dark:border-blue-800/80 cursor-pointer transition-colors select-all"
									@click="copyOrgCode(record.orgCode)"
								>
									<span>{{ record.orgCode }}</span>
									<CopyOutlined class="text-[10px] opacity-70" />
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</a-tooltip>
						</template>

						<!-- 3. 机构简称 -->
						<template v-else-if="column.key === 'orgShortName'">
							<span
								v-if="record.orgShortName"
								class="text-xs text-slate-700 dark:text-slate-300 font-medium"
							>
								{{ record.orgShortName }}
							</span>
							<span v-else class="text-slate-300 dark:text-slate-600">-</span>
						</template>

						<!-- 4. 父级机构（分支图标或根机构徽标） -->
						<template v-else-if="column.key === 'parentOrgName'">
							<span
								v-if="record.parentOrgName"
								class="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
							>
								<BranchesOutlined class="text-slate-400 text-xs" />
								{{ record.parentOrgName }}
							</span>
							<span
								v-else
								class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800"
							>
								根机构
							</span>
						</template>

						<!-- 5. 状态（呼吸灯胶囊） -->
						<template v-else-if="column.key === 'status'">
							<span
								v-if="String(record.status) === '1'"
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
								></span>
								有效
							</span>
							<span
								v-else
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
								失效
							</span>
						</template>

						<!-- 6. 操作列 (查看 / 编辑 / 成员 / 删除) -->
						<template v-else-if="column.key === 'operation'">
							<div class="flex items-center justify-center gap-1">
								<a-button
									type="link"
									size="small"
									class="table-action-btn view-action-btn"
									data-testid="rbac-org-row-view"
									@click="viewOrgInfo(record.id)"
								>
									<template #icon><EyeOutlined /></template>
									查看
								</a-button>

								<a-button
									v-permission="'org:edit'"
									type="link"
									size="small"
									class="table-action-btn edit-action-btn"
									data-testid="rbac-org-row-edit"
									@click="editOrgInfo('update', record.id)"
								>
									<template #icon><EditOutlined /></template>
									编辑
								</a-button>

								<a-button
									type="link"
									size="small"
									class="table-action-btn member-action-btn"
									data-testid="rbac-org-row-members"
									@click="handleOpenMembers(record)"
								>
									<template #icon><TeamOutlined /></template>
									成员
								</a-button>

								<span v-permission="'org:delete'">
									<a-popconfirm
										:title="`确认删除【${record.orgName || record.orgCode}】?`"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delOrgInfo(String(record.id || ''))"
									>
										<a-button
											type="link"
											size="small"
											danger
											class="table-action-btn delete-action-btn"
											data-testid="rbac-org-row-delete"
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

			<org-info-detail
				v-model:modelInfo="modelInfo"
				@success="() => handleSuccess()"
			/>

			<org-user-drawer
				v-model:open="memberDrawerVisible"
				:org="currentMemberOrg"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	ApartmentOutlined,
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	ReloadOutlined,
	BranchesOutlined,
	EyeOutlined,
	TeamOutlined,
	CopyOutlined,
	InfoCircleOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { columns } from '@/views/user/orgInfo/config';
import { getOrgInfoPage, deleteOrgInfo } from '@/views/user/orgInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';
import { useDataScopeHint } from '@/composables/useDataScopeHint';

// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

// 使用分页组合式函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: () => getOrgDataPage(),
	});

const { scopeHintText } = useDataScopeHint();
const { getDictByType } = useDictInfo('is_valid');
const statusList = computed(() => getDictByType('is_valid'));

const loading = ref<boolean>(false);
const dataSource = ref<OrgInfoData[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<OrgInfoData>({});
const memberDrawerVisible = ref<boolean>(false);
const currentMemberOrg = ref<OrgInfoData | null>(null);

const copyOrgCode = async (code?: string) => {
	if (!code) return;
	try {
		await navigator.clipboard.writeText(code);
		message.success(`已复制机构编码: ${code}`);
	} catch {
		message.info(`机构编码: ${code}`);
	}
};

const handleOpenMembers = (record: OrgInfoData) => {
	currentMemberOrg.value = record;
	memberDrawerVisible.value = true;
};

// 查询
const query = (resetPage: boolean = false) => {
	if (resetPage) {
		resetPagination();
	}
	getOrgDataPage();
};

// 清空查询条件
function cancelQuery() {
	searchInfo.value = {};
	query(true);
}

const delOrgInfo = async (ids: string) => {
	if (!ids) {
		message.warning('请选择要删除的机构');
		return;
	}
	try {
		const { code, message: messageInfo } = await deleteOrgInfo(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			clearSelection();
			query(true);
		} else {
			message.error(messageInfo || '删除失败！', 3);
		}
	} catch {
		message.error('删除失败，请稍后重试！', 3);
	}
};

// 批量删除表格中选中的机构
const batchDelOrgInfo = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delOrgInfo(rowIds.value.map((id) => String(id)).join(','));
};

const getOrgDataPage = async () => {
	try {
		loading.value = true;
		const {
			code,
			data,
			message: messageInfo,
		} = await getOrgInfoPage(
			searchInfo.value,
			pagination.current,
			pagination.pageSize,
		);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id:
					item.id !== undefined && item.id !== null
						? String(item.id)
						: undefined,
				parentId:
					item.parentId !== undefined && item.parentId !== null
						? String(item.parentId)
						: undefined,
			}));
			setTotal(data?.total || 0);
		} else if (code) {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 查看机构详情弹窗
function viewOrgInfo(id?: string) {
	modelInfo.value.title = '机构详情';
	modelInfo.value.id = id !== undefined && id !== null ? String(id) : null;
	modelInfo.value.readonly = true;
	modelInfo.value.open = true;
}

// 新增和修改弹窗
function editOrgInfo(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增机构' : '修改机构';
	modelInfo.value.id =
		isAdd ? null
		: id !== undefined && id !== null ? String(id)
		: null;
	modelInfo.value.readonly = false;
	modelInfo.value.open = true;
}

const handleSuccess = () => {
	query(false);
};

onMounted(() => {
	getOrgDataPage();
});
</script>

<style lang="scss" scoped>
.modern-org-table {
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
	.modern-org-table {
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
