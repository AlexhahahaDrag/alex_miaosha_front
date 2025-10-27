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
						<a-col :span="8">
							<a-form-item
								:name="labelMap['batchCode'].name"
								:label="labelMap['batchCode'].label"
							>
								<a-input
									v-model:value="searchInfo.batchCode"
									:placeholder="'请填写' + labelMap['batchCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['batchName'].name"
								:label="labelMap['batchName'].label"
							>
								<a-input
									v-model:value="searchInfo.batchName"
									:placeholder="'请填写' + labelMap['batchName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col style="text-align: right">
							<a-space>
								<a-button type="primary" @click="query"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button" style="margin-left: 10px">
			<a-space>
				<a-button type="primary" @click="editShopStockBatch('add')">
					新增
				</a-button>
				<a-button type="primary" danger @click="batchDelShopStockBatch">
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
				:scroll="{ x: 'max-content', y: 470 }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editShopStockBatch('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStockBatch(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'isValid'">
						<a-tag
							:key="record.isValid"
							:color="record.isValid == 1 ? '#87d068' : 'grey'"
						>
							{{ record.isValid == 1 ? '有效' : '失效' }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<ShopStockBatchDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopStockBatchDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './shopStockBatchListTs';
import { columns } from './shopStockBatchListTs';
import {
	getShopStockBatchPage,
	deleteShopStockBatch,
} from '@/views/finance/shopStockBatch/api';
import { message } from 'ant-design-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: DataItem[],
		changeRows: DataItem[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

const labelMap = ref<Record<string, { name: string; label: string }>>({
	batchCode: { name: 'batchCode', label: '订单编码' },
	batchName: { name: 'batchName', label: '订单名称' },
	isValid: { name: 'isValid', label: '状态' },
	description: { name: 'description', label: '描述' },
});

let searchInfo = ref<SearchInfo>({});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getShopStockBatchListPage(searchInfo.value, pagination);
};

const handleTableChange = (pagination: PageInfo): void => {
	paginationChange(pagination);
	getShopStockBatchListPage(searchInfo.value, pagination);
};

const delShopStockBatch = (ids: string): void => {
	deleteShopStockBatch(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopStockBatchListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelShopStockBatch = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopStockBatch(rowIds.join(','));
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getShopStockBatchListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopStockBatchPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data?.records;
				setTotal(res.data?.total || 0);
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const init = (): void => {
	//获取商店库存批次表页面数据
	getShopStockBatchListPage(searchInfo.value, pagination);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopStockBatch = (type: string, id?: number): void => {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
};

const handleOk = (v: boolean): void => {
	visible.value = v;
	getShopStockBatchListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
