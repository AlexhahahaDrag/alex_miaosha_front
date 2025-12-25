<template>
	<div class="navbar-info">
		<a-menu
			id="menu"
			mode="inline"
			theme="dark"
			v-model:selectedKeys="curSelectedKeys"
			v-model:openKeys="openKeys"
			:items="menuItems"
			@click="onMenuClick"
		>
		</a-menu>
	</div>
</template>

<script setup lang="ts">
import type { ItemType } from 'ant-design-vue';
import type { MenuDataItem } from '@/router/config';

interface Props {
	routes: MenuDataItem[];
	selectedKeys: string[];
}

let curSelectedKeys = ref<string[]>(['finance']);

let openKeys = ref<string[]>([]);

const props = withDefaults(defineProps<Props>(), {
	routes: () => [],
});

// AI Agent：这里 routes.meta.icon 的类型是 string（见 router/config），但 a-menu items 的 icon 类型是 VNode/渲染函数。
// 为了在不改动路由配置的前提下保持类型正确：此处不把 string 直接塞给 icon。
// 若后续要显示图标：建议新增映射，把 meta.icon(string) -> 真实图标组件/VNode，再赋值给 icon。
type MenuMetaWithHide = { hiedInMenu?: boolean; hideInMenu?: boolean };
const isItemType = (i: ItemType | null): i is ItemType => i !== null;

const shouldHideInMenu = (meta?: MenuMetaWithHide) => {
	// 注意：你们项目路由 meta 字段是 hiedInMenu（历史拼写），这里做兼容。
	return meta?.hiedInMenu === true || meta?.hideInMenu === true;
};

const buildMenuItem = (item: MenuDataItem): ItemType | null => {
	const meta = item.meta as unknown as MenuMetaWithHide | undefined;
	if (shouldHideInMenu(meta)) {
		return null;
	}

	const children =
		item.children?.length ?
			item.children.map(buildMenuItem).filter(isItemType)
		:	undefined;

	return {
		// key 必须稳定且非空：优先用 name，其次用 path（path 必填）
		key: item.name || item.path,
		label: item.meta?.title,
		title: item.meta?.title,
		// icon 暂不透传（string 不符合 ItemType.icon 类型）
		icon: undefined,
		...(children && children.length ? { children } : {}),
	} as ItemType;
};

const menuItems = computed<ItemType[]>(() => {
	// AI Agent：过滤掉 meta.hideInMenu/meta.hiedInMenu 为 true 的菜单项
	return props.routes?.map(buildMenuItem).filter(isItemType) || [];
});

// AI Agent：菜单点击跳转
// 说明：buildMenuItem.key = name || path，所以这里优先按 name 跳转，失败再按 path 兜底。
const router = useRouter();
const route = useRoute();
const onMenuClick = async (info: { key: string | number }) => {
	// ant-design-vue 的 key 类型是 Key（string | number），这里统一转 string 处理
	const key = info?.key;
	if (key === undefined || key === null || key === '') {
		return;
	}
	const targetKey = String(key);
	try {
		// 1) 优先认为 key 是 route.name
		await router.push({ name: targetKey });
	} catch {
		// 2) 兜底认为 key 是 path（如：/finance/xxx）
		await router.push(targetKey);
	}
};

// AI Agent：根据当前路由同步菜单高亮/展开
const onSyncMenuByRoute = () => {
	const matched = route.matched || [];
	const name: string = (route?.name as string) || 'home';
	curSelectedKeys.value = [name === 'dashboard' ? 'home' : name];
	const parent = matched[matched.length - 2];
	openKeys.value = [(parent?.name as string) || '', name].filter(Boolean);
};

onMounted(() => {
	//获取用户信息
	onSyncMenuByRoute();
});

watch(
	() => route.fullPath,
	() => {
		onSyncMenuByRoute();
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.navbar-info {
	max-height: calc(100vh - 50px);
	overflow-y: auto;
}

/* 自定义滚动条样式 */
.navbar-info::-webkit-scrollbar {
	display: none;
	/* 设置滚动条的宽度 */
}

.navbar-info::-webkit-scrollbar-track {
	background: #f1f1f1;
	/* 滚动条轨道的颜色 */
	border-radius: 10px;
	/* 圆角 */
}

.navbar-info::-webkit-scrollbar-thumb {
	background-color: #888;
	/* 滚动条的颜色 */
	border-radius: 10px;
	/* 圆角 */
	border: 2px solid #f1f1f1;
	/* 滚动条的边框 */
}

.navbar-info::-webkit-scrollbar-thumb:hover {
	background: #555;
	/* 鼠标悬停时的滚动条颜色 */
}

/* 可以设置滚动条的阴影 */
::-webkit-scrollbar-thumb:active {
	background: #333;
	/* 鼠标点击时的颜色 */
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	/* 滚动条的阴影效果 */
}
</style>
