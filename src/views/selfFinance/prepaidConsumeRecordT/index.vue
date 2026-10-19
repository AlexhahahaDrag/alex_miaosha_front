<template>
	<div class="prepaid-consume-screen">
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<HistoryOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">储值卡交易流水记录</h1>
						<span class="stat-pill">
							共 <strong>{{ pagination.total || 0 }}</strong> 笔流水
						</span>
					</div>
					<p class="page-subtitle">
						检索与管理全量预付卡、储值卡充值入账与刷卡消费流水台账
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-popconfirm
					v-if="selectedRowKeys.length > 0"
					:title="`确认批量删除选中的 ${selectedRowKeys.length} 条流水记录吗？`"
					ok-text="确认删除"
					cancel-text="取消"
					@confirm="batchDelRecord"
				>
					<a-button danger class="action-btn">
						<template #icon><DeleteOutlined /></template>
						批量删除 ({{ selectedRowKeys.length }})
					</a-button>
				</a-popconfirm>
				<a-button
					type="primary"
					class="action-btn primary-btn"
					@click="openDetail('add')"
				>
					<template #icon><PlusOutlined /></template>
					新增流水记录
				</a-button>
			</div>
		</header>

		<section class="filter-card">
			<div class="filter-row">
				<div class="filter-inputs">
					<div class="filter-item">
						<span class="filter-label">流水号</span>
						<a-input
							id="search_orderNo"
							name="orderNo"
							v-model:value="searchInfo.orderNo"
							placeholder="搜索交易流水号..."
							allow-clear
							class="filter-input"
							@pressEnter="query(true)"
						/>
					</div>
					<div class="filter-item">
						<span class="filter-label">商户名称</span>
						<a-input
							id="search_merchantName"
							name="merchantName"
							v-model:value="searchInfo.merchantName"
							placeholder="搜索商户名称..."
							allow-clear
							class="filter-input"
							@pressEnter="query(true)"
						/>
					</div>
				</div>
				<div class="filter-btns">
					<a-button type="primary" class="filter-btn" @click="query(true)">
						<template #icon><SearchOutlined /></template>
						查询
					</a-button>
					<a-button class="filter-btn" @click="cancelQuery">
						<template #icon><ReloadOutlined /></template>
						重置
					</a-button>
				</div>
			</div>
		</section>

		<section class="table-card">
			<a-table
				class="modern-consume-table"
				:columns="columns"
				:data-source="dataSource"
				:loading="loading"
				:row-key="(record: PrepaidConsumeRecordTData) => String(record.id || record.orderNo || '')"
				:pagination="pagination"
				:row-selection="rowSelection"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'orderNo'">
						<span v-if="record.orderNo" class="code-pill">
							{{ record.orderNo }}
						</span>
						<span v-else class="text-slate-300">—</span>
					</template>

					<template v-else-if="column.key === 'amount'">
						<span
							class="amount-cell"
							:class="
								Number(record.amount || 0) < 0 ?
									'text-emerald-600'
								:	'text-rose-600'
							"
						>
							{{ Number(record.amount || 0) < 0 ? '+' : '-' }}¥{{
								formatAmount(Math.abs(Number(record.amount || 0)))
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'balanceAfter'">
						<span class="font-mono font-semibold text-slate-700">
							¥{{ formatAmount(record.balanceAfter || 0) }}
						</span>
					</template>

					<template v-else-if="column.key === 'consumeTime'">
						<span class="font-mono text-xs text-slate-500">
							{{
								record.consumeTime ?
									formatTime(record.consumeTime, 'YYYY-MM-DD HH:mm')
								:	'—'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								@click="openDetail('update', record.id)"
							>
								编辑
							</a-button>
							<a-divider type="vertical" />
							<a-popconfirm
								title="确认删除该条交易流水吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delRecord(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

		<PrepaidConsumeRecordTDetailModal
			v-model:open="detailOpen"
			:model-info="modelInfo"
			@success="() => query()"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	HistoryOutlined,
	PlusOutlined,
	DeleteOutlined,
	SearchOutlined,
	ReloadOutlined,
} from '@ant-design/icons-vue';
import type { ModelInfo } from '@/types/modal';
import {
	columns,
	type PrepaidConsumeRecordTData,
} from '@/views/selfFinance/prepaidConsumeRecordT/config';
import {
	getPrepaidConsumeRecordTPage,
	deletePrepaidConsumeRecordT,
} from '@/views/selfFinance/prepaidConsumeRecordT/api';
import PrepaidConsumeRecordTDetailModal from '@/views/selfFinance/prepaidConsumeRecordT/prepaidConsumeRecordTDetail/index.vue';
import { usePagination, useRowSelection } from '@/composables/usePagination';
import { formatAmount } from '@/utils/amountInfo';
import { formatTime } from '@/utils/dayjs';

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const searchInfo = ref<PrepaidConsumeRecordTData>({});
const loading = ref<boolean>(false);
const dataSource = ref<PrepaidConsumeRecordTData[]>([]);
const detailOpen = ref<boolean>(false);
const modelInfo = ref<ModelInfo>({});

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => fetchPage(searchInfo.value, p),
	});

const fetchPage = async (param: PrepaidConsumeRecordTData, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPrepaidConsumeRecordTPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询交易流水失败！');
		}
	} finally {
		loading.value = false;
	}
};

const query = (reset = false) => {
	if (reset) {
		resetPagination();
	}
	fetchPage(searchInfo.value, pagination);
};

const cancelQuery = () => {
	searchInfo.value = {};
	query(true);
};

const openDetail = (type: 'add' | 'update', id?: string) => {
	modelInfo.value = {
		title: type === 'add' ? '新增储值卡交易流水' : '编辑储值卡交易流水',
		id: type === 'add' ? undefined : id ? String(id) : undefined,
	};
	detailOpen.value = true;
};

const delRecord = async (ids: string) => {
	if (!ids) return;
	const { code, message: messageInfo } = await deletePrepaidConsumeRecordT(ids);
	if (code === '200') {
		message.success(messageInfo || '删除成功！');
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！');
	}
};

const batchDelRecord = () => {
	if (!selectedRowKeys.value.length) return;
	delRecord(selectedRowKeys.value.join(','));
};

onMounted(() => {
	query(true);
});
</script>

<style lang="scss" scoped>
.prepaid-consume-screen {
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
	}

	.header-titles {
		display: flex;
		flex-direction: column;
		gap: 4px;

		.title-row {
			display: flex;
			align-items: center;
			gap: 8px;
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
		padding: 2px 9px;
		border-radius: 999px;
		font-size: 12px;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;

		.action-btn {
			height: 36px;
			border-radius: 8px;
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
		}

		.filter-input {
			width: 200px;
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
	padding: 12px 16px;
}

.code-pill {
	display: inline-block;
	padding: 1px 7px;
	border-radius: 5px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 12px;
	color: #475569;
}

.amount-cell {
	font-size: 14px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
}
</style>
