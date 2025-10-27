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
								:name="labelMap['shopId'].name"
								:label="labelMap['shopId'].label"
							>
								<a-input
									v-model:value="searchInfo.shopId"
									:placeholder="'请填写' + labelMap['shopId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['userId'].name"
								:label="labelMap['userId'].label"
							>
								<a-input
									v-model:value="searchInfo.userId"
									:placeholder="'请填写' + labelMap['userId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['customerId'].name"
								:label="labelMap['customerId'].label"
							>
								<a-input
									v-model:value="searchInfo.customerId"
									:placeholder="'请填写' + labelMap['customerId'].label"
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
								<a-input
									v-model:value="searchInfo.isValid"
									:placeholder="'请填写' + labelMap['isValid'].label"
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
				<a-button type="primary" @click="editShopCart('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelShopCart">
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
								@click="editShopCart('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopCart(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopCartDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></ShopCartDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './shopCartListTs';
import type { ModelInfo } from '@/views/common/config';
import { columns } from './shopCartListTs';
import { getShopCartPage, deleteShopCart } from '@/views/finance/shopCart/api';
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
	shopId: { name: 'shopId', label: '商品id' },
	userId: { name: 'userId', label: '人员id' },
	customerId: { name: 'customerId', label: '客户id' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleNum: { name: 'saleNum', label: '数量' },
});

let searchInfo = ref<SearchInfo>({});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getShopCartListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getShopCartListPage(searchInfo.value, pagination);
};

const delShopCart = (ids: string): void => {
	deleteShopCart(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getShopCartListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelShopCart = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopCart(rowIds.join(','));
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getShopCartListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopCartPage(param, cur.current, cur.pageSize)
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
	//获取购物车表页面数据
	getShopCartListPage(searchInfo.value, pagination);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopCart = (type: string, id?: number): void => {
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
	getShopCartListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
