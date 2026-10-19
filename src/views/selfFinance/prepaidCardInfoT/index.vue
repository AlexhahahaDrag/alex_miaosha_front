<template>
	<div class="prepaid-card-screen">
		<!-- 1. 顶部储值卡资产工作台 Header -->
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<CreditCardOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">我的消费卡与储值资产</h1>
						<span class="stat-pill">
							持卡 <strong>{{ cards.length }}</strong> 张
						</span>
						<span class="stat-pill stat-pill-blue">
							卡内总余额 <strong>¥{{ formatAmount(totalCardBalance) }}</strong>
						</span>
					</div>
					<p class="page-subtitle">
						管理超市卡、会员储值卡余额变动，点击任意卡片可穿透筛选该卡专属充值与消费流水
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-button class="action-btn" :loading="cardsLoading" @click="refreshAll">
					<template #icon><ReloadOutlined /></template>
					刷新
				</a-button>
				<a-button
					type="primary"
					class="action-btn primary-btn"
					@click="handleRecharge('recharge')"
				>
					<template #icon><PlusOutlined /></template>
					新增卡片充值
				</a-button>
			</div>
		</header>

		<!-- 2. 储值卡资产网格卡片区 -->
		<section class="wallet-section">
			<a-spin :spinning="cardsLoading">
				<div v-if="cards.length" class="wallet-cards-grid">
					<div
						v-for="card in cards"
						:key="String(card.id || card.cardId)"
						class="wallet-card-item"
						:class="{
							'is-active':
								selectedCardId !== null &&
								String(selectedCardId) === String(card.id),
						}"
						@click="handleCardClick(card)"
					>
						<div class="wallet-card-top">
							<div class="card-name-group">
								<span class="card-icon-badge">
									<WalletOutlined />
								</span>
								<div class="card-name-meta">
									<h3 class="card-title">{{ card.cardName || '未命名储值卡' }}</h3>
									<span class="card-no">
										NO. {{ card.cardId || card.id || '—' }}
									</span>
								</div>
							</div>
							<span class="card-status-pill">
								{{ card.cardStatus || '正常' }}
							</span>
						</div>

						<div class="wallet-card-balance">
							<span class="balance-label">当前可用余额</span>
							<span class="balance-amount">
								¥{{ formatAmount(card.currentBalance || 0) }}
							</span>
						</div>

						<div class="wallet-card-footer" @click.stop>
							<a-button
								size="small"
								class="card-op-btn recharge-btn"
								@click="handleRecharge('recharge', card)"
							>
								<PlusCircleOutlined /> 充值
							</a-button>
							<a-button
								size="small"
								class="card-op-btn consume-btn"
								@click="handleRecharge('consume', card)"
							>
								<PayCircleOutlined /> 消费扣款
							</a-button>
						</div>
					</div>
				</div>

				<div v-else class="empty-wallet-box">
					<a-empty description="暂未添加任何消费储值卡">
						<a-button type="primary" @click="handleRecharge('recharge')">
							立即添加首张储值卡
						</a-button>
					</a-empty>
				</div>
			</a-spin>
		</section>

		<!-- 3. 交易流水记录卡片 -->
		<section class="table-card">
			<div class="table-card-header">
				<div class="header-title-group">
					<HistoryOutlined class="text-blue-600" />
					<span class="table-title">储值卡交易流水明细</span>
					<span class="count-pill">
						共 {{ paginationInfo.total || 0 }} 笔
					</span>
				</div>

				<div v-if="selectedCardId" class="filter-banner-inline">
					<span class="banner-dot"></span>
					<span>
						当前筛选卡片：<strong>{{ getSelectedCardName() }}</strong>
					</span>
					<a-button
						type="link"
						size="small"
						class="clear-filter-btn"
						@click="clearCardSelection"
					>
						查看全部卡片流水
					</a-button>
				</div>
			</div>

			<a-table
				class="modern-prepaid-table"
				:columns="columns"
				:data-source="transactions"
				:loading="recordsLoading"
				:row-key="(record: any) => String(record.id || record.orderNo || '')"
				:pagination="paginationInfo"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'cardName'">
						<span class="font-semibold text-slate-800">
							{{ record.cardName || '—' }}
						</span>
					</template>

					<template v-else-if="column.key === 'type'">
						<span
							class="tx-type-pill"
							:class="isRechargeRecord(record) ? 'is-recharge' : 'is-consume'"
						>
							{{ isRechargeRecord(record) ? '充值入账' : '刷卡消费' }}
						</span>
					</template>

					<template v-else-if="column.key === 'amount'">
						<span
							class="tx-amount"
							:class="
								isRechargeRecord(record) ? 'text-emerald-600' : 'text-rose-600'
							"
						>
							{{ isRechargeRecord(record) ? '+' : '-' }}¥{{
								formatAmount(Math.abs(Number(record.amount || 0)))
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'balanceAfter'">
						<span class="font-mono font-semibold text-slate-700">
							{{
								record.balanceAfter !== undefined && record.balanceAfter !== null ?
									`¥${formatAmount(record.balanceAfter)}`
								:	'—'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'orderNo'">
						<span v-if="record.orderNo" class="order-no-code">
							{{ record.orderNo }}
						</span>
						<span v-else class="text-slate-300">—</span>
					</template>

					<template v-else-if="column.key === 'description'">
						<span class="text-slate-600">
							{{ record.description || record.merchantName || '—' }}
						</span>
					</template>

					<template v-else-if="column.key === 'consumeTime'">
						<span class="font-mono text-xs text-slate-500">
							{{
								record.consumeTime || record.operateTime ?
									formatTime(
										record.consumeTime || record.operateTime,
										'YYYY-MM-DD HH:mm',
									)
								:	'—'
							}}
						</span>
					</template>
				</template>
			</a-table>
		</section>

		<recharge-info-modal
			v-model:open="rechargeDialogOpen"
			:data="currentCard"
			@ok="confirmRecharge"
			@cancel="cancelRecharge"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	CreditCardOutlined,
	WalletOutlined,
	PlusOutlined,
	ReloadOutlined,
	PlusCircleOutlined,
	PayCircleOutlined,
	HistoryOutlined,
} from '@ant-design/icons-vue';
import type { PageInfo } from '@/composables/usePagination';
import {
	columns,
	type IRechargeForm,
	type PrepaidCardInfoTData,
} from '@/views/selfFinance/prepaidCardInfoT/config';
import { getPrepaidCardInfoList } from '@/views/selfFinance/prepaidCardInfoT/api';
import { getPrepaidConsumeRecordTPage } from '@/views/selfFinance/prepaidConsumeRecordT/api';
import RechargeInfoModal from '@/views/selfFinance/prepaidCardInfoT/recharge-info-modal/index.vue';
import { formatTime } from '@/utils/dayjs';
import { formatAmount } from '@/utils/amountInfo';

const cards = ref<PrepaidCardInfoTData[]>([]);
const transactions = ref<any[]>([]);
const cardsLoading = ref<boolean>(false);
const recordsLoading = ref<boolean>(false);

const selectedCardId = ref<string | null>(null);

const paginationInfo = ref<any>({
	pageNum: 1,
	current: 1,
	pageSize: 10,
	total: 0,
	showSizeChanger: true,
	showTotal: (total: number) => `共 ${total} 条流水`,
});

const rechargeDialogOpen = ref<boolean>(false);
const currentCard = ref<IRechargeForm | null>(null);

const totalCardBalance = computed(() => {
	return (cards.value || []).reduce(
		(sum, item) => sum + (Number(item.currentBalance) || 0),
		0,
	);
});

const isRechargeRecord = (record: any) => {
	if (record?.type === '充值' || record?.type === 'recharge') return true;
	if (record?.type === '消费' || record?.type === 'consume') return false;
	return Number(record?.amount || 0) < 0;
};

const handleRecharge = (type: string, card?: PrepaidCardInfoTData) => {
	currentCard.value = {
		id: card?.id ? String(card.id) : undefined,
		cardId: card?.cardId ? String(card.cardId) : undefined,
		cardName: card?.cardName || '',
		type,
	};
	rechargeDialogOpen.value = true;
};

const handleCardClick = (card: PrepaidCardInfoTData) => {
	const nextId = card.id ? String(card.id) : null;
	if (selectedCardId.value === nextId) {
		clearCardSelection();
		return;
	}
	selectedCardId.value = nextId;
	paginationInfo.value.pageNum = 1;
	paginationInfo.value.current = 1;
	getPrepaidConsumeRecordTPageInfo();
};

const clearCardSelection = () => {
	selectedCardId.value = null;
	paginationInfo.value.pageNum = 1;
	paginationInfo.value.current = 1;
	getPrepaidConsumeRecordTPageInfo();
};

const getSelectedCardName = () => {
	const card = cards.value.find(
		(c) => String(c.id) === String(selectedCardId.value),
	);
	return card?.cardName || '';
};

const getPrepaidCardInfoListInfo = async () => {
	cardsLoading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPrepaidCardInfoList({});
		if (code === '200') {
			cards.value = data || [];
		} else {
			message.error(messageInfo || '获取消费卡列表失败');
		}
	} finally {
		cardsLoading.value = false;
	}
};

const getPrepaidConsumeRecordTPageInfo = async () => {
	recordsLoading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPrepaidConsumeRecordTPage(
			{ cardId: selectedCardId.value || undefined },
			paginationInfo.value.pageNum,
			paginationInfo.value.pageSize,
		);
		if (code === '200') {
			transactions.value = data?.records || [];
			paginationInfo.value.total = data?.total ?? 0;
		} else {
			message.error(messageInfo || '获取交易记录失败');
		}
	} finally {
		recordsLoading.value = false;
	}
};

const refreshAll = () => {
	getPrepaidCardInfoListInfo();
	getPrepaidConsumeRecordTPageInfo();
};

const confirmRecharge = () => {
	rechargeDialogOpen.value = false;
	refreshAll();
};

const cancelRecharge = () => {
	rechargeDialogOpen.value = false;
};

const handleTableChange = (pagination: PageInfo) => {
	paginationInfo.value.pageNum = pagination.current;
	paginationInfo.value.current = pagination.current;
	paginationInfo.value.pageSize = pagination.pageSize;
	getPrepaidConsumeRecordTPageInfo();
};

onMounted(() => {
	selectedCardId.value = null;
	refreshAll();
});
</script>

<style lang="scss" scoped>
.prepaid-card-screen {
	display: flex;
	flex-direction: column;
	gap: 16px;
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
		padding: 2px 10px;
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

.wallet-section {
	.wallet-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 14px;
	}

	.wallet-card-item {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 14px;
		padding: 16px 18px;
		border-radius: 12px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			border-color: #93c5fd;
			box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
		}

		&.is-active {
			border-color: #2563eb;
			background: linear-gradient(135deg, #eff6ff 0%, #ffffff 75%);
			box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.16);
		}

		.wallet-card-top {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 8px;

			.card-name-group {
				display: flex;
				align-items: center;
				gap: 10px;
				min-width: 0;
			}

			.card-icon-badge {
				width: 34px;
				height: 34px;
				border-radius: 8px;
				background: #eff6ff;
				color: #2563eb;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 16px;
				flex-shrink: 0;
			}

			.card-name-meta {
				display: flex;
				flex-direction: column;
				min-width: 0;

				.card-title {
					margin: 0;
					font-size: 15px;
					font-weight: 700;
					color: #0f172a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.card-no {
					font-size: 11px;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
						monospace;
					color: #94a3b8;
				}
			}

			.card-status-pill {
				padding: 1px 8px;
				border-radius: 999px;
				font-size: 11px;
				font-weight: 600;
				background: #ecfdf5;
				color: #047857;
				border: 1px solid #a7f3d0;
				flex-shrink: 0;
			}
		}

		.wallet-card-balance {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			padding: 10px 12px;
			border-radius: 8px;
			background: #f8fafc;
			border: 1px solid #f1f5f9;

			.balance-label {
				font-size: 12px;
				color: #64748b;
			}

			.balance-amount {
				font-size: 20px;
				font-weight: 800;
				color: #1d4ed8;
				font-variant-numeric: tabular-nums;
			}
		}

		.wallet-card-footer {
			display: flex;
			align-items: center;
			gap: 8px;

			.card-op-btn {
				flex: 1;
				border-radius: 6px;
				font-size: 12px;
				font-weight: 600;

				&.recharge-btn {
					color: #047857;
					border-color: #a7f3d0;
					background: #ecfdf5;
					&:hover {
						border-color: #10b981;
						background: #d1fae5;
					}
				}

				&.consume-btn {
					color: #1d4ed8;
					border-color: #bfdbfe;
					background: #eff6ff;
					&:hover {
						border-color: #3b82f6;
						background: #dbeafe;
					}
				}
			}
		}
	}

	.empty-wallet-box {
		padding: 36px 20px;
		background: #ffffff;
		border: 1px dashed #cbd5e1;
		border-radius: 12px;
	}
}

