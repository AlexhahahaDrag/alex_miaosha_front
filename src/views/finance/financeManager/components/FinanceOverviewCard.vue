<template>
	<!-- 一体化概览面板（账单统计与月度预算并排，节省纵向空间） -->
	<div class="finance-overview-card">
		<!-- 左侧：账单收支统计 -->
		<div class="overview-section bill-stats-section">
			<a-skeleton
				:loading="!isFirstSummaryLoaded"
				active
				:title="{ width: '38%' }"
				:paragraph="{ rows: 2, width: ['80%', '60%'] }"
			>
				<div class="section-header">
					<span class="summary-tag-title">
						<CalendarOutlined class="summary-title-icon" />
						<span>{{ summaryTitle }}</span>
					</span>
					<span class="record-total-badge">
						共
						<strong>{{ summaryData.totalCount ?? paginationTotal ?? 0 }}</strong>
						笔账单
					</span>
				</div>

				<div class="stats-metrics-group">
					<!-- 全部 或 支出模式：展示支出 -->
					<div
						v-if="
							!searchInfo.incomeAndExpenses ||
							searchInfo.incomeAndExpenses === 'expense'
						"
						class="stat-metric expense"
					>
						<span class="label">{{
							searchInfo.incomeAndExpenses === 'expense' ?
								'支出合计'
							:	'总支出'
						}}</span>
						<span class="value"
							>-¥{{ formatAmount(summaryData.totalExpense || 0) }}</span
						>
					</div>

					<!-- 全部 或 收入模式：展示收入 -->
					<div
						v-if="
							!searchInfo.incomeAndExpenses ||
							searchInfo.incomeAndExpenses === 'income'
						"
						class="stat-metric income"
					>
						<span class="label">{{
							searchInfo.incomeAndExpenses === 'income' ? '收入合计' : '总收入'
						}}</span>
						<span class="value"
							>+¥{{ formatAmount(summaryData.totalIncome || 0) }}</span
						>
					</div>

					<!-- 仅在全部模式下展示结余 -->
					<div v-if="!searchInfo.incomeAndExpenses" class="stat-metric balance">
						<span class="label">净结余</span>
						<span
							:class="[
								'value',
								(summaryData.totalBalance || 0) >= 0 ?
									'text-income'
								:	'text-expense',
							]"
						>
							{{ (summaryData.totalBalance || 0) >= 0 ? '+' : '-' }}¥{{
								formatAmount(Math.abs(summaryData.totalBalance || 0))
							}}
						</span>
					</div>
				</div>

				<!-- 微洞察行：日均支出 + Top 3 支出大头微标签 -->
				<div class="stats-insights-row">
					<div
						class="insight-item daily-avg"
						:title="`基于${effectiveDaysInfo.label}计算`"
					>
						<span class="insight-label">日均支出:</span>
						<span class="insight-val">
							¥{{ formatAmount(dailyExpenseAvg) }}
							<span class="insight-unit">/天</span>
						</span>
					</div>

					<div
						v-if="topExpenseCategories.length > 0"
						class="insight-item top-categories"
					>
						<span class="insight-label">主要支出:</span>
						<div class="insight-tags-wrap">
							<span
								v-for="cat in topExpenseCategories"
								:key="cat.name"
								class="insight-top-tag"
								:title="`点击筛选【${cat.name}】，本期支出 ¥${formatAmount(cat.amount)} (${cat.percent}%)`"
								@click="$emit('filter-category', cat.name)"
							>
								{{ cat.name }} <span class="tag-pct">{{ cat.percent }}%</span>
							</span>
						</div>
					</div>
				</div>
			</a-skeleton>
		</div>

		<!-- 中间细垂直分割线 -->
		<div class="overview-divider"></div>

		<!-- 右侧：零花钱月度预算 -->
		<div class="overview-section budget-section">
			<a-skeleton
				:loading="!isFirstBudgetLoaded"
				active
				:title="{ width: '42%' }"
				:paragraph="{ rows: 2, width: ['80%', '60%'] }"
			>
				<div class="section-header">
					<div class="budget-title-line">
						<WalletOutlined class="budget-icon" />
						<span class="budget-title">{{ currentMonthStr }} 零花钱预算</span>
						<a-tag
							v-if="budgetStatus?.isInherited"
							color="processing"
							class="budget-tag"
						>
							继承自上月
						</a-tag>
						<a-tag
							v-if="budgetStatus?.isOverBudget"
							color="error"
							class="budget-tag"
						>
							已超支
						</a-tag>
					</div>
					<a-button
						type="link"
						size="small"
						class="budget-setting-btn"
						@click="$emit('open-budget-modal')"
					>
						<template #icon><SettingOutlined /></template>
						调整预算
					</a-button>
				</div>

				<!-- 主金额行：剩余可用 + 上限/已用 -->
				<div class="budget-metrics-group">
					<div class="budget-stat-item">
						<span class="stat-label">{{
							budgetStatus?.isOverBudget ? '超支金额:' : '剩余可用:'
						}}</span>
						<span
							:class="[
								'stat-val',
								budgetStatus?.isOverBudget ? 'text-expense' : 'text-income',
							]"
						>
							{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{
								formatAmount(Math.abs(budgetStatus?.remainingAmount || 0))
							}}
						</span>
					</div>

					<div class="budget-sub-stats">
						<span class="sub-stat"
							>上限 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span
						>
						<span class="sub-sep">/</span>
						<span
							class="sub-stat clickable-sub-stat"
							@click="$emit('drill-down-budget-month')"
							title="点击联动查看当月已计入明细"
						>
							{{ budgetSpentLabel }}
							{{ Number(budgetStatus?.actualExpense || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(Number(budgetStatus?.actualExpense || 0)))
							}}
							<span class="drill-icon">↗</span>
						</span>
					</div>
				</div>

				<!-- 微洞察行：进度条 + 计入分类微标签 -->
				<div class="budget-insights-row">
					<div
						class="budget-progress-wrap"
						:title="`预算使用率: ${budgetStatus?.usagePercent || 0}%`"
					>
						<a-progress
							:percent="
								Math.max(0, Math.min(budgetStatus?.usagePercent || 0, 100))
							"
							:stroke-color="progressStrokeColor"
							:format="() => `${budgetStatus?.usagePercent || 0}%`"
							size="small"
							class="budget-progress"
						/>
					</div>

					<div
						class="budget-category-hints"
						:title="
							budgetStatus?.categoryNames?.length ?
								budgetStatus.categoryNames.join('、')
							:	budgetDirectionLabel
						"
					>
						<span class="hint-label">计入:</span>
						<template v-if="budgetStatus?.categoryNames?.length">
							<a-tag
								v-for="cat in budgetStatus.categoryNames.slice(0, 3)"
								:key="cat"
								class="cat-pill clickable-cat-pill"
								@click="$emit('drill-down-category', cat)"
								:title="`点击仅查看本月【${cat}】账目`"
							>
								{{ cat }}
							</a-tag>
							<span
								v-if="budgetStatus.categoryNames.length > 3"
								class="cat-pill-more clickable-cat-more"
								@click="$emit('drill-down-category', budgetStatus.categoryNames[3])"
								:title="`点击仅查看本月【${budgetStatus.categoryNames[3]}】账目`"
							>
								+{{ budgetStatus.categoryNames.length - 3 }}
							</span>
						</template>
						<span
							v-else
							class="cat-pill-all clickable-cat-pill"
							@click="$emit('drill-down-budget-month')"
							title="点击查看当月全部预算收支明细"
						>
							{{ budgetDirectionLabel }}
						</span>
					</div>
				</div>
			</a-skeleton>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	CalendarOutlined,
	WalletOutlined,
	SettingOutlined,
} from '@ant-design/icons-vue';
import { formatAmount } from '@/utils/amountInfo';
import type { FinanceSummaryData } from '@/views/finance/financeManager/api';
import type {
	FinanceBudgetStatusVo,
	FinanceManagerData,
} from '@/views/finance/financeManager/config';

