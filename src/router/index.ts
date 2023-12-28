import Layout from "@/layout/index.vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";
import type { Component } from 'vue';
import type { MenuInfo } from "@/store/modules/user/typing";
import Error404 from '@/views/common/error/404.vue';

const modules = import.meta.glob("@/views/**/**.vue");

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
  // {
  //   path: "/product",
  //   component: Layout,
  //   redirect: "/product/pmsAttr/pmsAttrList",
  //   name: "商品管理",
  //   meta: { title: "商品管理", icon: "productManager", hiedInMenu: false },
  //   children: [
  //     {
  //       path: "/product/pmsAttr/pmsAttrList",
  //       name: "商品信息",
  //       component: PmsAttrList,
  //       meta: { title: "商品信息", icon: "pmsAttr", hiedInMenu: false },
  //     },
  //     {
  //       path: "/product/pmsBrand/pmsBrandList",
  //       name: "品牌信息",
  //       component: PmsBrandList,
  //       meta: { title: "品牌信息", icon: "pmsBrand", hiedInMenu: false },
  //     },
  //     {
  //       path: "/product/pmsShopProduct/pmsShopProductList",
  //       name: "网上商品信息",
  //       component: PmsShopProductList,
  //       meta: { title: "网上商品信息", icon: "PmsShopProduct", hiedInMenu: false },
  //     },
  //     {
  //       path: "/product/pmsShopWantProduct/pmsShopWantProductList",
  //       name: "网上想买商品信息",
  //       component: PmsShopWantProductList,
  //       meta: { title: "网上想买商品信息", icon: "PmsShopWantProduct", hiedInMenu: false },
  //     },
  //   ],
  // },
  // {
  //   path: "/orderManager",
  //   component: Layout,
  //   redirect: "/orderManager/order",
  //   name: "订单管理",
  //   meta: { title: "订单管理", icon: "orderManager", hiedInMenu: false },
  //   children: [
  //     {
  //       path: "/orderManager/order",
  //       name: "订单信息",
  //       component: Order,
  //       meta: { title: "订单信息", icon: "order", hiedInMenu: false },
  //     },
  //     {
  //       path: "/orderManager/order2",
  //       name: "订单信息2",
  //       component: Order,
  //       meta: { title: "订单信息2", icon: "order2", hiedInMenu: false },
  //     },
  //   ],
  // },
  // {
  //   path: "/promotion",
  //   component: Layout,
  //   redirect: "/promotion/seckill",
  //   name: "促销管理",
  //   meta: { title: "促销", icon: "promotion", hiedInMenu: false },
  //   children: [
  //     {
  //       path: "/promotion/seckill",
  //       name: "秒杀活动",
  //       component: Seckill,
  //       meta: { title: "秒杀活动", icon: "seckill", hiedInMenu: false },
  //     },
  //   ],
  // },
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to: any, from: any, next) => {
  const userStore = useUserStore();
  NProgress.start();
  if (to.path == '/login') {
    next();
    console.log('from' + from)
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
  let component = item.component == null ? Error404 : ("Layout" === item.component ? Layout : (): Component => import(/* @vite-ignore */ item.component == null ? '' : item.component));
  let routeInfo: RouteRecordRaw = {
    path: item.path,
    component: component,
    redirect: item.redirect,
    name: item.name,
    meta: {
      title: item.title,
      icon: item.icon,
      hiedInMenu: item.hideInMenu == '0' ? false : true,
      showInHome: item.showInHome == '1' ? true : false
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