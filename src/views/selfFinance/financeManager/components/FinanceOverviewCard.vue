<template>
	<!-- 现代 SaaS 双子概览面板 (Tailwind Soft UI 响应式独立卡片) -->
	<div
		class="finance-overview-grid shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-3 mb-2.5"
	>
		<!-- 左侧：账单收支统计 -->
		<div
			class="overview-section bill-stats-section flex flex-col justify-between min-w-0 bg-white px-4 py-3 rounded-2xl border-0 shadow-sm shadow-slate-200/60 hover:shadow-md hover:shadow-slate-200/70 transition-all duration-200"
		>
			<a-skeleton
				:loading="summaryLoading || !isFirstSummaryLoaded"
				active
				:title="{ width: '38%' }"
				:paragraph="{ rows: 2, width: ['80%', '60%'] }"
			>
				<div class="flex items-center justify-between mb-1.5 leading-none">
					<span
						class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
					>
						<span
							class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center"
						>
							<CalendarOutlined class="text-[11px]" />
						</span>
						<span>{{ summaryTitle }}</span>
					</span>
					<span class="text-xs text-slate-400">
						共
						<strong class="text-slate-900 font-semibold font-mono">{{
							summaryData.totalCount ?? paginationTotal ?? 0
						}}</strong>
						笔账单
					</span>
				</div>

				<div class="flex items-baseline gap-5 mb-1.5 flex-wrap">
					<!-- 全部 或 支出模式：展示支出 -->
					<div
						v-if="
							!searchInfo.incomeAndExpenses ||
							searchInfo.incomeAndExpenses === 'expense'
						"
						class="inline-flex items-baseline gap-1.5"
					>
						<span class="text-xs text-slate-400">{{
							searchInfo.incomeAndExpenses === 'expense' ?
								'支出合计'
							:	'总支出'
						}}</span>
						<span
							class="text-lg font-extrabold leading-tight font-mono tabular-nums tracking-tight text-rose-600"
							>-¥{{ formatAmount(summaryData.totalExpense || 0) }}</span
						>
					</div>

					<!-- 全部 或 收入模式：展示收入 -->
					<div
						v-if="
							!searchInfo.incomeAndExpenses ||
							searchInfo.incomeAndExpenses === 'income'
						"
						class="inline-flex items-baseline gap-1.5"
					>
						<span class="text-xs text-slate-400">{{
							searchInfo.incomeAndExpenses === 'income' ? '收入合计' : '总收入'
						}}</span>
						<span
							class="text-lg font-extrabold leading-tight font-mono tabular-nums tracking-tight text-emerald-600"
							>+¥{{ formatAmount(summaryData.totalIncome || 0) }}</span
						>
					</div>

					<!-- 仅在全部模式下展示结余 -->
					<div
						v-if="!searchInfo.incomeAndExpenses"
						class="inline-flex items-baseline gap-1.5"
					>
						<span class="text-xs text-slate-400">净结余</span>
						<span
							:class="[
								'text-lg font-bold leading-tight font-mono tabular-nums tracking-tight',
								(summaryData.totalBalance || 0) >= 0 ?
									'text-emerald-600'
								:	'text-rose-600',
							]"
						>
							{{ (summaryData.totalBalance || 0) >= 0 ? '+' : '-' }}¥{{
								formatAmount(Math.abs(summaryData.totalBalance || 0))
							}}
						</span>
					</div>
				</div>

				<!-- 微洞察行：日均支出 + Top 3 支出大头微标签 -->
				<div class="flex items-center gap-3 min-h-[20px] leading-none">
					<div
						class="inline-flex items-center gap-1 text-xs text-slate-400"
						:title="`基于${effectiveDaysInfo.label}计算`"
					>
						<span class="shrink-0">日均支出:</span>
						<span class="text-slate-700 font-semibold font-mono tabular-nums">
							¥{{ formatAmount(dailyExpenseAvg) }}
							<span class="text-[10px] text-slate-400 font-normal">/天</span>
						</span>
					</div>

					<div
						v-if="topExpenseCategories.length > 0"
						class="inline-flex items-center gap-1.5 text-xs text-slate-400 flex-1 min-w-0 overflow-hidden"
					>
						<span class="shrink-0">主要支出:</span>
						<div
							class="inline-flex items-center gap-1.5 min-w-0 overflow-hidden whitespace-nowrap"
						>
							<span
								v-for="cat in topExpenseCategories"
								:key="cat.name"
								class="inline-flex items-center gap-1 text-[11px] leading-4 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer transition-all duration-150 shrink-0 font-medium group"
								:title="`点击筛选【${cat.name}】，本期支出 ¥${formatAmount(cat.amount)} (${cat.percent}%)`"
								@click="$emit('filter-category', cat.name)"
							>
								<span>{{ cat.name }}</span>
								<span
									class="text-[10px] text-rose-500 group-hover:text-white font-mono"
									>{{ cat.percent }}%</span
								>
							</span>
						</div>
					</div>
				</div>
			</a-skeleton>
		</div>

		<!-- 右侧：零花钱月度预算 -->
		<div
			class="overview-section budget-section flex flex-col justify-between min-w-0 bg-white px-4 py-3 rounded-2xl border-0 shadow-sm shadow-slate-200/60 hover:shadow-md hover:shadow-slate-200/70 transition-all duration-200"
		>
			<a-skeleton
				:loading="budgetLoading || !isFirstBudgetLoaded"
				active
				:title="{ width: '42%' }"
				:paragraph="{ rows: 2, width: ['80%', '60%'] }"
			>
				<div class="flex items-center justify-between mb-1.5 leading-none">
					<div class="inline-flex items-center gap-1.5">
						<span
							class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center"
						>
							<WalletOutlined class="text-[11px]" />
						</span>
						<span class="text-xs font-medium text-slate-500"
							>{{ currentMonthStr }} 零花钱预算</span
						>
						<span
							v-if="budgetStatus?.isInherited"
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-600"
						>
							继承自上月
						</span>
						<span
							v-if="budgetStatus?.isOverBudget"
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600"
							data-testid="budget-over-tag"
						>
							已超支
						</span>
					</div>
					<button
						type="button"
						class="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
						data-testid="btn-open-budget-modal"
						@click="$emit('open-budget-modal')"
					>
						<SettingOutlined class="text-[11px]" />
						<span>调整预算</span>
					</button>
				</div>

				<!-- 主金额行：剩余可用 + 上限/已用 -->
				<div class="flex items-baseline justify-between mb-1.5 gap-2">
					<div class="inline-flex items-baseline gap-1.5 flex-wrap">
						<span class="text-xs text-slate-400">{{
							budgetStatus?.isOverBudget ? '超支金额:' : '剩余可用:'
						}}</span>
						<span
							:class="[
								'text-lg font-extrabold leading-tight font-mono tabular-nums tracking-tight',
								budgetStatus?.isOverBudget ?
									'text-rose-600'
								:	'text-emerald-600',
							]"
							data-testid="budget-remaining-value"
						>
							{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{
								formatAmount(Math.abs(budgetStatus?.remainingAmount || 0))
							}}
						</span>
						<span
							v-if="budgetDailyGuide"
							:class="[
								'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full leading-snug ml-1 whitespace-nowrap',
								budgetDailyGuide.isOver ?
									'bg-rose-500/10 text-rose-600 animate-pulse'
								:	'bg-emerald-500/10 text-emerald-600',
							]"
							:title="budgetDailyGuide.label"
						>
							{{ budgetDailyGuide.label }}
						</span>
					</div>

					<div
						class="inline-flex items-baseline gap-1 text-xs text-slate-400 font-mono tabular-nums shrink-0"
					>
						<span>上限 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span>
						<span class="text-slate-300">/</span>
						<span
							class="cursor-pointer hover:text-indigo-600 hover:underline transition-colors"
							@click="$emit('drill-down-budget-month')"
							title="点击联动查看当月已计入明细"
						>
							{{ budgetSpentLabel }}
							{{ Number(budgetStatus?.actualExpense || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(
									Math.abs(Number(budgetStatus?.actualExpense || 0)),
								)
							}}
							<span class="text-[10px] ml-0.5 opacity-70">↗</span>
						</span>
					</div>
				</div>

				<!-- 微洞察行：进度条 + 计入分类微标签 -->
				<div class="flex items-center gap-3 min-h-[20px] leading-none">
					<div
						class="budget-progress-wrap w-40 shrink-0"
						:title="`预算使用率: ${budgetStatus?.usagePercent || 0}%`"
					>
						<a-progress
							:percent="
								Math.max(0, Math.min(budgetStatus?.usagePercent || 0, 100))
							"
							:stroke-color="progressStrokeColor"
							:format="() => `${budgetStatus?.usagePercent || 0}%`"
							size="small"
						/>
					</div>

					<div
						class="inline-flex items-center gap-1.5 text-xs min-w-0 overflow-hidden whitespace-nowrap"
						:title="
							budgetStatus?.categoryNames?.length ?
								budgetStatus.categoryNames.join('、')
							:	budgetDirectionLabel
						"
					>
						<span class="text-slate-400 text-xs shrink-0">计入:</span>
						<template v-if="budgetStatus?.categoryNames?.length">
							<span
								v-for="cat in budgetStatus.categoryNames.slice(0, 3)"
								:key="cat"
								class="inline-flex items-center text-[11px] leading-4 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer transition-all duration-150 font-medium"
								@click="$emit('drill-down-category', cat)"
								:title="`点击仅查看本月【${cat}】账目`"
							>
								{{ cat }}
							</span>
							<span
								v-if="budgetStatus.categoryNames.length > 3"
								class="text-[11px] text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0 font-mono"
								@click="
									$emit('drill-down-category', budgetStatus.categoryNames[3])
								"
								:title="`点击仅查看本月【${budgetStatus.categoryNames[3]}】账目`"
							>
								+{{ budgetStatus.categoryNames.length - 3 }}
							</span>
						</template>
						<span
							v-else
							class="text-slate-500 text-xs hover:text-indigo-600 cursor-pointer transition-colors"
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
import type { FinanceSummaryData } from '@/views/selfFinance/financeManager/api';
import type {
	FinanceBudgetStatusVo,
	FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';

defineProps<{
	summaryLoading?: boolean;
	budgetLoading?: boolean;
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
	budgetDailyGuide?: {
		remainingDays: number;
		suggestedDaily: number;
		isOver: boolean;
		label: string;
	} | null;
}>();

defineEmits<{
	(e: 'filter-category', cat: string): void;
	(e: 'open-budget-modal'): void;
	(e: 'drill-down-budget-month'): void;
	(e: 'drill-down-category', cat: string): void;
}>();
</script>

<style lang="scss" scoped>
.overview-section {
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
}

.budget-progress-wrap {
	:deep(.ant-progress) {
		display: flex;
		align-items: center;
		margin: 0;

		.ant-progress-outer {
			flex: 1;
			margin-inline-end: 0;
			padding-inline-end: 0;
		}

		.ant-progress-text {
			width: auto;
			margin-inline-start: 8px;
			flex-shrink: 0;
			text-align: right;
			font-variant-numeric: tabular-nums;
			color: #64748b;
			font-size: 11px;
		}
	}
}
</style>
