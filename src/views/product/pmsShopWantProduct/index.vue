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
							<a-form-item name="name" label="商品名称">
								<a-input
									v-model:value="searchInfo.name"
									placeholder="商品名称"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="shop" label="商铺">
								<a-input
									v-model:value="searchInfo.shop"
									placeholder="商铺"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="source" label="来源">
								<a-select
									ref="select"
									v-model:value="searchInfo.source"
									placeholder="请选择来源类型"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="sourceList"
									@change="initPage"
									:allowClear="true"
								></a-select>
							</a-form-item>
						</a-col>
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
				<a-button type="primary" @click="editPmsShopWantProduct('add')"
					>新增</a-button
				>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelPmsShopWantProduct"
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
								@click="editPmsShopWantProduct('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsShopWantProduct(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
					<template v-else-if="column.key === 'source'">
						<div v-for="source in sourceTransferList" :key="source.value">
							<MySvgIcon
								v-if="
									record.source.indexOf(source.value) >= 0 && source.value != ''
								"
								:name="source.label"
								class="svg"
								style="
									width: 1.5em;
									height: 1.5em;
									font-size: 18px;
									cursor: pointer;
									vertical-align: middle;
								"
							></MySvgIcon>
						</div>
					</template>
				</template>
			</a-table>
			<PmsShopWantProductDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</PmsShopWantProductDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';

// 字典数据已通过 useDictInfo 自动加载
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type {
	SearchInfo,
	PmsShopWantProductData,
} from './pmsShopWantProductListTs';
import { columns, sourceTransferList } from './pmsShopWantProductListTs';
import {
	getPmsShopWantProductPage,
	deletePmsShopWantProduct,
} from '@/views/product/pmsShopWantProduct/api';
import { message } from 'ant-design-vue';
import type { DictInfo } from '@/views/finance/dict/dict';

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
	onSelect: (
		record: PmsShopWantProductData,
		selected: boolean,
		selectedRows: PmsShopWantProductData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: PmsShopWantProductData[],
		changeRows: PmsShopWantProductData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

let searchInfo = ref<SearchInfo>({});
const sourceList = ref<DictInfo[]>([{ typeName: '请填写', typeCode: '' }]);

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getPmsShopWantProductListPage(searchInfo.value, pagination);
}

function handleTableChange(paginationInfo: PageInfo) {
	paginationChange(paginationInfo);
	getPmsShopWantProductListPage(searchInfo.value, paginationInfo);
}

function delPmsShopWantProduct(ids: string) {
	deletePmsShopWantProduct(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getPmsShopWantProductListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelPmsShopWantProduct() {
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
	delPmsShopWantProduct(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getPmsShopWantProductListPage = async (
	param: SearchInfo,
	cur: PageInfo,
) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getPmsShopWantProductPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

// 字典数据已通过 useDictInfo 自动加载

function init() {
	//获取商品想买网上商品信息页面数据
	getPmsShopWantProductListPage(searchInfo.value, pagination);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsShopWantProduct(type: string, id?: number) {
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
	getPmsShopWantProductListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};
</script>
<style lang="scss" scoped></style>
