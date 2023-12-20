import Layout from "@/layout/index.vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Order from '@v/order/order/index.vue';
import PmsAttrList from '@v/product/pmsAttr/pmsAttrList.vue';
import PmsBrandList from '@v/product/pmsBrand/pmsBrandList.vue';
import PmsShopProductList from '@v/product/pmsShopProduct/pmsShopProductList.vue';
import PmsShopWantProductList from '@v/product/pmsShopWantProduct/pmsShopWantProductList.vue';
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import Seckill from '@v/seckill/seckill/index.vue';
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";
import type { Component } from 'vue';
import type { MenuInfo } from "@/store/modules/user/typing";

export const routes: MenuDataItem[] = [
  {
    name: "home",
    path: "/",
    redirect: "/dashboard/welcome",
    component: Layout,
    meta: {
      title: "仪表盘",
      hiedInMenu: false,
    },
    children: [
      {
        path: "/dashboard/welcome",
        component: Dashboard,
        meta: { title: "仪表盘", icon: "dashboard" },
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    component: Login,
  },
  // {
  //   name: "404",
  //   path: "/404",
  //   component: () => import("@v/exception/404.vue"),
  //   meta: {
  //     hiedInMenu: true,
  //   },
  // },
  // {
  //   name: "401",
  //   path: "/401",
  //   component: () => import("@v/exception/401.vue"),
  //   meta: {
  //     title: "401",
  //     hiedInMenu: true,
  //   },
  // },
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
  // {
  //   path: "/finance",
  //   component: Layout,
  //   redirect: "/finance/financeManager",
  //   name: "finance",
  //   meta: { title: "财务管理", icon: "financeManager", hiedInMenu: false },
  //   children: [
  //     {
  //       path: "/finance/financeManager",
  //       name: "financeManager",
  //       component: FinanceManager,
  //       meta: { title: "财务信息", icon: "finance", hiedInMenu: false },
  //     },
  //     {
  //       path: "/finance/financeAnalysis",
  //       name: "financeAnalysis",
  //       component: FinanceAnalysis,
  //       meta: { title: "财务分析", icon: "financeAnalysis", hiedInMenu: false },
  //     },
  //     {
  //       path: "/finance/accountRecordInfo",
  //       name: "accountRecordInfo",
  //       component: AccountRecordInfo,
  //       meta: { title: "账号管理", icon: "accountRecordInfo", hiedInMenu: false },
  //     },
  //     {
  //       path: "/finance/dict",
  //       name: "dict",
  //       component: Dict,
  //       meta: { title: "字典信息", icon: "dict", hiedInMenu: false },
  //     },
  //   ],
  // },
  // {
  //   path: "/user",
  //   component: Layout,
  //   redirect: "/user/userManager",
  //   name: "user",
  //   meta: { title: "用户管理", icon: "userManager", hiedInMenu: false },
  //   children: [
  //     {
  //       path: "/user/userManager",
  //       name: "userManager",
  //       component: UserManager,
  //       meta: { title: "用户信息", icon: "user", hiedInMenu: false },
  //     },
  //     {
  //       path: "/user/orgManager",
  //       name: "orgManager",
  //       component: OrgManager,
  //       meta: { title: "机构管理", icon: "org", hiedInMenu: false },
  //     },
  //     {
  //       path: "/user/menuInfo",
  //       name: "menuInfo",
  //       component: (): Component => import('@/views/user/menuInfo/menuInfoList.vue'),
  //       meta: { title: "菜单管理", icon: "menu", hiedInMenu: false },
  //     },
  //   ],
  // },
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  NProgress.start(); // start progress bar
  if (to.path == '/login') {
    next();
    console.log('from' + from)
  } else if (userStore.getToken) {
    console.log(`token:`, userStore.getToken, userStore.getRouteStatus)
    if (!userStore.getRouteStatus) {
      if (userStore.menuInfo?.length) {
        userStore.menuInfo.forEach((item: MenuInfo) => {
          let newRouter = getChildren(item);
          router.addRoute(newRouter);
          routes.push(newRouter);
          console.log(`router:`, router, newRouter, routes);
        });
      }
      userStore.changeRouteStatus(true);
    }
    next();
  } else {
    next({ name: 'login' });
  }
});

router.afterEach(() => {
  NProgress.done() // finish progress bar
});

const modules = import.meta.glob("@/views/**/**.vue");

const getChildren = (item: MenuInfo): any => {
  console.log(`modules:`, modules);
  let routeInfo: RouteRecordRaw = {
    path: item.path,
    component: "Layout" === item.component ? Layout : (): Component => import(/* @vite-ignore */'../views/' + item.component),
    redirect: item.redirect,
    name: item.name,
    meta: { title: item.title, icon: item.icon, hiedInMenu: item.hideInMenu == '0' ? false : true},
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