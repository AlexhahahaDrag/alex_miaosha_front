<template>
	<div class="menu-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors">
		<!-- 1. 页面头部与现代 KPI 指标概览 -->
		<div class="screen-header mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2.5">
					<span class="w-2.5 h-6 rounded-full bg-blue-600 flex-shrink-0 shadow-xs"></span>
					<h1 class="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0">菜单管理</h1>
				</div>
				<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal">
					维护系统路由、多级菜单树、按钮权限标识与组件挂载路径
				</p>
			</div>
			<!-- 顶部三环现代统计指标卡 -->
			<div class="flex items-center gap-3 flex-wrap">
				<div class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-sm flex-shrink-0">
						<AppstoreOutlined />
					</div>
					<div>
						<div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">根菜单数</div>
						<div class="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">{{ pagination.total || dataSource.length }}</div>
					</div>
				</div>
				<div class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-sm flex-shrink-0">
						<CheckCircleOutlined />
					</div>
					<div>
						<div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">已启用</div>
						<div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{{ activeMenuCount }}</div>
					</div>
				</div>
				<div class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-sm flex-shrink-0">
						<EyeOutlined />
					</div>
					<div>
						<div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">导航显示</div>
						<div class="text-base font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight mt-0.5">{{ visibleMenuCount }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. 主工作区（紧凑筛选栏 + 一体化表格面板） -->
		<div class="flex flex-col gap-5">
			<!-- 紧凑单行高效搜索栏 -->
			<div class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-xs transition-colors">
				<a-form :model="searchInfo" layout="inline" class="flex flex-wrap items-center gap-y-3 gap-x-4">
					<a-form-item label="菜单名称" class="!mr-0 mb-0">
						<a-input
							v-model:value="searchInfo.name"
							placeholder="输入路由名称"
							class="rounded-lg w-40"
							@keyup.enter="query(true)"
							allow-clear
						/>
					</a-form-item>

					<a-form-item label="菜单标题" class="!mr-0 mb-0">
						<a-input
							v-model:value="searchInfo.title"
							placeholder="输入菜单标题"
							class="rounded-lg w-40"
							@keyup.enter="query(true)"
							allow-clear
						/>
					</a-form-item>

					<a-form-item label="权限标识" class="!mr-0 mb-0">
						<a-input
							v-model:value="searchInfo.permissionCode"
							placeholder="如 user:list"
							class="rounded-lg w-40"
							@keyup.enter="query(true)"
							allow-clear
						/>
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

					<a-form-item label="导航显示" class="!mr-0 mb-0">
						<a-select
							v-model:value="searchInfo.hideInMenu"
							placeholder="是否隐藏"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="hideInMenuList"
							class="rounded-lg w-32"
							allow-clear
						/>
					</a-form-item>

					<!-- 操作按钮组 -->
					<div class="flex items-center gap-2.5 ml-auto">
						<a-button
							type="primary"
							data-testid="rbac-menu-btn-query"
							class="inline-flex items-center gap-1.5 rounded-lg px-4 shadow-xs"
							@click="() => query(true)"
						>
							<template #icon><SearchOutlined /></template>
							查找
						</a-button>
						<a-button
							data-testid="rbac-menu-btn-reset"
							class="inline-flex items-center gap-1.5 rounded-lg px-4"
							@click="cancelQuery"
						>
							<template #icon><ReloadOutlined /></template>
							清空
						</a-button>
					</div>
				</a-form>
			</div>

			<!-- 一体化表格面板 -->
			<div class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
				<!-- 工具栏 -->
				<div class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<span class="text-base font-bold text-slate-800 dark:text-slate-100">根菜单列表</span>
						<span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium">
							共 {{ pagination.total || dataSource.length }} 个
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
							v-permission="'menu:add'"
							type="primary"
							data-testid="rbac-menu-btn-add"
							class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
							@click="editMenuInfo('add')"
						>
							<template #icon><PlusOutlined /></template>
							新增菜单
						</a-button>

						<span v-permission="'menu:delete'">
							<a-popconfirm
								v-if="rowIds.length > 0"
								:title="`确认批量删除选中的 ${rowIds.length} 个菜单?`"
								ok-text="确认"
								cancel-text="取消"
								@confirm="batchDelMenuInfo"
							>
								<a-button
									type="primary"
									danger
									data-testid="rbac-menu-btn-batch-delete"
									class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
								>
									<template #icon><DeleteOutlined /></template>
									批量删除 ({{ rowIds.length }})
								</a-button>
							</a-popconfirm>
							<a-button
								v-else
								type="primary"
								danger
								disabled
								data-testid="rbac-menu-btn-batch-delete"
								class="inline-flex items-center gap-1.5 opacity-50 rounded-lg font-medium"
							>
								<template #icon><DeleteOutlined /></template>
								批量删除
							</a-button>
						</span>
					</div>
				</div>

				<!-- 表格体 -->
				<div class="px-2 pt-2 pb-4">
					<a-table
						:data-source="dataSource"
						:columns="columns"
						:loading="loading"
						:row-key="(record) => record.id"
						:pagination="pagination"
						:scroll="{ x: 'max-content' }"
						:row-selection="rowSelection"
						class="modern-menu-table"
						data-testid="rbac-menu-table"
						@change="handleTableChange"
					>
						<template #bodyCell="{ column, record }">
							<!-- 菜单标题 -->
							<template v-if="column.key === 'title'">
								<div class="flex items-center gap-1.5">
									<span v-if="record.icon" class="text-xs text-slate-400 font-mono">[{{ record.icon }}]</span>
									<span class="font-semibold text-slate-800 dark:text-slate-100">{{ record.title }}</span>
								</div>
							</template>

							<!-- 权限标识 -->
							<template v-else-if="column.key === 'permissionCode'">
								<span
									v-if="record.permissionCode"
									class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50"
								>
									{{ record.permissionCode }}
								</span>
								<span v-else class="text-slate-400 text-xs">-</span>
							</template>

							<!-- 隐藏菜单 -->
							<template v-else-if="column.key === 'hideInMenu'">
								<span
									v-if="String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'"
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
								>
									隐藏
								</span>
								<span
									v-else
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
								>
									显示
								</span>
							</template>

							<!-- 首页展示 -->
							<template v-else-if="column.key === 'showInHome'">
								<span
									v-if="String(record.showInHome) === '1' || String(record.showInHome) === 'true'"
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
								>
									是
								</span>
								<span
									v-else
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
								>
									否
								</span>
							</template>

							<!-- 状态 -->
							<template v-else-if="column.key === 'status'">
								<span
									v-if="String(record.status) === '1'"
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
								>
									启用
								</span>
								<span
									v-else
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
								>
									禁用
								</span>
							</template>

							<!-- 操作列 -->
							<template v-else-if="column.key === 'operation'">
								<div class="flex items-center justify-center gap-2">
									<a-button
										v-permission="'menu:add'"
										type="text"
										size="small"
										data-testid="rbac-menu-row-add-child"
										class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 transition-colors"
										@click="openSubMenuManager(record)"
									>
										<template #icon><BranchesOutlined /></template>
										子菜单
									</a-button>

									<a-button
										v-permission="'menu:edit'"
										type="text"
										size="small"
										data-testid="rbac-menu-row-edit"
										class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
										@click="editMenuInfo('update', record.id)"
									>
										<template #icon><EditOutlined /></template>
										编辑
									</a-button>

									<span v-permission="'menu:delete'">
										<a-popconfirm
											title="确认删除该菜单?"
											ok-text="确认"
											cancel-text="取消"
											@confirm="delMenuInfo(String(record.id))"
										>
											<a-button
												type="text"
												size="small"
												danger
												data-testid="rbac-menu-row-delete"
												class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 transition-colors"
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

				<!-- 自定义组件 -->
				<menu-info-detail
					v-model:model-info="modelInfo"
					@success="() => query()"
				></menu-info-detail>

				<sub-menu-manager
					v-model:model-info="subMenuManagerInfo"
				></sub-menu-manager>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	AppstoreOutlined,
	CheckCircleOutlined,
	EyeOutlined,
	SearchOutlined,
	ReloadOutlined,
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	BranchesOutlined,
} from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import MenuInfoDetail from './menuInfoDetail/index.vue';
import SubMenuManager from './subMenuManager/index.vue';
import { getMenuInfoPage, deleteMenuInfo } from '@/views/user/menuInfo/api';
import { columns } from '@/views/user/menuInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import type { ModelInfo } from '@/views/common/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 3. Hooks
const { getDictByType } = useDictInfo('true_or_false,is_valid');
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

