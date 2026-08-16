<template>
	<a-modal
		v-model:open="open"
		title="选择人情事件"
		width="500px"
		:destroy-on-close="true"
		@cancel="handleCancel"
	>
		<div class="event-selector-container">
			<!-- 内联创建新事件表单 -->
			<div v-if="showCreateForm" class="create-form-panel">
				<h4 class="panel-title">创建新事件</h4>
				<a-form :model="createForm" layout="vertical" ref="formRef">
					<a-form-item
						label="事件名称"
						name="eventName"
						:rules="[{ required: true, message: '请输入事件名称，如：张三婚礼' }]"
					>
						<a-input v-model:value="createForm.eventName" placeholder="例如：张三婚礼" />
					</a-form-item>
					
					<a-form-item
						label="事件分类"
						name="eventType"
						:rules="[{ required: true, message: '请选择事件分类' }]"
					>
						<a-select
							v-model:value="createForm.eventType"
							placeholder="请选择分类"
							:options="eventTypeSelectOptions"
						/>
					</a-form-item>

					<a-form-item
						label="举行时间"
						name="eventTime"
						:rules="[{ required: true, message: '请选择举行时间' }]"
					>
						<a-date-picker
							v-model:value="createForm.eventTime"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							placeholder="请选择举行日期"
						/>
					</a-form-item>

					<a-form-item label="关联人员" name="hostPersonId">
						<gift-person-picker
							v-model="createForm.hostPersonId"
							placeholder="选择或搜索关联人员（选填）"
						/>
					</a-form-item>
				</a-form>
				<div class="panel-buttons">
					<a-button size="small" @click="showCreateForm = false">返回选择</a-button>
					<a-button size="small" type="primary" :loading="creating" @click="handleCreate">确定创建</a-button>
				</div>
			</div>

			<!-- 事件选择列表 -->
			<div v-else class="selection-panel">
				<a-input-search
					v-model:value="searchKey"
					placeholder="输入事件名称或类型搜索"
					style="margin-bottom: 16px"
					allow-clear
					@search="loadEvents"
				/>

				<a-spin :spinning="loading">
					<div class="events-list-scroll">
						<div v-if="filteredEvents.length > 0" class="events-grid">
							<div
								v-for="item in filteredEvents"
								:key="item.id"
								class="event-item-row"
								:class="{ active: String(selectedId) === String(item.id) }"
								@click="handleSelect(item)"
							>
								<div class="event-icon">📅</div>
								<div class="event-body">
									<div class="event-title">{{ item.eventName }}</div>
									<div class="event-meta">
										<span class="type-tag">{{ item.eventType }}</span>
										<span class="dot">·</span>
										<span class="time-text">{{ formatTime(item.eventTime) }}</span>
									</div>
								</div>
							</div>
						</div>
						<div v-else class="empty-placeholder">
							<p>暂无匹配的人情事件</p>
							<a-button type="link" size="small" @click="openCreatePanel">
								直接创建一个？
							</a-button>
						</div>
					</div>
				</a-spin>
				
				<div class="panel-footer-actions">
					<a-button type="dashed" block @click="openCreatePanel">
						+ 创建新事件
					</a-button>
				</div>
			</div>
		</div>

		<template #footer>
			<div style="display: flex; justify-content: flex-end; gap: 8px;">
				<a-button @click="handleCancel">关闭</a-button>
			</div>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { getGiftEventList, addGiftEvent } from '@/views/finance/gift/api';
import type { GiftEventInfo } from '@/views/finance/gift/config';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import GiftPersonPicker from '@/views/finance/gift/components/gift-person-picker/index.vue';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	selectedId?: string;
}>();

const emit = defineEmits<{
	(e: 'select', item: GiftEventInfo): void;
	(e: 'cancel'): void;
}>();

const { presetOptions, customOptions } = useGiftEventTypeOptions();

const loading = ref(false);
const creating = ref(false);
const showCreateForm = ref(false);
const searchKey = ref('');
const eventsList = ref<GiftEventInfo[]>([]);
const formRef = ref<FormInstance>();

const createForm = ref<GiftEventInfo>({
	eventName: '',
	eventType: undefined,
	eventTime: undefined,
	hostPersonId: undefined,
});

