<template>
	<div class="coupon-info-screen">
		<!-- 1. 顶部业务头部 -->
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<GiftOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">消费券资产管理</h1>
						<span class="stat-pill">
							共 <strong>{{ pagination.total || 0 }}</strong> 张券种
						</span>
						<span class="stat-pill stat-pill-emerald">
							本页可用余量 <strong>{{ totalRemainingQuantity }}</strong> 张
						</span>
						<span class="stat-pill stat-pill-blue">
							已支付 <strong>{{ paidCouponCount }}</strong> 项
						</span>
					</div>
					<p class="page-subtitle">
						管理消费券发行批次、面值门槛、到期预警与一键按量核销，支持 AI 智能营销方案策划
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-popconfirm
					v-if="selectedRowKeys.length > 0"
					:title="`确认批量删除选中的 ${selectedRowKeys.length} 项消费券吗？`"
					ok-text="确认删除"
					cancel-text="取消"
					@confirm="batchDelCpnCouponInfo"
				>
					<a-button danger class="action-btn">
						<template #icon><DeleteOutlined /></template>
						批量删除 ({{ selectedRowKeys.length }})
					</a-button>
				</a-popconfirm>
				<a-button
					type="primary"
					class="action-btn primary-btn"
					data-testid="btn-add-coupon"
					@click="editCpnCouponInfo('add')"
				>
					<template #icon><PlusOutlined /></template>
					新增消费券
				</a-button>
			</div>
		</header>

		<!-- 2. 单行紧凑筛选卡片 -->
		<section class="filter-card">
			<div class="filter-row">
				<div class="filter-inputs">
					<div class="filter-item">
						<span class="filter-label">有效状态</span>
						<a-radio-group
							v-model:value="searchInfo.onlyValidAndNotFullyRedeemed"
							button-style="solid"
							class="status-radio-group"
						>
							<a-radio-button :value="true">仅看可用有效券</a-radio-button>
							<a-radio-button :value="null">全部消费券</a-radio-button>
						</a-radio-group>
					</div>

					<div class="filter-item">
						<span class="filter-label">券名称</span>
						<a-input
							id="search_couponName"
							name="couponName"
							v-model:value="searchInfo.couponName"
							placeholder="搜索消费券名称..."
							allow-clear
							class="filter-input"
							@pressEnter="() => query(true)"
						>
							<template #prefix>
								<SearchOutlined class="text-slate-400" />
							</template>
						</a-input>
					</div>

					<div class="filter-item">
						<span class="filter-label">有效期至</span>
						<a-date-picker
							id="search_endDate"
							name="endDate"
							v-model:value="searchInfo.endDate"
							show-time
							format="YYYY-MM-DD HH:mm"
							placeholder="选择截止有效期"
							allow-clear
							class="filter-picker"
						/>
					</div>
				</div>

				<div class="filter-btns">
					<a-button type="primary" class="filter-btn" @click="() => query(true)">
						<template #icon><SearchOutlined /></template>
						查找
					</a-button>
					<a-button class="filter-btn" @click="cancelQuery">
						<template #icon><ReloadOutlined /></template>
						重置
					</a-button>
				</div>
			</div>
		</section>

		<!-- 3. 消费券列表卡片 -->
		<section class="table-card">
			<div class="table-card-header">
				<div class="table-title-wrap">
					<span class="table-title">消费券批次列表</span>
					<span v-if="selectedRowKeys.length" class="selection-badge">
						已选 {{ selectedRowKeys.length }} 项
						<a class="clear-link" @click="clearSelected">清空</a>
					</span>
				</div>
			</div>

			<a-table
				class="modern-coupon-table"
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: CpnCouponInfoData) => String(record.id || '')"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'couponName'">
						<div class="coupon-name-cell">
							<span class="coupon-ticket-dot"></span>
							<span class="coupon-name-text">{{ record.couponName || '—' }}</span>
						</div>
					</template>

					<template v-else-if="column.key === 'unitValue'">
						<div class="value-cell">
							<span class="unit-val">
								¥{{ formatAmount(record.unitValue || 0) }}
							</span>
							<span v-if="record.minSpend" class="min-spend-tag">
								满¥{{ record.minSpend }}可用
							</span>
						</div>
					</template>

					<template v-else-if="column.key === 'remainingQuantity'">
						<div class="quantity-cell">
							<span
								class="remain-num"
								:class="
									(record.remainingQuantity ?? 0) > 0 ?
										'text-blue-600'
									:	'text-slate-400'
								"
							>
								{{ record.remainingQuantity ?? 0 }}
							</span>
							<span v-if="record.totalQuantity !== undefined" class="total-num">
								/ {{ record.totalQuantity }} 张
							</span>
						</div>
					</template>

					<template v-else-if="column.key === 'expireStatus'">
						<a-tag
							v-if="record.expireRangeStatus !== 3 && record.expireStatus"
							:color="getExpireStatusColor(record.expireRangeStatus)"
							class="rounded-md font-medium"
						>
							{{ record.expireStatus }}
						</a-tag>
						<span v-else class="normal-expire-pill">正常有效</span>
					</template>

					<template v-else-if="column.key === 'paymentStatus'">
						<span
							class="pay-status-pill"
							:class="record.paymentStatus === 1 ? 'is-paid' : 'is-unpaid'"
						>
							<span class="dot"></span>
							{{ record.paymentStatus === 1 ? '已支付' : '未支付' }}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="2">
							<a-button
								type="link"
								size="small"
								class="op-btn view-btn"
								@click="editCpnCouponInfo('view', record.id)"
							>
								查看
							</a-button>
							<a-divider type="vertical" />
							<a-button
								type="link"
								size="small"
								class="op-btn"
								@click="editCpnCouponInfo('update', record.id)"
							>
								编辑
							</a-button>
							<template v-if="record.remainingQuantity">
								<a-divider type="vertical" />
								<a-button
									type="link"
									size="small"
									class="op-btn redeem-btn"
									@click="onShowRedeemQuantityModal(record)"
								>
									核销
								</a-button>
								<a-divider type="vertical" />
								<a-popconfirm
									title="确认删除该消费券吗？"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delCpnCouponInfo(String(record.id))"
								>
									<a-button type="link" size="small" danger class="op-btn">
										删除
									</a-button>
								</a-popconfirm>
							</template>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

		<cpn-coupon-info-detail
			ref="editInfo"
			v-model:modelInfo="modelInfo"
			@success="handleSuccess"
		/>
		<cpn-coupon-redeem-quantity-detail
			v-model:modelInfo="redeemModelInfo"
			:coupon-info="redeemCouponInfo || undefined"
			@success="handleSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	GiftOutlined,
	PlusOutlined,
	DeleteOutlined,
	SearchOutlined,
	ReloadOutlined,
} from '@ant-design/icons-vue';
import {
	getCpnCouponInfoPage,
	deleteCpnCouponInfo,
} from '@/views/cpn-coupon/cpn-coupon-info/api';
import type { ModelInfo } from '@/types/modal';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import {
	columns,
	getExpireStatusColor,
} from '@/views/cpn-coupon/cpn-coupon-info/config';
import {
	usePagination,
	useRowSelection,
	type PageInfo,
} from '@/composables/usePagination';
import { formatAmount } from '@/utils/amountInfo';
import { debounce } from 'lodash-es';

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection({
	config: {
		checkStrictly: false,
		getCheckboxProps: (record: CpnCouponInfoData) => ({
			disabled: (record.remainingQuantity ?? 0) === 0,
		}),
	},
});

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getCpnCouponInfoListPage(searchInfo.value, p),
	});

