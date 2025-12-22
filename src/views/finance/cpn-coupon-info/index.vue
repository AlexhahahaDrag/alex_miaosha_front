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
							<Tag :color="getExpireStatusColor(record.expireRangeStatus)">
								{{ record.expireStatus }}
							</Tag>
						</template>
					</template>
			</a-table>
			<cpn-coupon-info-detail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</cpn-coupon-info-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message, Tag } from 'ant-design-vue';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from './api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from './config';
import { columns, labelMap, labelCol, wrapperCol } from './config';
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

// 是否显示弹窗
let visible = ref<boolean>(false);

// modal信息
let modelInfo = ref<ModelInfo>({});

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

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
// AI Agent：使用 lodash-es 的 debounce，避免输入频繁变化导致接口被高频调用
// 获取过期状态颜色
const getExpireStatusColor = (status: number | undefined): string => {
	if (status === undefined) return 'default';
	switch (status) {
		case 0:
			return 'red';
		case 1:
			return 'green';
		case 2:
			return 'orange';
		default:
			return 'default';
	}
};

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
	console.log(`data aaaaaaaaaaaa:`, data);
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
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
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
