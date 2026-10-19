<template>
	<div class="shop-stock-attrs-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">INVENTORY ATTRIBUTES</span>
				<h1>商店库存规格属性管理</h1>
				<p class="subtitle">
					统一维护门店库存商品绑定的扩展属性编码、规格名称、参数值及有效状态
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openStockAttrDrawer('add')">
						新增规格属性
					</a-button>
					<a-button
						danger
						:disabled="!selectedRowKeys.length"
						@click="batchDelShopStockAttrs"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="stockId" label="库存 ID">
						<a-input
							id="filter-stock-attr-stock-id"
							v-model:value="searchInfo.stockId"
							name="stockId"
							placeholder="请输入库存 ID"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="attrCode" label="属性编码">
						<a-input
							id="filter-stock-attr-code"
							v-model:value="searchInfo.attrCode"
							name="attrCode"
							placeholder="请输入属性编码"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="attrName" label="属性名称">
						<a-input
							id="filter-stock-attr-name"
							v-model:value="searchInfo.attrName"
							name="attrName"
							placeholder="请输入属性名称关键词"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="isValid" label="有效状态">
						<a-select
							id="filter-stock-attr-is-valid"
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
					库存规格属性列表
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
					<template v-if="column.key === 'stockId'">
						<span class="mono-id">{{ record.stockId || '--' }}</span>
					</template>

					<template v-else-if="column.key === 'attrCode'">
						<a
							class="mono-code-link"
							@click="openStockAttrDrawer('view', record.id)"
						>
							{{ record.attrCode || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'attrValue'">
						<span class="val-badge">{{ record.attrValue || '--' }}</span>
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
								@click="openStockAttrDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openStockAttrDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该库存规格属性吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopStockAttrs(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<ShopStockAttrsDetail
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import {
	columns,
	DEFAULT_VALID_OPTIONS,
	type SearchInfo,
	type ShopStockAttrsData,
} from '@/views/finance/shopStockAttrs/config';
import {
	getShopStockAttrsPage,
	deleteShopStockAttrs,
} from '@/views/finance/shopStockAttrs/api';
import type { PageInfo } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const isValidList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
});

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const { pagination, handleTableChange, resetPagination, setTotal } =
	usePagination({
		onChange: (p) => getShopStockAttrsListPage(searchInfo.value, p),
	});

const searchInfo = ref<SearchInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockAttrsData[]>([]);
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
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

const delShopStockAttrs = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopStockAttrs(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopStockAttrs = (): void => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopStockAttrs(selectedRowKeys.value.join(','));
};

const getShopStockAttrsListPage = async (
	param: SearchInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopStockAttrsPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
				stockId: item.stockId !== undefined ? String(item.stockId) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const openStockAttrDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string,
): void => {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增库存商品规格属性',
		update: '编辑库存商品规格属性',
		view: '库存商品规格属性详情',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
};

const handleSuccess = (): void => {
	getShopStockAttrsListPage(searchInfo.value, pagination);
};

onMounted(() => {
	query(true);
});
</script>

<style lang="scss" scoped>
.shop-stock-attrs-screen {
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

.mono-id {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: #475569;
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

.val-badge {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	background: #f1f5f9;
	color: #334155;
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
