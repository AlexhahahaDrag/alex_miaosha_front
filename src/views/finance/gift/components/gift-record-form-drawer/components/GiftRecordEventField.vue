<template>
	<a-form-item
		label="人情事件"
		name="eventId"
		:rules="[{ required: true, message: '请选择或关联人情事件' }]"
	>
		<div class="event-selection-row">
			<div class="quick-event-tags">
				<a-tag
					v-for="item in quickEventTags"
					:key="item.id"
					class="quick-event-tag"
					data-testid="gift-record-quick-event-tag"
					:color="isSelectedQuickTag(item) ? 'blue' : 'default'"
					@click="selectQuickTag(item)"
				>
					<span>{{ item.icon }} {{ item.name }}</span>
				</a-tag>
			</div>
			<a-button
				type="link"
				size="small"
				style="padding: 0"
				data-testid="gift-record-event-select-btn"
				@click="eventSelectorOpen = true"
			>
				请选择人情事件 &gt;
			</a-button>
		</div>

		<!-- 选中的事件详细展示卡片 -->
		<div v-if="selectedEventDetail" class="selected-event-card">
			<div class="card-header">
				<span class="card-icon">💍</span>
				<strong class="card-title">{{ selectedEventDetail.eventName }}</strong>
				<a-button
					type="link"
					size="small"
					class="modify-btn"
					@click="eventSelectorOpen = true"
					>修改 &gt;</a-button
				>
			</div>
			<div class="card-body">
				<span class="meta-item"
					>举行时间: {{ formatDate(selectedEventDetail.eventTime) }}</span
				>
				<span class="meta-item" v-if="selectedEventDetail.remark"
					>地点/备注: {{ selectedEventDetail.remark }}</span
				>
			</div>
		</div>

		<!-- 人情事件选择器弹窗 -->
		<gift-event-selector-modal
			v-model:open="eventSelectorOpen"
			:selected-id="eventId"
			@select="handleEventSelect"
		/>
	</a-form-item>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/dayjs';
import type { GiftEventInfo } from '@/views/finance/gift/config';
import GiftEventSelectorModal from '@/views/finance/gift/components/gift-event-selector-modal/index.vue';

const props = withDefaults(
	defineProps<{
		eventId?: string;
		quickEventTags?: Array<{
			id: string;
			name: string;
			eventType?: string;
			eventTime?: string;
			icon: string;
			isEvent: boolean;
		}>;
		selectedEventDetail?: GiftEventInfo | null;
	}>(),
	{
		eventId: '',
		quickEventTags: () => [],
		selectedEventDetail: null,
	},
);

const emit = defineEmits<{
	(e: 'select-tag', item: any): void;
	(e: 'select-event', item: GiftEventInfo): void;
}>();

const eventSelectorOpen = ref<boolean>(false);

const isSelectedQuickTag = (item: any) => {
	return String(props.eventId) === String(item.id);
};

const selectQuickTag = (item: any) => {
	emit('select-tag', item);
};

const handleEventSelect = (item: GiftEventInfo) => {
	emit('select-event', item);
};
</script>

<style scoped lang="less">
.event-selection-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.quick-event-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.quick-event-tag {
	cursor: pointer;
	user-select: none;
	padding: 4px 10px;
	border-radius: 4px;
	font-size: 13px;
	transition: all 0.2s;

	&:hover {
		opacity: 0.85;
	}
}

.selected-event-card {
	border: 1px solid #e8e8e8;
	border-radius: 6px;
	padding: 10px 12px;
	background: #fafafa;
	margin-top: 8px;

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 4px;

		.card-icon {
			font-size: 16px;
			margin-right: 6px;
		}

		.card-title {
			font-size: 13.5px;
			color: #262626;
			flex: 1;
		}

		.modify-btn {
			padding: 0;
			font-size: 12px;
		}
	}

	.card-body {
		font-size: 12px;
		color: #8c8c8c;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
}
</style>
