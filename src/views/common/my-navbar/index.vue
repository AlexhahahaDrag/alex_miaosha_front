<template>
	<div class="navbar-info">
		<a-menu
			id="menu"
			mode="inline"
			theme="dark"
			v-model:selectedKeys="curSelectedKeys"
			v-model:openKeys="openKeys"
			@click="onMenuClick"
		>
			<template v-for="item in menuItems" :key="item.key">
				<!-- 一级带子级的菜单项 -->
				<a-sub-menu
					v-if="item.children && item.children.length"
					:key="item.key"
				>
					<template #title>
						<span>{{ item.label }}</span>
					</template>

					<template v-for="sub in item.children" :key="sub.key">
						<!-- 支持嵌套二级子菜单 -->
						<a-sub-menu
							v-if="sub.children && sub.children.length"
							:key="sub.key"
						>
							<template #title>
								<span>{{ sub.label }}</span>
							</template>
							<a-menu-item
								v-for="leaf in sub.children"
								:key="leaf.key"
							>
								{{ leaf.label }}
							</a-menu-item>
						</a-sub-menu>

						<!-- 二级叶子菜单项 -->
						<a-menu-item v-else :key="sub.key">
							{{ sub.label }}
						</a-menu-item>
					</template>
				</a-sub-menu>

				<!-- 一级单菜单项（如首页） -->
				<a-menu-item v-else :key="item.key">
					{{ item.label }}
				</a-menu-item>
			</template>
		</a-menu>
	</div>
</template>

<script setup lang="ts">
import type { MenuDataItem } from '@/router/config';

interface Props {
	routes: MenuDataItem[];
	selectedKeys: string[];
}

export interface CustomNavbarMenuItem {
	key: string;
	label: string;
	path?: string;
	children?: CustomNavbarMenuItem[];
}

let curSelectedKeys = ref<string[]>(['home']);

let openKeys = ref<string[]>([]);

const props = withDefaults(defineProps<Props>(), {
	routes: () => [],
});

type MenuMetaWithHide = { hideInMenu?: boolean };

const shouldHideInMenu = (meta?: MenuMetaWithHide) => {
	return meta?.hideInMenu === true;
};

const buildMenuItem = (
	item: MenuDataItem,
	usedKeys: Set<string>,
): CustomNavbarMenuItem | null => {
	const meta = item.meta as unknown as MenuMetaWithHide | undefined;
	if (shouldHideInMenu(meta)) {
		return null;
	}

	const children =
		item.children?.length ?
			item.children
				.map((child) => buildMenuItem(child, usedKeys))
				.filter((i): i is CustomNavbarMenuItem => i !== null)
		:	undefined;

	// 生成稳定、全局唯一的 key：
	// 1) 优先非 "sub" 的 route.name
	// 2) 其次使用 route.path
	// 3) 若仍产生重复，附带唯一索引后缀，彻底避免 Vue Virtual DOM 节点复用与 Context 丢失
	const nameStr = item.name ? String(item.name).trim() : '';
	const pathStr = item.path ? String(item.path).trim() : '';
	let preferredKey =
		nameStr && nameStr !== 'sub' ? nameStr : pathStr || nameStr || 'menu-item';

	if (usedKeys.has(preferredKey)) {
		preferredKey = `${preferredKey}_${usedKeys.size + 1}`;
	}
	usedKeys.add(preferredKey);

	return {
		key: preferredKey,
		label: item.meta?.title || preferredKey,
		path: pathStr,
		...(children && children.length ? { children } : {}),
	};
};

const menuItems = computed<CustomNavbarMenuItem[]>(() => {
	const usedKeys = new Set<string>();
	return (
		props.routes
			?.map((r) => buildMenuItem(r, usedKeys))
			.filter((i): i is CustomNavbarMenuItem => i !== null) || []
	);
});

/** 收集当前菜单树里「带子级」的节点 key，用于与 route.matched 对齐设置 openKeys */
const collectSubmenuKeysFromItems = (
	items: CustomNavbarMenuItem[],
): Set<string> => {
	const keys = new Set<string>();
	const walk = (list: CustomNavbarMenuItem[]) => {
		for (const node of list) {
			const keyStr = node.key ? String(node.key) : '';
			if (node.children?.length) {
				if (keyStr) keys.add(keyStr);
				walk(node.children);
			}
		}
	};
	walk(items);
	return keys;
};

/** 收集菜单树里所有有效节点 key */
const collectAllMenuKeys = (items: CustomNavbarMenuItem[]): Set<string> => {
	const keys = new Set<string>();
	const walk = (list: CustomNavbarMenuItem[]) => {
		for (const node of list) {
			const keyStr = node.key ? String(node.key) : '';
			if (keyStr) keys.add(keyStr);
			if (node.children?.length) {
				walk(node.children);
			}
		}
	};
	walk(items);
	return keys;
};

const router = useRouter();
const route = useRoute();

const onMenuClick = async (info: { key: string | number }) => {
	const key = info?.key;
	if (key === undefined || key === null || key === '') {
		return;
	}
	const targetKey = String(key);
	// 1) 若 key 本身是路径格式（以 / 开头），直接按 path 跳转
	if (targetKey.startsWith('/')) {
		try {
			await router.push(targetKey);
			return;
		} catch {
			// fallback
		}
	}

	// 2) 优先按 route.name 跳转
	try {
		await router.push({ name: targetKey });
	} catch {
		// 3) 兜底按 path 跳转
		await router.push(targetKey);
	}
};

// 根据当前路由同步菜单高亮/展开（openKeys 只包含菜单树中真实存在的「子菜单」key）
const onSyncMenuByRoute = () => {
	const matched = route.matched || [];
	const name: string = (route?.name as string) || '';
	const path: string = route?.path || '';

	let selectedKey = name;
	if (
		name === 'home' ||
		name === 'dashboard' ||
		name === 'homeDashboard' ||
		path === '/' ||
		path === '/home-dashboard'
	) {
		selectedKey = 'home';
	} else {
		const allKeys = collectAllMenuKeys(menuItems.value);
		if (!allKeys.has(name) && !allKeys.has(path)) {
			// 如果当前路由 name/path 不直接在菜单里（如隐藏的详情页），从 matched 中倒序寻找最近的一个在菜单里的祖先
			const hit = [...matched].reverse().find((m) => {
				const hitName = m.name ? String(m.name) : '';
				const hitPath = m.path ? String(m.path) : '';
				return (
					(hitName && allKeys.has(hitName)) || (hitPath && allKeys.has(hitPath))
				);
			});
			if (hit) {
				const hitName = hit.name ? String(hit.name) : '';
				const hitPath = hit.path ? String(hit.path) : '';
				selectedKey =
					hitName && allKeys.has(hitName) ? hitName : hitPath || hitName;
			}
		} else if (!allKeys.has(name) && allKeys.has(path)) {
			selectedKey = path;
		}
	}

	curSelectedKeys.value = selectedKey ? [selectedKey] : ['home'];

	const submenuKeys = collectSubmenuKeysFromItems(menuItems.value);
	const nextOpenKeys: string[] = [];
	for (const rec of matched) {
		const recName = rec.name ? String(rec.name) : '';
		const recPath = rec.path ? String(rec.path) : '';
		if (recName && submenuKeys.has(recName)) {
			nextOpenKeys.push(recName);
		} else if (recPath && submenuKeys.has(recPath)) {
			nextOpenKeys.push(recPath);
		}
	}

	nextTick(() => {
		openKeys.value = nextOpenKeys;
	});
};

watch(
	[() => route.fullPath, () => menuItems.value],
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
