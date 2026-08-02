import Layout from '@/views/layout/index.vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import type { MenuDataItem } from './config';
import NProgress from 'nprogress';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin,
} from '@/utils/permission';

const modules = import.meta.glob([
	'@/views/**/**.vue',
	'!@/views/common/**/**.vue',
	'!@/views/layout/index.vue',
]);

export const routes: MenuDataItem[] = [
	{
		name: 'home',
		path: '/',
		redirect: '/home-dashboard',
		component: Layout,
		meta: {
			title: '首页',
			hideInMenu: false,
		},
		children: [
			{
				path: '/home-dashboard',
				component: modules['/src/views/home-dashboard/index.vue'],
				name: 'homeDashboard',
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
	superAdmin: boolean,
): boolean => canAccessPermission(permissionSet, permissionCode, superAdmin);

const judgeMenuPermission = (
	item: MenuInfoData,
	permissionSet: Set<string>,
	superAdmin: boolean,
): boolean =>
	judgePermission(permissionSet, item.permissionCode, superAdmin) ||
	!!item.children?.some((child) =>
		judgeMenuPermission(child, permissionSet, superAdmin),
	);

/** 根据 MenuInfo 解析对应的 Vue 组件 */
const getComponent = (item: MenuInfoData) => {
	if (!item.component) {
		return modules['/src/views/error-404/index.vue'];
	}
	if (item.component === 'Layout') {
		return Layout;
	}
	return modules[item.component];
};

/** 递归将 MenuInfo 转换为 RouteRecordRaw */
const buildRouteRecord = (
	item: MenuInfoData,
	permissionSet: Set<string>,
	superAdmin: boolean,
): RouteRecordRaw => {
	const routeInfo: RouteRecordRaw = {
		path: item.path ?? '',
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
		item.children.forEach((childItem: MenuInfoData) => {
			if (judgeMenuPermission(childItem, permissionSet, superAdmin)) {
				routeInfo.children!.push(
					buildRouteRecord(childItem, permissionSet, superAdmin),
				);
			}
		});
	}

	return routeInfo;
};

// ─── 动态路由注册 ──────────────────────────────────────────────────────────────

const addRouter = async () => {
	const userStore = useUserStore();
	if (!userStore.getMenuInfo?.length) return;

	const permissionContext = userStore.getPermissionContext;
	const superAdmin = isSuperAdmin(permissionContext || userStore.getRoleInfo);
	const permissionSet = buildPermissionSet(permissionContext);

	if (!superAdmin && !permissionSet.size) return;

	userStore.getMenuInfo.forEach((item: MenuInfoData) => {
		if (judgeMenuPermission(item, permissionSet, superAdmin)) {
			const newRoute = buildRouteRecord(item, permissionSet, superAdmin);
			router.addRoute(newRoute);
			dynamicRouter.push(newRoute);
			routes.push(newRoute as MenuDataItem);
		}
	});

	// 添加 404 兜底路由，必须在所有动态路由之后添加
	const catchAllRoute: RouteRecordRaw = {
		name: '404',
		meta: {
			title: '404',
			hideInMenu: true,
		},
		path: '/:catchAll(.*)',
		component: modules['/src/views/error-404/index.vue'],
	};
	router.addRoute(catchAllRoute);
	dynamicRouter.push(catchAllRoute);
	routes.push(catchAllRoute as MenuDataItem);
	userStore.changeRouteStatus(true);
};

// ─── 导航守卫 ──────────────────────────────────────────────────────────────────

router.beforeEach(async (to: any, _from, next) => {
	const userStore = useUserStore();
	NProgress.start();

	if (to.path === '/login') {
		next();
	} else if (userStore.getToken) {
		if (!userStore.getRouteStatus || routes.length <= BASE_ROUTE_COUNT) {
			dynamicRouter = [];
			await addRouter();
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
