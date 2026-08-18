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
		<p v-if="orgScopeHint" class="gift-picker__hint">{{ orgScopeHint }}</p>
		<a-button
			v-if="showCreateLink"
			type="link"
			size="small"
			class="gift-picker__link"
			data-testid="gift-person-picker-create"
			@click="goCreatePerson"
		>
			+ 新建联系人（跳转亲友管理）
		</a-button>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { useGiftOrgScope } from '@/composables/useGiftOrgScope';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
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
		placeholder: '搜索姓名或手机号',
		showCreateLink: true,
		testId: 'gift-person-picker',
	},
);

const router = useRouter();
const { orgScopeHint } = useGiftOrgScope();
const { relationLabel, loadRelationOptions } = useGiftRelationOptions();

const loading = ref(false);
const options = ref<PickerOption[]>([]);

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

const fetchPersonList = async (keyword?: string) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonList({
			keyword: keyword?.trim() || undefined,
			personScope: 'CONTACT',
		});
		if (code === '200') {
			mergeOptions(data || []);
		} else {
			message.error(msg || '亲友列表加载失败');
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
	if (open) {
		void fetchPersonList();
	}
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
	void ensureSelectedOption(modelValue.value);
});

onUnmounted(() => {
	debouncedSearch.cancel();
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

.gift-picker__link {
	padding-left: 0;
}
</style>