defineProps<{
	isFirstSummaryLoaded: boolean;
	isFirstBudgetLoaded: boolean;
	summaryTitle: string;
	summaryData: FinanceSummaryData;
	searchInfo: FinanceManagerData;
	paginationTotal?: number;
	effectiveDaysInfo: { label: string; days: number };
	dailyExpenseAvg: number;
	topExpenseCategories: Array<{
		name: string;
		amount: number;
		percent: number;
	}>;
	currentMonthStr: string;
	budgetStatus?: FinanceBudgetStatusVo | null;
	budgetSpentLabel: string;
	budgetDirectionLabel: string;
	progressStrokeColor: string;
}>();

defineEmits<{
	(e: 'filter-category', cat: string): void;
	(e: 'open-budget-modal'): void;
	(e: 'drill-down-budget-month'): void;
	(e: 'drill-down-category', cat: string): void;
}>();
</script>

<style lang="scss" scoped>
.finance-overview-card {
	flex-shrink: 0;
	background: #fff;
	padding: 8px 16px;
	border-radius: 8px;
	margin: 0 0 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	display: flex;
	align-items: center;
	gap: 16px;
	min-height: 72px;

	.overview-divider {
		width: 1px;
		align-self: stretch;
		background: #f0f0f0;
		flex-shrink: 0;
		margin: 2px 0;
	}

	.overview-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;

		:deep(.ant-skeleton) {
			.ant-skeleton-title {
				margin: 2px 0 8px;
				height: 14px;
			}
			.ant-skeleton-paragraph {
				margin: 0;
				> li {
					height: 12px;
					margin: 4px 0 0;
				}
			}
		}

		&.bill-stats-section {
			flex: 1.1;
		}

		&.budget-section {
			flex: 0.9;
		}

		.section-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;
			line-height: 1;

			.summary-tag-title {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				font-size: 11px;
				font-weight: 600;
				color: #8c8c8c;
				letter-spacing: 0.3px;

				.summary-title-icon {
					font-size: 12px;
					color: #1677ff;
				}
			}

			.record-total-badge {
				font-size: 11px;
				color: #8c8c8c;

				strong {
					color: #262626;
					font-weight: 600;
				}
			}

			.budget-title-line {
				display: inline-flex;
				align-items: center;
				gap: 4px;

				.budget-icon {
					font-size: 12px;
					color: #722ed1;
				}

				.budget-title {
					font-size: 11px;
					font-weight: 600;
					color: #8c8c8c;
					letter-spacing: 0.3px;
				}

				.budget-tag {
					font-size: 10px;
					line-height: 14px;
					padding: 0 4px;
					margin: 0;
				}
			}

			.budget-setting-btn {
				padding: 0;
				height: auto;
				font-size: 11px;
				line-height: 1;
			}
		}

		.stats-metrics-group {
			display: flex;
			align-items: baseline;
			gap: 16px;
			margin-bottom: 4px;
			flex-wrap: wrap;

			.stat-metric {
				display: inline-flex;
				align-items: baseline;
				gap: 4px;

				.label {
					font-size: 11px;
					color: #8c8c8c;
				}

				.value {
					font-size: 16px;
					font-weight: 700;
					line-height: 1.1;
					font-variant-numeric: tabular-nums;
				}

				&.expense .value {
					color: #ff4d4f;
				}

				&.income .value {
					color: #52c41a;
				}

				&.balance .value {
					font-weight: 600;
				}
			}
		}

		.budget-metrics-group {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			margin-bottom: 4px;
			gap: 8px;

			.budget-stat-item {
				display: inline-flex;
				align-items: baseline;
				gap: 4px;

				.stat-label {
					font-size: 11px;
					color: #8c8c8c;
				}

				.stat-val {
					font-size: 16px;
					font-weight: 700;
					line-height: 1.1;
					font-variant-numeric: tabular-nums;
				}
			}

			.budget-sub-stats {
				display: inline-flex;
				align-items: baseline;
				gap: 4px;
				font-size: 11px;
				color: #8c8c8c;

				.sub-sep {
					color: #d9d9d9;
				}

				.clickable-sub-stat {
					cursor: pointer;
					transition: color 0.2s ease;

					&:hover {
						color: #1677ff;
						text-decoration: underline;
					}

					.drill-icon {
						font-size: 10px;
						margin-left: 1px;
					}
				}
			}
		}

		.stats-insights-row,
		.budget-insights-row {
			display: flex;
			align-items: center;
			gap: 12px;
			min-height: 20px;
			line-height: 1;
		}

		.insight-item {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 11px;
			color: #8c8c8c;

			.insight-label {
				color: #8c8c8c;
				flex-shrink: 0;
			}

			.insight-val {
				color: #595959;
				font-weight: 600;
				font-variant-numeric: tabular-nums;

				.insight-unit {
					font-size: 10px;
					color: #bfbfbf;
					font-weight: normal;
				}
			}

			&.top-categories {
				flex: 1;
				min-width: 0;
				overflow: hidden;

				.insight-tags-wrap {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					min-width: 0;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}

				.insight-top-tag {
					display: inline-flex;
					align-items: center;
					gap: 2px;
					font-size: 11px;
					line-height: 16px;
					padding: 0 5px;
					border-radius: 10px;
					background: #fff1f0;
					border: 1px solid #ffccc7;
					color: #cf1322;
					cursor: pointer;
					transition: all 0.2s ease;
					flex-shrink: 0;

					.tag-pct {
						font-size: 10px;
						color: #ff4d4f;
					}

					&:hover {
						background: #ff4d4f;
						border-color: #ff4d4f;
						color: #fff;

						.tag-pct {
							color: #fff;
						}
					}
				}
			}
		}

		.budget-progress-wrap {
			width: 160px;
			flex-shrink: 0;

			:deep(.ant-progress) {
				display: flex;
				align-items: center;
				margin: 0;

				.ant-progress-outer {
					flex: 1;
					margin-inline-end: 0 !important;
					padding-inline-end: 0 !important;
				}

				.ant-progress-text {
					width: auto !important;
					margin-inline-start: 8px !important;
					flex-shrink: 0;
					text-align: right;
					font-variant-numeric: tabular-nums;
				}
			}
		}

		.budget-category-hints {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 12px;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			.hint-label {
				color: #8c8c8c;
				font-size: 11px;
				flex-shrink: 0;
			}

			.cat-pill {
				font-size: 11px;
				line-height: 16px;
				padding: 0 5px;
				margin: 0;
				border-radius: 10px;
				background: #fafafa;
				border: 1px solid #e8e8e8;
				color: #595959;
				cursor: pointer;
				transition: all 0.2s ease;

				&:hover {
					background: #e6f4ff;
					border-color: #91caff;
					color: #1677ff;
				}
			}

			.cat-pill-more {
				font-size: 11px;
				color: #8c8c8c;
				cursor: pointer;
				flex-shrink: 0;

				&:hover {
					color: #1677ff;
				}
			}

			.cat-pill-all {
				color: #8c8c8c;
				font-size: 11px;
				cursor: pointer;

				&:hover {
					color: #1677ff;
				}
			}
		}
	}
}

@media (max-width: 1300px) {
	.finance-overview-card {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;

		.overview-divider {
			display: none;
		}
	}
}

.text-income {
	color: #52c41a !important;
}

.text-expense {
	color: #ff4d4f !important;
}
</style>
