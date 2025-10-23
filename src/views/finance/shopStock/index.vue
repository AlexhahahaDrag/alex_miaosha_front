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
								:name="labelMap['shopName'].name"
								:label="labelMap['shopName'].label"
							>
								<a-input
									v-model:value="searchInfo.shopName"
									:placeholder="'请填写' + labelMap['shopName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['shopCode'].name"
								:label="labelMap['shopCode'].label"
							>
								<a-input
									v-model:value="searchInfo.shopCode"
									:placeholder="'请填写' + labelMap['shopCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['category'].name"
								:label="labelMap['category'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.category"
									:placeholder="'请输入' + labelMap['category'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="categoryList"
									:allowClear="true"
								>
								</a-select>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['purchasePlace'].name"
								:label="labelMap['purchasePlace'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.purchasePlace"
									:placeholder="'请输入' + labelMap['purchasePlace'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="purchasePlaceList"
									:allowClear="true"
								>
								</a-select>
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
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editShopStock('add')">新增</a-button>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelShopStock"
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
				:scroll="{ x: 1100, y: 420 }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editShopStock('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStock(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopStockDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopStockDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './shopStockListTs';
import { columns } from './shopStockListTs';
import {
	getShopStockPage,
	deleteShopStock,
} from '@/views/finance/shopStock/api';
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
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	costAmount: { name: 'costAmount', label: '成本价' },
	saleAmount: { name: 'saleAmount', label: '零售价' },
	isValid: { name: 'isValid', label: '状态' },
	saleDate: { name: 'saleDate', label: '进货日期' },
	category: { name: 'category', label: '类别' },
	purchasePlace: { name: 'purchasePlace', label: '进货地点' },
	saleNum: { name: 'saleNum', label: '数量' },
});

let searchInfo = ref<SearchInfo>({});

// 字典数据已通过 useDictInfo 自动加载
const categoryList = computed(() => getDictByType('category'));
const purchasePlaceList = computed(() => getDictByType('purchase_place'));

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getShopStockListPage(searchInfo.value, pagination);
}

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getShopStockListPage(searchInfo.value, pagination);
}

function delShopStock(ids: string) {
	deleteShopStock(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopStockListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelShopStock() {
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
	delShopStock(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
	console.log(e);
};

function getShopStockListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getShopStockPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data?.records || [];
				setTotal(res.data?.total || 0);
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

function init() {
	//获取商店库存表页面数据
	getShopStockListPage(searchInfo.value, pagination);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editShopStock(type: string, id?: number) {
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
	getShopStockListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
