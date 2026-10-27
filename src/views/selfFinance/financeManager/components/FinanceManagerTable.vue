<template>
	<div class="content finance-table-card" ref="tableContainerRef">
		<div class="table-card-header">
			<div class="header-left">
				<span class="table-title">账单流水明细</span>
				<span class="table-count-pill">
					{{ Number(pagination.total || 0).toLocaleString() }} 笔
				</span>
				<span v-if="selectedRowIds.length" class="header-selection-tag">
					已勾选 {{ selectedRowIds.length }} 项
				</span>
			</div>
			<div class="header-right">
				<slot name="headerActions" />
			</div>
		</div>
		<a-table
			class="modern-finance-table"
			:dataSource="dataSource"
			:columns="columns"
			:loading="loading"
			:row-key="(record: FinanceManagerData) => record.id || ''"
			:pagination="false"
			@change="handleTableChange"
			:scroll="{ x: 'max-content', y: tableScrollY }"
			:row-selection="rowSelection"
		>
			<template #bodyCell="{ column, record }">
				<!-- 操作列：轻量链接按钮降噪 -->
				<template v-if="column.key === 'operation'">
					<a-space :size="2">
						<a-button
							type="link"
							size="small"
							class="action-link-btn view-link-btn"
							data-testid="btn-view-finance"
							@click="$emit('edit', 'view', record.id)"
						>
							查看
						</a-button>
						<template v-if="canEditRecord(record)">
							<a-divider type="vertical" />
							<a-button
								type="link"
								size="small"
								class="action-link-btn"
								data-testid="btn-edit-finance"
								@click="$emit('edit', 'update', record.id)"
							>
								编辑
							</a-button>
						</template>
						<template v-if="canDeleteRecord(record)">
							<a-divider type="vertical" />
							<a-popconfirm
								title="确认删除该笔账目?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="$emit('delete', record.id)"
							>
								<a-button
									type="link"
									size="small"
									danger
									class="action-link-btn"
									data-testid="btn-delete-finance"
								>
									删除
								</a-button>
							</a-popconfirm>
						</template>
					</a-space>
				</template>

				<!-- 类别列：语义化彩色胶囊 -->
				<template v-else-if="column.key === 'typeCode'">
					<span
						v-if="record.typeCode"
						class="category-pill"
						:style="getCategoryPillStyle(record.typeCode)"
						@click="$emit('filter-category', record.typeCode)"
						:title="`点击仅筛选【${record.typeCode}】`"
					>
						<span class="pill-emoji">{{ getCategoryEmoji(record.typeCode) }}</span>
						<span class="pill-name">{{ record.typeCode }}</span>
					</span>
					<span v-else class="text-slate-300">-</span>
				</template>

				<!-- 金额列：等宽、红绿收支色彩区分 -->
				<template v-else-if="column.key === 'amount'">
					<span
						:class="[
							'amount-text',
							record.incomeAndExpenses === 'income'
								? 'amount-income'
								: 'amount-expense',
						]"
					>
						<span class="direction-symbol">{{ record.incomeAndExpenses === 'income' ? '+' : '-' }}</span>
						<span class="currency-symbol">¥</span>
						<span class="amount-number">{{ formatAmount(record.amount) }}</span>
					</span>
				</template>

				<!-- 状态列：圆点 Badge 风格 -->
				<template v-else-if="column.key === 'isValid'">
					<a-badge
						:status="record.isValid === '1' ? 'success' : 'default'"
						:text="record.isValid === '1' ? '有效' : '失效'"
					/>
				</template>

				<!-- 收支类型列 -->
				<template v-else-if="column.key === 'incomeAndExpenses'">
					<a-tag
						:color="
							record.incomeAndExpenses === 'income' ? 'success' : 'error'
						"
						class="type-tag"
					>
						{{ record.incomeAndExpenses === 'income' ? '收入' : '支出' }}
					</a-tag>
				</template>

				<!-- 业务时间列 -->
				<template v-else-if="column.key === 'infoDate'">
					<span class="info-date-text">
						{{ record.infoDate ? formatTime(record.infoDate) : '-' }}
					</span>
				</template>

				<!-- 支付方式列：图标胶囊 -->
				<template v-else-if="column.key === 'fromSource'">
					<div class="from-source-pill">
						<component
							v-if="getFinanceIconComponent(record.fromSource)"
							:is="getFinanceIconComponent(record.fromSource)"
							class="from-source-icon"
						/>
						<span>{{ getFromSourceName(record.fromSource) }}</span>
					</div>
				</template>
			</template>
		</a-table>

		<!-- 常驻表格底栏工具条 (Sticky Action Toolbar) -->
		<div class="table-footer-toolbar">
			<div class="toolbar-left">
				<template v-if="selectedRowIds.length">
					<span class="selection-pill">
						已选
						<strong class="selection-count">{{
							selectedRowIds.length
						}}</strong>
						项
					</span>
					<a-divider type="vertical" />
					<a-popconfirm
						:title="`确认批量删除选中的 ${selectedRowIds.length} 笔账目?`"
						ok-text="确认"
						cancel-text="取消"
						@confirm="$emit('batch-delete')"
					>
						<a-button type="link" danger size="small" class="footer-action-btn">
							<template #icon><DeleteOutlined /></template>
							批量删除
						</a-button>
					</a-popconfirm>
					<a-button
						type="link"
						size="small"
						class="footer-action-btn clear-btn"
						@click="$emit('clear-selected')"
					>
						清空选择
					</a-button>
				</template>
				<template v-else>
					<span class="total-text">
						共
						<span class="total-num">{{
							Number(pagination.total || 0).toLocaleString()
						}}</span>
						笔账目
					</span>
				</template>
			</div>
			<div class="toolbar-right">
				<a-pagination
					size="small"
					:current="pagination.current"
					:page-size="pagination.pageSize"
					:total="pagination.total"
					:show-size-changer="pagination.showSizeChanger"
					:page-size-options="pagination.pageSizeOptions"
					:show-quick-jumper="pagination.showQuickJumper"
					:show-total="pagination.showTotal"
					@change="handlePageChange"
					@showSizeChange="handleSizeChange"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue';
