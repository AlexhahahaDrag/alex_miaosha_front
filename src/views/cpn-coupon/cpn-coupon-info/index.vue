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
									format="YYYY-MM-DD HH:mm"
									:placeholder="'请输入' + labelMap['endDate'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['onlyValidAndNotFullyRedeemed'].name"
								:label="labelMap['onlyValidAndNotFullyRedeemed'].label"
							>
								<!-- AI Agent：有效状态筛选（全部/有效） -->
								<a-select
									v-model:value="searchInfo.onlyValidAndNotFullyRedeemed"
									:placeholder="
										'请选择' + labelMap['onlyValidAndNotFullyRedeemed'].label
									"
									allow-clear
								>
									<a-select-option :value="true">有效</a-select-option>
									<a-select-option :value="null">全部</a-select-option>
								</a-select>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
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
				<a-button type="primary" @click="editCpnCouponInfo('add')">
					新增
				</a-button>
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
				:scroll="{ x: 'max-content', y: '465px' }"
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
								v-if="record.remainingQuantity"
								type="primary"
								size="small"
								@click="onShowRedeemQuantityModal(record)"
							>
								核销
							</a-button>
							<a-popconfirm
								v-if="record.remainingQuantity"
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
					<template v-else-if="column.key === 'paymentStatus'">
						<!-- AI Agent：支付状态展示（1：已支付，0：未支付） -->
						<a-tag :color="record.paymentStatus === 1 ? 'green' : 'default'">
							{{ record.paymentStatus === 1 ? '已支付' : '未支付' }}
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
				:coupon-info="redeemCouponInfo || undefined"
				@handleOk="onRedeemOk"
				@handleCancel="onRedeemCancel"
			/>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { TableRowSelection } from 'ant-design-vue/es/table/interface';
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

// 搜索信息（AI Agent：默认查询有效的数据）
let searchInfo = ref<CpnCouponInfoData>({
	onlyValidAndNotFullyRedeemed: true,
});

// 行选择
const rowSelection = ref<TableRowSelection>({
	checkStrictly: false,
	// AI Agent：当 remainingQuantity 为 0 时禁用勾选（包含“全选”也会自动跳过禁用项）
	getCheckboxProps: (record: CpnCouponInfoData) => ({
		disabled: (record.remainingQuantity ?? 0) === 0,
	}),
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

// 清空搜索（AI Agent：清空后恢复默认查询有效数据）
const cancelQuery = (): void => {
	searchInfo.value = {
		onlyValidAndNotFullyRedeemed: true,
	};
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
		rowIds = [];
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
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
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
	redeemModelInfo.value = {
		open: true,
		title: '消费券核销',
		width: 'min(600px, 60%)',
		id: record.id || undefined,
	};
	redeemCouponInfo.value = record;
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
		pagination.current = 1;
		triggerDebouncedQuery();
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>
<style lang="scss" scoped></style>
