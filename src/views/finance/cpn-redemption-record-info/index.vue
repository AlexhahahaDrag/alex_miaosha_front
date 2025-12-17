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
								:name="labelMap['userCouponId'].name"
								:label="labelMap['userCouponId'].label"
							>
								<a-input
									v-model:value="searchInfo.userCouponId"
									:placeholder="'请输入' + labelMap['userCouponId'].label"
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
									:placeholder="'请输入' + labelMap['userId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['orderId'].name"
								:label="labelMap['orderId'].label"
							>
								<a-input
									v-model:value="searchInfo.orderId"
									:placeholder="'请输入' + labelMap['orderId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['redemptionQuantity'].name"
								:label="labelMap['redemptionQuantity'].label"
							>
								<a-input
									v-model:value="searchInfo.redemptionQuantity"
									:placeholder="'请输入' + labelMap['redemptionQuantity'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['redemptionValue'].name"
								:label="labelMap['redemptionValue'].label"
							>
								<a-input
									v-model:value="searchInfo.redemptionValue"
									:placeholder="'请输入' + labelMap['redemptionValue'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['redemptionTime'].name"
								:label="labelMap['redemptionTime'].label"
							>
								<a-input
									v-model:value="searchInfo.redemptionTime"
									:placeholder="'请输入' + labelMap['redemptionTime'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['merchantId'].name"
								:label="labelMap['merchantId'].label"
							>
								<a-input
									v-model:value="searchInfo.merchantId"
									:placeholder="'请输入' + labelMap['merchantId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" style="text-align: right; margin-bottom: 20px">
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
				<a-button type="primary" @click="editCpnRedemptionRecordInfo('add')"
					>新增</a-button
				>
				<a-button
					type="primary"
					danger
					@click="batchDelCpnRedemptionRecordInfo"
				>
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnRedemptionRecordInfoData) => record.id || 0"
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
								@click="editCpnRedemptionRecordInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delCpnRedemptionRecordInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
			<CpnRedemptionRecordInfoDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</CpnRedemptionRecordInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	getCpnRedemptionRecordInfoPage,
	deleteCpnRedemptionRecordInfo,
} from './api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnRedemptionRecordInfoData } from './config';
import { columns, labelMap, labelCol, wrapperCol } from './config';
import { usePagination, type PageInfo } from '@/composables/usePagination';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

let loading = ref<boolean>(false);

let dataSource = ref<CpnRedemptionRecordInfoData[]>([]);

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

let rowIds: (string | number)[] = [];

let searchInfo = ref<CpnRedemptionRecordInfoData>({});

const rowSelection = ref({
	checkStrictly: false,
	onChange: (
		selectedRowKeys: (string | number)[],
		_selectedRows: CpnRedemptionRecordInfoData[],
	) => {
		console.log(_selectedRows);
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: CpnRedemptionRecordInfoData,
		selected: boolean,
		selectedRows: CpnRedemptionRecordInfoData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: CpnRedemptionRecordInfoData[],
		changeRows: CpnRedemptionRecordInfoData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

const delCpnRedemptionRecordInfo = async (ids: string) => {
	const { code, message: messageInfo } =
		await deleteCpnRedemptionRecordInfo(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelCpnRedemptionRecordInfo = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delCpnRedemptionRecordInfo(rowIds.join(','));
};

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getCpnRedemptionRecordInfoListPage = async (
	param: CpnRedemptionRecordInfoData,
	cur: PageInfo,
) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getCpnRedemptionRecordInfoPage(
		param,
		cur.current,
		cur.pageSize,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		let curData = data;
		dataSource.value = curData?.records || [];
		pagination.current = curData?.current || 1;
		pagination.pageSize = curData?.size || 10;
		setTotal(curData?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

//新增和修改弹窗
const editCpnRedemptionRecordInfo = (type: string, id?: number): void => {
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
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};

const init = (): void => {
	//获取消费券核销记录表 (按数量核销)页面数据
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
