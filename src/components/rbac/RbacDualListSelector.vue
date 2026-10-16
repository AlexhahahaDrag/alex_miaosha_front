<template>
	<section class="grid grid-cols-1 lg:grid-cols-[1fr_84px_1fr] gap-3 items-stretch">
		<!-- 左侧：可分配列表 -->
		<div
			class="min-w-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xs"
		>
			<header
				class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2"
			>
				<div class="flex items-center gap-2">
					<span class="w-1.5 h-3.5 rounded-full bg-slate-400"></span>
					<h3
						class="m-0 text-slate-800 dark:text-slate-100 text-[13px] font-bold"
					>
						{{ availableTitle }}
					</h3>
					<span
						class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
					>
						{{ selectedAvailableKeys.length }} / {{ availableItems.length }}
					</span>
				</div>
				<a-input-search
					:value="availableKeyword"
					:placeholder="availablePlaceholder"
					size="small"
					allow-clear
					class="w-48 rounded-lg"
					@search="emit('search-available', $event)"
					@change="handleAvailableInput"
				/>
			</header>

			<a-spin :spinning="loading">
				<div class="h-[290px] overflow-y-auto p-2 space-y-1">
					<label
						v-for="item in availableItems"
						:key="item.key"
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none"
						:class="[
							item.disabled
								? 'opacity-50 cursor-not-allowed'
								: selectedAvailableKeySet.has(item.key)
									? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/70'
									: 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent',
						]"
					>
						<a-checkbox
							:checked="selectedAvailableKeySet.has(item.key)"
							:disabled="item.disabled"
							@change="handleAvailableCheck(item.key, $event)"
						/>
						<span class="flex-1 min-w-0 flex items-center gap-2">
							<span
								class="font-medium text-slate-800 dark:text-slate-100 text-[13px] truncate"
							>
								{{ item.title }}
							</span>
							<span
								v-if="item.description"
								class="font-mono text-xs text-slate-400 dark:text-slate-500 truncate"
							>
								@{{ item.description }}
							</span>
						</span>
						<span
							v-if="item.meta"
							class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0 max-w-[120px] truncate"
							:title="item.meta"
						>
							{{ item.meta }}
						</span>
					</label>
					<div
						v-if="!availableItems.length"
						class="h-full flex items-center justify-center py-10"
					>
						<a-empty :image="simpleImage" description="暂无可分配用户" />
					</div>
				</div>
			</a-spin>
		</div>

		<!-- 中间：穿梭操作按钮 -->
		<div class="flex lg:flex-col items-center justify-center gap-2 py-1">
			<a-button
				type="primary"
				size="small"
				class="w-full h-8 rounded-lg font-medium shadow-xs"
				:disabled="!selectedAvailableKeys.length"
				@click="emit('add')"
			>
				添加 →
			</a-button>
			<a-button
				danger
				size="small"
				class="w-full h-8 rounded-lg font-medium"
				:disabled="!selectedAssignedKeys.length"
				@click="emit('remove')"
			>
				← 移除
			</a-button>
		</div>

		<!-- 右侧：已分配列表 -->
		<div
			class="min-w-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xs"
		>
			<header
				class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/30 flex flex-wrap items-center justify-between gap-2"
			>
				<div class="flex items-center gap-2">
					<span class="w-1.5 h-3.5 rounded-full bg-blue-600"></span>
					<h3
						class="m-0 text-slate-800 dark:text-slate-100 text-[13px] font-bold"
					>
						{{ assignedTitle }}
					</h3>
					<span
						class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800"
					>
						{{ selectedAssignedKeys.length }} / {{ assignedItems.length }}
					</span>
				</div>
				<a-input-search
					:value="assignedKeyword"
					:placeholder="assignedPlaceholder"
					size="small"
					allow-clear
					class="w-48 rounded-lg"
					@search="emit('search-assigned', $event)"
					@change="handleAssignedInput"
				/>
			</header>

			<a-spin :spinning="loading">
				<div class="h-[290px] overflow-y-auto p-2 space-y-1">
					<label
						v-for="item in assignedItems"
						:key="item.key"
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none"
						:class="[
							item.disabled
								? 'opacity-50 cursor-not-allowed'
								: selectedAssignedKeySet.has(item.key)
									? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/70'
									: 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent',
						]"
					>
						<a-checkbox
							:checked="selectedAssignedKeySet.has(item.key)"
							:disabled="item.disabled"
							@change="handleAssignedCheck(item.key, $event)"
						/>
						<span class="flex-1 min-w-0 flex items-center gap-2">
							<span
								class="font-medium text-slate-800 dark:text-slate-100 text-[13px] truncate"
							>
								{{ item.title }}
							</span>
							<span
								v-if="item.description"
								class="font-mono text-xs text-slate-400 dark:text-slate-500 truncate"
							>
								@{{ item.description }}
							</span>
						</span>
						<span
							v-if="item.meta"
							class="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 shrink-0 max-w-[120px] truncate"
							:title="item.meta"
						>
							{{ item.meta }}
						</span>
					</label>
					<div
						v-if="!assignedItems.length"
						class="h-full flex items-center justify-center py-10"
					>
						<a-empty :image="simpleImage" description="暂无已分配用户" />
					</div>
				</div>
			</a-spin>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Empty } from 'ant-design-vue';
