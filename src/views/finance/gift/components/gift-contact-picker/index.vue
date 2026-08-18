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
			data-testid="gift-contact-picker-create"
			@click="goCreatePerson"
		>
			+ 新建外部联系人（跳转亲友管理）
		</a-button>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { useGiftRecordOptionsCache } from '@/views/finance/gift/composables/useGiftRecordOptionsCache';
import {
	getGiftPersonDetail,
	getGiftPersonList,
} from '@/views/finance/gift/api';
import type { GiftPersonInfo } from '@/views/finance/gift/config';
import { GIFT_PERSON_PATH } from '@/views/finance/gift/config';

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
		placeholder: '搜索外部联系人姓名或手机号',
		showCreateLink: true,
		testId: 'gift-contact-picker',
	},
);

const router = useRouter();
const { relationLabel, loadRelationOptions } = useGiftRelationOptions();
const { getContacts, isWarmed, warmup } = useGiftRecordOptionsCache();

const loading = ref(false);
const options = ref<PickerOption[]>([]);
const listLoaded = ref(false);

const formatPersonOption = (person: GiftPersonInfo): PickerOption => {
	const relation = relationLabel(person.relationType);
	const name = person.personName || '-';
	const label = relation && relation !== '-' ? `${name} · ${relation}` : name;
	return {
		value: String(person.id),
		label,
	};
};

const mergeOptions = (list: GiftPersonInfo[]) => {
	const map = new Map<string, PickerOption>();
	options.value.forEach((item) => map.set(item.value, item));
	list.forEach((person) => {
		if (person.id) {
			map.set(String(person.id), formatPersonOption(person));
		}
	});
	options.value = Array.from(map.values());
};

const applyCachedContacts = () => {
	if (!isWarmed()) {
		return false;
	}
	mergeOptions(getContacts());
	listLoaded.value = true;
	return true;
};

const fetchPersonList = async (keyword?: string) => {
	const trimmedKeyword = keyword?.trim();
	if (!trimmedKeyword && applyCachedContacts()) {
		return;
	}
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonList({
			keyword: trimmedKeyword || undefined,
			personScope: 'CONTACT',
		});
		if (code === '200') {
			mergeOptions(data || []);
			if (!trimmedKeyword) {
				listLoaded.value = true;
			}
		} else {
			message.error(msg || '外部联系人加载失败');
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
	void fetchPersonList(keyword);
}, 300);

const handleSearch = (keyword: string) => {
	debouncedSearch(keyword);
};

const handleDropdownVisibleChange = (open: boolean) => {
	if (!open || listLoaded.value) {
		return;
	}
	void fetchPersonList();
};

const goCreatePerson = async () => {
	await router.push({ path: GIFT_PERSON_PATH, query: { open: 'create' } });
};

watch(
	() => modelValue.value,
	(value) => {
		void ensureSelectedOption(value);
	},
	{ immediate: true },
);

onMounted(() => {
	void loadRelationOptions();
	if (applyCachedContacts()) {
		void ensureSelectedOption(modelValue.value);
		return;
	}
	void warmup().then(() => {
		applyCachedContacts();
		void ensureSelectedOption(modelValue.value);
	});
});

onUnmounted(() => {
	debouncedSearch.cancel();
});

defineExpose({
	preload: async () => {
		if (applyCachedContacts()) {
			return;
		}
		await warmup();
		applyCachedContacts();
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
