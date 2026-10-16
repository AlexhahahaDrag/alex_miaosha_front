<template>
	<section
		class="p-3.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl"
	>
		<header class="flex items-center justify-between gap-3 mb-2.5">
			<div class="flex items-center gap-2 flex-wrap">
				<span class="w-1.5 h-3.5 rounded-full bg-indigo-600"></span>
				<h3 class="m-0 text-slate-800 dark:text-slate-100 text-[13px] font-bold">
					{{ title }}
				</h3>
				<span
					v-if="description"
					class="text-xs text-slate-400 dark:text-slate-500"
				>
					{{ description }}
				</span>
			</div>
			<div class="flex items-center gap-1.5 text-xs font-mono shrink-0">
				<span
					class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800"
				>
					+{{ added.length }} 新增
				</span>
				<span
					class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800"
				>
					-{{ removed.length }} 移除
				</span>
				<span
					class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
				>
					={{ unchanged.length }} 保持
				</span>
			</div>
		</header>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
			<!-- 本次新增 -->
			<div
				class="min-h-[84px] max-h-[120px] overflow-y-auto p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/60"
			>
				<div
					class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1.5"
				>
					[本次新增] ({{ added.length }})
				</div>
				<div v-if="added.length" class="flex flex-wrap gap-1">
					<span
						v-for="item in added"
						:key="item.key"
						class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
					>
						+ {{ item.label }}
					</span>
				</div>
				<div v-else class="text-xs text-slate-400 dark:text-slate-500 py-2">
					暂无新增成员
				</div>
			</div>

			<!-- 本次移除 -->
			<div
				class="min-h-[84px] max-h-[120px] overflow-y-auto p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-900/60"
			>
				<div
					class="text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1.5"
				>
					[本次移除] ({{ removed.length }})
				</div>
				<div v-if="removed.length" class="flex flex-wrap gap-1">
					<span
						v-for="item in removed"
						:key="item.key"
						class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
					>
						- {{ item.label }}
					</span>
				</div>
				<div v-else class="text-xs text-slate-400 dark:text-slate-500 py-2">
					暂无移除成员
				</div>
			</div>

			<!-- 保持不变 -->
			<div
				class="min-h-[84px] max-h-[120px] overflow-y-auto p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800"
			>
				<div
					class="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5"
				>
					[保持不变] ({{ unchanged.length }})
				</div>
				<div v-if="unchanged.length" class="flex flex-wrap gap-1">
					<span
						v-for="item in unchanged"
						:key="item.key"
						class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
					>
						{{ item.label }}
					</span>
				</div>
				<div v-else class="text-xs text-slate-400 dark:text-slate-500 py-2">
					暂无保持项
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { RbacDiffItem } from './types';

interface Props {
	title?: string;
	description?: string;
	added?: RbacDiffItem[];
	removed?: RbacDiffItem[];
	unchanged?: RbacDiffItem[];
}

withDefaults(defineProps<Props>(), {
	title: '变更差异预览',
	description: '',
	added: () => [],
	removed: () => [],
	unchanged: () => [],
});
</script>
