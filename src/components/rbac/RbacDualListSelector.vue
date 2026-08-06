<template>
	<section class="rbac-dual-list">
		<div class="rbac-dual-list__panel">
			<header class="rbac-dual-list__header">
				<div>
					<h3 class="rbac-dual-list__title">{{ availableTitle }}</h3>
					<p class="rbac-dual-list__count">
						已选 {{ selectedAvailableKeys.length }} / {{ availableItems.length }}
					</p>
				</div>
				<a-input-search
					:value="availableKeyword"
					:placeholder="availablePlaceholder"
					size="small"
					@search="emit('search-available', $event)"
					@change="handleAvailableInput"
				/>
			</header>
			<a-spin :spinning="loading">
				<div class="rbac-dual-list__body">
					<label
						v-for="item in availableItems"
						:key="item.key"
						class="rbac-dual-list__item"
						:class="{ 'rbac-dual-list__item--disabled': item.disabled }"
					>
						<a-checkbox
							:checked="selectedAvailableKeySet.has(item.key)"
							:disabled="item.disabled"
							@change="handleAvailableCheck(item.key, $event)"
						/>
						<span class="rbac-dual-list__item-main">
							<span class="rbac-dual-list__item-title">{{ item.title }}</span>
							<span v-if="item.description" class="rbac-dual-list__item-desc">
								{{ item.description }}
							</span>
						</span>
						<span v-if="item.meta" class="rbac-dual-list__item-meta">
							{{ item.meta }}
						</span>
					</label>
					<a-empty
						v-if="!availableItems.length"
						:image="simpleImage"
						description="暂无可分配数据"
					/>
				</div>
			</a-spin>
		</div>

		<div class="rbac-dual-list__ops">
			<a-button
				type="primary"
				class="rbac-dual-list__primary"
				:disabled="!selectedAvailableKeys.length"
				@click="emit('add')"
			>
				添加
			</a-button>
			<a-button
				:disabled="!selectedAssignedKeys.length"
				@click="emit('remove')"
			>
				移除
			</a-button>
		</div>

		<div class="rbac-dual-list__panel">
			<header class="rbac-dual-list__header">
				<div>
					<h3 class="rbac-dual-list__title">{{ assignedTitle }}</h3>
					<p class="rbac-dual-list__count">
						已选 {{ selectedAssignedKeys.length }} / {{ assignedItems.length }}
					</p>
				</div>
				<a-input-search
					:value="assignedKeyword"
					:placeholder="assignedPlaceholder"
					size="small"
					@search="emit('search-assigned', $event)"
					@change="handleAssignedInput"
				/>
			</header>
			<a-spin :spinning="loading">
				<div class="rbac-dual-list__body">
					<label
						v-for="item in assignedItems"
						:key="item.key"
						class="rbac-dual-list__item"
						:class="{ 'rbac-dual-list__item--disabled': item.disabled }"
					>
						<a-checkbox
							:checked="selectedAssignedKeySet.has(item.key)"
							:disabled="item.disabled"
							@change="handleAssignedCheck(item.key, $event)"
						/>
						<span class="rbac-dual-list__item-main">
							<span class="rbac-dual-list__item-title">{{ item.title }}</span>
							<span v-if="item.description" class="rbac-dual-list__item-desc">
								{{ item.description }}
							</span>
						</span>
						<span v-if="item.meta" class="rbac-dual-list__item-meta">
							{{ item.meta }}
						</span>
					</label>
					<a-empty
						v-if="!assignedItems.length"
						:image="simpleImage"
						description="暂无已分配数据"
					/>
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
	availablePlaceholder: '搜索可分配数据',
	assignedPlaceholder: '搜索已分配数据',
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
const selectedAssignedKeySet = computed(() => new Set(props.selectedAssignedKeys));

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

<style scoped lang="less">
.rbac-dual-list {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 72px minmax(0, 1fr);
	gap: 12px;
	align-items: stretch;
}

.rbac-dual-list__panel {
	min-width: 0;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.rbac-dual-list__header {
	display: grid;
	grid-template-columns: minmax(120px, 1fr) minmax(160px, 220px);
	gap: 10px;
	align-items: center;
	padding: 12px;
	border-bottom: 1px solid #f3f4f6;
}

.rbac-dual-list__title {
	margin: 0;
	color: #111111;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
}

.rbac-dual-list__count {
	margin: 2px 0 0;
	color: #737373;
	font-size: 12px;
	line-height: 18px;
}

.rbac-dual-list__body {
	min-height: 260px;
	max-height: 420px;
	overflow: auto;
	padding: 6px;
}

.rbac-dual-list__item {
	display: flex;
	align-items: center;
	gap: 8px;
	min-height: 40px;
	padding: 7px 8px;
	border-radius: 6px;
	cursor: pointer;
}

.rbac-dual-list__item:hover {
	background: #f9fafb;
}

.rbac-dual-list__item--disabled {
	color: #a3a3a3;
	cursor: not-allowed;
}

.rbac-dual-list__item-main {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-width: 0;
}

.rbac-dual-list__item-title {
	color: #111111;
	font-size: 13px;
	font-weight: 500;
	line-height: 18px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.rbac-dual-list__item-desc {
	color: #737373;
	font-size: 12px;
	line-height: 18px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.rbac-dual-list__item-meta {
	color: #525252;
	font-size: 12px;
	line-height: 18px;
	white-space: nowrap;
}

.rbac-dual-list__ops {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 8px;
}

.rbac-dual-list__primary {
	background: #111111;
	border-color: #111111;
}
</style>
