<template>
	<div class="page-info">
		<div class="search">
			<div class="search-box">
				<a-form
					:model="searchInfo"
					:label-col="labelCol"
					:wrapper-col="wrapperCol"
				>
					<a-row :gutter="24">
						<a-col :span="6">
							<a-form-item name="name" label="分类名称">
								<a-input
									v-model:value="searchInfo.name"
									placeholder="分类名称"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="6" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="() => query()"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editPmsCategory('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelPmsCategory">
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editPmsCategory('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsCategory(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<PmsCategoryDetail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			></PmsCategoryDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, PmsCategoryData } from './pmsCategoryListTs';
import { columns } from './pmsCategoryListTs';
import {
	getPmsCategoryPage,
	deletePmsCategory,
} from '@/views/product/pmsCategory/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: PmsCategoryData,
		selected: boolean,
		selectedRows: PmsCategoryData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: PmsCategoryData[],
		changeRows: PmsCategoryData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getPmsCategoryListPage(searchInfo.value, pagination);
}

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getPmsCategoryListPage(searchInfo.value, pagination);
}

async function delPmsCategory(ids: string) {
	try {
		const { code, message: messageInfo } = await deletePmsCategory(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			query(true);
		} else {
			message.error(messageInfo || '删除失败！', 3);
		}
	} catch {
		message.error('删除失败，请稍后重试！', 3);
	}
}

const batchDelPmsCategory = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPmsCategory(rowIds.join(','));
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getPmsCategoryListPage = async (
	param: SearchInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPmsCategoryPage(param, cur.current, cur.pageSize);
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

// 初始化页面数据
const init = () => {
	//获取商品三级分类页面数据
	getPmsCategoryListPage(searchInfo.value, pagination);
};

init();

const modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsCategory(type: string, id?: number) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? undefined : id;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

// 移除冗余的 handleSuccess 函数

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

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};
</script>
<style lang="scss" scoped></style>
