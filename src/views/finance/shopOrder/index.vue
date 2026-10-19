<template>
	<div class="shop-order-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">SHOP ORDER CENTER</span>
				<h1>商店销售订单管理</h1>
				<p class="subtitle">
					集中管理门店销售订单主数据、成交金额、购买件数、支付渠道与订单状态
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openOrderDrawer('add')">
						新增订单
					</a-button>
					<a-button
						danger
						:disabled="!rowIds.length"
						@click="batchDelShopOrder"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="saleOrderCode" label="订单编码">
						<a-input
							id="filter-order-code"
							v-model:value="searchInfo.saleOrderCode"
							name="saleOrderCode"
							placeholder="请输入订单编码"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="saleOrderName" label="订单名称">
						<a-input
							id="filter-order-name"
							v-model:value="searchInfo.saleOrderName"
							name="saleOrderName"
							placeholder="请输入订单名称关键词"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="payWay" label="支付方式">
						<a-input
							id="filter-order-pay-way"
							v-model:value="searchInfo.payWay"
							name="payWay"
							placeholder="请输入支付方式"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="isValid" label="有效状态">
						<a-select
							id="filter-order-is-valid"
							v-model:value="searchInfo.isValid"
							placeholder="全部状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
							allow-clear
						/>
					</a-form-item>

					<div class="filter-actions">
						<a-space :size="8">
							<a-button type="primary" @click="() => query(true)">
								查询
							</a-button>
							<a-button @click="cancelQuery">重置</a-button>
						</a-space>
					</div>
				</div>
			</a-form>
		</section>

		<section class="table-card">
			<div class="table-toolbar">
				<span class="table-summary">
					销售订单列表
					<template v-if="rowIds.length">
						· 已勾选 <strong>{{ rowIds.length }}</strong> 笔
					</template>
				</span>
			</div>

			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => String(record.id)"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'saleOrderCode'">
						<a
							class="mono-code-link"
							@click="openOrderDrawer('view', record.id)"
						>
							{{ record.saleOrderCode || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'saleAmount'">
						<span class="amount-chip">
							¥{{ Number(record.saleAmount ?? 0).toFixed(2) }}
						</span>
					</template>

					<template v-else-if="column.key === 'saleCount'">
						<span class="count-badge">{{ record.saleCount ?? 0 }} 件</span>
					</template>

					<template v-else-if="column.key === 'isValid'">
						<span
							class="status-pill"
							:class="record.isValid === '1' ? 'is-valid' : 'is-invalid'"
						>
							{{ record.isValid === '1' ? '有效' : '失效' }}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								@click="openOrderDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openOrderDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该销售订单吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopOrder(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<ShopOrderDetailInfo
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';
import type { PageInfo } from '@/composables/usePagination';
import {
	columns,
	DEFAULT_VALID_OPTIONS,
	type ShopOrderData,
} from '@/views/finance/shopOrder/config';
import {
	getShopOrderPage,
	deleteShopOrder,
} from '@/views/finance/shopOrder/api';
import { message } from 'ant-design-vue';

const { getDictByType } = useDictInfo('is_valid');

const isValidList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
});

const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

const { pagination, handleTableChange, resetPagination, setTotal } =
	usePagination({
		onChange: (p) => getShopOrderListPage(searchInfo.value, p),
	});

const searchInfo = ref<ShopOrderData>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopOrderData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const cancelQuery = (): void => {
	searchInfo.value = {};
	query(true);
};

const query = (resetPage = false): void => {
	if (resetPage) {
		resetPagination();
	}
	getShopOrderListPage(searchInfo.value, pagination);
};

const delShopOrder = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopOrder(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopOrder = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopOrder(rowIds.value.join(','));
};

const getShopOrderListPage = async (
	param: ShopOrderData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopOrderPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const openOrderDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string,
): void => {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商店销售订单',
		update: '编辑商店销售订单',
		view: '商店销售订单凭证',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
};

const handleSuccess = (): void => {
	getShopOrderListPage(searchInfo.value, pagination);
};

onMounted(() => {
	query(true);
});
</script>

<style lang="scss" scoped>
.shop-order-screen {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px 24px 28px;
	background: #f8fafc;
	min-height: 100%;
}

.screen-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	padding: 20px 24px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

	.title-block {
		.eyebrow {
			display: inline-block;
			font-size: 11px;
			font-weight: 700;
			letter-spacing: 0.08em;
			color: #2563eb;
			background: #eff6ff;
			padding: 2px 8px;
			border-radius: 999px;
			margin-bottom: 6px;
		}

		h1 {
			margin: 0 0 4px;
			font-size: 20px;
			font-weight: 700;
			color: #0f172a;
		}

		.subtitle {
			margin: 0;
			font-size: 13px;
			color: #64748b;
		}
	}
}

.filter-card {
	padding: 18px 22px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

	.filter-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
		gap: 14px;
		align-items: center;

		:deep(.ant-form-item) {
			margin-bottom: 0;
		}
	}

	.filter-actions {
		display: flex;
		justify-content: flex-end;
	}
}

.table-card {
	padding: 18px 22px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

	.table-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.table-summary {
			font-size: 13px;
			font-weight: 600;
			color: #334155;

			strong {
				color: #2563eb;
			}
		}
	}
}

.mono-code-link {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	font-weight: 600;
	color: #2563eb;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
}

.amount-chip {
	font-weight: 700;
	color: #0f172a;
	font-variant-numeric: tabular-nums;
}

.count-badge {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	background: #eff6ff;
	color: #1d4ed8;
}

.status-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 600;

	&.is-valid {
		background: #dcfce7;
		color: #15803d;
	}

	&.is-invalid {
		background: #f1f5f9;
		color: #64748b;
	}
}
</style>