.table-card {
	flex: 1;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 0 16px 12px;
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);

	.table-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 4px;
		border-bottom: 1px solid #f1f5f9;
		margin-bottom: 4px;
		flex-wrap: wrap;
		gap: 10px;

		.header-title-group {
			display: flex;
			align-items: center;
			gap: 8px;

			.table-title {
				font-size: 14px;
				font-weight: 700;
				color: #0f172a;
			}

			.count-pill {
				padding: 1px 8px;
				border-radius: 999px;
				background: #f1f5f9;
				border: 1px solid #e2e8f0;
				font-size: 11px;
				font-weight: 600;
				color: #475569;
			}
		}

		.filter-banner-inline {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 3px 10px;
			border-radius: 999px;
			background: #eff6ff;
			border: 1px solid #bfdbfe;
			font-size: 12px;
			color: #1e40af;

			.banner-dot {
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: #2563eb;
			}

			.clear-filter-btn {
				padding: 0;
				height: auto;
				font-size: 12px;
			}
		}
	}
}

.tx-type-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;

	&.is-recharge {
		background: #ecfdf5;
		color: #047857;
		border: 1px solid #a7f3d0;
	}

	&.is-consume {
		background: #fffbeb;
		color: #b45309;
		border: 1px solid #fde68a;
	}
}

.tx-amount {
	font-size: 14px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
}

.order-no-code {
	display: inline-block;
	padding: 1px 7px;
	border-radius: 5px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 12px;
	color: #475569;
}
</style>
