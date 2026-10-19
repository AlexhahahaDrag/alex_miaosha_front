<template>
	<div class="redemption-record-screen">
		<!-- 1. 顶部业务头部 -->
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<FileDoneOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">消费券核销流水台账</h1>
						<span class="stat-pill">
							共 <strong>{{ pagination.total || 0 }}</strong> 笔核销记录
						</span>
						<span class="stat-pill stat-pill-blue">
							本页累计核销 <strong>{{ totalRedeemedOnPage }}</strong> 张
						</span>
					</div>
					<p class="page-subtitle">
						审计消费券每次按量核销的时间、操作用户、核销张数与备注说明
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-button class="action-btn" :loading="loading" @click="query">
					<template #icon><ReloadOutlined /></template>
					刷新流水
				</a-button>
			</div>
		</header>

		<!-- 2. 单行紧凑筛选卡片 -->
		<section class="filter-card">
			<div class="filter-row">
				<div class="filter-inputs">
					<div class="filter-item">
						<span class="filter-label">{{ labelMap['couponName'].label }}</span>
						<a-input
							id="search_couponName"
							name="couponName"
							v-model:value="searchInfo.couponName"
							:placeholder="'搜索' + labelMap['couponName'].label + '...'"
							allow-clear
							class="filter-input"
							@pressEnter="query"
						>
							<template #prefix>
								<SearchOutlined class="text-slate-400" />
							</template>
						</a-input>
					</div>

					<div class="filter-item">
						<span class="filter-label">{{ labelMap['userName'].label }}</span>
						<a-input
							id="search_userName"
							name="userName"
							v-model:value="searchInfo.userName"
							:placeholder="'搜索' + labelMap['userName'].label + '...'"
							allow-clear
							class="filter-input"
							@pressEnter="query"
						/>
					</div>

					<div class="filter-item">
						<span class="filter-label">
							{{ labelMap['redemptionTime'].label }}
						</span>
						<a-date-picker
							id="search_redemptionTime"
							name="redemptionTime"
							v-model:value="searchInfo.redemptionTime"
							show-time
							format="YYYY-MM-DD HH:mm:ss"
							:placeholder="'选择' + labelMap['redemptionTime'].label"
							allow-clear
							class="filter-picker"
						/>
					</div>
				</div>

				<div class="filter-btns">
					<a-button type="primary" class="filter-btn" @click="query">
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button class="filter-btn" @click="cancelQuery">
						<template #icon><ReloadOutlined /></template>
						清空
					</a-button>
				</div>
			</div>
		</section>

		<!-- 3. 核销流水表格卡片 -->
		<section class="table-card">
			<div class="table-card-header">
				<span class="table-title">核销审计流水明细</span>
			</div>

			<a-table
				class="modern-redemption-table"
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnRedemptionRecordInfoData) => String(record.id || '')"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'couponName'">
						<span class="font-semibold text-slate-800">
							{{ record.couponName || '—' }}
						</span>
					</template>

					<template v-else-if="column.key === 'userName'">
						<span class="user-badge">
							<UserOutlined class="mr-1 text-blue-500" />
							{{ record.userName || '—' }}
						</span>
					</template>

					<template v-else-if="column.key === 'redemptionQuantity'">
						<span class="redeem-qty-pill">
							-{{ record.redemptionQuantity ?? 1 }} 张
						</span>
					</template>

					<template v-else-if="column.key === 'redemptionTime'">
						<span class="font-mono text-xs text-slate-500">
							{{
								record.redemptionTime ?
									formatTime(record.redemptionTime, 'YYYY-MM-DD HH:mm:ss')
								:	'—'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'remarks'">
						<span class="text-slate-600">
							{{ record.remarks || '—' }}
						</span>
					</template>
				</template>
			</a-table>
		</section>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	FileDoneOutlined,
	SearchOutlined,
	ReloadOutlined,
	UserOutlined,
} from '@ant-design/icons-vue';
import { getCpnRedemptionRecordInfoPage } from '@/views/cpn-coupon/cpn-redemption-record-info/api';
import type { CpnRedemptionRecordInfoData } from '@/views/cpn-coupon/cpn-redemption-record-info/config';
import {
	columns,
	labelMap,
} from '@/views/cpn-coupon/cpn-redemption-record-info/config';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { formatTime } from '@/utils/dayjs';
import { debounce } from 'lodash-es';

const { pagination, handleTableChange, setTotal } = usePagination({
	onChange: (p) => getCpnRedemptionRecordInfoListPage(searchInfo.value, p),
});

const loading = ref<boolean>(false);
const dataSource = ref<CpnRedemptionRecordInfoData[]>([]);
const searchInfo = ref<CpnRedemptionRecordInfoData>({});

const totalRedeemedOnPage = computed(() => {
	return (dataSource.value || []).reduce(
		(sum, item) => sum + (Number(item.redemptionQuantity) || 0),
		0,
	);
});

const cancelQuery = (): void => {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {};
	pagination.current = 1;
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
};

const query = (): void => {
	triggerDebouncedQuery.cancel();
	pagination.current = 1;
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
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
	if (code === '200') {
		const curData = data;
		dataSource.value = curData?.records || [];
		pagination.current = curData?.current || 1;
		pagination.pageSize = curData?.size || 10;
		setTotal(curData?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const triggerDebouncedQuery = debounce((): void => {
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
}, 300);

onMounted(() => {
	getCpnRedemptionRecordInfoListPage(searchInfo.value, pagination);
});

onBeforeUnmount(() => {
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
	},
);
</script>

<style lang="scss" scoped>
.redemption-record-screen {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 16px;
	min-height: calc(100vh - 110px);
	background: #f8fafc;
}

.screen-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 20px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	flex-wrap: wrap;

	.header-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.header-icon-box {
		width: 42px;
		height: 42px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		color: #2563eb;
		font-size: 20px;
		border: 1px solid #bfdbfe;
		flex-shrink: 0;
	}

	.header-titles {
		display: flex;
		flex-direction: column;
		gap: 4px;

		.title-row {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
		}

		.page-title {
			margin: 0;
			font-size: 17px;
			font-weight: 700;
			color: #0f172a;
		}

		.page-subtitle {
			margin: 0;
			font-size: 12px;
			color: #64748b;
		}
	}

	.stat-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 9px;
		border-radius: 999px;
		font-size: 12px;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		font-variant-numeric: tabular-nums;

		strong {
			font-weight: 700;
			color: #0f172a;
		}

		&.stat-pill-blue {
			background: #eff6ff;
			color: #1d4ed8;
			border-color: #bfdbfe;
			strong {
				color: #1e40af;
			}
		}
	}

	.action-btn {
		height: 36px;
		border-radius: 8px;
	}
}

.filter-card {
	padding: 14px 18px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;

	.filter-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.filter-inputs {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: 8px;

		.filter-label {
			font-size: 13px;
			font-weight: 500;
			color: #475569;
			white-space: nowrap;
		}

		.filter-input {
			width: 200px;
			border-radius: 8px;
		}

		.filter-picker {
			width: 195px;
			border-radius: 8px;
		}
	}

	.filter-btns {
		display: flex;
		align-items: center;
		gap: 8px;

		.filter-btn {
			border-radius: 8px;
		}
	}
}

.table-card {
	flex: 1;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 0 16px 12px;

	.table-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 4px;
		border-bottom: 1px solid #f1f5f9;
		margin-bottom: 4px;

		.table-title {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;
		}
	}
}

.user-badge {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	font-size: 12px;
	color: #334155;
}

.redeem-qty-pill {
	display: inline-block;
	padding: 1px 9px;
	border-radius: 999px;
	background: #fff7ed;
	border: 1px solid #fed7aa;
	font-size: 12px;
	font-weight: 700;
	color: #ea580c;
	font-variant-numeric: tabular-nums;
}
</style>
