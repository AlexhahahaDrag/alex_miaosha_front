<template>
	<div class="org-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors">
		<!-- 1. 页面头部与现代 KPI 指标概览 -->
		<div class="screen-header mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<div class="flex items-center gap-2.5">
					<span class="w-2.5 h-6 rounded-full bg-blue-600 flex-shrink-0 shadow-xs"></span>
					<h1 class="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0">机构管理</h1>
				</div>
				<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal">
					维护集团多级组织拓扑架构、机构编码与层级归属关系
				</p>
			</div>
			<!-- 顶部双环现代统计指标卡 -->
			<div class="flex items-center gap-3">
				<div class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-sm flex-shrink-0">
						<ApartmentOutlined />
					</div>
					<div>
						<div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">机构总数</div>
						<div class="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">{{ pagination.total || dataSource.length }}</div>
					</div>
				</div>
				<div class="bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-2 shadow-xs hover:shadow-sm transition-all flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-sm flex-shrink-0">
						<CheckCircleOutlined />
					</div>
					<div>
						<div class="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">已启用</div>
						<div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{{ activeOrgCount }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. 左右双栏现代工作区 -->
		<div class="flex flex-col lg:flex-row gap-5 items-start">
			<!-- 左侧：独立组织架构树卡片 -->
			<div class="w-full lg:w-72 flex-shrink-0 bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-4 overflow-hidden">
				<div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold text-slate-800 dark:text-slate-100">组织架构</span>
						<span v-if="currentParentId" class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-medium">已过滤</span>
					</div>
					<a
						v-if="currentParentId"
						class="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
						@click="clearTreeFilter"
					>
						重置
					</a>
				</div>
				<div class="max-h-[580px] overflow-y-auto pr-1 modern-tree-wrap">
					<a-tree
						:tree-data="treeData"
						data-testid="rbac-org-tree"
						v-model:expandedKeys="expandedKeys"
						v-model:selectedKeys="selectedKeys"
						v-model:checkedKeys="checkedKeys"
						:fieldNames="{ title: 'orgName', key: 'id' }"
						@select="onTreeSelect"
						blockNode
					>
						<template #title="{ orgName, children }">
							<div class="flex items-center gap-2 py-0.5">
								<folder-outlined v-if="children && children.length > 0" class="text-blue-500 text-xs" />
								<apartment-outlined v-else class="text-slate-400 text-xs" />
								<span class="text-xs text-slate-700 dark:text-slate-200">{{ orgName }}</span>
							</div>
						</template>
					</a-tree>
				</div>
			</div>

			<!-- 右侧：主工作区（紧凑筛选栏 + 一体化表格面板） -->
			<div class="flex-1 w-full min-w-0 flex flex-col gap-5">
				<!-- 紧凑单行高效搜索栏 -->
				<div class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-xs transition-colors">
					<a-form :model="searchInfo" layout="inline" class="flex flex-wrap items-center gap-y-3 gap-x-4">
						<a-form-item label="机构名称" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.orgName"
								placeholder="输入机构名称"
								data-testid="rbac-org-search-orgname"
								class="rounded-lg w-44"
								@keyup.enter="query(true)"
								allow-clear
							/>
						</a-form-item>

						<a-form-item label="机构编码" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.orgCode"
								placeholder="输入机构编码"
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

						<a-form-item label="所属上级" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.parentId"
								placeholder="上级机构ID"
								class="rounded-lg w-36"
								@keyup.enter="query(true)"
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

				<!-- 一体化表格面板 -->
				<div class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
					<!-- 工具栏 -->
					<div class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div class="flex items-center gap-3">
							<span class="text-base font-bold text-slate-800 dark:text-slate-100">机构列表</span>
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
								v-permission="'org:add'"
								type="primary"
								data-testid="rbac-org-btn-add"
								class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
								@click="editOrgInfo('add')"
							>
								<template #icon><PlusOutlined /></template>
								新增机构
							</a-button>

							<a-button
								v-if="hasSelectedNode"
								v-permission="'org:edit'"
								data-testid="rbac-org-btn-edit-node"
								class="inline-flex items-center gap-1.5 rounded-lg font-medium"
								@click="editOrgInfo('update', String(selectedKeys[0]))"
							>
								<template #icon><EditOutlined /></template>
								编辑选中节点
							</a-button>

							<span v-permission="'org:delete'">
								<a-popconfirm
									v-if="rowIds.length > 0"
									:title="`确认批量删除选中的 ${rowIds.length} 个机构?`"
									ok-text="确认"
									cancel-text="取消"
									@confirm="batchDelOrgInfo"
								>
									<a-button
										type="primary"
										danger
										data-testid="rbac-org-batch-delete"
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
									data-testid="rbac-org-batch-delete"
									class="inline-flex items-center gap-1.5 opacity-50 rounded-lg font-medium"
								>
									<template #icon><DeleteOutlined /></template>
									批量删除
								</a-button>
							</span>

							<a-button
								data-testid="rbac-org-btn-goto-relation"
								class="rounded-lg font-medium text-slate-600 dark:text-slate-300"
								@click="router.push('/user/org-user-info')"
							>
								机构-用户关系配置
							</a-button>
						</div>
					</div>

					<!-- 表格体 -->
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
							class="modern-org-table"
							data-testid="rbac-org-table"
						>
							<template #bodyCell="{ column, record }">
								<template v-if="column.key === 'status'">
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

								<template v-else-if="column.key === 'operation'">
									<div class="flex items-center gap-2">
										<a-button
											v-permission="'org:edit'"
											type="text"
											size="small"
											data-testid="rbac-org-row-edit"
											class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
											@click="editOrgInfo('update', record.id)"
										>
											<template #icon><EditOutlined /></template>
											编辑
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

					<org-info-detail
						v-model:modelInfo="modelInfo"
						:treeData="treeData"
						@success="() => handleSuccess()"
					></org-info-detail>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	FolderOutlined,
	ApartmentOutlined,
	CheckCircleOutlined,
	SearchOutlined,
	ReloadOutlined,
} from '@ant-design/icons-vue';
// 字典数据已通过 useDictInfo 自动加载

