import Layout from "@/layout/index.vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";
import type { MenuInfo } from "@/store/modules/user/typing";
import Error404 from '@/views/common/error/404.vue';

const modules = import.meta.glob('/src/views/**/**.vue');

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
    component: () => import("@/views/common/error/404.vue")
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
    userStore.menuInfo.forEach((item: MenuInfo) => {
      let newRouter = getChildren(item);
      router.addRoute(newRouter);
      routes.push(newRouter);
    });
    userStore.changeRouteStatus(true);
  }
};

const getChildren = (item: MenuInfo): any => {
  let component = item.component == null ? Error404 :
      ("Layout" === item.component ? Layout :
          modules[item.component]);
  console.log('modules:', item.component, modules[item.component], modules, component)
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
      routeInfo.children?.push(getChildren(childItem));
    });
  }
  return routeInfo;
};

export default router;