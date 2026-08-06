<template>
	<section class="rbac-permission-tree">
		<header class="rbac-permission-tree__toolbar">
			<div>
				<h3 class="rbac-permission-tree__title">{{ title }}</h3>
				<p v-if="description" class="rbac-permission-tree__description">
					{{ description }}
				</p>
			</div>
			<div class="rbac-permission-tree__actions">
				<a-button size="small" @click="emit('select-all')">全选</a-button>
				<a-button size="small" @click="emit('clear')">清空</a-button>
				<a-button size="small" @click="emit('expand-all')">批量展开</a-button>
				<a-button size="small" @click="emit('collapse-all')">批量收起</a-button>
			</div>
		</header>

		<a-alert
			v-if="halfCheckedKeys.length"
			class="rbac-permission-tree__half"
			type="info"
			:message="`当前存在 ${halfCheckedKeys.length} 个半选节点`"
			show-icon
		/>

		<a-tree
			checkable
			:block-node="true"
			:tree-data="treeData"
			:checked-keys="checkedKeys"
			:expanded-keys="expandedKeys"
			@check="handleCheck"
			@expand="handleExpand"
		/>
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
}

withDefaults(defineProps<Props>(), {
	title: '菜单权限树',
	description: '',
	treeData: () => [],
	checkedKeys: () => [],
	expandedKeys: () => [],
	halfCheckedKeys: () => [],
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

<style scoped lang="less">
.rbac-permission-tree {
	padding: 12px;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.rbac-permission-tree__toolbar {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 12px;
}

.rbac-permission-tree__title {
	margin: 0;
	color: #111111;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
}

.rbac-permission-tree__description {
	margin: 2px 0 0;
	color: #737373;
	font-size: 12px;
	line-height: 18px;
}

.rbac-permission-tree__actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 6px;
}

.rbac-permission-tree__half {
	margin-bottom: 10px;
}
</style>
