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
				<!-- 1. 复合列：账目名称 + 状态呼吸点 + 归属人与时间 -->
				<template v-if="column.key === 'name'">
					<div class="compound-name-cell">
						<div class="primary-row">
							<span
								:class="[
									'status-indicator-dot',
									record.isValid === '1' ? 'status-dot-active' : 'status-dot-inactive',
								]"
								:title="record.isValid === '1' ? '状态：有效' : '状态：失效'"
							/>
							<span class="cell-name-text" :title="record.name || '未命名账目'">
								{{ record.name || '未命名账目' }}
							</span>
						</div>
						<div class="secondary-row">
							<span v-if="record.belongToName" class="cell-belong-pill">
								<UserOutlined class="belong-icon" />
								{{ record.belongToName }}
							</span>
							<span v-if="record.belongToName && record.infoDate" class="sub-sep">·</span>
							<span v-if="record.infoDate" class="cell-date-text">
								{{ formatTime(record.infoDate) }}
							</span>
						</div>
					</div>
				</template>

				<!-- 2. 类别列：语义化彩色胶囊 -->
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

				<!-- 3. 支付方式列：图标徽章与品牌胶囊 -->
				<template v-else-if="column.key === 'fromSource'">
					<div class="from-source-pill">
						<component
							v-if="getFinanceIconComponent(record.fromSource)"
							:is="getFinanceIconComponent(record.fromSource)"
							class="from-source-icon"
						/>
						<CreditCardOutlined v-else class="from-source-icon from-source-fallback-icon" />
						<span class="from-source-name">{{ getFromSourceName(record.fromSource) }}</span>
					</div>
				</template>

				<!-- 4. 金额列：等宽、靠右对齐、正负红绿自解释 -->
				<template v-else-if="column.key === 'amount'">
					<div
						:class="[
							'amount-container',
							record.incomeAndExpenses === 'income'
								? 'amount-income'
								: 'amount-expense',
						]"
					>
						<span class="direction-symbol">{{ record.incomeAndExpenses === 'income' ? '+' : '-' }}</span>
						<span class="currency-symbol">¥</span>
						<span class="amount-number">{{ formatAmount(record.amount) }}</span>
					</div>
				</template>

				<!-- 5. 操作列：Taste-Skill 磁吸微胶囊按钮 -->
				<template v-else-if="column.key === 'operation'">
					<div class="table-actions-group">
						<button
							type="button"
							class="table-action-btn view-action-btn"
							data-testid="btn-view-finance"
							@click="$emit('edit', 'view', record.id)"
							title="查看明细"
						>
							<EyeOutlined class="action-btn-icon" />
							<span>查看</span>
						</button>
						<template v-if="canEditRecord(record)">
							<button
								type="button"
								class="table-action-btn edit-action-btn"
								data-testid="btn-edit-finance"
								@click="$emit('edit', 'update', record.id)"
								title="编辑账目"
							>
								<EditOutlined class="action-btn-icon" />
								<span>编辑</span>
							</button>
						</template>
						<template v-if="canDeleteRecord(record)">
							<a-popconfirm
								title="确认删除该笔账目?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="$emit('delete', record.id)"
							>
								<button
									type="button"
									class="table-action-btn delete-action-btn"
									data-testid="btn-delete-finance"
									title="删除账目"
								>
									<DeleteOutlined class="action-btn-icon" />
									<span>删除</span>
								</button>
							</a-popconfirm>
						</template>
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
import {
	DeleteOutlined,
	UserOutlined,
	CreditCardOutlined,
	EyeOutlined,
	EditOutlined,
} from '@ant-design/icons-vue';
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

/* 复合主列：名称 + 状态微圆点 + 归属人与时间 (Taste-Skill VISUAL_DENSITY=8) */
.compound-name-cell {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 2px 0;

	.primary-row {
		display: flex;
		align-items: center;
		gap: 8px;

		.status-indicator-dot {
			width: 7px;
			height: 7px;
			border-radius: 999px;
			flex-shrink: 0;
			transition: all 0.2s ease;

			&.status-dot-active {
				background: #10b981;
				box-shadow: 0 0 0 2px #d1fae5;
			}

			&.status-dot-inactive {
				background: #cbd5e1;
				box-shadow: 0 0 0 2px #f1f5f9;
			}
		}

		.cell-name-text {
			font-size: 13.5px;
			font-weight: 600;
			color: #0f172a;
			line-height: 1.3;
			letter-spacing: -0.01em;
			transition: color 0.15s ease;

			&:hover {
				color: #2563eb;
			}
		}
	}

	.secondary-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: #94a3b8;
		padding-left: 15px;

		.cell-belong-pill {
			display: inline-flex;
			align-items: center;
			gap: 3px;
			padding: 1px 6px;
			background: #f1f5f9;
			border: 1px solid #e2e8f0;
			border-radius: 4px;
			color: #475569;
			font-weight: 500;
			line-height: 1.2;

			.belong-icon {
				font-size: 10px;
				color: #64748b;
			}
		}

		.sub-sep {
			color: #cbd5e1;
		}

		.cell-date-text {
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-variant-numeric: tabular-nums;
			color: #64748b;
		}
	}
}

/* 金额列：等宽、靠右对齐、收支自解释 */
.amount-container {
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
	font-weight: 700;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
	font-variant-numeric: tabular-nums;
	letter-spacing: -0.02em;

	.direction-symbol {
		font-size: 13px;
		margin-right: 1px;
	}

	.currency-symbol {
		font-size: 12px;
		margin-right: 1.5px;
		opacity: 0.85;
	}

	.amount-number {
		font-size: 15px;
	}

	&.amount-income {
		color: #059669;
	}

	&.amount-expense {
		color: #e11d48;
	}
}

/* 支付渠道微胶囊 */
.from-source-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2.5px 8px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-size: 12px;
	color: #334155;
	font-weight: 500;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

	.from-source-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.from-source-fallback-icon {
		font-size: 13px;
		color: #64748b;
	}

	.from-source-name {
		white-space: nowrap;
	}
}

/* 操作列磁吸微胶囊按钮 (Taste-Skill 微交互规范) */
.table-actions-group {
	display: inline-flex;
	align-items: center;
	gap: 4px;

	.table-action-btn {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 7px;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		line-height: 1.4;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;

		.action-btn-icon {
			font-size: 11px;
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		}

		&:hover {
			transform: scale(1.08);

			.action-btn-icon {
				transform: scale(1.15);
			}
		}

		&:active {
			transform: scale(0.96);
		}

		&.view-action-btn {
			color: #475569;
			&:hover {
				background: #f1f5f9;
				border-color: #e2e8f0;
				color: #0f172a;
			}
		}

		&.edit-action-btn {
			color: #2563eb;
			&:hover {
				background: #eff6ff;
				border-color: #bfdbfe;
				color: #1d4ed8;
			}
		}

		&.delete-action-btn {
			color: #e11d48;
			&:hover {
				background: #fff1f2;
				border-color: #fecdd3;
				color: #be123c;
			}
		}
	}
}

.category-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
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
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
}
</style>
