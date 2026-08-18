<template>
	<div class="gift-picker">
		<a-select
			v-model:value="modelValue"
			show-search
			:filter-option="false"
			:options="options"
			:loading="loading"
			:placeholder="placeholder"
			allow-clear
			:data-testid="testId"
			@search="handleSearch"
			@dropdown-visible-change="handleDropdownVisibleChange"
		/>
		<a-button
			v-if="showCreateLink"
			type="link"
			size="small"
			class="gift-picker__link"
			data-testid="gift-event-picker-create"
			@click="goCreateEvent"
		>
			+ 新建事由（跳转事由管理）
		</a-button>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { useGiftRecordOptionsCache } from '@/views/finance/gift/composables/useGiftRecordOptionsCache';
import { getGiftEventDetail, getGiftEventList } from '@/views/finance/gift/api';
import type { GiftEventInfo } from '@/views/finance/gift/config';
import { GIFT_EVENT_PATH } from '@/views/finance/gift/config';

interface PickerOption {
	label: string;
	value: string;
}

const modelValue = defineModel<string | undefined>('modelValue');

const props = withDefaults(
	defineProps<{
		placeholder?: string;
		showCreateLink?: boolean;
		testId?: string;
	}>(),
	{
		placeholder: '搜索事由名称',
		showCreateLink: true,
		testId: 'gift-event-picker',
	},
);

const router = useRouter();
const { eventLabel, loadEventTypeOptions } = useGiftEventTypeOptions();
const { getEvents, isWarmed, warmup } = useGiftRecordOptionsCache();

const loading = ref(false);
const options = ref<PickerOption[]>([]);
const listLoaded = ref(false);

const formatEventOption = (event: GiftEventInfo): PickerOption => {
	const typeLabel = eventLabel(event.eventType);
	const name = event.eventName || '-';
	const label =
		typeLabel && typeLabel !== '-' ? `${name} · ${typeLabel}` : name;
	return {
		value: String(event.id),
		label:
			event.eventTime ? `${label} · ${event.eventTime.slice(0, 10)}` : label,
	};
};

const mergeOptions = (list: GiftEventInfo[]) => {
	const map = new Map<string, PickerOption>();
	options.value.forEach((item) => map.set(item.value, item));
	list.forEach((event) => {
		if (event.id) {
			map.set(String(event.id), formatEventOption(event));
		}
	});
	options.value = Array.from(map.values());
};

const applyCachedEvents = () => {
	if (!isWarmed()) {
		return false;
	}
	mergeOptions(getEvents());
	listLoaded.value = true;
	return true;
};

const fetchEventList = async (keyword?: string) => {
	const trimmedKeyword = keyword?.trim();
	if (!trimmedKeyword && applyCachedEvents()) {
		return;
	}
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftEventList({
			keyword: trimmedKeyword || undefined,
		});
		if (code === '200') {
			mergeOptions(data || []);
			if (!trimmedKeyword) {
				listLoaded.value = true;
			}
		} else {
			message.error(msg || '事由列表加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const ensureSelectedOption = async (eventId?: string) => {
	if (!eventId || options.value.some((item) => item.value === eventId)) {
		return;
	}
	const { code, data } = await getGiftEventDetail(eventId);
	if (code === '200' && data?.id) {
		mergeOptions([data]);
	}
};

const debouncedSearch = debounce((keyword: string) => {
	void fetchEventList(keyword);
}, 300);

const handleSearch = (keyword: string) => {
	debouncedSearch(keyword);
};

const handleDropdownVisibleChange = (open: boolean) => {
	if (!open || listLoaded.value) {
		return;
	}
	void fetchEventList();
};

const goCreateEvent = async () => {
	await router.push({ path: GIFT_EVENT_PATH, query: { open: 'create' } });
};

watch(
	() => modelValue.value,
	(value) => {
		void ensureSelectedOption(value);
	},
	{ immediate: true },
);

onMounted(() => {
	loadEventTypeOptions();
	if (applyCachedEvents()) {
		void ensureSelectedOption(modelValue.value);
		return;
	}
	warmup().then(() => {
		applyCachedEvents();
		void ensureSelectedOption(modelValue.value);
	});
});

onUnmounted(() => {
	debouncedSearch.cancel();
});

defineExpose({
	preload: async () => {
		if (applyCachedEvents()) {
			return;
		}
		await warmup();
		applyCachedEvents();
	},
});
</script>

<style scoped lang="less">
.gift-picker {
	width: 100%;

	:deep(.ant-select) {
		width: 100%;
	}
}

.gift-picker__link {
	padding-left: 0;
}
</style>
