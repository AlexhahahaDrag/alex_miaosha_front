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
		<p v-if="orgMemberHint" class="gift-picker__hint">{{ orgMemberHint }}</p>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { useGiftOrgScope } from '@/composables/useGiftOrgScope';
import { useGiftRecordOptionsCache } from '@/views/finance/gift/composables/useGiftRecordOptionsCache';
import {
	getGiftOrgMemberOptions,
	getGiftPersonDetail,
} from '@/views/finance/gift/api';
import type { GiftPersonInfo } from '@/views/finance/gift/config';

interface PickerOption {
	label: string;
	value: string;
}

const modelValue = defineModel<string | undefined>('modelValue');

withDefaults(
	defineProps<{
		placeholder?: string;
		testId?: string;
	}>(),
	{
		placeholder: '搜索家庭组成员',
		testId: 'gift-org-member-picker',
	},
);

const { orgMemberHint } = useGiftOrgScope();
const { getOrgMembers, isWarmed, warmup, findSelfPersonId } =
	useGiftRecordOptionsCache();

const loading = ref(false);
const options = ref<PickerOption[]>([]);
const listLoaded = ref(false);

const formatMemberOption = (person: GiftPersonInfo): PickerOption => ({
	value: String(person.id),
	label: person.personName || '家庭成员',
});

const mergeOptions = (list: GiftPersonInfo[]) => {
	const map = new Map<string, PickerOption>();
	options.value.forEach((item) => map.set(item.value, item));
	list.forEach((person) => {
		if (person.id) {
			map.set(String(person.id), formatMemberOption(person));
		}
	});
	options.value = Array.from(map.values());
};

const applyCachedOrgMembers = () => {
	if (!isWarmed()) {
		return false;
	}
	mergeOptions(getOrgMembers());
	listLoaded.value = true;
	return true;
};

const fetchMemberList = async (keyword?: string) => {
	const trimmedKeyword = keyword?.trim();
	if (!trimmedKeyword && applyCachedOrgMembers()) {
		return;
	}
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftOrgMemberOptions(trimmedKeyword || undefined);
		if (code === '200') {
			mergeOptions(data || []);
			if (!trimmedKeyword) {
				listLoaded.value = true;
			}
		} else {
			message.error(msg || '家庭成员加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const ensureSelectedOption = async (personId?: string) => {
	if (!personId || options.value.some((item) => item.value === personId)) {
		return;
	}
	const { code, data } = await getGiftPersonDetail(personId);
	if (code === '200' && data?.id) {
		mergeOptions([data]);
	}
};

const debouncedSearch = debounce((keyword: string) => {
	void fetchMemberList(keyword);
}, 300);

const handleSearch = (keyword: string) => {
	debouncedSearch(keyword);
};

const handleDropdownVisibleChange = (open: boolean) => {
	if (!open || listLoaded.value) {
		return;
	}
	void fetchMemberList();
};

watch(
	() => modelValue.value,
	(value) => {
		void ensureSelectedOption(value);
	},
	{ immediate: true },
);

onMounted(() => {
	if (applyCachedOrgMembers()) {
		void ensureSelectedOption(modelValue.value);
		return;
	}
	void warmup().then(() => {
		applyCachedOrgMembers();
		void ensureSelectedOption(modelValue.value);
	});
});

onUnmounted(() => {
	debouncedSearch.cancel();
});

defineExpose({
	preload: async () => {
		if (applyCachedOrgMembers()) {
			return;
		}
		await warmup();
		applyCachedOrgMembers();
	},
	loadOptions: fetchMemberList,
	findSelfPersonId: async (loginUserId?: string) => {
		if (!loginUserId) {
			return undefined;
		}
		if (!isWarmed()) {
			await warmup();
			applyCachedOrgMembers();
		}
		return findSelfPersonId(loginUserId);
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

.gift-picker__hint {
	margin: 6px 0 0;
	color: #667085;
	font-size: 12px;
}
</style>
