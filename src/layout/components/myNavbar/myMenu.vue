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
						<component
							:is="getIconComponent(`home`)"
							class="my-svg"
							:color="currentColor"
							:name="route?.meta?.icon || '#icon-home'"
						></component>
					</template>
				</template>
				<router-link :to="route.path">
					{{ route.meta && route.meta.title }}
				</router-link>
			</a-menu-item>
		</template>
		<template v-else-if="route.children && route.children.length > 0">
			<a-sub-menu
				v-if="!route.meta?.hiedInMenu"
				:id="route.name"
				:key="route.name"
				:title="route?.meta?.title"
			>
				<template #icon>
					<template v-if="route?.meta" style="text-align: center">
						<component
							:is="getIconComponent(route?.meta?.icon)"
							class="my-svg"
							:color="currentColor"
							:name="route?.meta?.icon || '#icon-home'"
						></component>
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
						<component
							:is="getIconComponent(route?.meta?.icon)"
							:color="currentColor"
							class="my-svg"
							:name="route?.meta?.icon || '#icon-home'"
						></component>
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
import type { MenuDataItem } from '@/router/typing';
import { iconComponentMap } from '@/views/common/config';

interface Props {
	routes: MenuDataItem[];
}

const currentColor = ref<string>('#ffffff');

const props = withDefaults(defineProps<Props>(), {
	routes: () => [],
});

const p = ref<MenuDataItem[]>(props.routes);

// 根据icon名称获取对应的组件
const getIconComponent = (iconName?: string) => {
	if (!iconName) {
		console.log(`iconName 为空，使用默认图标`);
		return null;
	}
	// 从映射表中获取组件
	const component = iconComponentMap[`menu-${iconName}`];
	if (component) {
		console.log(`找到图标组件: ${iconName}`);
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
