<template>
	<a-select
		v-model:value="modelValue"
		show-search
		:filter-option="filterOption"
		:options="options"
		:loading="loading"
		placeholder="选择待回礼的收礼记录"
		allow-clear
		data-testid="gift-return-record-picker"
		@dropdown-visible-change="handleDropdownVisibleChange"
		@change="handleChange"
	/>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getGiftRecordPage } from '@/views/finance/gift/api';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import { money } from '@/views/finance/gift/config';

interface PickerOption {
	label: string;
	value: string;
	record?: GiftRecordInfo;
}

const modelValue = defineModel<string | undefined>('modelValue');

const emit = defineEmits<{
	select: [record: GiftRecordInfo | undefined];
}>();

const loading = ref(false);
const options = ref<PickerOption[]>([]);
const recordMap = ref<Map<string, GiftRecordInfo>>(new Map());

const formatRecordOption = (record: GiftRecordInfo): PickerOption => {
	const person =
		record.personName ||
		record.giverPersonName ||
		record.receiverPersonName ||
		'-';
	const event = record.eventName || '未关联事由';
	const amount = money(record.amount);
	const date = record.payTime?.slice(0, 10) || '-';
	return {
		value: String(record.id),
		label: `${person} · ${event} · ${amount} · ${date}`,
		record,
	};
};

const fetchPendingRecords = async () => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftRecordPage(
			{
				direction: 'RECEIVE',
				returnStatus: '0',
			},
			1,
			100,
		);
		if (code === '200') {
			const list = data?.records || [];
			recordMap.value = new Map(
				list.filter((item) => item.id).map((item) => [String(item.id), item]),
			);
			options.value = list
				.filter((item) => item.id)
				.map((item) => formatRecordOption(item));
		} else {
			message.error(msg || '待回礼记录加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const filterOption = (input: string, option?: PickerOption) =>
	(option?.label || '').toLowerCase().includes(input.toLowerCase());

const handleDropdownVisibleChange = (open: boolean) => {
	if (open && !options.value.length) {
		void fetchPendingRecords();
	}
};

const handleChange = (value: string | undefined) => {
	emit('select', value ? recordMap.value.get(value) : undefined);
};

const ensureSelectedOption = async (recordId?: string) => {
	if (!recordId) {
		return;
	}
	if (recordMap.value.has(recordId)) {
		return;
	}
	await fetchPendingRecords();
};

watch(
	() => modelValue.value,
	(value) => {
		void ensureSelectedOption(value);
	},
	{ immediate: true },
);
</script>
