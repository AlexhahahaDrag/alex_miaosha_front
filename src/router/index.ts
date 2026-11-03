import Layout from '@/layout/index.vue';
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import { reactive, markRaw, toRaw } from 'vue';
import type { MenuDataItem } from './config';
import NProgress from 'nprogress';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import {
	buildPermissionSet,
	isSuperAdmin,
} from '@/utils/permission';
import { getUserMenusApi } from '@/views/login/api';
import { message } from 'ant-design-vue';
import {
	modules,
	judgeMenuPermission,
	buildRouteRecord,
} from './helper';

export const routes: MenuDataItem[] = reactive([
	{
		name: 'home',
		path: '/',
		redirect: '/home-dashboard',
		component: markRaw(Layout),
		meta: {
			title: '首页',
			icon: 'home',
			hideInMenu: false,
		},
		children: [
			{
				path: '/home-dashboard',
				component: modules['/src/views/home-dashboard/index.vue'],
				name: 'homeDashboard',
				meta: { title: '首页', icon: 'dashboard', hideInMenu: true },
			},
			{
				// RBAC-PC-RELATION-001：独立机构-用户关系配置页，暂未纳入后端菜单树，
				// 通过机构/角色列表页的快捷入口跳转访问，hideInMenu 避免在侧边栏产生重复入口。
				path: '/user/org-user-info',
				component: modules['/src/views/user/orgUserInfo/index.vue'],
				name: 'orgUserInfo',
				meta: { title: '机构-用户关系配置', hideInMenu: true },
			},
			{
				path: '/user/role-user-info',
				component: modules['/src/views/user/roleUserInfo/index.vue'],
				name: 'roleUserInfo',
				meta: { title: '角色-用户关系配置', hideInMenu: true },
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
]);

/** 静态路由数量，冻结在模块初始化时，用于区分静态/动态路由 */
const BASE_ROUTE_COUNT = routes.length;

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

let dynamicRouter: RouteRecordRaw[] = [];

// ─── 动态路由注册 ──────────────────────────────────────────────────────────────

const addRouter = () => {
	const userStore = useUserStore();
	try {
		routes.splice(BASE_ROUTE_COUNT);
		if (userStore.getMenuInfo?.length) {
			const permissionContext = userStore.getPermissionContext;
			const superAdmin = isSuperAdmin(permissionContext || userStore.getRoleInfo);
			const permissionSet = buildPermissionSet(permissionContext);

			const clonedMenus: MenuInfoData[] = structuredClone(toRaw(userStore.getMenuInfo));
			clonedMenus.forEach((item: MenuInfoData) => {
				if (judgeMenuPermission(item, permissionSet, superAdmin)) {
					const newRoute = buildRouteRecord(item, permissionSet, superAdmin);
					router.addRoute('home', newRoute);
					dynamicRouter.push(newRoute);
					routes.push(newRoute as MenuDataItem);
				}
			});
		}

		// 最后动态注入 404 通配路由，确保所有动态路由优先匹配
		const notFoundRoute: RouteRecordRaw = {
			name: '404',
			path: '/:catchAll(.*)',
			meta: {
				title: '404',
				hideInMenu: true,
			},
			component: markRaw(modules['/src/views/error-404/index.vue']),
		};
		router.addRoute(notFoundRoute);
		dynamicRouter.push(notFoundRoute);
	} finally {
		userStore.changeRouteStatus(true);
	}
};

// ─── 导航守卫辅助 ──────────────────────────────────────────────────────────────

const toLogin = (to: RouteLocationNormalized) => ({
	name: 'login',
	query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
});

const loadUserMenus = async (userStore: ReturnType<typeof useUserStore>) => {
	try {
		const { code, data, message: msg } = await getUserMenusApi();
		if (code === '200' && data?.length) {
			userStore.setMenuInfo(data);
			return true;
		}
		message.error(msg || '加载菜单失败，请重新登录');
	} catch (error) {
		console.error('加载用户菜单失败：', error);
		message.error('加载菜单失败，请重新登录');
	}
	userStore.resetAuth();
	return false;
};

// ─── 导航守卫 ──────────────────────────────────────────────────────────────────

router.beforeEach(async (to: RouteLocationNormalized, _from, next) => {
	const userStore = useUserStore();
	NProgress.start();

	// ① 白名单直接放行
	if (to.path === '/login') {
		return next();
	}

	// ② 无 Token 直接去登录
	if (!userStore.getToken) {
		return next(toLogin(to));
	}

	// ③ 动态路由已就绪直接放行
	if (userStore.getRouteStatus && routes.length > BASE_ROUTE_COUNT) {
		return next();
	}

	// ④ 按需获取菜单并装配动态路由
	dynamicRouter = [];
	if (!userStore.getMenuInfo?.length) {
		const success = await loadUserMenus(userStore);
		if (!success) {
			return next(toLogin(to));
		}
	}

	addRouter();
	next({ path: to.fullPath || to.path, query: to.query, hash: to.hash, replace: true });
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
