<template>
	<div
		class="dict-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
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
						数据字典管理
					</h1>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal"
				>
					统一维护全系统枚举编码、业务分类字典与排序规则
				</p>
			</div>

			<!-- 顶部统计指标胶囊 -->
			<div class="flex items-center gap-2.5 flex-wrap">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<BookOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">字典总数</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
							{{ pagination?.total ?? dataSource.length }}
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
				<a-form-item label="类别名称" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.typeName"
						placeholder="搜索类别名称"
						allow-clear
						class="rounded-lg w-44"
						data-testid="dict-search-typename"
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="分类名称" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.belongToName"
						placeholder="搜索分类名称"
						allow-clear
						class="rounded-lg w-44"
						data-testid="dict-search-belongtoname"
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<a-form-item label="分类编码" class="!mr-0 mb-0">
					<a-input
						v-model:value="searchInfo.belongTo"
						placeholder="搜索分类编码"
						allow-clear
						class="rounded-lg w-44 font-mono text-xs"
						data-testid="dict-search-belongto"
						@press-enter="() => query(true)"
					/>
				</a-form-item>

				<div class="flex items-center gap-2.5 ml-auto">
					<a-button
						type="primary"
						data-testid="dict-btn-query"
						class="rounded-lg px-4"
						@click="() => query(true)"
					>
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button
						data-testid="dict-btn-reset"
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
						type="primary"
						data-testid="dict-btn-add"
						class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
						@click="openDictDrawer('add')"
					>
						<template #icon><PlusOutlined /></template>
						新增字典
					</a-button>

					<a-popconfirm
						:disabled="!selectedRowKeys.length"
						:title="`确认批量删除选中的 ${selectedRowKeys.length} 项字典数据吗？`"
						ok-text="确认删除"
						cancel-text="取消"
						@confirm="batchDelDictManager"
					>
						<a-button
							danger
							:disabled="!selectedRowKeys.length"
							data-testid="dict-btn-batch-delete"
							class="rounded-lg"
						>
							批量删除
							<span v-if="selectedRowKeys.length" class="ml-1 font-mono">
								({{ selectedRowKeys.length }})
							</span>
						</a-button>
					</a-popconfirm>
				</div>

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden md:flex items-center gap-1.5">
					<InfoCircleOutlined class="text-blue-500" />
					<span>提示：点击「类别编码」或「分类编码」药丸可一键复制编码值</span>
				</div>
			</div>

			<!-- 表格视图 -->
			<div class="px-2 pt-2 pb-4">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: DictInfo) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 1150 }"
					class="modern-dict-table"
					data-testid="dict-table"
					@change="handleTableChange"
				>
					<template #emptyText>
						<a-empty description="暂无符合条件的数据字典项" />
					</template>

					<template #bodyCell="{ column, record }">
						<!-- 1. 类别名称 -->
						<template v-if="column.key === 'typeName'">
							<span class="font-semibold text-slate-900 dark:text-slate-100 text-[13px]">
								{{ record.typeName || '-' }}
							</span>
						</template>

						<!-- 2. 类别编码 (点击一键复制) -->
						<template v-else-if="column.key === 'typeCode'">
							<a-tooltip title="点击复制类别编码">
								<span
									v-if="record.typeCode !== undefined && record.typeCode !== null && record.typeCode !== ''"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70 border border-blue-200/70 dark:border-blue-800/80 cursor-pointer transition-colors select-all"
									@click="copyCode('类别编码', String(record.typeCode))"
								>
									<span>{{ record.typeCode }}</span>
									<CopyOutlined class="text-[10px] opacity-70" />
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</a-tooltip>
						</template>

						<!-- 3. 所属分类名称 -->
						<template v-else-if="column.key === 'belongToName'">
							<span
								v-if="record.belongToName"
								class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
							>
								{{ record.belongToName }}
							</span>
							<span v-else class="text-slate-300 dark:text-slate-600">-</span>
						</template>

						<!-- 4. 分类编码 (点击一键复制) -->
						<template v-else-if="column.key === 'belongTo'">
							<a-tooltip title="点击复制分类编码">
								<span
									v-if="record.belongTo !== undefined && record.belongTo !== null && record.belongTo !== ''"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 dark:hover:bg-indigo-900/70 border border-indigo-200/70 dark:border-indigo-800/80 cursor-pointer transition-colors select-all"
									@click="copyCode('分类编码', String(record.belongTo))"
								>
									<span>{{ record.belongTo }}</span>
									<CopyOutlined class="text-[10px] opacity-70" />
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</a-tooltip>
						</template>

						<!-- 5. 排序 -->
						<template v-else-if="column.key === 'orderBy'">
							<span class="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
								{{ record.orderBy ?? '-' }}
							</span>
						</template>

						<!-- 6. 状态呼吸灯胶囊 -->
						<template v-else-if="column.key === 'isValid'">
							<span
								v-if="String(record.isValid) === '1'"
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

						<!-- 7. 业务时间 -->
						<template v-else-if="column.key === 'operateTime'">
							<span class="text-xs font-mono text-slate-500 dark:text-slate-400">
								{{ record.operateTime || '-' }}
							</span>
						</template>

						<!-- 8. 操作列 (查看 / 编辑 / 删除) -->
						<template v-else-if="column.key === 'operation'">
							<div class="flex items-center justify-center gap-1">
								<a-button
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
									data-testid="dict-row-view"
									@click="openDictDrawer('view', record.id)"
								>
									<template #icon><EyeOutlined /></template>
									查看
								</a-button>

								<a-button
									type="link"
									size="small"
									class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400"
									data-testid="dict-row-edit"
									@click="openDictDrawer('update', record.id)"
								>
									<template #icon><EditOutlined /></template>
									编辑
								</a-button>

								<a-popconfirm
									:title="`确认删除字典【${record.typeName || record.typeCode}】吗？`"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delDict(String(record.id))"
								>
									<a-button
										type="link"
										size="small"
										danger
										class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400"
										data-testid="dict-row-delete"
									>
										<template #icon><DeleteOutlined /></template>
										删除
									</a-button>
								</a-popconfirm>
							</div>
						</template>
					</template>
				</a-table>
			</div>

			<DictDetail v-model:modelInfo="modelInfo" @success="handleSuccess" />
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	BookOutlined,
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
import type { PageInfo } from '@/composables/usePagination';
import type { DictInfo } from '@/views/dict/config';
import type { ModelInfo } from '@/types/modal';
import { columns } from '@/views/dict/config';
import { getDictManagerPage, deleteDictManager } from '@/views/dict/api';
import DictDetail from '@/views/dict/dict-detail/index.vue';

