<template>
	<div class="user-coupon-screen">
		<!-- 1. 顶部业务头部 -->
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<SafetyCertificateOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">用户领券与核销明细</h1>
						<span class="stat-pill">
							共 <strong>{{ pagination.total || 0 }}</strong> 条记录
						</span>
						<span class="stat-pill stat-pill-emerald">
							本页已核销 <strong>{{ usedCount }}</strong> 笔
						</span>
					</div>
					<p class="page-subtitle">
						查看用户消费券领用与按量核销批次状态，支持对已核销记录执行回退取消核销
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-button class="action-btn" :loading="loading" @click="onQuery">
					<template #icon><ReloadOutlined /></template>
					刷新列表
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
							:placeholder="'搜索' + labelMap['couponName'].label + '名称...'"
							allow-clear
							class="filter-input"
							@pressEnter="onQuery"
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
							@pressEnter="onQuery"
						/>
					</div>
				</div>

				<div class="filter-btns">
					<a-button type="primary" class="filter-btn" @click="onQuery">
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button class="filter-btn" @click="onCancelQuery">
						<template #icon><ReloadOutlined /></template>
						清空
					</a-button>
				</div>
			</div>
		</section>

		<!-- 3. 表格数据卡片 -->
		<section class="table-card">
			<div class="table-card-header">
				<span class="table-title">用户领券及核销台账</span>
			</div>

			<a-table
				class="modern-user-coupon-table"
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnUserCouponInfoData) => String(record.id || '')"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				@change="onTableChange"
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
						<span class="quantity-pill">
							{{ record.redemptionQuantity ?? 1 }} 张
						</span>
					</template>

					<template v-else-if="column.key === 'status'">
						<span
							class="status-pill"
							:class="record.status === 'USED' ? 'is-used' : 'is-other'"
						>
							<span class="dot"></span>
							{{
								record.status === 'USED' ? '已核销'
								: record.status === 'UNUSED' ? '未核销'
								: record.status || '已记录'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'receiveTime'">
						<span class="font-mono text-xs text-slate-500">
							{{
								record.receiveTime ?
									formatTime(record.receiveTime, 'YYYY-MM-DD HH:mm')
								:	'—'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-popconfirm
							v-if="record.status === 'USED'"
							title="确认取消核销？取消后将回退本次核销数量"
							ok-text="确认回退"
							cancel-text="取消"
							@confirm="onCancelRedeem(record)"
						>
							<a-button type="link" size="small" class="undo-btn">
								<RollbackOutlined /> 取消核销
							</a-button>
						</a-popconfirm>
						<span v-else class="text-xs text-slate-300">—</span>
					</template>
				</template>
			</a-table>
		</section>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	SafetyCertificateOutlined,
	SearchOutlined,
	ReloadOutlined,
	UserOutlined,
	RollbackOutlined,
} from '@ant-design/icons-vue';
import { debounce } from 'lodash-es';
import {
	getCpnUserCouponInfoPage,
	cancelRedeemCpnUserCouponInfo,
} from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import type { CpnUserCouponInfoData } from '@/views/cpn-coupon/cpn-user-coupon-info/config';
import {
	columns,
	labelMap,
} from '@/views/cpn-coupon/cpn-user-coupon-info/config';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { formatTime } from '@/utils/dayjs';

const {
	pagination,
	handleTableChange: onTableChange,
	setTotal,
} = usePagination({
	onChange: (p) => getCpnUserCouponInfoListPage(searchInfo.value, p),
});

const loading = ref<boolean>(false);
const dataSource = ref<CpnUserCouponInfoData[]>([]);
const searchInfo = ref<CpnUserCouponInfoData>({});

const usedCount = computed(() => {
	return (dataSource.value || []).filter((item) => item.status === 'USED')
		.length;
});

const onCancelQuery = (): void => {
	onDebouncedQuery.cancel();
	searchInfo.value = {};
	pagination.current = 1;
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const onQuery = (): void => {
	onDebouncedQuery.cancel();
	pagination.current = 1;
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
};

const onCancelRedeem = async (record: CpnUserCouponInfoData) => {
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

	loading.value = true;
	try {
		const { code, message: messageInfo } = await cancelRedeemCpnUserCouponInfo({
			userId: String(record.userId),
			couponId: String(record.couponId),
			userCouponId: String(record.id),
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

const getCpnUserCouponInfoListPage = async (
	param: CpnUserCouponInfoData,
	cur: PageInfo,
) => {
	loading.value = true;
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

const onDebouncedQuery = debounce(() => {
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
}, 300);

onMounted(() => {
	getCpnUserCouponInfoListPage(searchInfo.value, pagination);
});

onBeforeUnmount(() => {
	onDebouncedQuery.cancel();
});

watch(
	() => searchInfo.value,
	() => {
		pagination.current = 1;
		onDebouncedQuery();
	},
	{ deep: true },
);
</script>

<style lang="scss" scoped>
.user-coupon-screen {
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

		&.stat-pill-emerald {
			background: #ecfdf5;
			color: #047857;
			border-color: #a7f3d0;
			strong {
				color: #065f46;
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
		}

		.filter-input {
			width: 220px;
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

.quantity-pill {
	display: inline-block;
	padding: 1px 8px;
	border-radius: 999px;
	background: #eff6ff;
	border: 1px solid #bfdbfe;
	font-size: 12px;
	font-weight: 700;
	color: #1d4ed8;
	font-variant-numeric: tabular-nums;
}

.status-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 2px 9px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.is-used {
		background: #ecfdf5;
		color: #047857;
		border: 1px solid #a7f3d0;
		.dot {
			background: #10b981;
		}
	}

	&.is-other {
		background: #f1f5f9;
		color: #64748b;
		border: 1px solid #cbd5e1;
		.dot {
			background: #94a3b8;
		}
	}
}

.undo-btn {
	color: #d97706;
	font-weight: 600;
	&:hover {
		color: #b45309;
	}
}
</style>
