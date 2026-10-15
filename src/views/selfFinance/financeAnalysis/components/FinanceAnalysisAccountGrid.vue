<template>
	<div class="account-grid">
		<div
			v-for="(config, index) in listConfigs"
			:key="index"
			class="account-card"
		>
			<div class="account-card-header">
				<div class="header-left">
					<span class="account-icon">{{ config.icon }}</span>
					<span class="account-title">{{ config.title }}</span>
				</div>
				<div class="header-right">
					<span class="subtotal-label">小计:</span>
					<span class="subtotal-value">¥{{ formatAmount(config.subtotal) }}</span>
				</div>
			</div>
			<div class="account-list">
				<div
					v-for="(item, itemIndex) in config.list"
					:key="itemIndex"
					class="account-item"
				>
					<span class="item-name">{{ item.typeName }}</span>
					<span
						class="item-value"
						:class="
							Number(item.amount || 0) < 0
								? 'text-danger'
								: config.valueClass
						"
					>
						¥{{ formatAmount(item.amount || 0) }}
					</span>
				</div>
				<div
					v-if="!config.list || config.list.length === 0"
					class="empty-items"
				>
					暂无账户数据
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';

defineProps<{
	listConfigs: Array<{
		icon: string;
		title: string;
		subtotal: number | string;
		list: FinanceManagerData[] | Array<{ typeName?: string; amount?: number | string }>;
		valueClass: string;
	}>;
	formatAmount: (val?: any) => string;
}>();
</script>

<style scoped lang="less">
.account-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 16px;
}

.account-card {
	background: #fff;
	border-radius: 12px;
	border: 1px solid #edf2f7;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	overflow: hidden;

	.account-card-header {
		padding: 12px 16px;
		background: #f8fafc;
		border-bottom: 1px solid #edf2f7;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.header-left {
			display: flex;
			align-items: center;
			gap: 8px;

			.account-icon {
				font-size: 16px;
			}

			.account-title {
				font-weight: 600;
				font-size: 13.5px;
				color: #2d3748;
			}
		}

		.header-right {
			display: flex;
			align-items: center;
			gap: 4px;

			.subtotal-label {
				font-size: 11px;
				color: #a0aec0;
			}

			.subtotal-value {
				font-weight: 700;
				font-size: 13px;
				color: #2d3748;
				font-variant-numeric: tabular-nums;
			}
		}
	}

	.account-list {
		padding: 10px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 180px;
		overflow-y: auto;

		.account-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 12.5px;

			.item-name {
				color: #4a5568;
			}

			.item-value {
				font-weight: 600;
				font-variant-numeric: tabular-nums;

				&.text-blue {
					color: #3182ce;
				}
				&.text-green {
					color: #38a169;
				}
				&.text-orange {
					color: #dd6b20;
				}
				&.text-purple {
					color: #805ad5;
				}
				&.text-danger {
					color: #e53e3e;
				}
			}
		}

		.empty-items {
			font-size: 12px;
			color: #a0aec0;
			text-align: center;
			padding: 12px 0;
		}
	}
}
</style>
