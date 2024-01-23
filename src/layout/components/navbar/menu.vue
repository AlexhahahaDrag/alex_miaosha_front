<template>
  <template v-for="route in p" :key="route.path" :item="route" :base-path="route.path">
    <template v-if="route.children && route.children.length > 0">
      <a-sub-menu :key="route.name" v-if="!route.meta?.hiedInMenu">
        <template #icon>
          <template v-if="route?.meta?.icon" style="text-align:center">
              <SvgIcon :name="route.meta.icon" color="white" class="svg"></SvgIcon>
          </template>
        </template>
        <template #title>{{ route.meta ? route.meta.title : "未知" }}</template>
        <Menu :routes="route.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item :key="route.name" :item="route" :base-path="route.path" v-if="!route.meta?.hiedInMenu">
        <template #title>{{ route.meta ? route.meta.title : "未知" }}</template>
        <template #icon>
          <template v-if="route.meta?.icon" style="vertical-align:middle">
            <SvgIcon :name="route.meta.icon" color="white" class="svg"></SvgIcon>
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
