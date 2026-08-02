<template>
	<section class="rbac-diff">
		<header class="rbac-diff__header">
			<div>
				<h3 class="rbac-diff__title">{{ title }}</h3>
				<p v-if="description" class="rbac-diff__description">
					{{ description }}
				</p>
			</div>
			<span class="rbac-diff__count">共 {{ totalCount }} 项变更</span>
		</header>

		<div class="rbac-diff__grid">
			<div class="rbac-diff__group rbac-diff__group--added">
				<div class="rbac-diff__group-title">[本次新增]</div>
				<div v-if="added.length" class="rbac-diff__tags">
					<a-tag v-for="item in added" :key="item.key" color="green">
						{{ item.label }}
					</a-tag>
				</div>
				<a-empty v-else :image="simpleImage" description="暂无新增" />
			</div>

			<div class="rbac-diff__group rbac-diff__group--removed">
				<div class="rbac-diff__group-title">[本次移除]</div>
				<div v-if="removed.length" class="rbac-diff__tags">
					<a-tag v-for="item in removed" :key="item.key" color="red">
						{{ item.label }}
					</a-tag>
				</div>
				<a-empty v-else :image="simpleImage" description="暂无移除" />
			</div>

			<div class="rbac-diff__group">
				<div class="rbac-diff__group-title">[保持不变]</div>
				<div v-if="unchanged.length" class="rbac-diff__tags">
					<a-tag v-for="item in unchanged" :key="item.key">
						{{ item.label }}
					</a-tag>
				</div>
				<a-empty v-else :image="simpleImage" description="暂无保持项" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Empty } from 'ant-design-vue';
import type { RbacDiffItem } from './types';

interface Props {
	title?: string;
	description?: string;
	added?: RbacDiffItem[];
	removed?: RbacDiffItem[];
	unchanged?: RbacDiffItem[];
}

const props = withDefaults(defineProps<Props>(), {
	title: '变更差异预览',
	description: '',
	added: () => [],
	removed: () => [],
	unchanged: () => [],
});

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
const totalCount = computed(
	() => props.added.length + props.removed.length + props.unchanged.length,
);
</script>

<style scoped lang="less">
.rbac-diff {
	padding: 12px;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.rbac-diff__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 12px;
}

.rbac-diff__title {
	margin: 0;
	color: #111111;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
}

.rbac-diff__description {
	margin: 2px 0 0;
	color: #737373;
	font-size: 12px;
	line-height: 18px;
}

.rbac-diff__count {
	color: #525252;
	font-size: 12px;
	line-height: 20px;
	white-space: nowrap;
}

.rbac-diff__grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 8px;
}

.rbac-diff__group {
	min-height: 112px;
	padding: 10px;
	background: #fafafa;
	border: 1px solid #f3f4f6;
	border-radius: 6px;
}

.rbac-diff__group--added {
	background: #f7fdf9;
}

.rbac-diff__group--removed {
	background: #fff7f7;
}

.rbac-diff__group-title {
	margin-bottom: 8px;
	color: #525252;
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
}

.rbac-diff__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}
</style>
