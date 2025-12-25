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
								:name="labelMap['userName'].name"
								:label="labelMap['userName'].label"
							>
								<a-input
									v-model:value="searchInfo.userName"
									:placeholder="'请输入' + labelMap['userName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['redemptionTime'].name"
								:label="labelMap['redemptionTime'].label"
							>
								<a-date-picker
									v-model:value="searchInfo.redemptionTime"
									show-time
									format="YYYY-MM-DD HH:mm:ss"
									:placeholder="'请输入' + labelMap['redemptionTime'].label"
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
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnRedemptionRecordInfoData) => record.id || 0"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
			>
			</a-table>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getCpnRedemptionRecordInfoPage } from './api/index';
import type { CpnRedemptionRecordInfoData } from './config';
import { columns, labelMap, labelCol, wrapperCol } from './config';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { debounce } from 'lodash-es';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

let loading = ref<boolean>(false);

let dataSource = ref<CpnRedemptionRecordInfoData[]>([]);

let searchInfo = ref<CpnRedemptionRecordInfoData>({});

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

// 获取消费券核销记录表 (按数量核销)页面数据
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
	console.log(`data aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:`, data);
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

// 查询条件防抖：任意查询条件变化 300ms 后触发查询
const triggerDebouncedQuery = debounce((): void => {
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
}, 300);

// 初始化
const init = (): void => {
	//获取消费券核销记录表 (按数量核销)页面数据
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
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
