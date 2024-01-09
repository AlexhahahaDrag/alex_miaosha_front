<template>
  <template v-for="route in p" :key="route.path" :item="route" :base-path="route.path">
    <template v-if="route.children && route.children.length > 0">
      <a-sub-menu v-if="!route.meta?.hiedInMenu" :key="route.path">
        <template #icon>
          <template v-if="route?.meta" style="text-align:center">
            <template v-if="route.meta.icon == 'homeIcon'">
              <HomeIcon />
            </template>
            <template v-else-if="route.meta.icon == 'goodsManagerIcon'">
              <GoodsManagerIcon />
            </template>
            <template v-else-if="route.meta.icon == 'orderManagerIcon'">
              <OrderManagerIcon />
            </template>
            <template v-else-if="route.meta.icon == 'promotionIcon'">
              <PromotionIcon />
            </template>
            <template v-else-if="route.meta.icon == 'userManagerIcon'">
              <UserManagerIcon />
            </template>
            <template v-else-if="route.meta.icon == 'financeManagerIconIcon'">
              <FinanceManagerIcon />
            </template>
          </template>
        </template>
        <template #title>{{ route?.meta?.title || "未知" }}</template>
        <Menu :routes="route.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item v-if="!route.meta?.hiedInMenu" :key="route.path" :item="route" :base-path="route.path">
        <template #title>{{ route?.meta?.title || "未知" }}</template>
        <template #icon>
          <template v-if="route.meta" style="vertical-align:middle">
            <template v-if="route.meta.icon == 'homeIcon'">
              <HomeIcon />
            </template>
            <template v-else-if="route.meta.icon == 'goodsIcon'">
              <GoodsIcon />
            </template>
            <template v-else-if="route.meta.icon == 'orderIcon'">
              <OrderIcon />
            </template>
            <template v-else-if="route.meta.icon == 'seckillIcon'">
              <SeckillIcon />
            </template>
            <template v-else-if="route.meta.icon == 'financeIcon'">
              <FinanceIcon />
            </template>
            <template v-else-if="route.meta.icon == 'financeAnalysisIcon'">
              <FinanceAnalysisIcon />
            </template>
            <template v-else-if="route.meta.icon == 'userIconIcon'">
              <UserIcon />
            </template>
            <template v-else-if="route.meta.icon == 'dictIcon '">
              <DictIcon />
            </template>
            <template v-else-if="route.meta.icon == 'accountRecordInfoIcon'">
              <AccountRecordInfoIcon />
            </template>
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
