<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <Navbar :routes="routes" :selectedKeys="selectedKeys"></Navbar>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" >
      <Breadcrumb></Breadcrumb>
      </a-layout-header>
      <a-layout-content style="margin: 20px 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        alex-miaosha
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { algorithm } from '@/utils/algorithm';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "./components/navbar/index.vue";
import Breadcrumb from "./components/breadcrumb/index.vue";

const router = useRouter().options.routes as [];
const routes = computed(() => algorithm.increaseIndexes(router));
  let collapsed = ref<boolean>(false);
  let selectedKeys = ref<string[]>(['1']);

</script>
<style>
</style>

<!-- <template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider :collapsed="collapsed" collapsible>
      <Navbar :routes="routes" :selectedKeys="selectedKeys" :openKeys="openKeys"></Navbar>
    </a-layout-sider>
    <a-layout>
      <Breadcrumb></Breadcrumb>
      <a-layout-content style="margin: 0 16px">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center"> alex blog </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import Navbar from "./components/navbar/index.vue";
import Breadcrumb from "./components/breadcrumb/index.vue";
import { useRouter } from "vue-router";
import { algorithm } from "@/utils/algorithm/index";

const router = useRouter().options.routes as [];
const routes = computed(() => algorithm.increaseIndexes(router));
let collapsed = ref(false);
let selectedKeys = ref([]);
let openKeys= ref([]);
</script>
<style>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 206px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme="dark"] .site-layout .site-layout-background {
  background: dark;
}
</style> -->
