import { h, defineComponent, markRaw } from 'vue';
import { RouterView } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import { canAccessPermission } from '@/utils/permission';

export const ParentLayout = markRaw(
	defineComponent({
		name: 'ParentLayout',
		render() {
			return h(RouterView);
		},
	}),
);

export const modules = import.meta.glob('/src/views/**/**.vue');

/** 根据 permissionCode 判断是否有权限，无 permissionCode 则默认由后端菜单树控制放行 */
export const judgePermission = (
	permissionSet: Set<string>,
	permissionCode: string | undefined,
	superAdmin: boolean,
): boolean => {
	if (superAdmin || !permissionCode) return true;
	return canAccessPermission(permissionSet, permissionCode, superAdmin);
};

export const judgeMenuPermission = (
	item: MenuInfoData,
	permissionSet: Set<string>,
	superAdmin: boolean,
): boolean =>
	judgePermission(permissionSet, item.permissionCode, superAdmin) ||
	!!item.children?.some((child) =>
		judgeMenuPermission(child, permissionSet, superAdmin),
	);

export const resolveRawComponentPath = (component: string): string => {
	if (component.startsWith('/src/')) {
		return component;
	}
	if (component.startsWith('/')) {
		return `/src${component}`;
	}
	return `/src/views/${component}`;
};

/** 根据 MenuInfo 解析对应的 Vue 组件 */
export const getComponent = (item: MenuInfoData) => {
	if (!item.component) {
		return markRaw(modules['/src/views/error-404/index.vue']);
	}
	if (item.component === 'Layout') {
		return ParentLayout;
	}
	const rawPath = resolveRawComponentPath(item.component);

	// Ponytail 向后兼容归一化：将正式环境老数据库中的 /src/views/finance/ 路径无缝映射到现有的 /src/views/selfFinance/，彻底杜绝 404
	const path = rawPath
		.replace('/src/views/finance/financeManager', '/src/views/selfFinance/financeManager')
		.replace('/src/views/finance/financeAnalysis', '/src/views/selfFinance/financeAnalysis')
		.replace('/src/views/finance/accountRecordInfo', '/src/views/selfFinance/accountRecordInfo');

	const comp =
		modules[path] ||
		modules[rawPath] ||
		modules[item.component] ||
		modules['/src/views/error-404/index.vue'];

	return typeof comp === 'object' && comp !== null ? markRaw(comp) : comp;
};

/** 递归将 MenuInfo 转换为 RouteRecordRaw */
export const buildRouteRecord = (
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
				const childRoute = buildRouteRecord(childItem, permissionSet, superAdmin);
				routeInfo.children!.push(childRoute);
				if (childItem.component !== 'Layout' && childRoute.children?.length) {
					const nestedRoutes = childRoute.children.splice(0);
					routeInfo.children!.push(...nestedRoutes);
				}
			}
		});
	}

	return routeInfo;
};
