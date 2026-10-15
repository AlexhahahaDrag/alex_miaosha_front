<template>
	<section class="panel panel-secondary ranking-panel">
		<div class="panel-head">
			<h3>往来密切联系人</h3>
		</div>
		<gift-empty-state
			v-if="rankingRows.length === 0"
			title="暂无往来联系人"
			description="添加联系人并记录礼金往来后，这里会展示互动最密切的亲友排行。"
			action-text="去添加联系人 →"
			:to="personPath"
			:icon="TeamOutlined"
		/>
		<div v-else class="ranking-list">
			<div
				v-for="item in rankingRows"
				:key="item.name"
				class="ranking-item"
			>
				<span class="rank-index">{{ item.index }}</span>
				<div class="rank-main">
					<div class="rank-row">
						<span class="rank-name">{{ item.name }}</span>
						<span class="rank-amount">{{ money(item.amount) }}</span>
					</div>
					<div class="rank-track">
						<div
							class="rank-progress"
							:style="{ width: `${item.percent}%` }"
						/>
					</div>
				</div>
			</div>
		</div>
		<a-button
			type="link"
			class="ranking-link"
			data-testid="gift-dashboard-ranking-all"
			@click="$emit('go-person')"
		>
			查看全部排行榜
		</a-button>
	</section>
</template>

<script setup lang="ts">
import { TeamOutlined } from '@ant-design/icons-vue';
import GiftEmptyState from '@/views/finance/gift/gift-dashboard/components/GiftEmptyState.vue';
import { money } from '@/views/finance/gift/config';

defineProps<{
	rankingRows: Array<{
		index: number;
		name: string;
		amount: number;
		percent: number;
	}>;
	personPath: string;
}>();

defineEmits<{
	(e: 'go-person'): void;
}>();
</script>

<style scoped lang="less">
.panel {
	border-radius: 16px;
	padding: 20px;
	background: #fff;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.panel-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}
}

.ranking-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.ranking-item {
	display: flex;
	align-items: center;
	gap: 12px;
}

.rank-index {
	width: 20px;
	font-size: 13px;
	font-weight: 700;
	color: #94a3b8;
	text-align: center;
}

.rank-main {
	flex: 1;
}

.rank-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 6px;
	font-size: 13px;

	.rank-name {
		font-weight: 600;
		color: #1e293b;
	}

	.rank-amount {
		color: #64748b;
	}
}

.rank-track {
	height: 6px;
	background: #f1f5f9;
	border-radius: 9999px;
	overflow: hidden;
}

.rank-progress {
	height: 100%;
	background: #2563eb;
	border-radius: 9999px;
	transition: width 0.3s ease;
}

.ranking-link {
	width: 100%;
	margin-top: 16px;
	text-align: center;
	color: #2563eb;
	font-size: 13px;
	padding: 0;
}
</style>