import { formatTime } from '@/utils/dayjs';
import { iconComponentMap } from '@/config/icons';
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';


const categoryEmojiMap: Record<string, string> = {
	餐饮: '🍱',
	日常交通: '🚗',
	交通: '🚗',
	打车: '🚕',
	日用百货: '🛒',
	日用: '🛒',
	超市: '🏪',
	水费: '💧',
	电费: '⚡',
	燃气费: '🔥',
	零食: '🍿',
	饮品: '☕',
	咖啡: '☕',
	工资: '💰',
	奖金: '🧧',
	礼金: '🎁',
	房租: '🏠',
	医疗: '💊',
	娱乐: '🎮',
};

// 仅在获取支付方式图标时使用的映射（避免使用 includes 模糊匹配产生误判）
const financeSourceIconMap: Record<string, string> = {
	hfw: 'hf',
	hfm: 'hf',
	hfmj: 'hf',
	dfw: 'df',
	dfm: 'df',
};

const getFinanceIconComponent = (source?: string) => {
	if (!source) return null;
	const iconKey = financeSourceIconMap[source] || source;
	return iconComponentMap[`finance-${iconKey}`] || null;
};

const getCategoryEmoji = (name?: string): string => {
	if (!name) return '🏷️';
	for (const [key, emoji] of Object.entries(categoryEmojiMap)) {
		if (name.includes(key)) {
			return emoji;
		}
	}
	return '🏷️';
};

defineProps<{
	dataSource: FinanceManagerData[];
	columns: any[];
	loading: boolean;
	tableScrollY: number;
	rowSelection: any;
	selectedRowIds: (string | number)[];
	pagination: any;
	canEditRecord: (record: FinanceManagerData) => boolean;
	canDeleteRecord: (record: FinanceManagerData) => boolean;
	getCategoryPillStyle: (typeCode: string) => any;
	formatAmount: (amount?: number | string) => string;
	getFromSourceName: (val?: string) => string;
}>();

const emit = defineEmits<{
	(e: 'edit', action: 'add' | 'update' | 'view', id?: string): void;
	(e: 'delete', id?: string): void;
	(e: 'batch-delete'): void;
	(e: 'clear-selected'): void;
	(e: 'filter-category', typeCode: string): void;
	(e: 'table-change', pagination: any, filters: any, sorter: any): void;
	(e: 'page-change', page: number, pageSize: number): void;
	(e: 'size-change', current: number, size: number): void;
}>();

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
	emit('table-change', pagination, filters, sorter);
};

const handlePageChange = (page: number, pageSize: number) => {
	emit('page-change', page, pageSize);
};

const handleSizeChange = (current: number, size: number) => {
	emit('size-change', current, size);
};
</script>

