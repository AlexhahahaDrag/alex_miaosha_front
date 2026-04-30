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
									:placeholder="'请填写' + labelMap['saleOrderCode'].label"
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
									:placeholder="'请填写' + labelMap['saleOrderName'].label"
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
									:placeholder="'请填写' + labelMap['saleAmount'].label"
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
									:placeholder="'请选择' + labelMap['isValid'].label"
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
									:placeholder="'请填写' + labelMap['saleDate'].label"
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
									:placeholder="'请填写' + labelMap['description'].label"
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
								:name="labelMap['saleCount'].name"
								:label="labelMap['saleCount'].label"
							>
								<a-input
									v-model:value="searchInfo.saleCount"
									:placeholder="'请填写' + labelMap['saleCount'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" class="actions-col">
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
				<a-button type="primary" danger @click="batchDelShopOrder">
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
								@click="editShopOrder('update', record.id)"
							>
								编辑
							</a-button>
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
				v-model:open="visible"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			></ShopOrderDetailInfo>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { ShopOrderData } from '@/views/finance/shopOrder/config';
import { columns } from '@/views/finance/shopOrder/config';
import {
	getShopOrderPage,
	deleteShopOrder,
} from '@/views/finance/shopOrder/api';
import { message } from 'ant-design-vue';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const isValidList = computed(() => getDictByType('is_valid'));

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const rowIds = ref<(string | number)[]>([]);

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

const labelMap: Record<string, { name: string; label: string }> = {
	saleOrderCode: { name: 'saleOrderCode', label: '订单编码' },
	saleOrderName: { name: 'saleOrderName', label: '订单名称' },
	saleAmount: { name: 'saleAmount', label: '总销售金额' },
	isValid: { name: 'isValid', label: '状态' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	description: { name: 'description', label: '描述' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleCount: { name: 'saleCount', label: '销售数量' },
};

const searchInfo = ref<ShopOrderData>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopOrderData[]>([]);
const visible = ref<boolean>(false);
const modelInfo = ref<ModelInfo>({});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getShopOrderListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	getShopOrderListPage(searchInfo.value, paginationInfo);
};

const delShopOrder = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopOrder(ids);
	if (code === '200') {
		message.success(('删除' + messageInfo) || '删除成功！', 3);
		rowIds.value = [];
		getShopOrderListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopOrder = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopOrder(rowIds.value.join(','));
};

const cancel = (): void => {};

const getShopOrderListPage = async (
	param: ShopOrderData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	const { code, data, message: messageInfo } = await getShopOrderPage(
		param,
		cur.current,
		cur.pageSize,
	).finally(() => {
		loading.value = false;
	});
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const init = (): void => {
	//获取商店订单表页面数据
	getShopOrderListPage(searchInfo.value, pagination);
};

//新增和修改弹窗
const editShopOrder = (type: string, id?: number): void => {
	if (type === 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type === 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id ? String(id) : undefined;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
};

const handleSuccess = (): void => {
	getShopOrderListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.actions-col {
	text-align: right;
}
</style>
