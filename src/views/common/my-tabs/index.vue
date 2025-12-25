<template>
	<a-tabs
		v-model:activeKey="activeTabKey"
		type="editable-card"
		@change="onChangeTab"
		@edit="onTabEdit"
		:hideAdd="true"
		size="small"
		:tabBarGutter="10"
		:tabBarStyle="tabBarStyle"
		style="margin-top: -5px; margin-bottom: -20px"
	>
		<a-tab-pane
			v-for="tab in tabs"
			:key="tab.key || ''"
			:closable="tab?.key === 'dashboard' ? false : tab.closable"
			:tab="tab.title"
		>
		</a-tab-pane>
	</a-tabs>
</template>
<script setup lang="ts">
import router from '@/router';
import { useTabsStore } from '@/store/modules/tabs';
import type { TabItem } from '@/store/modules/tabs';

const route = useRoute();
const tabsStore = useTabsStore();

// AI Agent：tabs/activeKey 都交给 Pinia 管理并持久化，刷新后可恢复
const activeTabKey = computed<string>({
	get: () => tabsStore.getActiveKey,
	set: (val) => tabsStore.setActive(val),
});

const tabBarStyle = {
	padding: '10px 0', // 上下内边距，左右无内边距
	color: '#add8e6', // 字体颜色为白色
	fontSize: '10px', // 适中的字体大小
};

const tabs = computed<TabItem[]>(() => tabsStore.getTabs);

onMounted(() => {
	// AI Agent：首屏初始化（优先使用持久化 tabs；为空则以当前路由初始化）
	tabsStore.initByRoute(route);
});

// AI Agent：关闭 Tab（editable-card 的 remove）
const onTabEdit = (targetKey: string | number, action: string) => {
	if (action !== 'remove') {
		return;
	}
	const nextKey = tabsStore.removeTab(String(targetKey));
	const nextTab = tabsStore.getTabByKey(nextKey);
	if (nextTab?.fullPath) {
		router.push(nextTab.fullPath);
	}
};

// AI Agent：切换 Tab
const onChangeTab = (key: string) => {
	const tab = tabsStore.getTabByKey(key);
	if (tab?.fullPath) {
		router.push(tab.fullPath);
		return;
	}
	// 兜底：按 name 跳转
	router.push({ name: key });
};

watch(
	() => route.fullPath,
	() => {
		// AI Agent：路由变化 -> 新增/更新 tab，并持久化
		tabsStore.upsertTabByRoute(route);
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped>
/* 调整标签的高度 */
.ant-tabs-tab {
	height: 10px;
	line-height: 50px;
	/* 确保文本垂直居中 */
	padding: 5px 12px;
	/* 通过调整左右内边距来间接设置宽度 */
}

.ant-tabs-tab-active .ant-tabs-tab-btn {
	color: #4ade80;
	/* 活跃状态的标签颜色 */
	font-weight: 600;
	/* 字体加粗，使活跃标签更显眼 */
}

.ant-tabs-ink-bar {
	background-color: #4ade80 !important;
	/* 下划线颜色与活跃标签颜色一致 */
}
</style>
