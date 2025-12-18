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
								:name="labelMap['couponId'].name"
								:label="labelMap['couponId'].label"
							>
								<a-input
									v-model:value="searchInfo.couponId"
									:placeholder="'请输入' + labelMap['couponId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['status'].name"
								:label="labelMap['status'].label"
							>
								<a-input
									v-model:value="searchInfo.status"
									:placeholder="'请输入' + labelMap['status'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['receiveTime'].name"
								:label="labelMap['receiveTime'].label"
							>
								<a-date-picker
									show-time
									format="YYYY-MM-DD HH:mm:ss"
									v-model:value="searchInfo.receiveTime"
									:placeholder="'请输入' + labelMap['receiveTime'].label"
									allow-clear
								>
								</a-date-picker>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['expireTime'].name"
								:label="labelMap['expireTime'].label"
							>
								<a-date-picker
									show-time
									format="YYYY-MM-DD HH:mm:ss"
									v-model:value="searchInfo.expireTime"
									:placeholder="'请输入' + labelMap['expireTime'].label"
									allow-clear
								>
								</a-date-picker>
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
				<a-button type="primary" @click="editCpnUserCouponInfo('add')"
					>新增</a-button
				>
				<a-button type="primary" danger @click="batchDelCpnUserCouponInfo">
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnUserCouponInfoData) => record.id || 0"
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
								@click="editCpnUserCouponInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delCpnUserCouponInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
			<cpn-user-coupon-info-detail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</cpn-user-coupon-info-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getCpnUserCouponInfoPage, deleteCpnUserCouponInfo } from './api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnUserCouponInfoData } from './config';
import { columns, labelMap, labelCol, wrapperCol } from './config';
import { usePagination, type PageInfo } from '@/composables/usePagination';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

let loading = ref<boolean>(false);

let dataSource = ref<CpnUserCouponInfoData[]>([]);

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

let rowIds: (string | number)[] = [];

let searchInfo = ref<CpnUserCouponInfoData>({});

const rowSelection = ref({
	checkStrictly: false,
	onChange: (
		selectedRowKeys: (string | number)[],
		_selectedRows: CpnUserCouponInfoData[],
	) => {
		console.log(_selectedRows);
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: CpnUserCouponInfoData,
		selected: boolean,
		selectedRows: CpnUserCouponInfoData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: CpnUserCouponInfoData[],
		changeRows: CpnUserCouponInfoData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const delCpnUserCouponInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteCpnUserCouponInfo(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getCpnUserCouponInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelCpnUserCouponInfo = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delCpnUserCouponInfo(rowIds.join(','));
};

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getCpnUserCouponInfoListPage = async (
	param: CpnUserCouponInfoData,
	cur: PageInfo,
) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getCpnUserCouponInfoPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
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
const editCpnUserCouponInfo = (type: string, id?: number): void => {
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
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};

const init = (): void => {
	//获取用户消费券库存表 (按数量核销)页面数据
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
