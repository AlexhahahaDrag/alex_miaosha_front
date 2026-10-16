<template>
	<section
		class="rbac-permission-tree p-3.5 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl"
	>
		<header class="flex items-start justify-between gap-3 mb-3">
			<div>
				<h3 class="m-0 text-slate-800 dark:text-slate-100 text-[13px] font-semibold leading-5">
					{{ title }}
				</h3>
				<p
					v-if="description"
					class="mt-0.5 mb-0 text-slate-500 dark:text-slate-400 text-xs leading-relaxed"
				>
					{{ description }}
				</p>
			</div>
			<div class="flex flex-wrap justify-end gap-1.5 shrink-0">
				<a-button
					v-if="!disabled"
					size="small"
					class="text-xs rounded-md"
					@click="emit('select-all')"
				>
					全选
				</a-button>
				<a-button
					v-if="!disabled"
					size="small"
					class="text-xs rounded-md"
					@click="emit('clear')"
				>
					清空
				</a-button>
				<a-button
					size="small"
					class="text-xs rounded-md"
					@click="emit('expand-all')"
				>
					展开
				</a-button>
				<a-button
					size="small"
					class="text-xs rounded-md"
					@click="emit('collapse-all')"
				>
					收起
				</a-button>
			</div>
		</header>

		<a-alert
			v-if="halfCheckedKeys.length"
			class="mb-2.5 rounded-lg"
			type="info"
			:message="`当前存在 ${halfCheckedKeys.length} 个半选节点`"
			show-icon
		/>

		<div class="max-h-[340px] overflow-y-auto pr-1">
			<a-tree
				checkable
				:disabled="disabled"
				:block-node="true"
				:tree-data="treeData"
				:checked-keys="checkedKeys"
				:expanded-keys="expandedKeys"
				class="bg-transparent"
				@check="handleCheck"
				@expand="handleExpand"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { RbacKey, RbacTreeNode } from './types';

interface Props {
	title?: string;
	description?: string;
	treeData?: RbacTreeNode[];
	checkedKeys?: RbacKey[];
	expandedKeys?: RbacKey[];
	halfCheckedKeys?: RbacKey[];
	disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	title: '菜单权限树',
	description: '',
	treeData: () => [],
	checkedKeys: () => [],
	expandedKeys: () => [],
	halfCheckedKeys: () => [],
	disabled: false,
});

const emit = defineEmits<{
	'update:checkedKeys': [keys: RbacKey[]];
	'update:expandedKeys': [keys: RbacKey[]];
	'select-all': [];
	clear: [];
	'expand-all': [];
	'collapse-all': [];
}>();

function normalizeKeys(keys: unknown): RbacKey[] {
	if (Array.isArray(keys)) return keys as RbacKey[];
	if (keys && typeof keys === 'object' && 'checked' in keys) {
		return (keys as { checked: RbacKey[] }).checked;
	}
	return [];
}

function handleCheck(keys: unknown) {
	emit('update:checkedKeys', normalizeKeys(keys));
}

function handleExpand(keys: RbacKey[]) {
	emit('update:expandedKeys', keys);
}
</script>
