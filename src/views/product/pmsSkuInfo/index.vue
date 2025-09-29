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
							<a-form-item name="spuId" label="spuId">
								<a-input
									v-model:value="searchInfo.spuId"
									placeholder="spuId"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="skuName" label="sku名称">
								<a-input
									v-model:value="searchInfo.skuName"
									placeholder="sku名称"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="skuDesc" label="sku介绍描述">
								<a-input
									v-model:value="searchInfo.skuDesc"
									placeholder="sku介绍描述"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="catalogId" label="所属分类id">
								<a-input
									v-model:value="searchInfo.catalogId"
									placeholder="所属分类id"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="6">
							<a-form-item name="brandId" label="品牌id">
								<a-input
									v-model:value="searchInfo.brandId"
									placeholder="品牌id"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="skuDefaultImg" label="默认图片">
								<a-input
									v-model:value="searchInfo.skuDefaultImg"
									placeholder="默认图片"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="skuTitle" label="标题">
								<a-input
									v-model:value="searchInfo.skuTitle"
									placeholder="标题"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="skuSubtitle" label="副标题">
								<a-input
									v-model:value="searchInfo.skuSubtitle"
									placeholder="副标题"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="6">
							<a-form-item name="price" label="价格">
								<a-input
									v-model:value="searchInfo.price"
									placeholder="价格"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="saleCount" label="销量">
								<a-input
									v-model:value="searchInfo.saleCount"
									placeholder="销量"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="6" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="query"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editPmsSkuInfo('add')">新增</a-button>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelPmsSkuInfo"
					>删除</a-button
				>
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
				:scroll="{ x: 1100 }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editPmsSkuInfo('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsSkuInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<PmsSkuInfoDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></PmsSkuInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { pagination } from '@/views/common/config';
import type { SearchInfo, DataItem } from './pmsSkuInfoListTs';
import { columns } from './pmsSkuInfoListTs';
import {
	getPmsSkuInfoPage,
	deletePmsSkuInfo,
} from '@/api/product/pmsSkuInfo/pmsSkuInfoTs';
import { message } from 'ant-design-vue';

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

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getPmsSkuInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(paginationInfo: PageInfo) {
	getPmsSkuInfoListPage(searchInfo.value, paginationInfo);
}

function delPmsSkuInfo(ids: string) {
	deletePmsSkuInfo(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getPmsSkuInfoListPage(searchInfo.value, pagination.value);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelPmsSkuInfo() {
	let ids = '';
	if (rowIds && rowIds.length > 0) {
		rowIds.forEach((item: string) => {
			ids += item + ',';
		});
		ids = ids.substring(0, ids.length - 1);
	} else {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPmsSkuInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
	console.log(e);
};

function getPmsSkuInfoListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getPmsSkuInfoPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data.records;
				pagination.value.current = res.data.current;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

function init() {
	//获取sku信息页面数据
	getPmsSkuInfoListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsSkuInfo(type: string, id?: number) {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
}

const handleOk = (v: boolean) => {
	visible.value = v;
	getPmsSkuInfoListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const initPage = () => {
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};
</script>
<style lang="scss" scoped></style>