import type { RbacKey, RbacSelectableItem } from './types';

interface Props {
	availableTitle?: string;
	assignedTitle?: string;
	availablePlaceholder?: string;
	assignedPlaceholder?: string;
	availableKeyword?: string;
	assignedKeyword?: string;
	availableItems?: RbacSelectableItem[];
	assignedItems?: RbacSelectableItem[];
	selectedAvailableKeys?: RbacKey[];
	selectedAssignedKeys?: RbacKey[];
	loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	availableTitle: '可分配',
	assignedTitle: '已分配',
	availablePlaceholder: '搜索姓名或账号',
	assignedPlaceholder: '搜索已分配成员',
	availableKeyword: '',
	assignedKeyword: '',
	availableItems: () => [],
	assignedItems: () => [],
	selectedAvailableKeys: () => [],
	selectedAssignedKeys: () => [],
	loading: false,
});

const emit = defineEmits<{
	'update:selectedAvailableKeys': [keys: RbacKey[]];
	'update:selectedAssignedKeys': [keys: RbacKey[]];
	'update:availableKeyword': [value: string];
	'update:assignedKeyword': [value: string];
	'search-available': [value: string];
	'search-assigned': [value: string];
	add: [];
	remove: [];
}>();

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const selectedAvailableKeySet = computed(
	() => new Set(props.selectedAvailableKeys),
);
const selectedAssignedKeySet = computed(
	() => new Set(props.selectedAssignedKeys),
);

function readChecked(event: unknown) {
	return Boolean((event as { target?: { checked?: boolean } }).target?.checked);
}

function nextKeys(keys: RbacKey[], key: RbacKey, checked: boolean) {
	const keySet = new Set(keys);
	if (checked) {
		keySet.add(key);
	} else {
		keySet.delete(key);
	}
	return Array.from(keySet);
}

function readInputValue(event: unknown) {
	return (event as { target?: { value?: string } }).target?.value ?? '';
}

function handleAvailableCheck(key: RbacKey, event: unknown) {
	emit(
		'update:selectedAvailableKeys',
		nextKeys(props.selectedAvailableKeys, key, readChecked(event)),
	);
}

function handleAssignedCheck(key: RbacKey, event: unknown) {
	emit(
		'update:selectedAssignedKeys',
		nextKeys(props.selectedAssignedKeys, key, readChecked(event)),
	);
}

function handleAvailableInput(event: unknown) {
	emit('update:availableKeyword', readInputValue(event));
}

function handleAssignedInput(event: unknown) {
	emit('update:assignedKeyword', readInputValue(event));
}
</script>
