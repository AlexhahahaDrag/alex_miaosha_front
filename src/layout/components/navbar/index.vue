<template>
  <div>
    <a-menu id="menu" mode="inline" theme="dark" v-model:selectedKeys="selectedKeys">
      <Menu :routes="routes"></Menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { Key } from "ant-design-vue/lib/_util/type";
import Menu from "./menu.vue";
import { MenuDataItem } from "@/router/typing";
interface Props {
  routes: MenuDataItem[];
  selectedKeys: Key[];
}

let selectedKeys = ref<Key[]>(['finance']);

const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

const routes = ref<MenuDataItem[]>(props.routes);
</script>
