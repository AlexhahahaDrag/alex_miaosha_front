<template>
	<template
		v-for="route in p"
		:key="route.path"
		:item="route"
		:base-path="route.path"
	>
		<template v-if="route?.name === 'home'"
			><a-menu-item
				v-if="!route.meta?.hiedInMenu"
				:id="route.name"
				:key="route.name"
				:item="route"
				:base-path="route.path"
				:title="route?.meta?.title || '未知'"
			>
				<template #title>{{ route?.meta?.title || '未知' }}</template>
				<template #icon>
					<template v-if="route.meta" style="vertical-align: middle">
						1232222222222222222222{{ route.meta }}
						<my-i-menu-financeAnalysis
							:name="route?.meta?.icon || '#icon-home'"
						></my-i-menu-financeAnalysis>
						<my-i-finance
							:name="route?.meta?.icon || '#icon-home'"
						></my-i-finance>
					</template>
				</template>
				<router-link :to="route.path">
					{{ route.meta && route.meta.title }}
				</router-link>
			</a-menu-item>
		</template>
		<template v-else-if="route.children && route.children.length > 0">
			<a-sub-menu
				:key="route.name"
				:id="route.name"
				v-if="!route.meta?.hiedInMenu"
				:title="route?.meta?.title"
			>
				<template #icon>
					<template v-if="route?.meta" style="text-align: center">
						2222222222222222222222222{{ route.meta }}
						<my-i-menu-financeAnalysis
							:name="route?.meta?.icon || '#icon-home'"
						></my-i-menu-financeAnalysis>
						<MySvgIcon
							:name="route?.meta?.icon || '#icon-home'"
							class="svg"
							color="white"
						></MySvgIcon>
					</template>
				</template>
				<template #title>{{ route?.meta?.title || '未知' }}</template>
				<MyMenu :routes="route.children"></MyMenu>
			</a-sub-menu>
		</template>
		<template v-else>
			<a-menu-item
				v-if="!route.meta?.hiedInMenu"
				:id="route.name"
				:key="route.name"
				:item="route"
				:base-path="route.path"
				:title="route?.meta?.title || '未知'"
			>
				<template #title>{{ route?.meta?.title || '未知' }}</template>
				<template #icon>
					<template v-if="route.meta" style="vertical-align: middle">
						3333333333333333333333{{ route.meta }}
						<my-i-menu-financeAnalysis
							:name="route?.meta?.icon || '#icon-home'"
						></my-i-menu-financeAnalysis>
						<MySvgIcon
							:name="route?.meta?.icon || '#icon-home'"
							class="svg"
							color="white"
						></MySvgIcon>
					</template>
				</template>
				<router-link :to="route.path">
					{{ route.meta && route.meta.title }}
				</router-link>
			</a-menu-item>
		</template>
	</template>
</template>
<script setup lang="ts">
import { MenuDataItem } from '@/router/typing';

interface Props {
	routes: MenuDataItem[];
}
const props = withDefaults(defineProps<Props>(), {
	routes: () => [],
});

const p = ref<MenuDataItem[]>(props.routes);
</script>
<style lang="less" scoped>
.svg {
	width: 1em;
	height: 1em;
	font-size: 18px;
	cursor: pointer;
}
</style>
