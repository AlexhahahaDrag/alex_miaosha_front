import Layout from "@/layout/index.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Order from '@v/order/order/index.vue';
import Goods from '@v/goods/goods/index.vue';
import Dashboard from '@v/dashboard/index.vue';
import Login from '@v/login/index.vue';
import Seckill from '@v/seckill/seckill/index.vue';
import NProgress from 'nprogress';

export const routes: MenuDataItem[] = [
  {
    name: "index",
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
    path: "/goods",
    component: Layout,
    redirect: "/goodsManager/goods",
    name: "商品管理",
    meta: { title: "商品管理", icon: "goodsManager", hiedInMenu: false },
    children: [
      {
        path: "/goodsManager/goods",
        name: "商品信息",
        component: Goods,
        meta: { title: "商品信息", icon: "goods", hiedInMenu: false },
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
    name: "促销",
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
];
  
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  });
  
  router.beforeEach(()  => {
    NProgress.start() // start progress bar
  return true
  });

  router.afterEach(() => {
    NProgress.done() // finish progress bar
  });

  export default router;