<template>
  <a-tabs v-model:activeKey="activeTabKey" type="editable-card" @change="changeTab" @edit="handleTabEdit" :hideAdd="true"
    size="small" :tabBarGutter="2" :tabBarStyle="tabBarStyle" style="margin-top: -5px; margin-bottom: -20px;">
    <a-tab-pane v-for="tab in tabs" :key="tab.key || ''" :closable="tab.closable" :tab="tab.tab">
    </a-tab-pane>
  </a-tabs>
</template>
<script setup lang="ts">
import router from '@/router';


const route = useRoute();
let activeTabKey = ref<any>(route.name || "");

const tabBarStyle = {
  padding: '10px 0', // 上下内边距，左右无内边距
  color: '#add8e6', // 字体颜色为白色
  fontSize: '10px', // 适中的字体大小
};

const tabs = ref([
  {
    tab: route?.meta?.title || "",
    key: route.name,
    component: route,
    closable: true,
  },
]);

const handleTabEdit = (targetKey, action) => {
  if (action === "remove") {
    const index = tabs.value.findIndex((tab) => tab.key === targetKey);
    tabs.value.splice(index, 1);
    if (activeTabKey.value === targetKey) {
      if (tabs.value.length) {
        activeTabKey.value = tabs.value[Math.max(0, index - 1)].key;
      } else {
        activeTabKey.value = "";
      }
    }
  }
};

const handleMenuClick = (item: any) => {
  let tab = tabs.value.find((tab) => tab.key === item.name);
  if (!tab) {
    tab = {
      tab: item?.meta?.title || '',
      key: item.name,
      component: item.component,
      closable: true,
    };
    tabs.value.push(tab);
  }
  activeTabKey.value = item.name;
}

const changeTab = (key: string) => {
  router.push({ name: key });
}

watch(
  () => route.name,
  () => {
    handleMenuClick(route);
  }
);
</script>

<style ang="scss" scoped>
/* 调整标签的高度 */
.ant-tabs-tab {
  height: 10px;
  line-height: 50px;
  /* 确保文本垂直居中 */
  padding: 5px 12px;
  /* 通过调整左右内边距来间接设置宽度 */
}

.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #4ADE80;
  /* 活跃状态的标签颜色 */
  font-weight: 600;
  /* 字体加粗，使活跃标签更显眼 */
}

.ant-tabs-ink-bar {
  background-color: #4ADE80 !important;
  /* 下划线颜色与活跃标签颜色一致 */
}
</style>