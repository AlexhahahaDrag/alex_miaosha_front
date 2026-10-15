<template>
	<div
		class="org-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
	>
		<!-- 1. 页面头部与紧凑指标 -->
		<div
			class="screen-header mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="w-2.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0 shadow-xs"
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
			<!-- 紧凑概览徽标胶囊 -->
			<div class="flex items-center gap-2.5">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<ApartmentOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">机构数</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
							{{ pagination.total || dataSource.length }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. 主工作区（紧凑筛选栏 + 一体化表格面板） -->
		<div class="w-full min-w-0 flex flex-col gap-5">
			<!-- 紧凑单行高效搜索栏 -->
			<div
				class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-xs transition-colors"
			>
				<a-form
					:model="searchInfo"
					layout="inline"
					class="flex flex-wrap items-center gap-y-3 gap-x-4"
				>
					<a-form-item label="机构名称" class="!mr-0 mb-0">
						<a-input
							v-model:value="searchInfo.orgName"
							placeholder="输入机构名称"
							data-testid="rbac-org-search-orgname"
							class="rounded-lg w-48"
							@keyup.enter="query(true)"
							allow-clear
						>
							<template #prefix>
								<ApartmentOutlined class="text-slate-400 text-xs mr-1" />
							</template>
						</a-input>
					</a-form-item>

					<a-form-item label="机构编码" class="!mr-0 mb-0">
						<a-input
							v-model:value="searchInfo.orgCode"
							placeholder="输入机构编码"
							class="rounded-lg w-44"
							@keyup.enter="query(true)"
							allow-clear
						>
							<template #prefix>
								<BarcodeOutlined class="text-slate-400 text-xs mr-1" />
							</template>
						</a-input>
					</a-form-item>

					<a-form-item label="状态" class="!mr-0 mb-0">
						<a-select
							v-model:value="searchInfo.status"
							placeholder="选择状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="statusList"
							class="rounded-lg w-32"
							allow-clear
						/>
					</a-form-item>

					<!-- 操作按钮组 -->
					<div class="flex items-center gap-2.5 ml-auto">
						<a-button
							type="primary"
							data-testid="rbac-org-btn-query"
							class="inline-flex items-center gap-1.5 rounded-lg px-4 shadow-xs"
							@click="() => query(true)"
						>
							<template #icon><SearchOutlined /></template>
							查找
						</a-button>
						<a-button
							data-testid="rbac-org-btn-reset"
							class="inline-flex items-center gap-1.5 rounded-lg px-4"
							@click="cancelQuery"
						>
							<template #icon><ReloadOutlined /></template>
							清空
						</a-button>
					</div>
				</a-form>
			</div>

			<!-- 一体化表格面板 (Compact & Impact Table) -->
			<div
				class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
			>
				<!-- 工具栏 -->
				<div
					class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
				>
					<div class="flex items-center gap-3">
						<span class="text-base font-bold text-slate-800 dark:text-slate-100"
							>机构列表</span
						>
						<span
							class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium font-mono"
						>
							共 {{ pagination.total || dataSource.length }} 条
						</span>
						<span
							v-if="rowIds.length > 0"
							class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-medium flex items-center gap-1.5"
						>
							<span>已选择 {{ rowIds.length }} 项</span>
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
								ok-text="确认"
								cancel-text="取消"
								@confirm="batchDelOrgInfo"
							>
								<a-button
									type="primary"
									danger
									:disabled="!rowIds.length"
									data-testid="rbac-org-batch-delete"
									class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
								>
									<template #icon><DeleteOutlined /></template>
									批量删除<span v-if="rowIds.length > 0"> ({{ rowIds.length }})</span>
								</a-button>
							</a-popconfirm>
						</span>
					</div>
				</div>

				<!-- 表格体 (紧凑 middle 排版与高辨识度单元格) -->
				<div class="px-2 pt-2 pb-4">
					<a-table
						:dataSource="dataSource"
						:columns="columns"
						:loading="loading"
						:row-key="(record) => record.id"
						:pagination="pagination"
						@change="handleTableChange"
						:scroll="{ x: 'max-content' }"
						:row-selection="rowSelection"
						size="middle"
						class="modern-org-table"
						data-testid="rbac-org-table"
					>
						<template #bodyCell="{ column, record }">
							<!-- 机构名称（带组织徽章与简介提示） -->
							<template v-if="column.key === 'orgName'">
								<div class="flex items-center gap-2.5 py-0.5">
									<div
										class="w-7 h-7 rounded-lg bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs flex-shrink-0 border border-blue-100 dark:border-blue-900/60 shadow-2xs"
									>
										<ApartmentOutlined />
									</div>
									<div class="flex flex-col min-w-0">
										<span
											class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug truncate"
										>
											{{ record.orgName }}
										</span>
										<span
											v-if="record.summary"
											class="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs leading-tight mt-0.5"
											:title="record.summary"
										>
											{{ record.summary }}
										</span>
									</div>
								</div>
							</template>

							<!-- 机构编码（等宽字体代码质感药丸） -->
							<template v-else-if="column.key === 'orgCode'">
								<span
									class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100/90 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
								>
									{{ record.orgCode }}
								</span>
							</template>

							<!-- 机构简称 -->
							<template v-else-if="column.key === 'orgShortName'">
								<span class="text-xs text-slate-600 dark:text-slate-300 font-medium">
									{{ record.orgShortName || '—' }}
								</span>
							</template>

							<!-- 父级机构（带分支图标或顶级机构徽标） -->
							<template v-else-if="column.key === 'parentOrgName'">
								<span
									v-if="record.parentOrgName"
									class="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
								>
									<BranchesOutlined class="text-slate-400 text-xs" />
									{{ record.parentOrgName }}
								</span>
								<span
									v-else
									class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50"
								>
									根机构
								</span>
							</template>

							<!-- 状态（微透晶莹药丸 + 呼吸灯圆点） -->
							<template v-else-if="column.key === 'status'">
								<span
									v-if="String(record.status) === '1'"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
								>
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
									启用
								</span>
								<span
									v-else
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
								>
									<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
									禁用
								</span>
							</template>

							<!-- 操作（悬浮微动效胶囊按钮） -->
							<template v-else-if="column.key === 'operation'">
								<div class="flex items-center justify-center gap-1.5">
									<a-button
										type="text"
										size="small"
										data-testid="rbac-org-row-view"
										class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 hover:shadow-2xs transition-all"
										@click="viewOrgInfo(record.id)"
									>
										<template #icon><EyeOutlined /></template>
										查看
									</a-button>
									<a-button
										v-permission="'org:edit'"
										type="text"
										size="small"
										data-testid="rbac-org-row-edit"
										class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 hover:shadow-2xs transition-all"
										@click="editOrgInfo('update', record.id)"
									>
										<template #icon><EditOutlined /></template>
										编辑
									</a-button>
									<a-button
										type="text"
										size="small"
										data-testid="rbac-org-row-members"
										class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 hover:shadow-2xs transition-all"
										@click="handleOpenMembers(record)"
									>
										<template #icon><TeamOutlined /></template>
										成员
									</a-button>
									<span v-permission="'org:delete'">
										<a-popconfirm
											title="确认删除该机构?"
											ok-text="确认"
											cancel-text="取消"
											@confirm="delOrgInfo(String(record.id || ''))"
										>
											<a-button
												type="text"
												size="small"
												danger
												data-testid="rbac-org-row-delete"
												class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:shadow-2xs transition-all"
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
				></org-info-detail>

				<org-user-drawer
					v-model:open="memberDrawerVisible"
					:org="currentMemberOrg"
				></org-user-drawer>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	ReloadOutlined,
	ApartmentOutlined,
	BarcodeOutlined,
	BranchesOutlined,
	EyeOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';
import type { ModelInfo } from '@/types/modal';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { columns } from '@/views/user/orgInfo/config';
import { getOrgInfoPage, deleteOrgInfo } from '@/views/user/orgInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';
import { message } from 'ant-design-vue';
import OrgInfoDetail from '@/views/user/orgInfo/orgInfoDetail/index.vue';
import OrgUserDrawer from '@/views/user/orgInfo/components/OrgUserDrawer.vue';

// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: () => getOrgDataPage(),
	});
