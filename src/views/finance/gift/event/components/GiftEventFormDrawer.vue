<template>
	<a-drawer
		v-model:open="open"
		:title="formInfo.id ? '编辑人情事件' : '新增人情事件'"
		width="480"
		destroy-on-close
	>
		<a-form :model="formInfo" layout="vertical">
			<a-form-item label="事件名称" required>
				<a-input
					v-model:value="formInfo.eventName"
					placeholder="例如：张三婚礼"
				/>
			</a-form-item>
			<a-form-item label="事件分类" required>
				<a-select
					v-model:value="formInfo.eventTypeMode"
					:options="eventTypeSelectOptions"
					allow-clear
					placeholder="请选择事件分类"
				/>
			</a-form-item>
			<a-form-item
				v-if="formInfo.eventTypeMode === EVENT_TYPE_CUSTOM"
				label="自定义事件分类"
				required
			>
				<a-input
					v-model:value="formInfo.customEventType"
					placeholder="请输入自定义事件分类"
					allow-clear
					:maxlength="20"
				/>
			</a-form-item>
			<a-form-item label="事件日期">
				<a-date-picker
					v-model:value="formInfo.eventTime"
					value-format="YYYY-MM-DD"
					style="width: 100%"
					placeholder="请选择举办日期"
				/>
			</a-form-item>
			<a-form-item
				label="关联亲友"
				extra="该事件的主办人、主角或主要关联亲友（如新人、寿星等）"
			>
				<gift-person-picker
					v-model="formInfo.hostPersonId"
					placeholder="请选择或搜索关联亲友/主办人"
					data-testid="gift-event-host-person-picker"
				/>
			</a-form-item>
			<a-form-item label="备注">
				<a-textarea
					v-model:value="formInfo.remark"
					:rows="3"
					placeholder="例如：地址/参与成员说明"
				/>
			</a-form-item>
		</a-form>
		<template #footer>
			<a-space>
				<a-button @click="open = false">取消</a-button>
				<a-button type="primary" :loading="saving" @click="handleSave">
					保存
				</a-button>
			</a-space>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { formatDate, formatTime } from '@/utils/dayjs';
import GiftPersonPicker from '@/views/finance/gift/components/gift-person-picker/index.vue';
import { addGiftEvent, updateGiftEvent } from '@/views/finance/gift/api';
import type {
	GiftEventBusinessInfo,
	GiftEventFormState,
	GiftEventInfo,
} from '@/views/finance/gift/config';
import {
	EVENT_TYPE_CUSTOM,
	buildEventTypeForSave,
} from '@/views/finance/gift/config';

const props = defineProps<{
	record?: GiftEventBusinessInfo | null;
}>();

const emit = defineEmits<{
	(e: 'success'): void;
}>();

const open = defineModel<boolean>('open', { default: false });
const saving = ref<boolean>(false);
const formInfo = ref<GiftEventFormState>({});

const { eventTypeSelectOptions, mapEventTypeToFormFields } =
	useGiftEventTypeOptions();

watch(
	() => open.value,
	(val) => {
		if (val) {
			const mapped = props.record ? mapEventTypeToFormFields(props.record) : {};
			if (mapped.eventTime) {
				mapped.eventTime = formatDate(mapped.eventTime);
			}
			formInfo.value = mapped;
		}
	},
	{ immediate: true },
);

const toSavePayload = (): GiftEventInfo => {
	const typePayload = buildEventTypeForSave(formInfo.value);
	const params: Record<string, any> = {
		id: formInfo.value.id || undefined,
		eventName: formInfo.value.eventName?.trim() || undefined,
		eventType: typePayload.eventType || undefined,
		eventTypeOptionId: typePayload.eventTypeOptionId || undefined,
		hostPersonId: formInfo.value.hostPersonId || undefined,
		remark: formInfo.value.remark?.trim() || undefined,
	};
	if (formInfo.value.eventTime) {
		params.eventTime = formatTime(formInfo.value.eventTime);
	}
	return params as GiftEventInfo;
};

const handleSave = async () => {
	if (!formInfo.value.eventName?.trim()) {
		message.warning('请输入事件名称');
		return;
	}
	if (
		formInfo.value.eventTypeMode === EVENT_TYPE_CUSTOM &&
		!formInfo.value.customEventType?.trim()
	) {
		message.warning('请输入自定义事件分类');
		return;
	}
	if (!formInfo.value.eventTypeMode) {
		message.warning('请选择事件分类');
		return;
	}

	saving.value = true;
	try {
		const api = formInfo.value.id ? updateGiftEvent : addGiftEvent;
		const { code, message: msg } = await api(toSavePayload());
		if (code === '200') {
			message.success('保存成功');
			open.value = false;
			emit('success');
		} else {
			message.error(msg || '保存失败');
		}
	} finally {
		saving.value = false;
	}
};
</script>
