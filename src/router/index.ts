import Layout from '@/layout/index.vue';
import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import { MenuDataItem } from './typing';
import NProgress from 'nprogress';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfo } from '@/store/modules/user/typing';

const modules = import.meta.glob([
  '@/views/**/**.vue',
  '!@/views/common/icons/**.vue',
]);
export const routes: MenuDataItem[] = [
  {
    name: 'home',
    path: '/',
    redirect: '/dashboard',
    component: Layout,
    meta: {
      title: '首页',
      hiedInMenu: false,
    },
    children: [
      {
        path: '/dashboard',
        component: modules['/src/views/dashboard/index.vue'],
        name: 'dashboard',
        meta: { title: '首页', icon: 'dashboard', hiedInMenu: true },
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: modules['/src/views/login/index.vue'],
  },
  {
    path: '/:catchAll(.*)',
    component: modules['/src/views/common/error/Error404.vue'],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

let dynamicRouter = [] as any[];

router.beforeEach((to: any, _from: any, next) => {
  const userStore = useUserStore();
  NProgress.start();
  console.log(`to ooooooooooooooooooooooo`, to, _from, userStore.getToken);
  if (to.path == '/login') {
    next();
  } else if (userStore.getToken) {
    if (!userStore.getRouteStatus || routes.length <= 3) {
      console.log(`2222222222222222222`);
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

const addRouter = () => {
  const userStore = useUserStore();
  if (userStore.getMenuInfo?.length) {
    let roleInfo = userStore.getRoleInfo;
    if (
      roleInfo.roleCode !== 'super_super' &&
      !roleInfo?.permissionList?.length
    ) {
      return;
    }
    userStore.getMenuInfo.forEach((item: MenuInfo) => {
      if (
        judgePermission(
          roleInfo?.permissionList,
          item?.permissionCode,
          roleInfo.roleCode,
        )
      ) {
        let newRouter = getChildren(
          item,
          roleInfo?.permissionList,
          roleInfo.roleCode,
        );
        router.addRoute(newRouter);
        dynamicRouter.push(newRouter);
        routes.push(newRouter);
      }
    });
    userStore.changeRouteStatus(true);
  }
};

const getChildren = (
  item: MenuInfo,
  permissionList: any[],
  roleCode: string,
): any => {
  let component =
    item.component == null ? modules['/src/views/common/error/Error404.vue']
    : 'Layout' === item.component ? Layout
    : modules[item.component];
  let routeInfo: RouteRecordRaw = {
    path: item.path,
    component: component,
    redirect: item.redirect,
    name: item.name,
    meta: {
      title: item.title,
      icon: item.icon,
      hiedInMenu: item.hideInMenu != '0',
      showInHome: item.showInHome == '1',
      permissionCode: item.permissionCode,
    },
    children: [],
  };
  if (item?.children?.length) {
    item.children.forEach((childItem: any) => {
      if (
        judgePermission(permissionList, childItem?.permissionCode, roleCode)
      ) {
        let cur = getChildren(childItem, permissionList, roleCode);
        if (!router.hasRoute(routeInfo?.name || '')) {
          routeInfo.children?.push(cur);
        }
      }
    });
  }
  return routeInfo;
};

const judgePermission = (
  permissionList: any[],
  permissionCode: string,
  roleCode: string,
) => {
  if (roleCode === 'super_super') {
    return true;
  }
  if (!permissionList?.length) {
    return false;
  }
  for (const item of permissionList) {
    if (item?.permissionCode === permissionCode) {
      return true;
    }
  }
  return false;
};

export const refreshRouter = () => {
  dynamicRouter.forEach((route) => {
    router.removeRoute(route.name);
    let index = routes.findIndex((item) => item.name === route.name);
    if (index > -1) {
      routes.splice(index);
    }
  });
  dynamicRouter = []; // 清空引用
};

export default router;
