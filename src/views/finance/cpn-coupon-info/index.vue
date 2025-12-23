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
								:name="labelMap['couponName'].name"
								:label="labelMap['couponName'].label"
							>
								<a-input
									v-model:value="searchInfo.couponName"
									:placeholder="'请输入' + labelMap['couponName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['endDate'].name"
								:label="labelMap['endDate'].label"
							>
								<a-date-picker
									v-model:value="searchInfo.endDate"
									show-time
									format="YYYY-MM-DD HH:mm:ss"
									:placeholder="'请输入' + labelMap['endDate'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8" style="text-align: right; margin-bottom: 20px">
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
				<a-button type="primary" @click="editCpnCouponInfo('add')"
					>新增</a-button
				>
				<a-button type="primary" danger @click="batchDelCpnCouponInfo">
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnCouponInfoData) => record.id || 0"
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
								@click="editCpnCouponInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-button
								type="primary"
								size="small"
								@click="onShowRedeemQuantityModal(record)"
							>
								消费券核销数量
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delCpnCouponInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
					<template v-else-if="column.key === 'expireStatus'">
						<!-- AI Agent：超过3天（expireRangeStatus === 3）时不展示标签 -->
						<a-tag
							v-if="record.expireRangeStatus !== 3"
							:color="getExpireStatusColor(record.expireRangeStatus)"
						>
							{{ record.expireStatus }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<cpn-coupon-info-detail
				ref="editInfo"
				:open="modelInfo.open"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</cpn-coupon-info-detail>
			<cpn-coupon-redeem-quantity-detail
				:open="redeemModelInfo.open"
				:modelInfo="redeemModelInfo"
				:couponInfo="redeemCouponInfo"
				@handleOk="onRedeemOk"
				@handleCancel="onRedeemCancel"
			/>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from './api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from './config';
import {
	columns,
	labelMap,
	labelCol,
	wrapperCol,
	getExpireStatusColor,
} from './config';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { debounce } from 'lodash-es';
import CpnCouponRedeemQuantityDetail from './cpn-coupon-redeem-quantity-detail/index.vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

// 加载中
let loading = ref<boolean>(false);

// 数据源
let dataSource = ref<CpnCouponInfoData[]>([]);

// modal信息
let modelInfo = ref<ModelInfo>({});

// AI Agent：核销弹窗（仿造 `cpn-coupon-info-detail` 的弹窗模式）
let redeemModelInfo = ref<ModelInfo>({});
let redeemCouponInfo = ref<CpnCouponInfoData | null>(null);

let rowIds: (string | number)[] = [];

// 搜索信息
let searchInfo = ref<CpnCouponInfoData>({});

// 行选择
const rowSelection = ref({
	checkStrictly: false,
	onChange: (
		selectedRowKeys: (string | number)[],
		_selectedRows: CpnCouponInfoData[],
	) => {
		console.log(_selectedRows);
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: CpnCouponInfoData,
		selected: boolean,
		selectedRows: CpnCouponInfoData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: CpnCouponInfoData[],
		changeRows: CpnCouponInfoData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 清空搜索
const cancelQuery = (): void => {
	searchInfo.value = {};
	pagination.current = 1;
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

// 查询
const query = (): void => {
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

// 查询条件防抖：任意查询条件变化 300ms 后触发查询
const triggerDebouncedQuery = debounce((): void => {
	getCpnCouponInfoListPage(searchInfo.value, pagination);
}, 300);

const handleTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

const delCpnCouponInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteCpnCouponInfo(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getCpnCouponInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelCpnCouponInfo = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delCpnCouponInfo(rowIds.join(','));
};

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getCpnCouponInfoListPage = async (
	param: CpnCouponInfoData,
	cur: PageInfo,
) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getCpnCouponInfoPage(param, cur.current, cur.pageSize).finally(
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
const editCpnCouponInfo = (type: string, id?: number): void => {
	let add = '新增';
	if (type == 'update') {
		add = '修改';
	}
	modelInfo.value = {
		confirmLoading: true,
		open: true,
		id: id || undefined,
		title: add + '消费券信息',
	};
};

const handleOk = (v: boolean): void => {
	modelInfo.value.open = v;
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	modelInfo.value.open = v;
};

// AI Agent：打开“消费券核销数量”弹窗（事件处理函数以 on 开头）
const onShowRedeemQuantityModal = (record: CpnCouponInfoData): void => {
	redeemCouponInfo.value = record;
	redeemModelInfo.value = {
		open: true,
		title: '消费券核销数量',
		width: 'min(1000px, 80%)',
		id: record.id || undefined,
	};
};

// AI Agent：核销弹窗 - 保存成功回调
const onRedeemOk = (v: boolean): void => {
	redeemModelInfo.value.open = v;
	// 核销成功后刷新列表（接口接入后保持同样逻辑）
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

// AI Agent：核销弹窗 - 取消回调
const onRedeemCancel = (v: boolean): void => {
	redeemModelInfo.value.open = v;
	redeemCouponInfo.value = null;
};

const init = (): void => {
	//获取消费券信息表页面数据
	pagination.current = 1;
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

init();

// 页面卸载时取消防抖任务，避免产生“卸载后仍触发请求”的副作用
onUnmounted(() => {
	triggerDebouncedQuery.cancel();
});

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>
<style lang="scss" scoped></style>
