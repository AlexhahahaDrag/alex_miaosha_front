<template>
	<a-drawer
		v-model:open="modelInfo.open"
		:title="modelInfo.title || '子菜单管理'"
		width="1000px"
		destroy-on-close
		@close="handleClose"
	>
		<div class="button" style="margin-bottom: 16px">
			<a-button type="primary" :loading="loading" @click="editSubMenu('add')">
				新增子菜单
			</a-button>
		</div>
		<a-table
			:data-source="dataSource"
			:columns="subMenuColumns"
			:loading="loading"
			:row-key="(record: any) => record.id"
			:pagination="pagination"
			:scroll="{ x: 'max-content' }"
			@change="handleTableChange"
		>
			<template #bodyCell="{ column, record }">
				<template v-if="column.key === 'operation'">
					<a-space>
						<a-button
							type="primary"
							size="small"
							@click="editSubMenu('update', record.id)"
						>
							编辑
						</a-button>
						<a-popconfirm
							title="确认删除该子菜单?"
							ok-text="确认"
							cancel-text="取消"
							@confirm="delSubMenu(record.id)"
						>
							<a-button type="primary" size="small" danger>删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</a-table>

		<!-- 复用主详情组件进行子菜单编辑 -->
		<menu-info-detail
			ref="subMenuEdit"
			v-model:model-info="subMenuModelInfo"
			@success="handleSuccess"
		></menu-info-detail>
	</a-drawer>
</template>

<script setup lang="ts">
// 1. Imports (框架 > 公共组件 > 业务组件 > 工具函数 > 类型定义)
import { ref, watch } from 'vue';
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

const editSubMenu = (type: string, id?: number) => {
	if (type === 'add') {
		subMenuModelInfo.value = {
			title: '新增子菜单',
			open: true,
			parentId: Number(modelInfo.value.id),
		};
	} else {
		subMenuModelInfo.value = {
			title: '编辑子菜单',
			open: true,
			id: String(id),
		};
	}
};

const delSubMenu = async (id: number) => {
	const { code, message: messageInfo } = await deleteMenuInfo(String(id));
	if (code === '200') {
		message.success(messageInfo || '删除成功');
		getSubMenuList();
	} else {
		message.error(messageInfo || '删除失败');
	}
};

const handleSuccess = () => {
	getSubMenuList();
};

const handleClose = () => {
	dataSource.value = [];
	resetPagination();
};

const getSubMenuList = async () => {
	if (!modelInfo.value.id) return;
	loading.value = true;
	try {
		const { code, data, message: messageInfo } = await getMenuInfoPage(
			{ parentId: Number(modelInfo.value.id) },
			pagination.current,
			pagination.pageSize
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
	}
);

// 8. Emits (永远是最后一行)
const emit = defineEmits(['success']);
</script>
