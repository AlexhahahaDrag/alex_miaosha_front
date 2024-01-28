<template>
  <template v-for="route in p" :key="route.path" :item="route" :base-path="route.path">
    <template v-if="route.children && route.children.length > 0">
      <a-sub-menu :key="route.name" v-if="!route.meta?.hiedInMenu">
      <a-sub-menu v-if="!route.meta?.hiedInMenu" :key="route.path">
        <template #icon>
          <template v-if="route?.meta?.icon" style="text-align:center">
              <SvgIcon :name="route.meta.icon" color="white" class="svg"></SvgIcon>
          <template v-if="route?.meta" style="text-align:center">
            <svgIcon
                :name="route?.meta?.icon ||'#icon-home'"
                class="svg"
                color="white"
            ></svgIcon>
          </template>
        </template>
        <template #title>{{ route?.meta?.title || "未知" }}</template>
        <Menu :routes="route.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item :key="route.name" :item="route" :base-path="route.path" v-if="!route.meta?.hiedInMenu">
        <template #title>{{ route.meta ? route.meta.title : "未知" }}</template>
      <a-menu-item v-if="!route.meta?.hiedInMenu" :key="route.path" :item="route" :base-path="route.path">
        <template #title>{{ route?.meta?.title || "未知" }}</template>
        <template #icon>
          <template v-if="route.meta?.icon" style="vertical-align:middle">
            <SvgIcon :name="route.meta.icon" color="white" class="svg"></SvgIcon>
          <template v-if="route.meta" style="vertical-align:middle">
            <svgIcon
                :name="route?.meta?.icon ||'#icon-home'"
                class="svg"
                color="white"
            ></svgIcon>
          </template>
        </template>
        <router-link :to="route.path">
          {{ route.meta && route.meta.title }}
        </router-link>
      </a-menu-item>
    </template>
  </template>
</template>
<script setup lang="ts">
import { MenuDataItem } from "@/router/typing";

interface Props {
  routes: MenuDataItem[];
}
const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

const p = ref<MenuDataItem[]>(props.routes);

</script>
<style lang="less" scoped>
.svg {
  width: 1em;
  height: 1em;
  font-size: 18px;
  cursor: pointer;
}
</style>
