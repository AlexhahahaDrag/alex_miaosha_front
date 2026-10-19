<template>
	<div class="shop-cart-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">SHOPPING CART LEDGER</span>
				<h1>商店购物车明细管理</h1>
				<p class="subtitle">
					统一管理门店客户选品加购记录、导购归属人员、加购件数与有效状态
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openCartDrawer('add')">
						新增加购
					</a-button>
					<a-button
						danger
						:disabled="!rowIds.length"
						@click="batchDelShopCart"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="shopId" label="商品 ID">
						<a-input
							id="filter-cart-shop-id"
							v-model:value="searchInfo.shopId"
							name="shopId"
							placeholder="请输入商品 ID"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="userId" label="销售人员 ID">
						<a-input
							id="filter-cart-user-id"
							v-model:value="searchInfo.userId"
							name="userId"
							placeholder="请输入销售人员 ID"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="customerId" label="客户 ID">
						<a-input
							id="filter-cart-customer-id"
							v-model:value="searchInfo.customerId"
							name="customerId"
							placeholder="请输入客户 ID"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="isValid" label="有效状态">
						<a-select
							id="filter-cart-is-valid"
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
					购物车明细列表
					<template v-if="rowIds.length">
						· 已勾选 <strong>{{ rowIds.length }}</strong> 项
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
					<template v-if="column.key === 'shopId'">
						<a
							class="mono-id-link"
							@click="openCartDrawer('view', record.id)"
						>
							{{ record.shopId || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'userId' || column.key === 'customerId'">
						<span class="mono-id">{{ record[column.key] || '--' }}</span>
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
								@click="openCartDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openCartDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该购物车记录吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopCart(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<ShopCartDetail
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import {
	columns,
	DEFAULT_VALID_OPTIONS,
	type ShopCartData,
} from '@/views/finance/shopCart/config';
import type { ModelInfo } from '@/types/modal';
import { getShopCartPage, deleteShopCart } from '@/views/finance/shopCart/api';
import { message } from 'ant-design-vue';
import { useDictInfo } from '@/composables/useDictInfo';

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
		onChange: (p) => getShopCartListPage(searchInfo.value, p),
	});

const searchInfo = ref<ShopCartData>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopCartData[]>([]);
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
	getShopCartListPage(searchInfo.value, pagination);
};

const delShopCart = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopCart(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopCart = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopCart(rowIds.value.join(','));
};

const getShopCartListPage = async (
	param: ShopCartData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopCartPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
				shopId: item.shopId !== undefined ? String(item.shopId) : undefined,
				userId: item.userId !== undefined ? String(item.userId) : undefined,
				customerId:
					item.customerId !== undefined ? String(item.customerId) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const openCartDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string,
): void => {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商店购物车记录',
		update: '编辑商店购物车记录',
		view: '商店购物车记录详情',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
};

const handleSuccess = (): void => {
	getShopCartListPage(searchInfo.value, pagination);
};

onMounted(() => {
	query(true);
});
</script>

<style lang="scss" scoped>
.shop-cart-screen {
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

.mono-id-link {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	font-weight: 600;
	color: #2563eb;
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
}

.mono-id {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: #475569;
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
