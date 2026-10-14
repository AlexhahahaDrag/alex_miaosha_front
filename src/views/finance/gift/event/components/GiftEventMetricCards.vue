<template>
	<div class="gift-event-metric-section">
		<div class="metric-grid metric-grid-three">
			<div class="metric-card metric-card-gold">
				<div class="metric-top">
					<span>本月人情活动</span>
					<div class="metric-icon">
						<calendar-outlined />
					</div>
				</div>
				<strong>{{ summary.monthPendingCount || 0 }} 项</strong>
				<p>近期需要跟进的往来活动</p>
			</div>
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>累计礼金收支</span>
					<div class="metric-icon">
						<pay-circle-outlined />
					</div>
				</div>
				<strong>{{ money(summary.totalAmount) }}</strong>
				<p>覆盖全部事件收支记录</p>
			</div>
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>活跃往来对象</span>
					<div class="metric-icon">
						<team-outlined />
					</div>
				</div>
				<strong>{{ summary.activePersonCount || 0 }} 位</strong>
				<p>近期待往来或已往来对象</p>
			</div>
		</div>

		<!-- 高频事件卡片 (Top Category Cards) -->
		<div class="section-title-bar">
			<h3 class="section-title">高频事件场景</h3>
			<span class="section-subtext">自动统计使用频次最高的事由场景，智能辅助随礼梯度</span>
		</div>
		<div class="top-event-cards">
			<div
				v-for="item in topEvents"
				:key="item.id"
				class="top-event-card"
			>
				<span class="card-icon-emoji">{{ item.icon || '💬' }}</span>
				<div class="card-main">
					<div class="card-title-row">
						<strong>{{ item.name }}</strong>
						<a-tag size="small" color="blue" class="category-badge">{{
							item.category
						}}</a-tag>
					</div>
					<div class="card-stats">
						<span class="stat-item"
							>累计使用:
							<strong style="color: #1890ff">{{ item.useCount || 0 }}</strong>
							次</span
						>
						<span
							class="stat-item"
							v-if="item.defaultAmount"
							style="margin-left: 12px"
						>
							建议金额:
							<strong style="color: #52c41a">¥{{ item.defaultAmount }}</strong>
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	CalendarOutlined,
	PayCircleOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';
import type {
	GiftEventSummary,
	GiftEventTypeOptionItem,
} from '@/views/finance/gift/config';
import { money } from '@/views/finance/gift/config';

defineProps<{
	summary: GiftEventSummary;
	topEvents: GiftEventTypeOptionItem[];
}>();
</script>

<style scoped lang="less">
.gift-event-metric-section {
	margin-bottom: 20px;
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.metric-grid-three {
	grid-template-columns: repeat(3, minmax(0, 1fr));
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

	.metric-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.metric-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		font-size: 18px;
		transition: all 0.2s ease;
	}

	strong {
		display: block;
		margin-top: 18px;
		font-size: 24px;
		line-height: 1;
		font-weight: 800;
		color: #0f172a;
	}

	p {
		margin: 8px 0 0;
		color: #64748b;
		font-size: 12px;
	}
}

.metric-card-blue strong {
	color: #0f172a;
}

.metric-card-blue .metric-icon {
	color: #2563eb;
	background: #eff6ff;
	border: 1px solid #dbeafe;
}

.metric-card-green strong {
	color: #0f172a;
}

.metric-card-green .metric-icon {
	color: #059669;
	background: #ecfdf5;
	border: 1px solid #a7f3d0;
}

.metric-card-gold strong {
	color: #0f172a;
}

.metric-card-gold .metric-icon {
	color: #d97706;
	background: #fffbeb;
	border: 1px solid #fde68a;
}

.section-title-bar {
	margin-top: 20px;
	margin-bottom: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.section-title {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
	}

	.section-subtext {
		color: #8c8c8c;
		font-size: 13px;
	}
}

.top-event-cards {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
}

.top-event-card {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	padding: 16px 18px;
	display: flex;
	align-items: center;
	gap: 12px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.08);
	}

	.card-icon-emoji {
		font-size: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: #eff6ff;
		border: 1px solid #dbeafe;
		border-radius: 50%;
	}

	.card-main {
		flex: 1;

		.card-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;

			strong {
				font-size: 14px;
				font-weight: 700;
				color: #0f172a;
			}
		}

		.card-stats {
			font-size: 12px;
			color: #64748b;
		}
	}
}
</style>
