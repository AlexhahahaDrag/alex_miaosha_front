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
						<a-col style="text-align: right; margin-bottom: 20px">
							<a-space>
								<a-button type="primary" @click="onQuery"> 查找</a-button>
								<a-button type="primary" @click="onCancelQuery">清空</a-button>
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
				:row-key="(record: CpnUserCouponInfoData) => record.id || 0"
				:pagination="pagination"
				@change="onTableChange"
				:scroll="{ x: 'max-content' }"
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
								@cancel="onCancel"
							>
								<a-button type="primary" size="small">取消核销</a-button>
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
import { debounce } from 'lodash-es';
import {
	getCpnUserCouponInfoPage,
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

let searchInfo = ref<CpnUserCouponInfoData>({});

const onCancelQuery = (): void => {
	searchInfo.value = {};
};

const onQuery = (): void => {
	// AI Agent：手动点击查询时，立即查询并回到第一页
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const onTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
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
			remarks: '取消核销',
		});
		if (code === '200') {
			message.success(messageInfo || '取消核销成功！');
			getCpnUserCouponInfoListPage(searchInfo.value, pagination);
		} else {
			message.error(messageInfo || '取消核销失败！');
		}
	} finally {
		loading.value = false;
	}
};

const onCancel = (e: MouseEvent): void => {
	console.log(e);
};

const getCpnUserCouponInfoListPage = async (
	param: CpnUserCouponInfoData,
	cur: PageInfo,
) => {
	loading.value = true;
	// AI Agent：对输入做一次轻量规范化，避免“全是空格”导致的无效查询
	const normalizedParam: CpnUserCouponInfoData = {
		...param,
		userName:
			typeof param?.userName === 'string' ?
				param.userName.trim()
			:	param?.userName,
		couponName:
			typeof param?.couponName === 'string' ?
				param.couponName.trim()
			:	param?.couponName,
	};
	const {
		code,
		data,
		message: messageInfo,
	} = await getCpnUserCouponInfoPage(
		normalizedParam,
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

const init = (): void => {
	//获取用户消费券库存表 (按数量核销)页面数据
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
});

onBeforeUnmount(() => {
	// AI Agent：组件卸载时取消 debounce 队列，避免卸载后仍触发请求
	onDebouncedQuery.cancel();
});

// AI Agent：使用 lodash-es 的 debounce，统一项目内防抖实现方式
const onDebouncedQuery = debounce(() => {
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
}, 300);

watch(
	() => searchInfo.value,
	() => {
		pagination.current = 1;
		// AI Agent：条件变化后触发防抖查询
		onDebouncedQuery();
	},
	{ deep: true, immediate: true },
);
</script>
<style lang="scss" scoped></style>
