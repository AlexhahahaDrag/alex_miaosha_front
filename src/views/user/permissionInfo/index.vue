<template>
	<div
		class="permission-page flex flex-col gap-3 h-[calc(100vh-110px)] overflow-hidden"
	>
		<!-- 顶部标题与紧凑筛选栏 -->
		<div
			class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] shrink-0"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<!-- 左侧标题与统计徽标 -->
				<div class="flex items-center gap-2.5">
					<div
						class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20"
					>
						<SafetyCertificateOutlined class="text-base" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<h2
								class="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight m-0"
							>
								权限管理
							</h2>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800"
							>
								{{ pagination?.total ?? 0 }} 项权限点
							</span>
						</div>
					</div>
				</div>

				<!-- 右侧单行紧凑筛选栏 -->
				<a-form
					:model="searchInfo"
					layout="inline"
					class="flex flex-wrap items-center gap-2"
				>
					<a-form-item name="permissionCode" class="!mb-0 !mr-0">
						<a-input
							v-model:value="searchInfo.permissionCode"
							placeholder="搜索权限编码 (如 user:add)"
							allow-clear
							class="w-48 rounded-lg font-mono text-xs"
							@press-enter="() => query(true)"
						/>
					</a-form-item>

					<a-form-item name="permissionName" class="!mb-0 !mr-0">
						<a-input
							v-model:value="searchInfo.permissionName"
							placeholder="搜索权限名称"
							allow-clear
							class="w-44 rounded-lg"
							@press-enter="() => query(true)"
						/>
					</a-form-item>

					<a-form-item name="status" class="!mb-0 !mr-0">
						<a-select
							v-model:value="searchInfo.status"
							placeholder="全部状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="statusList"
							allow-clear
							class="w-32"
							@change="() => query(true)"
						/>
					</a-form-item>

					<div class="flex items-center gap-1.5 ml-1">
						<a-button
							type="primary"
							data-testid="rbac-perm-btn-query"
							class="rounded-lg font-medium"
							@click="() => query(true)"
						>
							查找
						</a-button>
						<a-button
							data-testid="rbac-perm-btn-reset"
							class="rounded-lg text-slate-600 dark:text-slate-300"
							@click="cancelQuery"
						>
							清空
						</a-button>
					</div>
				</a-form>
			</div>
		</div>

		<!-- 主体高密度表格区 -->
		<div
			class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex-1 flex flex-col min-h-0 overflow-hidden"
		>
			<!-- 工具栏 -->
			<div class="flex items-center justify-between mb-3 shrink-0">
				<div class="flex items-center gap-2">
					<a-button
						v-permission="'permission:add'"
						type="primary"
						data-testid="rbac-perm-btn-add"
						class="rounded-lg font-medium shadow-sm shadow-blue-500/15"
						@click="openPermissionDrawer('add')"
					>
						+ 新增权限
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
								danger
								:disabled="!rowIds.length"
								data-testid="rbac-perm-btn-batch-delete"
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

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
					点击权限编码胶囊可一键复制
				</div>
			</div>

			<!-- 表格视图 -->
			<div class="flex-1 min-h-0 overflow-hidden">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: PermissionInfo) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 960, y: 'calc(100vh - 315px)' }"
					size="middle"
					data-testid="rbac-perm-table"
					@change="handleTableChange"
				>
					<template #bodyCell="{ column, record }">
						<!-- 1. 权限信息复合列 (名称 + 描述) -->
						<template v-if="column.key === 'permissionName'">
							<div class="flex flex-col py-0.5">
								<span
									class="font-semibold text-slate-800 dark:text-slate-100 text-[13px] leading-snug truncate"
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
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-blue-50/90 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70 border border-blue-200/70 dark:border-blue-800/80 cursor-pointer transition-colors select-all"
									@click="copyPermissionCode(record.permissionCode)"
								>
									{{ record.permissionCode }}
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
							<div class="flex items-center justify-center gap-1.5">
								<button
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
									data-testid="rbac-perm-row-view"
									@click="openPermissionDrawer('view', record.id)"
								>
									查看
								</button>

								<button
									v-permission="'permission:edit'"
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-blue-600 bg-blue-50/90 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 transition-colors cursor-pointer"
									data-testid="rbac-perm-row-edit"
									@click="openPermissionDrawer('update', record.id)"
								>
									编辑
								</button>

								<span v-permission="'permission:delete'">
									<a-popconfirm
										title="确认删除该权限点吗？"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delPermissionInfo(String(record.id))"
									>
										<button
											type="button"
											class="px-2 py-1 text-xs font-medium rounded-md text-rose-600 bg-rose-50/90 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 transition-colors cursor-pointer"
											data-testid="rbac-perm-row-delete"
										>
											删除
										</button>
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
import { SafetyCertificateOutlined } from '@ant-design/icons-vue';
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
