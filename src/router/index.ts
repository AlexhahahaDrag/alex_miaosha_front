import Layout from "@/layout/index.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Order from '@v/order/order/index.vue';
import PmsAttrList from '@v/product/pmsAttr/pmsAttrList.vue';
import PmsBrandList from '@v/product/pmsBrand/pmsBrandList.vue';
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import Seckill from '@v/seckill/seckill/index.vue';
import FinanceManager from '@v/finance/financeManager/index.vue';
import FinanceAnalysis from '@v/finance/financeAnalysis/index.vue';
import Dict from '@v/finance/dict/index.vue';
import UserManager from '@v/user/userManager/index.vue';
import NProgress from 'nprogress';
import { useUserStore } from "@/store/modules/user/user";

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
  {
    path: "/product",
    component: Layout,
    redirect: "/product/pmsAttr/pmsAttrList",
    name: "商品管理",
    meta: { title: "商品管理", icon: "productManager", hiedInMenu: false },
    children: [
      {
        path: "/product/pmsAttr/pmsAttrList",
        name: "商品信息",
        component: PmsAttrList,
        meta: { title: "商品信息", icon: "pmsAttr", hiedInMenu: false },
      },
      {
        path: "/product/pmsBrand/pmsBrandList",
        name: "品牌信息",
        component: PmsBrandList,
        meta: { title: "品牌信息", icon: "pmsBrand", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/orderManager",
    component: Layout,
    redirect: "/orderManager/order",
    name: "订单管理",
    meta: { title: "订单管理", icon: "orderManager", hiedInMenu: false },
    children: [
      {
        path: "/orderManager/order",
        name: "订单信息",
        component: Order,
        meta: { title: "订单信息", icon: "order", hiedInMenu: false },
      },
      {
        path: "/orderManager/order2",
        name: "订单信息2",
        component: Order,
        meta: { title: "订单信息2", icon: "order2", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/promotion",
    component: Layout,
    redirect: "/promotion/seckill",
    name: "促销管理",
    meta: { title: "促销", icon: "promotion", hiedInMenu: false },
    children: [
      {
        path: "/promotion/seckill",
        name: "秒杀活动",
        component: Seckill,
        meta: { title: "秒杀活动", icon: "seckill", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/finance",
    component: Layout,
    redirect: "/finance/financeManager",
    name: "财务管理",
    meta: { title: "财务管理", icon: "financeManager", hiedInMenu: false },
    children: [
      {
        path: "/finance/financeManager",
        name: "财务信息",
        component: FinanceManager,
        meta: { title: "财务信息", icon: "finance", hiedInMenu: false },
      },
      {
        path: "/finance/financeAnalysis",
        name: "财务分析",
        component: FinanceAnalysis,
        meta: { title: "财务分析", icon: "financeAnalysis", hiedInMenu: false },
      },
      {
        path: "/finance/dict",
        name: "字典信息",
        component: Dict,
        meta: { title: "字典信息", icon: "dict", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/user",
    component: Layout,
    redirect: "/user/userManager",
    name: "用户管理",
    meta: { title: "用户管理", icon: "userManager", hiedInMenu: false },
    children: [
      {
        path: "/user/userManager",
        name: "用户管理",
        component: UserManager,
        meta: { title: "用户信息", icon: "user", hiedInMenu: false },
      },
    ],
  },
];
  
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  });
  
  router.beforeEach((to, from, next)  => {
    const userStore = useUserStore();
    NProgress.start(); // start progress bar
    if (to.path=='/login' || userStore.getToken) {
      next();
      console.log('from' + from)
    } else {
      next({ name: 'login' });
    }
  });

  router.afterEach(() => {
    NProgress.done() // finish progress bar
  });

  export default router;