<template>
	<div class="shop-finance-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">SHOP REVENUE LEDGER</span>
				<h1>商店财务账单管理</h1>
				<p class="subtitle">
					统一核算门店商品销售流水、收支方向、支付渠道构成与账期明细对账
				</p>
			</div>
			<div class="header-actions">
				<div class="summary-pills">
					<span class="summary-pill income">
						本页收入：<strong>¥{{ pageIncomeSum }}</strong>
					</span>
					<span class="summary-pill expense">
						本页支出：<strong>¥{{ pageExpenseSum }}</strong>
					</span>
				</div>
				<a-space :size="10">
					<a-button type="primary" @click="openFinanceDrawer('add')">
						新增账单
					</a-button>
					<a-button
						danger
						:disabled="!selectedRowIds.length"
						@click="batchDelShopFinance"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="saleAmountFrom" label="售价区间(起)">
						<a-input-number
							id="filter-sale-amount-from"
							v-model:value="searchInfo.saleAmountFrom"
							name="saleAmountFrom"
							placeholder="最低售价"
							:min="0"
							class="full-width"
						/>
					</a-form-item>

					<a-form-item name="saleAmountEnd" label="售价区间(止)">
						<a-input-number
							id="filter-sale-amount-end"
							v-model:value="searchInfo.saleAmountEnd"
							name="saleAmountEnd"
							placeholder="最高售价"
							:min="0"
							class="full-width"
						/>
					</a-form-item>

					<a-form-item name="saleDateFrom" label="销售日期(起)">
						<a-date-picker
							id="filter-sale-date-from"
							v-model:value="saleDateFrom"
							name="saleDateFrom"
							class="full-width"
							placeholder="开始日期"
							@change="() => query(true)"
						/>
					</a-form-item>

					<a-form-item name="saleDateEnd" label="销售日期(止)">
						<a-date-picker
							id="filter-sale-date-end"
							v-model:value="saleDateEnd"
							name="saleDateEnd"
							class="full-width"
							placeholder="结束日期"
							@change="() => query(true)"
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
					商店财务流水列表
					<template v-if="selectedRowIds.length">
						· 已勾选 <strong>{{ selectedRowIds.length }}</strong> 笔
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
							@click="openFinanceDrawer('view', record.id)"
						>
							{{ record.shopName || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'shopCode'">
						<span class="mono-code">{{ record.shopCode || '--' }}</span>
					</template>

					<template v-else-if="column.key === 'saleAmount'">
						<span
							class="amount-text"
							:class="
								record.incomeAndExpenses === 'income' ?
									'is-income'
								:	'is-expense'
							"
						>
							{{ formatAmount(record.saleAmount) }}
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

					<template v-else-if="column.key === 'incomeAndExpenses'">
						<a-tag
							:color="record.incomeAndExpenses === 'income' ? 'success' : 'error'"
						>
							{{ record.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</a-tag>
					</template>

					<template v-else-if="column.key === 'saleDate'">
						<span class="date-text">
							{{ record.saleDate ? formatTime(record.saleDate) : '--' }}
						</span>
					</template>

					<template v-else-if="column.key === 'payWay'">
						<div class="pay-way-cell">
							<template
								v-for="(fromSource, index) in fromSourceTransferList"
								:key="index"
							>
								<span
									v-if="
										record.payWay &&
										fromSource.value !== '' &&
										record.payWay.indexOf(fromSource.value) >= 0
									"
									class="pay-way-badge"
								>
									<component
										v-if="iconComponentMap[`finance-${fromSource.value}`]"
										:is="iconComponentMap[`finance-${fromSource.value}`]"
										class="pay-way-icon"
									/>
									<span>{{ fromSource.name }}</span>
								</span>
							</template>
							<span v-if="!record.payWay" class="text-muted">--</span>
						</div>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								data-testid="btn-view-shop-finance"
								@click="openFinanceDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								data-testid="btn-edit-shop-finance"
								@click="openFinanceDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该商店财务记录吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopFinance(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<ShopFinanceDetail
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import type { ModelInfo } from '@/types/modal';
import { iconComponentMap } from '@/config/icons';
import { formatAmount } from '@/utils/amountInfo';
import type { ShopFinanceData } from '@/views/finance/shopFinance/config';
import {
	columns,
	fromSourceTransferList,
} from '@/views/finance/shopFinance/config';
import { formatTime, formatDate, type Dayjs } from '@/utils/dayjs';
import {
	getShopFinancePage,
	deleteShopFinance,
} from '@/views/finance/shopFinance/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

const {
	selectedRowKeys: selectedRowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (paginationInfo) => {
			const params = {
				...searchInfo.value,
				saleDateFrom:
					saleDateFrom.value ? formatDate(saleDateFrom.value) : null,
				saleDateEnd: saleDateEnd.value ? formatDate(saleDateEnd.value) : null,
			};
			getShopFinanceListPage(params, paginationInfo);
		},
	});

const searchInfo = ref<ShopFinanceData>({});
const saleDateFrom = ref<string | Dayjs>();
const saleDateEnd = ref<string | Dayjs>();
const loading = ref<boolean>(false);
const dataSource = ref<ShopFinanceData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const pageIncomeSum = computed(() =>
	dataSource.value
		.filter((item) => item.incomeAndExpenses === 'income' && item.isValid !== '0')
		.reduce((sum, item) => sum + Number(item.saleAmount || 0), 0)
		.toFixed(2),
);

const pageExpenseSum = computed(() =>
	dataSource.value
		.filter((item) => item.incomeAndExpenses !== 'income' && item.isValid !== '0')
		.reduce((sum, item) => sum + Number(item.saleAmount || 0), 0)
		.toFixed(2),
);

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

const cancelQuery = () => {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {};
	saleDateFrom.value = undefined;
	saleDateEnd.value = undefined;
	query(true);
};

const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	const params = {
		...searchInfo.value,
		saleDateFrom: saleDateFrom.value ? formatDate(saleDateFrom.value) : null,
		saleDateEnd: saleDateEnd.value ? formatDate(saleDateEnd.value) : null,
	};
	getShopFinanceListPage(params, pagination);
};

const delShopFinance = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopFinance(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopFinance = (): void => {
	if (!selectedRowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopFinance(selectedRowIds.value.join(','));
};

const getShopFinanceListPage = async (
	param: ShopFinanceData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopFinancePage(param, cur.current, cur.pageSize);
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

const openFinanceDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string,
) => {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商店财务账单',
		update: '编辑商店财务账单',
		view: '商店财务账单凭证',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
};

const handleSuccess = () => {
	query(false);
};

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);

onMounted(() => {
	query(true);
});

onBeforeUnmount(() => {
	triggerDebouncedQuery.cancel();
});
</script>

<style lang="scss" scoped>
.shop-finance-screen {
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

	.header-actions {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;

		.summary-pills {
			display: flex;
			gap: 8px;

			.summary-pill {
				padding: 4px 12px;
				border-radius: 999px;
				font-size: 12px;
				font-weight: 600;
				font-variant-numeric: tabular-nums;

				&.income {
					background: #dcfce7;
					color: #15803d;
				}

				&.expense {
					background: #fee2e2;
					color: #dc2626;
				}
			}
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

.full-width {
	width: 100%;
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

.amount-text {
	font-weight: 700;
	font-variant-numeric: tabular-nums;

	&.is-income {
		color: #16a34a;
	}

	&.is-expense {
		color: #dc2626;
	}
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

.date-text {
	font-size: 12px;
	color: #64748b;
	font-variant-numeric: tabular-nums;
}

.pay-way-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;

	.pay-way-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 8px;
		border-radius: 999px;
		background: #f1f5f9;
		font-size: 12px;
		font-weight: 600;
		color: #334155;
	}

	.pay-way-icon {
		width: 15px;
		height: 15px;
	}
}

.text-muted {
	font-size: 12px;
	color: #94a3b8;
}
</style>
