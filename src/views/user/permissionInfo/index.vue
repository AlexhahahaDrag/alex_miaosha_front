<template>
	<div
		class="permission-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
	>
		<!-- 1. 页面头部与现代概览指标 -->
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
						权限管理
					</h1>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal"
				>
					精细化管控系统功能权限点、API 接口访问权限与数据权限标识
				</p>
			</div>

			<!-- 顶部现代统计指标胶囊 -->
			<div class="flex items-center gap-3">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<SafetyCertificateOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">权限总数</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
							{{ pagination?.total ?? 0 }}
						</span>
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
				<a-form-item label="权限编码" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.permissionCode"
						placeholder="如 user:add"
						allow-clear
						class="rounded-lg w-48 font-mono text-xs"
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="权限名称" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.permissionName"
						placeholder="输入权限名称"
						allow-clear
						class="rounded-lg w-44"
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="状态" class="!mr-0 mb-0">
					<a-select
						v-model:value="searchInfo.status"
						placeholder="选择状态"
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
						data-testid="rbac-perm-btn-query"
						class="rounded-lg px-4"
						@click="() => query(true)"
					>
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button
						data-testid="rbac-perm-btn-reset"
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
				<div class="flex items-center gap-2.5">
					<a-button
						v-permission="'permission:add'"
						type="primary"
						data-testid="rbac-perm-btn-add"
						class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
						@click="openPermissionDrawer('add')"
					>
						<template #icon><PlusOutlined /></template>
						新增权限
					</a-button>

					<span v-permission="'permission:delete'">
						<a-popconfirm
							:title="`确认删除选中的 ${rowIds.length} 项权限吗？`"
							ok-text="确认删除"
							cancel-text="取消"
							:disabled="!rowIds.length"
							@confirm="handleBatchDelete"
						>
							<a-button
								type="primary"
								danger
								:disabled="!rowIds.length"
								data-testid="rbac-perm-btn-batch-delete"
								class="rounded-lg font-medium"
							>
								<template #icon><DeleteOutlined /></template>
								批量删除
								<span v-if="rowIds.length" class="ml-1 font-mono">
									({{ rowIds.length }})
								</span>
							</a-button>
						</a-popconfirm>
					</span>
				</div>

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-1.5">
					<InfoCircleOutlined class="text-blue-500" />
					<span>提示：点击权限编码药丸可一键复制</span>
				</div>
			</div>

			<!-- 表格视图 -->
			<div class="px-2 pt-2 pb-4">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: PermissionInfo) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 960 }"
					class="modern-permission-table"
					data-testid="rbac-perm-table"
					@change="handleTableChange"
				>
					<template #bodyCell="{ column, record }">
						<!-- 1. 权限信息复合列 (名称 + 描述) -->
						<template v-if="column.key === 'permissionName'">
							<div class="flex flex-col py-1">
								<span
									class="font-semibold text-slate-900 dark:text-slate-100 text-[13px] leading-snug truncate"
									:title="record.permissionName"
								>
									{{ record.permissionName || '-' }}
								</span>
								<span
									v-if="record.summary"
									class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5"
									:title="record.summary"
								>
									{{ record.summary }}
								</span>
							</div>
						</template>

						<!-- 2. 权限编码 (可点击复制的科技蓝药丸) -->
						<template v-else-if="column.key === 'permissionCode'">
							<a-tooltip title="点击复制权限编码">
								<span
									v-if="record.permissionCode"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70 border border-blue-200/70 dark:border-blue-800/80 cursor-pointer transition-colors select-all"
									@click="copyPermissionCode(record.permissionCode)"
								>
									<span>{{ record.permissionCode }}</span>
									<CopyOutlined class="text-[10px] opacity-70" />
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</a-tooltip>
						</template>

						<!-- 3. 关联资源 URL / Options -->
						<template v-else-if="column.key === 'options'">
							<span
								v-if="record.options"
								class="inline-block max-w-full truncate px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
								:title="record.options"
							>
								{{ record.options }}
							</span>
							<span v-else class="text-slate-300 dark:text-slate-600 text-xs">
								-
							</span>
						</template>

						<!-- 4. 状态呼吸灯胶囊 -->
						<template v-else-if="column.key === 'status'">
							<span
								v-if="String(record.status) === '1'"
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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

						<!-- 5. 操作列 (查看 / 编辑 / 删除微底胶囊) -->
						<template v-else-if="column.key === 'operation'">
							<div class="flex items-center justify-center gap-1">
								<a-button
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
									data-testid="rbac-perm-row-view"
									@click="openPermissionDrawer('view', record.id)"
								>
									<template #icon><EyeOutlined /></template>
									查看
								</a-button>

								<a-button
									v-permission="'permission:edit'"
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400"
									data-testid="rbac-perm-row-edit"
									@click="openPermissionDrawer('update', record.id)"
								>
									<template #icon><EditOutlined /></template>
									编辑
								</a-button>

								<span v-permission="'permission:delete'">
									<a-popconfirm
										:title="`确认删除【${record.permissionName || record.permissionCode}】?`"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delPermissionInfo(String(record.id))"
									>
										<a-button
											type="link"
											size="small"
											danger
											class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400"
											data-testid="rbac-perm-row-delete"
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

			<PermissionInfoDetail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	SafetyCertificateOutlined,
	SearchOutlined,
	ReloadOutlined,
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	CopyOutlined,
	InfoCircleOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { PageInfo } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	type SearchInfo,
	columns,
	type PermissionInfo,
} from '@/views/user/permissionInfo/config';
import {
	getPermissionInfoPage,
	deletePermissionInfo,
} from '@/views/user/permissionInfo/api';
import PermissionInfoDetail from '@/views/user/permissionInfo/permissionInfoDetail/index.vue';

// 表格行选择（ID 强制保持为 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

// 分页管理
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getPermissionInfoListPage(searchInfo.value, p),
	});

const { getDictByType } = useDictInfo('is_valid');

const searchInfo = ref<SearchInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<PermissionInfo[]>([]);
const modelInfo = ref<ModelInfo>({});

const statusList = computed(() => getDictByType('is_valid'));

function cancelQuery() {
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getPermissionInfoListPage(searchInfo.value, pagination);
}

const copyPermissionCode = async (code?: string) => {
	if (!code) return;
	try {
		await navigator.clipboard.writeText(code);
		message.success(`已复制权限编码: ${code}`);
	} catch {
		message.info(`权限编码: ${code}`);
	}
};

const delPermissionInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deletePermissionInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const handleBatchDelete = () => {
	if (!rowIds.value?.length) {
		message.warning('请先选择数据！');
		return;
	}
	delPermissionInfo(rowIds.value.map((id) => String(id)).join(','));
};

const getPermissionInfoListPage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPermissionInfoPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined && item.id !== null ? String(item.id) : undefined,
				parentId:
					item.parentId !== undefined && item.parentId !== null
						? String(item.parentId)
						: undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

function openPermissionDrawer(
	type: 'add' | 'update' | 'view',
	id?: string | number,
) {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value = {
		open: true,
		readonly: isView,
		title: isAdd ? '新增权限明细' : isView ? '查看权限明细' : '编辑权限明细',
		id: !isAdd && id !== undefined && id !== null ? String(id) : undefined,
	};
}

onMounted(() => {
	getPermissionInfoListPage(searchInfo.value, pagination);
});
</script>

<style lang="scss" scoped>
.modern-permission-table {
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
	.modern-permission-table {
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
