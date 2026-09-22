<template>
	<div class="gift-metric-card" :class="`gift-metric-card-${tone}`">
		<div class="gift-metric-card__top">
			<span class="gift-metric-card__title">{{ title }}</span>
			<span
				class="gift-metric-card__icon"
				:class="`gift-metric-card__icon-${tone}`"
			>
				<component :is="icon" />
			</span>
		</div>
		<div class="gift-metric-card__body">
			<div class="gift-metric-card__main">
				<div class="gift-metric-card__value">{{ value }}</div>
				<div
					class="gift-metric-card__trend"
					:class="`gift-metric-card__trend-${trendDirection}`"
				>
					<arrow-up-outlined v-if="trendDirection === 'up'" />
					<arrow-down-outlined v-else-if="trendDirection === 'down'" />
					<span>{{ trendText }}</span>
				</div>
				<div v-if="sub" class="gift-metric-card__sub">{{ sub }}</div>
			</div>
			<svg
				v-if="sparklinePoints"
				class="gift-metric-card__sparkline"
				viewBox="0 0 92 36"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<polyline
					:points="sparklinePoints"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import type { TrendDirection } from '@/views/finance/gift/gift-dashboard/utils/metrics';

interface Props {
	title: string;
	value: string;
	tone: 'income' | 'expense' | 'balance' | 'todo';
	icon: Component;
	trendText: string;
	trendDirection?: TrendDirection;
	sparklinePoints?: string;
	sub?: string;
}

withDefaults(defineProps<Props>(), {
	trendDirection: 'none',
	sparklinePoints: '',
	sub: '',
});
</script>

<style scoped lang="less">
.gift-metric-card {
	min-height: 132px;
	padding: 20px 18px 16px;
	background: #fff;
	border: 1px solid #e2e8f0; /* Tailwind border-slate-200 */
	border-radius: 16px; /* Tailwind rounded-2xl */
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
		border-color: #cbd5e1;
	}
}

.gift-metric-card__top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.gift-metric-card__title {
	font-size: 13px;
	font-weight: 500;
	color: #64748b; /* Tailwind slate-500 */
}

.gift-metric-card__icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px; /* Tailwind rounded-xl */
	font-size: 16px;
}

.gift-metric-card__body {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 12px;
	margin-top: 14px;
}

.gift-metric-card__value {
	font-size: 30px;
	font-weight: 800;
	line-height: 1.1;
	letter-spacing: -0.5px;
}

.gift-metric-card__trend {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin-top: 8px;
	font-size: 12px;
	font-weight: 600;
}

.gift-metric-card__trend-up {
	color: #059669; /* Tailwind emerald-600 */
}

.gift-metric-card__trend-down {
	color: #e11d48; /* Tailwind rose-600 */
}

.gift-metric-card__trend-flat,
.gift-metric-card__trend-none {
	color: #94a3b8; /* Tailwind slate-400 */
}

.gift-metric-card__sub {
	margin-top: 6px;
	font-size: 12px;
	color: #64748b; /* Tailwind slate-500 */
}

.gift-metric-card__sparkline {
	width: 92px;
	height: 36px;
	flex-shrink: 0;
	opacity: 0.85;
}

.gift-metric-card-income {
	.gift-metric-card__value {
		color: #059669; /* Tailwind emerald-600 */
	}

	.gift-metric-card__icon-income {
		color: #059669;
		background: #ecfdf5;
		border: 1px solid #a7f3d0;
	}

	.gift-metric-card__sparkline {
		color: #10b981;
	}
}

.gift-metric-card-expense {
	.gift-metric-card__value {
		color: #e11d48; /* Tailwind rose-600 */
	}

	.gift-metric-card__icon-expense {
		color: #e11d48;
		background: #fff1f2;
		border: 1px solid #fecdd3;
	}

	.gift-metric-card__sparkline {
		color: #f43f5e;
	}
}

.gift-metric-card-balance {
	.gift-metric-card__value {
		color: #2563eb; /* Tailwind blue-600 */
	}

	.gift-metric-card__icon-balance {
		color: #2563eb;
		background: #eff6ff;
		border: 1px solid #dbeafe;
	}

	.gift-metric-card__sparkline {
		color: #3b82f6;
	}
}

.gift-metric-card-todo {
	.gift-metric-card__value {
		color: #d97706; /* Tailwind amber-600 */
		font-size: 28px;
	}

	.gift-metric-card__icon-todo {
		color: #d97706;
		background: #fffbeb;
		border: 1px solid #fde68a;
	}

	.gift-metric-card__sparkline {
		color: #f59e0b;
	}
}
</style>