// 4. State
const loading = ref<boolean>(false);
const dataSource = ref<MenuInfoData[]>([]);
const searchInfo = ref<MenuInfoData>({});
const modelInfo = ref<ModelInfo>({});
const subMenuManagerInfo = ref<ModelInfo>({});
const rowIds = ref<(string | number)[]>([]);

const hideInMenuList = computed(() => getDictByType('true_or_false'));
const statusList = computed(() => getDictByType('is_valid'));

const activeMenuCount = computed(
	() => dataSource.value.filter((m) => String(m.status) === '1').length,
);

const visibleMenuCount = computed(
	() =>
		dataSource.value.filter(
			(m) =>
				String(m.hideInMenu) !== '1' && String(m.hideInMenu) !== 'true',
		).length,
);

const clearSelection = () => {
	rowIds.value = [];
};

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

// 5. Actions (业务处理逻辑)
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getMenuInfoListPage(searchInfo.value, pagination);
};

const query = (resetPage = false) => {
	triggerDebouncedQuery.cancel();
	if (resetPage) {
		resetPagination();
	}
	getMenuInfoListPage(searchInfo.value, pagination);
};

const cancelQuery = () => {
	searchInfo.value = { parentId: '0' };
	query(true);
};

const delMenuInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteMenuInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！');
		query(true);
	} else {
		message.error(messageInfo || '删除失败！');
	}
};

const batchDelMenuInfo = () => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！');
		return;
	}
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.value.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delMenuInfo(rowIds.value.join(',')),
	});
};

const editMenuInfo = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增明细' : '修改明细',
		open: true,
		id: isAdd ? undefined : (id ?? null),
		parentId: isAdd ? '0' : undefined,
	};
};

const openSubMenuManager = (record: MenuInfoData) => {
	subMenuManagerInfo.value = {
		title: `子菜单管理 - ${record.title || record.name}`,
		open: true,
		id: String(record.id),
	};
};

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

const getMenuInfoListPage = async (param: MenuInfoData, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getMenuInfoPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = () => {
	searchInfo.value.parentId = '0';
	getMenuInfoListPage(searchInfo.value, pagination);
};

// 7. Watchers
watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);

// 初始化
init();
</script>

<style lang="scss" scoped>
.modern-menu-table {
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

:global(html.dark) .modern-menu-table {
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
