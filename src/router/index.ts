import Layout from "@/layout/index.vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";
import type { MenuInfo } from "@/store/modules/user/typing";
import Error404 from '@/views/common/error/Error404.vue';

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
        component: Dashboard,
        name: "dashboard",
        meta: { title: "仪表盘", icon: "dashboard" },
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    component: Login,
  },
  {
    path: '/:catchAll(.*)',
    component: () => import("@/views/common/error/Error404.vue")
  }
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to: any, _from: any, next) => {
  const userStore = useUserStore();
  NProgress.start();
  if (to.path == '/login') {
    next();
  } else if (userStore.getToken) {
    if (!userStore.getRouteStatus) {
      addRouter();
      next({ ...to, replace: true })
    } else if (routes.length <= 3) {
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
    console.log(`aaaaaaaaaaaa`, aa, aa.permissionList);
    if (!aa?.permissionList?.length) {
      return;
    }
    userStore.menuInfo.forEach((item: MenuInfo) => {
      if (judgePermission(aa?.permissionList, item?.permissionCode)) {
        let newRouter = getChildren(item, aa.permissionList);
        router.addRoute(newRouter);
        routes.push(newRouter);
      }
    });
    userStore.changeRouteStatus(true);
  }
};

const judgePermission = (permissionList: any[], permissionCode: string) => {
  if (!permissionList?.length) {
    return false;
  }
  for (const item of permissionList) {
    if (item?.permissionCode === permissionCode) {
        return true;
    }
  }
  return false;
}

const getChildren = (item: MenuInfo, permissionList: any[]): any => {
  let component = item.component == null ? Error404 :
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
      showInHome: item.showInHome == '1'
    },
    children: [],
  };
  if (item?.children?.length) {
    item.children.forEach((childItem: any) => {
      if (judgePermission(permissionList, childItem?.permissionCode)) {
        routeInfo.children?.push(getChildren(childItem, permissionList));
      }
    });
  }
  return routeInfo;
};

export default router;