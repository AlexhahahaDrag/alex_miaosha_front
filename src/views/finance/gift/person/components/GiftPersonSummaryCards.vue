<template>
	<a-spin :spinning="loading">
		<div class="person-summary-grid">
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>关系总数</span>
					<span class="card-icon">👥</span>
				</div>
				<strong>{{ summary.personCount || 0 }} 人</strong>
				<p>常联系关系网络</p>
			</div>
			<div
				class="metric-card"
				:class="
					summary.netAmount && summary.netAmount >= 0
						? 'metric-card-green'
						: 'metric-card-gray'
				"
			>
				<div class="metric-top">
					<span>人情净值</span>
					<span class="card-icon">💰</span>
				</div>
				<div class="metric-value-row">
					<strong v-if="summary.netAmount && summary.netAmount >= 0"
						>+{{ money(summary.netAmount) }}</strong
					>
					<strong v-else>{{ money(summary.netAmount) }}</strong>
					<div class="balance-tag-group">
						<span
							class="tag-pos"
							title="人情余额正值和（收大于送的亲友差额总和）"
							>正: +{{ money(summary.positiveBalanceSum) }}</span
						>
						<span
							class="tag-neg"
							title="人情余额负值和（送大于收的亲友差额总和）"
							>负: -{{ money(summary.negativeBalanceSum) }}</span
						>
					</div>
				</div>
				<p>累计收礼与送礼差值</p>
			</div>
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>人情收礼总值</span>
					<span class="card-icon">📥</span>
				</div>
				<strong>{{ money(summary.totalReceiveAmount) }}</strong>
				<p>累计收到人情礼金</p>
			</div>
			<div class="metric-card metric-card-red">
				<div class="metric-top">
					<span>人情随礼总值</span>
					<span class="card-icon">📤</span>
				</div>
				<strong>{{ money(summary.totalGiveAmount) }}</strong>
				<p>累计送出随礼礼金</p>
			</div>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import type { GiftPersonSummary } from '@/views/finance/gift/config';
import { money } from '@/views/finance/gift/config';

defineProps<{
	summary: GiftPersonSummary;
	loading?: boolean;
}>();
</script>

<style scoped lang="less">
.person-summary-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14px;
	margin-bottom: 16px;
}

.metric-card {
	min-height: 116px;
	padding: 18px;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow:
		0 1px 3px 0 rgba(0, 0, 0, 0.05),
		0 1px 2px -1px rgba(0, 0, 0, 0.05);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.08);
	}

	span {
		color: #475569;
		font-size: 13px;
		font-weight: 600;
	}

	strong {
		display: block;
		margin-top: 18px;
		font-size: 24px;
		line-height: 1;
		font-weight: 800;
		color: #0f172a;
	}

	.metric-value-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		margin-top: 14px;

		strong {
			margin-top: 0;
			display: inline-block;
		}
	}

	.balance-tag-group {
		display: inline-flex;
		flex-direction: column;
		gap: 3px;
		font-size: 11px;
		line-height: 1.2;

		.tag-pos {
			color: #059669;
			background: #ecfdf5;
			border: 1px solid #a7f3d0;
			padding: 1px 8px;
			border-radius: 9999px;
			font-weight: 600;
			white-space: nowrap;
		}

		.tag-neg {
			color: #e11d48;
			background: #fff1f2;
			border: 1px solid #fecdd3;
			padding: 1px 8px;
			border-radius: 9999px;
			font-weight: 600;
			white-space: nowrap;
		}
	}

	p {
		margin: 8px 0 0;
		color: #64748b;
		font-size: 12px;
	}
}

.metric-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.card-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	font-size: 18px;
	transition: all 0.2s ease;
}

.metric-card-blue strong {
	color: #0f172a;
}

.metric-card-blue .card-icon {
	color: #2563eb;
	background: #eff6ff;
	border: 1px solid #dbeafe;
}

.metric-card-green strong {
	color: #0f172a;
}

.metric-card-green .card-icon {
	color: #059669;
	background: #ecfdf5;
	border: 1px solid #a7f3d0;
}

.metric-card-red strong {
	color: #0f172a;
}

.metric-card-red .card-icon {
	color: #e11d48;
	background: #fff1f2;
	border: 1px solid #fecdd3;
}

.metric-card-gold strong {
	color: #0f172a;
}

.metric-card-gold .card-icon {
	color: #d97706;
	background: #fffbeb;
	border: 1px solid #fde68a;
}

.metric-card-gray strong {
	color: #0f172a;
}

.metric-card-gray .card-icon {
	color: #64748b;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
}
</style>
