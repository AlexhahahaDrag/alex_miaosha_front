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
								:name="labelMap['stockId'].name"
								:label="labelMap['stockId'].label"
							>
								<a-input
									v-model:value="searchInfo.stockId"
									:placeholder="'请填写' + labelMap['stockId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['attrCode'].name"
								:label="labelMap['attrCode'].label"
							>
								<a-input
									v-model:value="searchInfo.attrCode"
									:placeholder="'请填写' + labelMap['attrCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['attrName'].name"
								:label="labelMap['attrName'].label"
							>
								<a-input
									v-model:value="searchInfo.attrName"
									:placeholder="'请填写' + labelMap['attrName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['attrValue'].name"
								:label="labelMap['attrValue'].label"
							>
								<a-input
									v-model:value="searchInfo.attrValue"
									:placeholder="'请填写' + labelMap['attrValue'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
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
								:name="labelMap['description'].name"
								:label="labelMap['description'].label"
							>
								<a-input
									v-model:value="searchInfo.description"
									:placeholder="'请填写' + labelMap['description'].label"
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
				<a-button type="primary" @click="editShopStockAttrs('add')"
					>新增</a-button
				>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelShopStockAttrs"
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
								@click="editShopStockAttrs('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStockAttrs(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopStockAttrsDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopStockAttrsDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './shopStockAttrsListTs';
import { columns } from './shopStockAttrsListTs';
import {
	getShopStockAttrsPage,
	deleteShopStockAttrs,
} from '@/api/finance/shopStockAttrs/shopStockAttrsTs';
import { message } from 'ant-design-vue';
import { getDictList } from '@/api/finance/dict/dictManager';
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
	stockId: { name: 'stockId', label: '库存id' },
	attrCode: { name: 'attrCode', label: '商品属性编码' },
	attrName: { name: 'attrName', label: '商品属性名称' },
	attrValue: { name: 'attrValue', label: '商品属性值' },
	isValid: { name: 'isValid', label: '状态' },
	description: { name: 'description', label: '描述' },
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
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

const handleTableChange = (pagination: PageInfo): void => {
	paginationChange(pagination);
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

const delShopStockAttrs = (ids: string): void => {
	deleteShopStockAttrs(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopStockAttrsListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelShopStockAttrs = (): void => {
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
	delShopStockAttrs(ids);
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getShopStockAttrsListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopStockAttrsPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data.records;
				setTotal(res.data.total);
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
	//获取商店库存属性表页面数据
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopStockAttrs = (type: string, id?: number): void => {
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
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
