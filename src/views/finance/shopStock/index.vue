<template>
	<div class="shop-stock-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">SHOP INVENTORY LEDGER</span>
				<h1>商店商品库存台账</h1>
				<p class="subtitle">
					统一纳管门店在库商品、进货成本、零售定价、货源渠道与库存余量监控
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openStockDrawer('add')">
						新增库存
					</a-button>
					<a-button
						danger
						:disabled="!selectedRowKeys.length"
						@click="batchDelShopStock"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="shopName" label="商品名称">
						<a-input
							id="filter-stock-name"
							v-model:value="searchInfo.shopName"
							name="shopName"
							placeholder="请输入商品名称关键词"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="shopCode" label="商品编码">
						<a-input
							id="filter-stock-code"
							v-model:value="searchInfo.shopCode"
							name="shopCode"
							placeholder="请输入商品编码"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="category" label="商品类别">
						<a-select
							id="filter-stock-category"
							v-model:value="searchInfo.category"
							placeholder="全部商品类别"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="categoryList"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="purchasePlace" label="进货地点">
						<a-select
							id="filter-stock-place"
							v-model:value="searchInfo.purchasePlace"
							placeholder="全部进货地点"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="purchasePlaceList"
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
					门店商品库存列表
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
					<template v-if="column.key === 'shopName'">
						<a
							class="shop-name-link"
							@click="openStockDrawer('view', record.id)"
						>
							{{ record.shopName || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'shopCode'">
						<span class="mono-code">{{ record.shopCode || '--' }}</span>
					</template>

					<template v-else-if="column.key === 'costAmount'">
						<span class="cost-text">
							¥{{ Number(record.costAmount ?? 0).toFixed(2) }}
						</span>
					</template>

					<template v-else-if="column.key === 'saleAmount'">
						<span class="sale-text">
							¥{{ Number(record.saleAmount ?? 0).toFixed(2) }}
						</span>
					</template>

					<template v-else-if="column.key === 'saleNum'">
						<span class="qty-badge">{{ record.saleNum ?? 0 }} 件</span>
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
								@click="openStockDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openStockDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该库存记录吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStock(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<ShopStockDetail
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
	type SearchInfo,
	type ShopStockData,
} from '@/views/finance/shopStock/config';
import {
	getShopStockPage,
	deleteShopStock,
} from '@/views/finance/shopStock/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

const { getDictByType } = useDictInfo(
	'is_valid',
	'shop_category',
	'stock_place',
);

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const { pagination, handleTableChange, resetPagination, setTotal } =
	usePagination({
		onChange: (p) => getShopStockListPage(searchInfo.value, p),
	});

const searchInfo = ref<SearchInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const categoryList = computed(() => getDictByType('shop_category'));
const purchasePlaceList = computed(() => getDictByType('stock_place'));

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

function cancelQuery() {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getShopStockListPage(searchInfo.value, pagination);
}

const delShopStock = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopStock(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopStock = (): void => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopStock(selectedRowKeys.value.join(','));
};

const getShopStockListPage = async (
	param: SearchInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopStockPage(param, cur.current, cur.pageSize);
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

function openStockDrawer(
	type: 'add' | 'update' | 'view',
	id?: string,
) {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商店商品库存',
		update: '编辑商店商品库存',
		view: '商店商品库存档案',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
}

const handleSuccess = () => {
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
.shop-stock-screen {
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

.shop-name-link {
	font-weight: 600;
	color: #0f172a;
	cursor: pointer;

	&:hover {
		color: #2563eb;
		text-decoration: underline;
	}
}

.mono-code {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: #475569;
}

.cost-text {
	color: #64748b;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
}

.sale-text {
	color: #0f172a;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
}

.qty-badge {
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
