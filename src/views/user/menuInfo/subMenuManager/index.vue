<template>
	<a-drawer
		v-model:open="modelInfo.open"
		:title="modelInfo.title || '子菜单管理'"
		width="1000px"
		destroy-on-close
		class="modern-submenu-drawer"
		@close="handleClose"
	>
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium">
					共 {{ pagination.total || dataSource.length }} 个子项
				</span>
			</div>
			<a-button
				type="primary"
				:loading="loading"
				class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
				@click="editSubMenu('add')"
			>
				<template #icon><PlusOutlined /></template>
				新增子菜单
			</a-button>
		</div>

		<div class="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden p-1">
			<a-table
				:data-source="dataSource"
				:columns="subMenuColumns"
				:loading="loading"
				:row-key="(record: any) => record.id"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				class="modern-menu-table"
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
								type="text"
								size="small"
								class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
								@click="editSubMenu('update', record.id)"
							>
								<template #icon><EditOutlined /></template>
								编辑
							</a-button>

							<a-popconfirm
								title="确认删除该子菜单?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delSubMenu(record.id)"
							>
								<a-button
									type="text"
									size="small"
									danger
									class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 transition-colors"
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

		<menu-info-detail
			v-model:model-info="subMenuModelInfo"
			@success="() => getSubMenuList()"
		></menu-info-detail>
	</a-drawer>
</template>

<script setup lang="ts">
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import MenuInfoDetail from '../menuInfoDetail/index.vue';
import { getMenuInfoPage, deleteMenuInfo } from '@/views/user/menuInfo/api';
import { usePagination } from '@/composables/usePagination';
import type { ModelInfo } from '@/views/common/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import { columns } from '@/views/user/menuInfo/config';

// 3. Hooks
const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

// 4. State
const loading = ref<boolean>(false);
const dataSource = ref<MenuInfoData[]>([]);
const subMenuModelInfo = ref<ModelInfo>({});
const subMenuColumns = columns; // 复用主列表配置

// 5. Actions (业务处理逻辑)
const handleTableChange = (paginationInfo: any) => {
	paginationChange(paginationInfo);
	getSubMenuList();
};

const editSubMenu = (type: string, id?: string) => {
	const isAdd = type === 'add';
	subMenuModelInfo.value = {
		title: isAdd ? '新增子菜单' : '编辑子菜单',
		open: true,
		id: isAdd ? undefined : id,
		parentId: isAdd ? modelInfo.value.id : undefined,
	};
};

const delSubMenu = async (id: string) => {
	const { code, message: messageInfo } = await deleteMenuInfo(id);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功');
		getSubMenuList();
	} else {
		message.error(messageInfo || '删除失败');
	}
};

const handleClose = () => {
	dataSource.value = [];
	resetPagination();
};

const getSubMenuList = async () => {
	if (!modelInfo.value.id) return;
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getMenuInfoPage(
			{ parentId: String(modelInfo.value.id) },
			pagination.current,
			pagination.pageSize,
		);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '获取子菜单失败');
		}
	} finally {
		loading.value = false;
	}
};

// 7. Watchers
watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal && modelInfo.value.id) {
			resetPagination();
			getSubMenuList();
		}
	},
);

// 8. Emits (永远是最后一行)
const emit = defineEmits(['success']);
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
		padding: 11px 14px;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #f1f5f9;
		padding: 10px 14px;
		transition: background-color 0.2s ease;
	}

	:deep(.ant-table-tbody > tr:hover > td) {
		background: #f8fafc !important;
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
