<template>
	<div class="gift-picker">
		<a-select
			v-model:value="modelValue"
			show-search
			:filter-option="filterOption"
			:options="options"
			:loading="loading"
			:placeholder="placeholder"
			allow-clear
			:data-testid="testId"
			@search="handleSearch"
			@dropdown-visible-change="handleDropdownVisibleChange"
		/>
		<p v-if="showOrgScopeHint && orgScopeHint" class="gift-picker__hint">
			{{ orgScopeHint }}
		</p>
		<a-button
			v-if="showCreateLink"
			type="link"
			size="small"
			class="gift-picker__link"
			data-testid="gift-person-picker-create"
			@click="openCreatePersonModal"
		>
			+ 新建联系人
		</a-button>

		<gift-person-detail
			v-model:model-info="createModelInfo"
			@success="handleCreatedPerson"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { ModelInfo } from '@/views/common/config';
import { useGiftOrgScope } from '@/composables/useGiftOrgScope';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import {
	getGiftPersonDetail,
	getGiftPersonList,
} from '@/views/finance/gift/api';
import type { GiftPersonInfo } from '@/views/finance/gift/config';

interface PickerOption {
	label: string;
	value: string;
}

const modelValue = defineModel<string | undefined>('modelValue');

const props = withDefaults(
	defineProps<{
		placeholder?: string;
		showCreateLink?: boolean;
		showOrgScopeHint?: boolean;
		testId?: string;
		personScope?: 'CONTACT' | 'ORG_MEMBER' | undefined;
	}>(),
	{
		placeholder: '搜索姓名或手机号',
		showCreateLink: true,
		showOrgScopeHint: false,
		testId: 'gift-person-picker',
		personScope: undefined,
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

const filterOption = (input: string, option: any) => {
	const label = option?.label ?? '';
	return String(label).toLowerCase().includes(input.toLowerCase());
};

const setOptions = (list: GiftPersonInfo[], isSearch = false) => {
	const map = new Map<string, PickerOption>();
	if (isSearch) {
		if (modelValue.value) {
			const selected = options.value.find((item) => item.value === modelValue.value);
			if (selected) {
				map.set(selected.value, selected);
			}
		}
	} else {
		options.value.forEach((item) => map.set(item.value, item));
	}
	list.forEach((person) => {
		if (person.id) {
			map.set(String(person.id), formatPersonOption(person));
		}
	});
	options.value = Array.from(map.values());
};

const fetchPersonList = async (keyword?: string) => {
	const trimmedKeyword = keyword?.trim();
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonList({
			keyword: trimmedKeyword || undefined,
			personScope: props.personScope,
		});
		if (code === '200') {
			setOptions(data || [], Boolean(trimmedKeyword));
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
		setOptions([data], false);
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

const createModelInfo = ref<ModelInfo>({
	open: false,
	title: '新建联系人',
	id: undefined,
});

const openCreatePersonModal = () => {
	createModelInfo.value = {
		open: true,
		title: '新建联系人',
		id: undefined,
	};
};

const handleCreatedPerson = async () => {
	await fetchPersonList();
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
