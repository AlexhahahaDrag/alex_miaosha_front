<template>
  <div class="navbar-info">
    <a-menu
      id="menu"
      mode="inline"
      theme="dark"
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
    >
      <MyMenu :routes="routes"></MyMenu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuDataItem } from '@/router/typing';

interface Props {
  routes: MenuDataItem[];
  selectedKeys: string[];
}

let selectedKeys = ref<string[]>(['finance']);

let openKeys = ref<string[]>([]);

const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

onMounted(() => {
  //获取用户信息
  let route = useRoute();
  let par = route.matched[route.matched.length - 2];
  let name: any = route?.name || '';
  selectedKeys.value = [name];
  openKeys.value = [par?.name || '', name];
});

const routes = ref<MenuDataItem[]>(props.routes);
</script>

<style lang="less" scoped>
.navbar-info {
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.navbar-info::-webkit-scrollbar {
  display: none;
  /* 设置滚动条的宽度 */
}

.navbar-info::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 滚动条轨道的颜色 */
  border-radius: 10px;
  /* 圆角 */
}

.navbar-info::-webkit-scrollbar-thumb {
  background-color: #888;
  /* 滚动条的颜色 */
  border-radius: 10px;
  /* 圆角 */
  border: 2px solid #f1f1f1;
  /* 滚动条的边框 */
}

.navbar-info::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 鼠标悬停时的滚动条颜色 */
}

/* 可以设置滚动条的阴影 */
::-webkit-scrollbar-thumb:active {
  background: #333;
  /* 鼠标点击时的颜色 */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  /* 滚动条的阴影效果 */
}
</style>