<style scoped lang="less">
.content {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	position: relative;
	background: #fff;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
	padding: 0 16px;
	overflow: hidden;

	.table-card-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 4px;
		border-bottom: 1px solid #f1f5f9;
		gap: 12px;

		.header-left {
			display: flex;
			align-items: center;
			gap: 8px;

			.table-title {
				font-size: 14px;
				font-weight: 700;
				color: #0f172a;
			}

			.table-count-pill {
				display: inline-flex;
				align-items: center;
				padding: 1px 8px;
				border-radius: 999px;
				background: #f1f5f9;
				border: 1px solid #e2e8f0;
				font-size: 11px;
				font-weight: 600;
				color: #475569;
				font-variant-numeric: tabular-nums;
			}

			.header-selection-tag {
				display: inline-flex;
				align-items: center;
				padding: 1px 8px;
				border-radius: 999px;
				background: #eff6ff;
				border: 1px solid #bfdbfe;
				font-size: 11px;
				font-weight: 600;
				color: #1d4ed8;
			}
		}

		.header-right {
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}

	:deep(.ant-table-wrapper) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;

		.ant-spin-nested-loading {
			flex: 1;
			min-height: 0;
			display: flex;
			flex-direction: column;

			.ant-spin-container {
				flex: 1;
				min-height: 0;
				display: flex;
				flex-direction: column;

				.ant-table {
					flex: 1;
					min-height: 0;

					.ant-table-thead > tr > th {
						background: #f8fafc !important;
						color: #475569;
						font-size: 12px;
						font-weight: 600;
						padding: 10px 12px;
						border-bottom: 1px solid #e2e8f0;
					}

					.ant-table-tbody > tr > td {
						padding: 9px 12px;
						border-bottom: 1px solid #f1f5f9;
					}

					.ant-table-container {
						height: 100%;
						display: flex;
						flex-direction: column;

						.ant-table-body {
							flex: 1;
							min-height: 0;
						}
					}
				}
			}
		}
	}

	.table-footer-toolbar {
		flex-shrink: 0;
		height: 46px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4px;
		background: #fff;
		border-top: 1px solid #f1f5f9;
		z-index: 10;

		.toolbar-left {
			display: flex;
			align-items: center;
			gap: 8px;

			.total-text {
				font-size: 13px;
				color: #64748b;

				.total-num {
					color: #0f172a;
					font-weight: 600;
					font-variant-numeric: tabular-nums;
				}
			}

			.selection-pill {
				display: inline-flex;
				align-items: center;
				padding: 2px 8px;
				background: #eff6ff;
				border: 1px solid #bfdbfe;
				border-radius: 6px;
				color: #1d4ed8;
				font-size: 12px;

				.selection-count {
					font-weight: 700;
					margin: 0 2px;
				}
			}

			.footer-action-btn {
				padding: 0 4px;
				font-size: 13px;
				height: auto;

				&.clear-btn {
					color: #64748b;
					&:hover {
						color: #1677ff;
					}
				}
			}
		}

		.toolbar-right {
			display: flex;
			align-items: center;

			:deep(.ant-pagination) {
				margin: 0 !important;
			}
		}
	}
}

.amount-text {
	display: inline-flex;
	align-items: baseline;
	font-weight: 600;
	font-size: 14px;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	font-variant-numeric: tabular-nums;
	letter-spacing: -0.01em;

	.direction-symbol {
		font-size: 13px;
		margin-right: 1px;
	}

	.currency-symbol {
		font-size: 11px;
		margin-right: 1px;
		opacity: 0.85;
	}

	.amount-number {
		font-size: 14px;
	}

	&.amount-income {
		color: #059669;
	}

	&.amount-expense {
		color: #e11d48;
	}
}

.action-link-btn {
	padding: 0 3px;
	font-size: 13px;

	&.view-link-btn {
		color: #475569;
		&:hover {
			color: #1677ff;
		}
	}
}

.type-tag {
	border-radius: 4px;
	font-size: 12px;
}

.info-date-text {
	color: #475569;
	font-size: 13px;
	font-variant-numeric: tabular-nums;
}

.from-source-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-size: 12px;
	color: #334155;
	min-width: 76px;

	.from-source-icon {
		width: 15px;
		height: 15px;
		flex-shrink: 0;
	}
}

.category-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;

	.pill-emoji {
		font-size: 11px;
		line-height: 1;
	}

	.pill-name {
		line-height: 1.2;
	}

	&:hover {
		opacity: 0.9;
		transform: translateY(-1px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
}
</style>
