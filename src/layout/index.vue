<template>
  <a-layout style="height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo"></div>
      <MyNavbar :routes="routes" :selectedKeys="selectedKeys"></MyNavbar>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <div
          class="navbar"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <MyBreadcrumb class="breadcrumb-container"></MyBreadcrumb>
          <div class="right-menu" style="display: flex; align-items: center">
            <MyRightInfo></MyRightInfo>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content>
        <MyTabs></MyTabs>
        <div
          :style="{
            padding: '4px',
            background: '#fff',
            minHeight: '360px',
            height: 'calc(100% - 60px)',
          }"
        >
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="height: 40px; background-color: #ffffff">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          "
        >
          alex管理后台
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { algorithm } from '@/utils/algorithm';

const router = useRouter();
const routes = computed(() =>
  algorithm.increaseIndexes(router.options.routes as []),
);
let collapsed = ref<boolean>(false);
let selectedKeys = ref<string[]>(['1']);
</script>
<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 10px;
    margin-right: 10px;

    &:focus {
      outline: none;
    }
  }
}
</style>
