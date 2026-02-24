import Layout from '@/views/layout/index.vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import type { MenuDataItem } from './config';
import NProgress from 'nprogress';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfo } from '@/store/modules/user/typing';

const modules = import.meta.glob([
	'@/views/**/**.vue',
	'!@/views/common/**/**.vue',
	'!@/views/layout/index.vue',
]);

export const routes: MenuDataItem[] = [
	{
		name: 'home',
		path: '/',
		redirect: '/dashboard',
		component: Layout,
		meta: {
			title: '首页',
			hideInMenu: false,
		},
		children: [
			{
				path: '/dashboard',
				component: modules['/src/views/dashboard/index.vue'],
				name: 'dashboard',
				meta: { title: '首页', icon: 'dashboard', hideInMenu: true },
			},
		],
	},
	{
		name: 'login',
		path: '/login',
		meta: {
			title: '登录',
			hideInMenu: true,
		},
		component: modules['/src/views/login/index.vue'],
	},
	{
		name: '404',
		meta: {
			title: '404',
			hideInMenu: true,
		},
		path: '/:catchAll(.*)',
		component: modules['/src/views/error-404/index.vue'],
	},
];

/** 静态路由数量，冻结在模块初始化时，用于区分静态/动态路由 */
const BASE_ROUTE_COUNT = routes.length;

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

let dynamicRouter: RouteRecordRaw[] = [];

// ─── 工具函数（定义在使用之前）─────────────────────────────────────────────────

/** 根据 permissionCode 判断是否有权限 */
const judgePermission = (
	permissionSet: Set<string>,
	permissionCode: string | undefined,
	roleCode: string,
): boolean => {
	if (roleCode === 'super_super') return true;
	if (!permissionCode || !permissionSet.size) return false;
	return permissionSet.has(permissionCode);
};

/** 根据 MenuInfo 解析对应的 Vue 组件 */
const getComponent = (item: MenuInfo) => {
	if (!item.component) {
		return modules['/src/views/common/error/Error404.vue'];
	}
	if (item.component === 'Layout') {
		return Layout;
	}
	return modules[item.component];
};

/** 递归将 MenuInfo 转换为 RouteRecordRaw */
const buildRouteRecord = (
	item: MenuInfo,
	permissionSet: Set<string>,
	roleCode: string,
): RouteRecordRaw => {
	const routeInfo: RouteRecordRaw = {
		path: item.path,
		component: getComponent(item),
		redirect: item.redirect,
		name: item.name,
		meta: {
			title: item.title,
			icon: item.icon,
			hideInMenu: item.hideInMenu !== '0',
			showInHome: item.showInHome === '1',
			permissionCode: item.permissionCode,
		},
		children: [],
	};

	if (item.children?.length) {
		item.children.forEach((childItem: MenuInfo) => {
			if (judgePermission(permissionSet, childItem.permissionCode, roleCode)) {
				routeInfo.children!.push(buildRouteRecord(childItem, permissionSet, roleCode));
			}
		});
	}

	return routeInfo;
};

// ─── 动态路由注册 ──────────────────────────────────────────────────────────────

const addRouter = () => {
	const userStore = useUserStore();
	if (!userStore.getMenuInfo?.length) return;

	const roleInfo = userStore.getRoleInfo;
	const roleCode = roleInfo?.roleCode || '';
	const permissionList = roleInfo?.permissionList || [];

	if (roleCode !== 'super_super' && !permissionList.length) return;

	const permissionSet = new Set<string>(
		permissionList.map((p: any) => p?.permissionCode as string),
	);

	userStore.getMenuInfo.forEach((item: MenuInfo) => {
		if (judgePermission(permissionSet, item.permissionCode, roleCode)) {
			const newRoute = buildRouteRecord(item, permissionSet, roleCode);
			router.addRoute(newRoute);
			dynamicRouter.push(newRoute);
			routes.push(newRoute as MenuDataItem);
		}
	});

	userStore.changeRouteStatus(true);
};

// ─── 导航守卫 ──────────────────────────────────────────────────────────────────

router.beforeEach((to: any, _from, next) => {
	const userStore = useUserStore();
	NProgress.start();

	if (to.path === '/login') {
		next();
	} else if (userStore.getToken) {
		if (!userStore.getRouteStatus || routes.length <= BASE_ROUTE_COUNT) {
			dynamicRouter = [];
			addRouter();
			next({ ...to, replace: true });
		} else {
			next();
		}
	} else {
		next({ name: 'login' });
	}
});

router.afterEach(() => {
	NProgress.done();
});

// ─── 导出 ──────────────────────────────────────────────────────────────────────

/**
 * 清除所有动态路由，退出登录时调用。
 * 使用 splice(BASE_ROUTE_COUNT) 一次性移除全部动态路由，避免逐条遍历。
 */
export const refreshRouter = () => {
	dynamicRouter.forEach((route) => {
		if (route.name) router.removeRoute(route.name);
	});
	dynamicRouter = [];
	// 一次性裁剪 routes 数组，保留静态路由部分
	routes.splice(BASE_ROUTE_COUNT);
	useUserStore().changeRouteStatus(false);
};

export default router;
