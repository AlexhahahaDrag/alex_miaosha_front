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
							<!-- AI Agent：取消核销（仅 USED 状态可操作） -->
							<a-popconfirm
								v-if="record.status === 'USED'"
								title="确认取消核销？取消后将回退本次核销数量"
								ok-text="确认"
								cancel-text="取消"
								@confirm="onCancelRedeem(record)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small">取消核销</a-button>
							</a-popconfirm>
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
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	getCpnUserCouponInfoPage,
	deleteCpnUserCouponInfo,
	cancelRedeemCpnUserCouponInfo,
} from './api/index';
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
		rowIds = [];
		getCpnUserCouponInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// AI Agent：取消核销（按数量核销）
const onCancelRedeem = async (record: CpnUserCouponInfoData) => {
	// 1) 参数兜底校验
	if (!record?.id) {
		message.warning('缺少券明细ID，无法取消核销');
		return;
	}
	if (!record?.userId || !record?.couponId) {
		message.warning('用户/消费券信息不完整，无法取消核销');
		return;
	}
	const redemptionQuantity = Number(record.redemptionQuantity ?? 1);
	if (!Number.isFinite(redemptionQuantity) || redemptionQuantity <= 0) {
		message.warning('核销数量异常，无法取消核销');
		return;
	}

	// 2) 调用后端取消核销接口
	loading.value = true;
	try {
		const { code, message: messageInfo } = await cancelRedeemCpnUserCouponInfo({
			userId: record.userId,
			couponId: record.couponId,
			userCouponId: record.id,
			redemptionQuantity,
			remarks: '列表取消核销',
		});
		if (code === '200') {
			message.success(messageInfo || '取消核销成功！');
			rowIds = [];
			getCpnUserCouponInfoListPage(searchInfo.value, pagination);
		} else {
			message.error(messageInfo || '取消核销失败！');
		}
	} finally {
		loading.value = false;
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

const init = (): void => {
	//获取用户消费券库存表 (按数量核销)页面数据
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
