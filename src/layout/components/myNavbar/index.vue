<template>
  <div>
    <a-menu id="menu" mode="inline" theme="dark" v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys">
      <MyMenu :routes="routes"></MyMenu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuDataItem } from "@/router/typing";

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
  let par = route.matched[route.matched.length - 2]
  let name: any = route?.name || '';
  selectedKeys.value = [name];
  openKeys.value = [par?.name || '',  name];
});

const routes = ref<MenuDataItem[]>(props.routes);
</script>
