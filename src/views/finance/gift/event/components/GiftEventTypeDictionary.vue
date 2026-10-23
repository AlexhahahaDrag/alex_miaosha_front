<template>
	<div class="dictionary-grid">
		<div
			v-for="(groupItems, groupName) in categorizedEventTypes"
			:key="groupName"
			class="dictionary-card"
		>
			<div class="dictionary-card-header">
				<strong>{{ groupName }}</strong>
			</div>
			<div class="dictionary-card-body">
				<div
					v-for="opt in groupItems"
					:key="opt.id"
					class="dictionary-item"
				>
					<div class="item-left">
						<span class="item-icon-emoji">{{ opt.icon || '💬' }}</span>
						<div class="item-info">
							<span
								class="item-name"
								:class="{ 'disabled-text': opt.status === 0 }"
								>{{ opt.name }}</span
							>
							<span class="item-count"
								>使用 {{ opt.useCount || 0 }} 次</span
							>
						</div>
					</div>
					<div class="item-right">
						<span class="item-amount" v-if="opt.defaultAmount">
							¥{{ opt.defaultAmount }}
						</span>
						<span class="item-amount text-muted" v-else>
							暂无推荐金额
						</span>
						<a-space size="small" style="margin-left: 12px">
							<a-button
								type="link"
								size="small"
								style="padding: 0"
								:disabled="loadingOptionId === opt.id"
								@click="$emit('edit', opt)"
							>
								编辑
							</a-button>
							<a-switch
								:checked="opt.status !== 0"
								:loading="loadingOptionId === opt.id"
								:disabled="loadingOptionId === opt.id"
								size="small"
								@change="toggleOptionStatus(opt)"
							/>
						</a-space>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { updateGiftEventTypeOption } from '@/views/finance/gift/api';
import type { GiftEventTypeOptionItem } from '@/views/finance/gift/config';

const props = defineProps<{
	presetOptions: GiftEventTypeOptionItem[];
	customOptions: GiftEventTypeOptionItem[];
}>();

const emit = defineEmits<{
	(e: 'edit', option: GiftEventTypeOptionItem): void;
	(e: 'refresh'): void;
}>();

const loadingOptionId = ref<string | null>(null);

const categorizedEventTypes = computed(() => {
	const groups: Record<string, GiftEventTypeOptionItem[]> = {
		婚庆类: [],
		家庭类: [],
		节日类: [],
		其他: [],
	};
	const all = [...props.presetOptions, ...props.customOptions];
	all.forEach((item) => {
		const cat = item.category || '其他';
		if (!groups[cat]) {
			groups[cat] = [];
		}
		if (!groups[cat].some((x) => x.name === item.name)) {
			groups[cat].push(item);
		}
	});
	return groups;
});

const toggleOptionStatus = async (opt: GiftEventTypeOptionItem) => {
	if (!opt.id || loadingOptionId.value === opt.id) return;
	loadingOptionId.value = opt.id;
	const newStatus = opt.status === 0 ? 1 : 0;
	try {
		const { code, message: msg } = await updateGiftEventTypeOption({
			id: opt.id,
			eventLabel: opt.name,
			status: newStatus,
		});
		if (code === '200') {
			message.success(
				`${newStatus === 1 ? '已启用' : '已停用'}事由【${opt.name}】`,
			);
			emit('refresh');
		} else {
			message.error(msg || '操作失败');
		}
	} catch (error: unknown) {
		message.error('操作失败，请重试');
	} finally {
		loadingOptionId.value = null;
	}
};
</script>

<style scoped lang="less">
.dictionary-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
	padding: 8px 0;
}

.dictionary-card {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	overflow: hidden;

	.dictionary-card-header {
		padding: 10px 16px;
		background: #f1f5f9;
		border-bottom: 1px solid #e2e8f0;

		strong {
			font-size: 14px;
			font-weight: 700;
			color: #1e293b;
		}
	}

	.dictionary-card-body {
		padding: 10px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dictionary-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px dashed #e2e8f0;

		&:last-child {
			border-bottom: none;
		}

		.item-left {
			display: flex;
			align-items: center;
			gap: 10px;

			.item-icon-emoji {
				font-size: 20px;
				width: 32px;
				height: 32px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				background: #fff;
				border-radius: 50%;
				border: 1px solid #e2e8f0;
			}

			.item-info {
				display: flex;
				flex-direction: column;

				.item-name {
					font-weight: 700;
					color: #1e293b;
					font-size: 13px;

					&.disabled-text {
						color: #94a3b8;
						text-decoration: line-through;
					}
				}

				.item-count {
					font-size: 11px;
					color: #64748b;
					margin-top: 2px;
				}
			}
		}

		.item-right {
			display: flex;
			align-items: center;

			.item-amount {
				font-size: 12px;
				color: #059669;
				font-weight: 700;

				&.text-muted {
					color: #94a3b8;
					font-weight: normal;
					font-style: italic;
				}
			}
		}
	}
}
</style>