import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { columns } from '@/views/user/orgInfo/config';
import {
	getOrgInfoPage,
	getOrgInfoTree,
	deleteOrgInfo,
} from '@/views/user/orgInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { TreeDataItem } from 'ant-design-vue/es/tree';
import type { TreeProps } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/_util/type';
import OrgInfoDetail from './orgInfoDetail/index.vue';

type OrgTreeNode = OrgInfoData &
	TreeDataItem & {
		id: Key;
		parentId?: Key | null;
		orgCode?: string;
		children?: OrgTreeNode[];
	};

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const { getDictByType } = useDictInfo('is_valid');
const statusList = computed(() => getDictByType('is_valid'));

const router = useRouter();

const treeData = ref<TreeDataItem[]>([]);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<Key[]>([]);
const checkedKeys = ref<Key[]>([]);
const loading = ref<boolean>(false);
const dataSource = ref<OrgInfoData[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<OrgInfoData>({});
const currentParentId = ref<string | undefined>(undefined);
const hasSelectedNode = computed(() => selectedKeys.value.length > 0);
const activeOrgCount = computed(
	() => dataSource.value.filter((o) => String(o.status) === '1').length,
);
const rowIds = ref<(string | number)[]>([]);

const clearSelection = () => {
	rowIds.value = [];
};

const clearTreeFilter = () => {
	selectedKeys.value = [];
	currentParentId.value = undefined;
	searchInfo.value.parentId = undefined;
	query(true);
};

// 表格行选择（批量删除）
const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

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
	searchInfo.value.parentId = currentParentId.value;
	query(true);
}

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getOrgDataPage();
};

const delOrgInfo = async (ids: string) => {
	if (!ids) {
		message.warning('请选择要删除的机构');
		return;
	}
	try {
		const { code, message: messageInfo } = await deleteOrgInfo(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			await getOrgTreeData();
			if (!selectedKeys.value.length) {
				searchInfo.value.parentId = undefined;
				currentParentId.value = undefined;
			}
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
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.value.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delOrgInfo(rowIds.value.join(',')),
	});
};

const onTreeSelect: TreeProps['onSelect'] = (keys, info) => {
	if (keys.length > 0) {
		currentParentId.value = String((info.node as unknown as OrgTreeNode).id || '');
	} else {
		currentParentId.value = undefined;
	}
	searchInfo.value.parentId = currentParentId.value;
	// No need to call getOrgDataPage here, watch on searchInfo will handle it
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
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 递归补齐 tree 组件所需的 key 字段（后端已按 parentId 组装好 children，无需前端再拼树）
const withTreeKey = (nodes: OrgInfoData[]): OrgTreeNode[] =>
	nodes.map((item) => ({
		...item,
		key: item.id,
		children: item.children?.length
			? withTreeKey(item.children as OrgInfoData[])
			: undefined,
	})) as OrgTreeNode[];

const getOrgTreeData = async () => {
	try {
		const { code, data, message: messageInfo } = await getOrgInfoTree();
		if (code === '200') {
			treeData.value = withTreeKey(data || []);
		} else {
			message.error(messageInfo || '机构树加载失败！');
		}
	} catch {
		message.error('机构树加载失败，请稍后重试！');
	}
};

//新增和修改弹窗
function editOrgInfo(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? null : (id !== undefined && id !== null ? String(id) : null);
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

const handleSuccess = () => {
	getOrgTreeData();
	query(false);
};

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);

const init = async () => {
	//获取机构表页面数据并生成树
	getOrgTreeData();
	// 取机构数据
	getOrgDataPage();
};

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.modern-tree-wrap {
	:deep(.ant-tree) {
		background: transparent;
		.ant-tree-node-content-wrapper {
			border-radius: 6px;
			transition: all 0.2s;
			padding: 2px 6px;
			&:hover {
				background-color: #f1f5f9;
			}
		}
		.ant-tree-node-selected {
			background-color: #e0f2fe !important;
			color: #0284c7;
			font-weight: 600;
		}
	}
}

:global(html.dark) .modern-tree-wrap {
	:deep(.ant-tree) {
		.ant-tree-node-content-wrapper:hover {
			background-color: #1e293b;
		}
		.ant-tree-node-selected {
			background-color: #0c4a6e !important;
			color: #38bdf8;
		}
	}
}

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

	:deep(.ant-pagination) {
		margin-top: 16px;
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
