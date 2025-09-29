<template>
	<template v-for="route in p" :key="route.path">
		<a-sub-menu
			v-if="
				route.children && route.children.length > 0 && !route.meta?.hiedInMenu
			"
			:key="route.name + '-sub'"
			:id="route.name"
		>
			<template #icon>
				<component
					v-if="route?.meta"
					:is="getIconComponent(route?.meta?.icon)"
					class="my-svg"
					:color="currentColor"
					:name="route?.meta?.icon || '#icon-home'"
				/>
			</template>
			<template #title>{{ route?.meta?.title || '未知' }}</template>
			<MyMenu :routes="route.children" />
		</a-sub-menu>

		<!-- 普通菜单项 -->
		<a-menu-item
			v-else-if="!route.meta?.hiedInMenu"
			:key="route.name + '-item'"
			:id="route.name"
		>
			<template #icon>
				<component
					v-if="route.meta"
					:is="getIconComponent(route?.meta?.icon)"
					class="my-svg"
					:color="currentColor"
					:name="route?.meta?.icon || '#icon-home'"
				/>
			</template>
			<!-- <template #title>{{ route?.meta?.title || '未知' }}</template> -->

			<router-link :to="route.path">
				{{ route.meta?.title }}
			</router-link>
		</a-menu-item>
	</template>
</template>

<script setup lang="ts">
import type { MenuDataItem } from '@/router/typing';
import { iconComponentMap } from '@/views/common/config';

interface Props {
	routes: MenuDataItem[];
}

const props = withDefaults(defineProps<Props>(), {
	routes: () => [],
});

const currentColor = ref<string>('#ffffff');
const p = ref<MenuDataItem[]>(props.routes);

// 根据 icon 名称获取对应的组件
const getIconComponent = (iconName?: string) => {
	if (!iconName) {
		console.log(`iconName 为空，使用默认图标`);
		return null;
	}
	const component = iconComponentMap[`menu-${iconName}`];
	if (component) {
		return component;
	} else {
		console.warn(
			`未找到图标组件: ${iconName}，可用的图标:`,
			Object.keys(iconComponentMap),
		);
		return null;
	}
};
</script>

<style lang="less" scoped></style>
