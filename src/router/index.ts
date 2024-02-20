import Layout from "@/layout/index.vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";
import type { MenuInfo } from "@/store/modules/user/typing";

const modules = import.meta.glob("/src/views/**/**.vue");
export const routes: MenuDataItem[] = [
  {
    name: "home",
    path: "/",
    redirect: "/dashboard",
    component: Layout,
    meta: {
      title: "仪表盘",
      hiedInMenu: false,
    },
    children: [
      {
        path: "/dashboard",
        component: modules["/src/views/dashboard/index.vue"],
        name: "dashboard",
        meta: { title: "仪表盘", icon: "dashboard" },
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    component: modules["/src/views/login/index.vue"],
  },
  {
    path: '/:catchAll(.*)',
    component: modules["/src/views/common/error/Error404.vue"],
  }
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

let dynamicRouter = [] as any[];

router.beforeEach((to: any, _from: any, next) => {
  const userStore = useUserStore();
  NProgress.start();
  if (to.path == '/login') {
    next();
  } else if (userStore.getToken) {
    if (!userStore.getRouteStatus) {
      dynamicRouter = [];
      addRouter();
      next({ ...to, replace: true })
    } else if (routes.length <= 3) {
      dynamicRouter = [];
      addRouter();
      next({ ...to, replace: true })
    } else {
      next();
    }
  } else {
    next({ name: 'login' });
  }
});

router.afterEach(() => {
  NProgress.done()
});

const addRouter = () => {
  const userStore = useUserStore();
  if (userStore.menuInfo?.length) {

    let aa = userStore.getRoleInfo;
    if (!aa?.permissionList?.length) {
      return;
    }
    let permissionMap = {};
    aa.permissionList.forEach((permission: any) => {
      permissionMap[permission.permissionCode] = permission;
    });
    console.log(`permissionMap:`, permissionMap);
    userStore.menuInfo.forEach((item: MenuInfo) => {
      if (judgePermission(permissionMap, item?.permissionCode)) {
        let newRouter = getChildren(item, permissionMap);
        router.addRoute(newRouter);
        dynamicRouter.push(newRouter);
        routes.push(newRouter);
      }
    });
    userStore.changeRouteStatus(true);
  }
};

const judgePermission = (permissionMap: any, permissionCode: string) => {
  if (!permissionMap) {
    return false;
  }
  return permissionMap[permissionCode];
}

const getChildren = (item: MenuInfo, permissionMap: any): any => {
  let component = item.component == null ? modules['Error404'] :
    ("Layout" === item.component ? Layout :
      modules[item.component]);
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
      if (judgePermission(permissionMap, childItem?.permissionCode)) {
        routeInfo.children?.push(getChildren(childItem, permissionMap));
      }
    });
  }
  return routeInfo;
};

export const refreshRouter = () => {
  dynamicRouter.forEach(route => {
    router.removeRoute(route.name);
    let index = routes.findIndex(item => item.name === route.name);
    routes.splice(index);
  });
  dynamicRouter = []; // 清空引用
}

export default router;