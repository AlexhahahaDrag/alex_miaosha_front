<template>
	<div class="shop-stock-batch-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">STOCK PURCHASE BATCH</span>
				<h1>商店进货批次管理</h1>
				<p class="subtitle">
					统一记录门店每次采购进货批次、货品总成本、采购差旅费用与批次入库日期
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openBatchDrawer('add')">
						新增批次
					</a-button>
					<a-button
						danger
						:disabled="!selectedRowKeys.length"
						@click="batchDelShopStockBatch"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item
						:name="labelMap['batchCode'].name"
						:label="labelMap['batchCode'].label"
					>
						<a-input
							id="filter-batch-code"
							v-model:value="searchInfo.batchCode"
							name="batchCode"
							placeholder="请输入批次编码"
							allow-clear
						/>
					</a-form-item>

					<a-form-item
						:name="labelMap['batchName'].name"
						:label="labelMap['batchName'].label"
					>
						<a-input
							id="filter-batch-name"
							v-model:value="searchInfo.batchName"
							name="batchName"
							placeholder="请输入批次名称关键词"
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
					进货批次列表
					<template v-if="selectedRowKeys.length">
						· 已勾选 <strong>{{ selectedRowKeys.length }}</strong> 项
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
					<template v-if="column.key === 'batchCode'">
						<a
							class="mono-code-link"
							@click="openBatchDrawer('view', record.id)"
						>
							{{ record.batchCode || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'cost' || column.key === 'travelExpense'">
						<span class="amount-text">
							¥{{ Number(record[column.key] ?? 0).toFixed(2) }}
						</span>
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
								@click="openBatchDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openBatchDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该进货批次吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStockBatch(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<shop-stock-batch-detail
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types/modal';
import type { PageInfo } from '@/composables/usePagination';
import type { ShopStockBatchData } from '@/views/finance/shopStockBatch/config';
import { columns, labelMap } from '@/views/finance/shopStockBatch/config';
import {
	getShopStockBatchPage,
	deleteShopStockBatch,
} from '@/views/finance/shopStockBatch/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getShopStockBatchListPage(searchInfo.value, p),
	});

const searchInfo = ref<ShopStockBatchData>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockBatchData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

const cancelQuery = (): void => {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {};
	query(true);
};

const query = (resetPage = false): void => {
	if (resetPage) {
		resetPagination();
	}
	getShopStockBatchListPage(searchInfo.value, pagination);
};

const delShopStockBatch = async (ids: string): Promise<void> => {
	const { code, message: msg } = await deleteShopStockBatch(ids);
	if (code === '200') {
		message.success(msg ? `删除${msg}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(msg || '删除失败！', 3);
	}
};

const batchDelShopStockBatch = (): void => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopStockBatch(selectedRowKeys.value.join(','));
};

const getShopStockBatchListPage = async (
	param: ShopStockBatchData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getShopStockBatchPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(msg || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const openBatchDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string,
): void => {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商店进货批次',
		update: '编辑商店进货批次',
		view: '商店进货批次核算卡',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
};

const handleSuccess = (): void => {
	query(false);
};

onMounted(() => {
	query(true);
});

onBeforeUnmount(() => {
	triggerDebouncedQuery.cancel();
});

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>

<style lang="scss" scoped>
.shop-stock-batch-screen {
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
		grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
		gap: 16px;
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

.amount-text {
	font-weight: 700;
	color: #0f172a;
	font-variant-numeric: tabular-nums;
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
