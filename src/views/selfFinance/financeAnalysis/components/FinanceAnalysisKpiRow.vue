<template>
	<div class="kpi-grid">
		<!-- 卡片 1: 总资产净值 -->
		<div class="kpi-card card-asset">
			<div class="kpi-card-inner">
				<div class="kpi-header">
					<span class="kpi-title">总资产净值</span>
					<span class="kpi-badge badge-blue">资产全景</span>
				</div>
				<div class="kpi-amount text-blue">
					<span class="currency-symbol">¥</span>{{ formatAmount(sumAmount) }}
				</div>
				<div class="kpi-footer">
					<span :class="['trend-pill', getTrendClass(yoyTrend)]">
						{{ formatTrend(yoyTrend, '同比') }}
					</span>
					<span :class="['trend-pill', getTrendClass(momTrend)]">
						{{ formatTrend(momTrend, '环比') }}
					</span>
				</div>
			</div>
		</div>

		<!-- 卡片 2: 本月总收入 -->
		<div class="kpi-card card-income">
			<div class="kpi-card-inner">
				<div class="kpi-header">
					<span class="kpi-title">本月总收入</span>
					<span class="kpi-badge badge-green">资金流入</span>
				</div>
				<div class="kpi-amount text-green">
					<span class="currency-symbol">¥</span>{{ formatAmount(monthIncomeSum) }}
				</div>
				<div class="kpi-footer">
					<span :class="['trend-pill', getTrendClass(incomeYoyTrend)]">
						{{ formatTrend(incomeYoyTrend, '同比') }}
					</span>
					<span :class="['trend-pill', getTrendClass(incomeMomTrend)]">
						{{ formatTrend(incomeMomTrend, '环比') }}
					</span>
				</div>
			</div>
		</div>

		<!-- 卡片 3: 本月总支出 -->
		<div class="kpi-card card-expense">
			<div class="kpi-card-inner">
				<div class="kpi-header">
					<span class="kpi-title">本月总消费</span>
					<span class="kpi-badge badge-orange">资金流出</span>
				</div>
				<div class="kpi-amount text-orange">
					<span class="currency-symbol">¥</span>{{ formatAmount(monthExpenseSum) }}
				</div>
				<div class="kpi-footer">
					<span :class="['trend-pill', getTrendClass(expenseYoyTrend)]">
						{{ formatTrend(expenseYoyTrend, '同比') }}
					</span>
					<span :class="['trend-pill', getTrendClass(expenseMomTrend)]">
						{{ formatTrend(expenseMomTrend, '环比') }}
					</span>
				</div>
			</div>
		</div>

		<!-- 卡片 4: 本月结余与储蓄率 -->
		<div class="kpi-card card-balance">
			<div class="kpi-card-inner">
				<div class="kpi-header">
					<span class="kpi-title">当月净结余</span>
					<span class="kpi-badge badge-purple">财务结余</span>
				</div>
				<div
					class="kpi-amount"
					:class="(monthBalanceNumber ?? 0) >= 0 ? 'text-purple' : 'text-danger'"
				>
					<span class="currency-symbol">¥</span>{{ formatAmount(monthBalance) }}
				</div>
				<div class="kpi-footer">
					<span class="sub-label">当月储蓄率:</span>
					<span class="savings-rate-tag" :class="savingsRateClass">
						{{ savingsRateText }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	sumAmount?: any;
	yoyTrend?: string;
	momTrend?: string;
	monthIncomeSum?: any;
	incomeYoyTrend?: string;
	incomeMomTrend?: string;
	monthExpenseSum?: any;
	expenseYoyTrend?: string;
	expenseMomTrend?: string;
	monthBalance?: any;
	monthBalanceNumber?: number;
	savingsRateClass?: string;
	savingsRateText?: string;
	formatAmount: (val?: any) => string;
	formatTrend: (trend: string | undefined, defaultPrefix: string) => string;
	getTrendClass: (trend?: string) => string;
}>();
</script>

<style scoped lang="less">
.kpi-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 16px;
}

.kpi-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px 20px;
	border: 1px solid #edf2f7;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.kpi-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;

		.kpi-title {
			font-size: 13px;
			color: #718096;
			font-weight: 500;
		}

		.kpi-badge {
			font-size: 11px;
			padding: 1px 8px;
			border-radius: 9999px;
			font-weight: 600;

			&.badge-blue {
				background: #ebf8ff;
				color: #3182ce;
			}
			&.badge-green {
				background: #f0fff4;
				color: #38a169;
			}
			&.badge-orange {
				background: #fffaf0;
				color: #dd6b20;
			}
			&.badge-purple {
				background: #faf5ff;
				color: #805ad5;
			}
		}
	}

	.kpi-amount {
		font-size: 26px;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 10px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-variant-numeric: tabular-nums;

		.currency-symbol {
			font-size: 16px;
			margin-right: 2px;
			font-weight: 500;
		}

		&.text-blue {
			color: #2b6cb0;
		}
		&.text-green {
			color: #2f855a;
		}
		&.text-orange {
			color: #c05621;
		}
		&.text-purple {
			color: #6b46c1;
		}
		&.text-danger {
			color: #e53e3e;
		}
	}

	.kpi-footer {
		display: flex;
		align-items: center;
		gap: 8px;

		.trend-pill {
			font-size: 11.5px;
			padding: 1px 6px;
			border-radius: 4px;
			font-weight: 500;

			&.trend-up {
				background: #feebc8;
				color: #c05621;
			}
			&.trend-down {
				background: #c6f6d5;
				color: #276749;
			}
			&.trend-flat {
				background: #edf2f7;
				color: #718096;
			}
		}

		.sub-label {
			font-size: 12px;
			color: #a0aec0;
		}

		.savings-rate-tag {
			font-size: 12px;
			font-weight: 700;

			&.text-green {
				color: #38a169;
			}
			&.text-orange {
				color: #dd6b20;
			}
			&.text-danger {
				color: #e53e3e;
			}
		}
	}
}
</style>
