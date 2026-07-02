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
	border: 1px solid #e5eaf1;
	border-radius: 12px;
	box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.gift-metric-card__top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.gift-metric-card__title {
	font-size: 13px;
	font-weight: 700;
	color: #344054;
}

.gift-metric-card__icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border-radius: 8px;
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
	font-size: 36px;
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: -0.02em;
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
	color: #14803c;
}

.gift-metric-card__trend-down {
	color: #d92d20;
}

.gift-metric-card__trend-flat,
.gift-metric-card__trend-none {
	color: #667085;
}

.gift-metric-card__sub {
	margin-top: 6px;
	font-size: 12px;
	color: #667085;
}

.gift-metric-card__sparkline {
	width: 92px;
	height: 36px;
	flex-shrink: 0;
	opacity: 0.85;
}

.gift-metric-card-income {
	.gift-metric-card__value {
		color: #14803c;
	}

	.gift-metric-card__icon-income {
		color: #168a3a;
		background: #ddf6df;
	}

	.gift-metric-card__sparkline {
		color: #69b66b;
	}
}

.gift-metric-card-expense {
	.gift-metric-card__value {
		color: #d92d20;
	}

	.gift-metric-card__icon-expense {
		color: #d92d20;
		background: #ffe7e7;
	}

	.gift-metric-card__sparkline {
		color: #f97066;
	}
}

.gift-metric-card-balance {
	.gift-metric-card__value {
		color: #1677ff;
	}

	.gift-metric-card__icon-balance {
		color: #1677ff;
		background: #dcecff;
	}

	.gift-metric-card__sparkline {
		color: #4096ff;
	}
}

.gift-metric-card-todo {
	.gift-metric-card__value {
		color: #9a6712;
		font-size: 30px;
	}

	.gift-metric-card__icon-todo {
		color: #9a6712;
		background: #f5ead5;
	}

	.gift-metric-card__sparkline {
		color: #d4a017;
	}
}
</style>