const { getDictByType } = useDictInfo('is_valid');
const statusList = computed(() => getDictByType('is_valid'));

const loading = ref<boolean>(false);
const dataSource = ref<OrgInfoData[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<OrgInfoData>({});
const memberDrawerVisible = ref<boolean>(false);
const currentMemberOrg = ref<OrgInfoData | null>(null);

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
	delOrgInfo(rowIds.value.join(','));
};

const getOrgDataPage = async () => {
	try {
		loading.value = true;
		const res = await getOrgInfoPage(
			searchInfo.value,
			pagination.current,
			pagination.pageSize,
		);
		const {
			code,
			data,
			message: messageInfo,
		} = res || {};
		if (code === '200') {
			dataSource.value = data?.records || [];
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
		background: #f8fafc;
		color: #334155;
		font-weight: 700;
		font-size: 13px;
		letter-spacing: 0.02em;
		border-bottom: 1px solid #e2e8f0;
		padding: 10px 14px;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #f1f5f9;
		padding: 10px 14px;
		transition: background-color 0.2s ease;
	}

	:deep(.ant-table-tbody > tr:hover > td) {
		background: #f0f7ff !important;
	}

	:deep(.ant-pagination) {
		margin-top: 14px;
		padding-right: 12px;
	}
}

:global(html.dark) .modern-org-table {
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
