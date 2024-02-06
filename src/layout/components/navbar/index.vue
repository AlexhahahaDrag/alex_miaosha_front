<template>
  <div>
    <a-menu id="menu" mode="inline" theme="dark" v-model:selectedKeys="selectedKeys" @click="handleClick">
      <Menu :routes="routes"></Menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import Menu from "./menu.vue";
import { MenuDataItem } from "@/router/typing";
import { Key } from "ant-design-vue/es/_util/type";
import { MenuProps } from "ant-design-vue/es/menu/src/Menu";
interface Props {
  routes: MenuDataItem[];
  selectedKeys: Key[];
}

const emit = defineEmits(["handleMenuClick"]);

let selectedKeys = ref<Key[]>(['finance']);

const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

const routes = ref<MenuDataItem[]>(props.routes);

const handleClick: MenuProps['onClick'] = (menuInfo: any) => {
  const { item } = menuInfo;
  emit("handleMenuClick", item);
};
</script>
