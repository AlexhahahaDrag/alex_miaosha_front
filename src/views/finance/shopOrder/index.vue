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
								:name="labelMap['saleOrderCode'].name"
								:label="labelMap['saleOrderCode'].label"
							>
								<a-input
									v-model:value="searchInfo.saleOrderCode"
									:placeholder="'请选择' + labelMap['saleOrderCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleOrderName'].name"
								:label="labelMap['saleOrderName'].label"
							>
								<a-input
									v-model:value="searchInfo.saleOrderName"
									:placeholder="'请选择' + labelMap['saleOrderName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleAmount'].name"
								:label="labelMap['saleAmount'].label"
							>
								<a-input
									v-model:value="searchInfo.saleAmount"
									:placeholder="'请选择' + labelMap['saleAmount'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['isValid'].name"
								:label="labelMap['isValid'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.isValid"
									:placeholder="'请输入' + labelMap['isValid'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="isValidList"
									:allowClear="true"
								>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleDate'].name"
								:label="labelMap['saleDate'].label"
							>
								<a-input
									v-model:value="searchInfo.saleDate"
									:placeholder="'请选择' + labelMap['saleDate'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['description'].name"
								:label="labelMap['description'].label"
							>
								<a-input
									v-model:value="searchInfo.description"
									:placeholder="'请选择' + labelMap['description'].label"
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
									:placeholder="'请选择' + labelMap['payWay'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleCount'].name"
								:label="labelMap['saleCount'].label"
							>
								<a-input
									v-model:value="searchInfo.saleCount"
									:placeholder="'请选择' + labelMap['saleCount'].label"
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
				<a-button type="primary" @click="editShopOrder('add')">新增</a-button>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelShopOrder"
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
								@click="editShopOrder('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopOrder(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopOrderDetailInfo
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopOrderDetailInfo>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo, PageInfo } from '@/views/common/config/index';
import { pagination } from '@/views/common/config/index';
import type { SearchInfo, DataItem } from './shopOrderListTs';
import { columns } from './shopOrderListTs';
import {
	getShopOrderPage,
	deleteShopOrder,
} from '@/api/finance/shopOrder/shopOrderTs';
import { message } from 'ant-design-vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { DictInfo } from '@/views/finance/dict/dict';

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
	saleOrderCode: { name: 'saleOrderCode', label: '订单编码' },
	saleOrderName: { name: 'saleOrderName', label: '订单名称' },
	saleAmount: { name: 'saleAmount', label: '总销售金额' },
	isValid: { name: 'isValid', label: '状态' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	description: { name: 'description', label: '描述' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleCount: { name: 'saleCount', label: '销售数量' },
});

let searchInfo = ref<SearchInfo>({});

let isValidList = ref<DictInfo[]>([]);

const getDictInfoList = (): void => {
	getDictList('is_valid').then((res) => {
		if (res.code == '200') {
			isValidList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getShopOrderListPage(searchInfo.value, pagination.value);
};

const handleTableChange = (pagination: PageInfo): void => {
	getShopOrderListPage(searchInfo.value, pagination);
};

const delShopOrder = (ids: string): void => {
	deleteShopOrder(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopOrderListPage(searchInfo.value, pagination.value);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelShopOrder = (): void => {
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
	delShopOrder(ids);
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getShopOrderListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopOrderPage(param, cur.current, cur.pageSize)
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
	getDictInfoList();
	//获取商店订单表页面数据
	getShopOrderListPage(searchInfo.value, pagination.value);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopOrder = (type: string, id?: number): void => {
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
	getShopOrderListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