const loading = ref<boolean>(false);
const dataSource = ref<DictInfo[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<DictInfo>({});

// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

// 使用分页组合式函数
const { pagination, handleTableChange, resetPagination, setTotal } =
	usePagination({
		onChange: (p) => getDictPage(searchInfo.value, p),
	});

const copyCode = async (label: string, code?: string) => {
	if (!code) return;
	try {
		await navigator.clipboard.writeText(code);
		message.success(`已复制${label}: ${code}`);
	} catch {
		message.info(`${label}: ${code}`);
	}
};

function cancelQuery() {
	searchInfo.value = {};
	clearSelection();
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getDictPage(searchInfo.value, pagination);
}

const delDict = async (ids: string) => {
	const { code, message: messageInfo } = await deleteDictManager(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelection();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

function batchDelDictManager() {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delDict(selectedRowKeys.value.map((id) => String(id)).join(','));
}

const getDictPage = async (param: DictInfo, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getDictManagerPage(param, cur.current, cur.pageSize);
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

function openDictDrawer(
	type: 'add' | 'update' | 'view',
	id?: string | number,
) {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value = {
		open: true,
		readonly: isView,
		title: isAdd ? '新增字典明细' : isView ? '查看字典明细' : '编辑字典明细',
		id: !isAdd && id !== undefined && id !== null ? String(id) : undefined,
		confirmLoading: false,
	};
}

const handleSuccess = () => {
	getDictPage(searchInfo.value, pagination);
};

onMounted(() => {
	getDictPage(searchInfo.value, pagination);
});
</script>

<style lang="scss" scoped>
.modern-dict-table {
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
	.modern-dict-table {
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