const eventTypeSelectOptions = computed(() => {
	const all = [...presetOptions.value, ...customOptions.value];
	return all.map(opt => ({
		label: `${opt.icon || '💬'} ${opt.name}`,
		value: opt.name,
	}));
});

const filteredEvents = computed(() => {
	const key = searchKey.value.trim().toLowerCase();
	if (!key) return eventsList.value;
	return eventsList.value.filter(
		e =>
			e.eventName?.toLowerCase().includes(key) ||
			e.eventType?.toLowerCase().includes(key)
	);
});

const formatTime = (time?: string) => {
	if (!time) return '-';
	return time.split(' ')[0] || time;
};

const loadEvents = async () => {
	loading.value = true;
	try {
		const { code, data } = await getGiftEventList({});
		if (code === '200' && data) {
			// 按 ID/创建时间降序
			eventsList.value = [...data].sort((a, b) => String(b.id).localeCompare(String(a.id)));
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const openCreatePanel = () => {
	createForm.value = {
		eventName: '',
		eventType: undefined,
		eventTime: undefined,
	};
	showCreateForm.value = true;
};

const handleCreate = async () => {
	if (!formRef.value) return;
	creating.value = true;
	try {
		await formRef.value.validateFields();
		
		let params: Record<string, any> = {
			eventName: createForm.value.eventName?.trim() || undefined,
			eventType: createForm.value.eventType || undefined,
			hostPersonId: createForm.value.hostPersonId || undefined,
		};
		if (createForm.value.eventTime) {
			const timeStr = createForm.value.eventTime;
			params.eventTime =
				timeStr.includes('T') ? timeStr : `${timeStr}T00:00:00`;
		}

		const { code, data, message: msg } = await addGiftEvent(
			params as GiftEventInfo,
		);
		if (code === '200' && data) {
			message.success('创建成功');
			showCreateForm.value = false;
			emit('select', data);
			open.value = false;
		} else {
			message.error(msg || '创建失败');
		}
	} catch (e) {
		// validation failed
	} finally {
		creating.value = false;
	}
};

const handleSelect = (item: GiftEventInfo) => {
	emit('select', item);
	open.value = false;
};

const handleCancel = () => {
	showCreateForm.value = false;
	emit('cancel');
	open.value = false;
};

watch(open, (isOpen) => {
	if (isOpen) {
		showCreateForm.value = false;
		searchKey.value = '';
		void loadEvents();
	}
});
</script>

<style scoped lang="less">
.event-selector-container {
	min-height: 250px;
	max-height: 450px;
	display: flex;
	flex-direction: column;
}

.create-form-panel {
	border: 1px solid #f0f0f0;
	border-radius: 8px;
	padding: 16px;
	background: #fafafa;
	
	.panel-title {
		margin-top: 0;
		margin-bottom: 16px;
		font-weight: 700;
		font-size: 14px;
	}
	
	.panel-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 12px;
	}
}

.events-list-scroll {
	flex: 1;
	overflow-y: auto;
	max-height: 280px;
	margin-bottom: 12px;
	border: 1px solid #f0f0f0;
	border-radius: 6px;
	padding: 6px;
}

.events-grid {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.event-item-row {
	display: flex;
	align-items: center;
	padding: 10px 12px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	border: 1px solid transparent;
	
	&:hover {
		background: #f0f7ff;
	}
	
	&.active {
		background: #e6f7ff;
		border-color: #1890ff;
	}
	
	.event-icon {
		font-size: 20px;
		margin-right: 12px;
	}
	
	.event-body {
		flex: 1;
		
		.event-title {
			font-weight: 700;
			color: #262626;
			font-size: 13.5px;
			margin-bottom: 2px;
		}
		
		.event-meta {
			display: flex;
			align-items: center;
			font-size: 12px;
			color: #8c8c8c;
			
			.type-tag {
				background: #f5f5f5;
				padding: 1px 6px;
				border-radius: 3px;
				color: #595959;
			}
			
			.dot {
				margin: 0 6px;
			}
		}
	}
}

.empty-placeholder {
	text-align: center;
	padding: 32px 0;
	color: #999;
	
	p {
		margin: 0 0 8px;
	}
}

.panel-footer-actions {
	margin-top: 4px;
}
</style>
