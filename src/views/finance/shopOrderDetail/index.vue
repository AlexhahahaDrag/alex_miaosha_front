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
								:name="labelMap['orderId'].name"
								:label="labelMap['orderId'].label"
							>
								<a-input
									v-model:value="searchInfo.orderId"
									:placeholder="'请填写' + labelMap['orderId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
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
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleAmount'].name"
								:label="labelMap['saleAmount'].label"
							>
								<a-input
									v-model:value="searchInfo.saleAmount"
									:placeholder="'请填写' + labelMap['saleAmount'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['isValid'].name"
								:label="labelMap['isValid'].label"
							>
								<a-input
									v-model:value="searchInfo.isValid"
									:placeholder="'请填写' + labelMap['isValid'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleDate'].name"
								:label="labelMap['saleDate'].label"
							>
								<a-input
									v-model:value="searchInfo.saleDate"
									:placeholder="'请填写' + labelMap['saleDate'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['payWay'].name"
								:label="labelMap['payWay'].label"
							>
								<a-input
									v-model:value="searchInfo.payWay"
									:placeholder="'请填写' + labelMap['payWay'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleNum'].name"
								:label="labelMap['saleNum'].label"
							>
								<a-input
									v-model:value="searchInfo.saleNum"
									:placeholder="'请填写' + labelMap['saleNum'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['shopStockId'].name"
								:label="labelMap['shopStockId'].label"
							>
								<a-input
									v-model:value="searchInfo.shopStockId"
									:placeholder="'请填写' + labelMap['shopStockId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" style="text-align: right">
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
				<a-button type="primary" @click="editShopOrderDetail('add')"
					>新增</a-button
				>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelShopOrderDetail"
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
								@click="editShopOrderDetail('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopOrderDetail(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopOrderDetailDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopOrderDetailDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import { pagination } from '@/views/common/config';
import type { SearchInfo, DataItem, ModelInfo } from './shopOrderDetailListTs';
import { columns } from './shopOrderDetailListTs';
import {
	getShopOrderDetailPage,
	deleteShopOrderDetail,
} from '@/api/finance/shopOrderDetail/shopOrderDetailTs';
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

const labelMap = ref<any>({
	orderId: { name: 'orderId', label: '订单id' },
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	saleAmount: { name: 'saleAmount', label: '售价' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleNum: { name: 'saleNum', label: '个数' },
	shopStockId: { name: 'shopStockId', label: '商品库存id' },
});

let searchInfo = ref<SearchInfo>({});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getShopOrderDetailListPage(searchInfo.value, pagination.value);
};

const handleTableChange = (pagination: PageInfo): void => {
	getShopOrderDetailListPage(searchInfo.value, pagination);
};

const delShopOrderDetail = (ids: string): void => {
	deleteShopOrderDetail(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopOrderDetailListPage(searchInfo.value, pagination.value);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelShopOrderDetail = (): void => {
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
	delShopOrderDetail(ids);
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getShopOrderDetailListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopOrderDetailPage(param, cur.current, cur.pageSize)
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
};

const init = (): void => {
	//获取商店订单明细表页面数据
	getShopOrderDetailListPage(searchInfo.value, pagination.value);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopOrderDetail = (type: string, id?: number): void => {
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
	getShopOrderDetailListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