const loading = ref<boolean>(false);
const dataSource = ref<CpnCouponInfoData[]>([]);
const modelInfo = ref<ModelInfo>({});
const redeemModelInfo = ref<ModelInfo>({});
const redeemCouponInfo = ref<CpnCouponInfoData | null>(null);

const searchInfo = ref<CpnCouponInfoData>({
	onlyValidAndNotFullyRedeemed: true,
});

const totalRemainingQuantity = computed(() => {
	return (dataSource.value || []).reduce(
		(sum, item) => sum + (Number(item.remainingQuantity) || 0),
		0,
	);
});

const paidCouponCount = computed(() => {
	return (dataSource.value || []).filter((item) => item.paymentStatus === 1)
		.length;
});

const cancelQuery = (): void => {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {
		onlyValidAndNotFullyRedeemed: true,
	};
};

const query = (resetPage = false): void => {
	triggerDebouncedQuery.cancel();
	if (resetPage) {
		resetPagination();
	}
	getCpnCouponInfoListPage(searchInfo.value, pagination);
};

const triggerDebouncedQuery = debounce((): void => {
	query(true);
}, 300);

const delCpnCouponInfo = async (ids: string) => {
	if (!ids) return;
	const { code, message: messageInfo } = await deleteCpnCouponInfo(ids);
	if (code === '200') {
		message.success(messageInfo || '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelCpnCouponInfo = (): void => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delCpnCouponInfo(selectedRowKeys.value.join(','));
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
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const editCpnCouponInfo = (type: string, id?: string | number): void => {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value = {
		confirmLoading: true,
		open: true,
		readonly: isView,
		id: isAdd ? null : id !== undefined ? String(id) : null,
		title:
			isAdd ? '新增消费券信息'
			: isView ? '消费券详情'
			: '修改消费券信息',
	};
};

const onShowRedeemQuantityModal = (record: CpnCouponInfoData): void => {
	redeemCouponInfo.value = record;
	redeemModelInfo.value = {
		open: true,
		title: '消费券核销',
		width: '480px',
		id: record.id ? String(record.id) : undefined,
	};
};

const handleSuccess = (): void => {
	query(false);
};

onMounted(() => {
	query(true);
});

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
	},
);
</script>

<style lang="scss" scoped>
.coupon-info-screen {
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
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
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

		&.stat-pill-blue {
			background: #eff6ff;
			color: #1d4ed8;
			border-color: #bfdbfe;
			strong {
				color: #1e40af;
			}
		}
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;

		.action-btn {
			height: 36px;
			border-radius: 8px;
			font-weight: 500;
		}
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
			width: 190px;
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

		.table-title-wrap {
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.table-title {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;
		}

		.selection-badge {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 2px 10px;
			border-radius: 999px;
			background: #eff6ff;
			border: 1px solid #bfdbfe;
			font-size: 12px;
			color: #1d4ed8;
			font-weight: 600;

			.clear-link {
				color: #2563eb;
				cursor: pointer;
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
}

.coupon-name-cell {
	display: inline-flex;
	align-items: center;
	gap: 8px;

	.coupon-ticket-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #2563eb;
		flex-shrink: 0;
	}

	.coupon-name-text {
		font-weight: 600;
		color: #0f172a;
	}
}

.value-cell {
	display: inline-flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;

	.unit-val {
		font-size: 14px;
		font-weight: 700;
		color: #e11d48;
		font-variant-numeric: tabular-nums;
	}

	.min-spend-tag {
		font-size: 11px;
		color: #64748b;
	}
}

.quantity-cell {
	font-variant-numeric: tabular-nums;

	.remain-num {
		font-size: 14px;
		font-weight: 700;
	}

	.total-num {
		font-size: 12px;
		color: #64748b;
	}
}

.normal-expire-pill {
	display: inline-block;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	background: #f8fafc;
	color: #64748b;
	border: 1px solid #e2e8f0;
}

.pay-status-pill {
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

	&.is-paid {
		background: #ecfdf5;
		color: #047857;
		border: 1px solid #a7f3d0;
		.dot {
			background: #10b981;
		}
	}

	&.is-unpaid {
		background: #f1f5f9;
		color: #64748b;
		border: 1px solid #cbd5e1;
		.dot {
			background: #94a3b8;
		}
	}
}

.op-btn {
	padding: 0 3px;
	font-size: 13px;

	&.view-btn {
		color: #475569;
		&:hover {
			color: #1677ff;
		}
	}

	&.redeem-btn {
		color: #d97706;
		font-weight: 600;
		&:hover {
			color: #b45309;
		}
	}
}
</style>
