<template>
	<a-form-item
		label="礼金金额"
		name="amount"
		:rules="amountRules"
		data-testid="gift-record-form-amount"
	>
		<a-input-number
			v-model:value="amountModel"
			:min="0.01"
			:precision="2"
			style="width: 100%; font-size: 16px; font-weight: bold"
			placeholder="请输入金额"
		>
			<template #prefix>¥</template>
		</a-input-number>

		<!-- 快捷推荐金额 -->
		<div class="quick-amounts" style="margin-top: 8px">
			<a-spin :spinning="recommendLoading" size="small">
				<a-tag
					v-for="amount in (recommendAmountTags?.length
						? recommendAmountTags
						: quickGiftAmounts)"
					:key="amount"
					class="quick-amount-tag"
					data-testid="gift-record-quick-amount-tag"
					:color="amountModel === amount ? 'blue' : 'default'"
					@click="amountModel = amount"
				>
					{{ amount }}
				</a-tag>
			</a-spin>
		</div>

		<!-- AI 推荐考量与场景贺词 -->
		<div
			v-if="recommendInfo?.aiReasoning || recommendInfo?.aiGreetingTip"
			class="ai-recommend-tip-card"
		>
			<div v-if="recommendInfo.aiReasoning" class="ai-reason-row">
				<span class="ai-badge">💡 礼金考量</span>
				<span class="ai-desc">{{ recommendInfo.aiReasoning }}</span>
			</div>
			<div v-if="recommendInfo.aiGreetingTip" class="ai-greeting-row">
				<span class="ai-badge">🎉 场景贺词</span>
				<span class="ai-desc greeting-text">{{
					recommendInfo.aiGreetingTip
				}}</span>
				<a-button
					type="link"
					size="small"
					class="copy-greeting-btn"
					data-testid="gift-record-copy-greeting-btn"
					@click="copyGreetingTip(recommendInfo.aiGreetingTip)"
				>
					复制贺词
				</a-button>
			</div>
		</div>
	</a-form-item>
</template>

<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import {
	type GiftRecordRecommendAmount,
	quickGiftAmounts,
} from '@/views/finance/gift/config';

const amountModel = defineModel<number>('amount');

const props = withDefaults(
	defineProps<{
		amountRules?: Rule[];
		recommendLoading?: boolean;
		recommendAmountTags?: number[];
		recommendInfo?: GiftRecordRecommendAmount;
	}>(),
	{
		amountRules: () => [],
		recommendLoading: false,
		recommendAmountTags: () => [],
		recommendInfo: () => ({}),
	},
);

const copyGreetingTip = async (text?: string) => {
	if (!text) return;
	try {
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
		} else {
			const ta = document.createElement('textarea');
			ta.value = text;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
		}
		message.success('贺词已复制到剪贴板');
	} catch {
		message.error('复制失败，请手动选择复制');
	}
};
</script>

<style scoped lang="less">
.quick-amounts {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.quick-amount-tag {
	cursor: pointer;
}

.ai-recommend-tip-card {
	margin-top: 10px;
	padding: 10px 12px;
	background: #fafafa;
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	display: flex;
	flex-direction: column;
	gap: 6px;

	.ai-reason-row,
	.ai-greeting-row {
		display: flex;
		align-items: flex-start;
		font-size: 12px;
		line-height: 1.6;
		gap: 6px;
	}

	.ai-badge {
		font-weight: 600;
		color: #1890ff;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.ai-desc {
		color: #595959;
		flex: 1;

		&.greeting-text {
			color: #cf1322;
			font-weight: 500;
		}
	}

	.copy-greeting-btn {
		padding: 0 4px;
		height: auto;
		font-size: 12px;
		flex-shrink: 0;
	}
}
</style>
