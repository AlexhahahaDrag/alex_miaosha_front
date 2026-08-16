<template>
	<div class="my-tabs-wrapper">
		<a-tabs
			v-model:activeKey="activeTabKey"
			type="editable-card"
			@change="onChangeTab"
			@edit="onTabEdit"
			:hideAdd="true"
			size="small"
			:tabBarGutter="6"
			:tabBarStyle="tabBarStyle"
			class="app-tabs-main"
		>
			<template #leftExtra>
				<div
					class="home-tab-pinned"
					:class="{ 'is-active': isHomeActive }"
					@click="goHomeTab"
				>
					<span class="home-tab-title">首页</span>
				</div>
			</template>

			<template #rightExtra>
				<div class="tabs-right-actions">
					<a-dropdown :trigger="['click']" placement="bottomRight">
						<a-button
							type="text"
							size="small"
							class="tabs-action-trigger"
							title="页签操作"
						>
							<template #icon><DownOutlined /></template>
						</a-button>
						<template #overlay>
							<a-menu @click="handleActionClick">
								<a-menu-item key="refresh">
									<template #icon><ReloadOutlined /></template>
									刷新当前
								</a-menu-item>
								<a-menu-item
									key="closeOthers"
									:disabled="dynamicTabs.length === 0 || (dynamicTabs.length === 1 && !isHomeActive)"
								>
									<template #icon><CloseCircleOutlined /></template>
									关闭其他标签
								</a-menu-item>
								<a-menu-item
									key="closeAll"
									:disabled="dynamicTabs.length === 0"
								>
									<template #icon><CloseOutlined /></template>
									关闭所有标签
								</a-menu-item>
							</a-menu>
						</template>
					</a-dropdown>
				</div>
			</template>

			<a-tab-pane
				v-for="tab in dynamicTabs"
				:key="tab.key || ''"
				:closable="tab.closable"
				:tab="tab.title"
			>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>
<script setup lang="ts">
import {
	DownOutlined,
	ReloadOutlined,
	CloseOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons-vue';
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

const isHomeActive = computed(
	() =>
		activeTabKey.value === 'home' ||
		activeTabKey.value === 'dashboard' ||
		activeTabKey.value === 'homeDashboard' ||
		route.path === '/' ||
		route.path === '/home-dashboard',
);

const tabBarStyle = {
	padding: '6px 0 0 0',
	marginBottom: '0',
};

// 排除固定在最左侧的首页 Tab，其余为可滚动/可关闭的动态 Tab
const dynamicTabs = computed<TabItem[]>(() =>
	tabsStore.getTabs.filter(
		(t) =>
			t.key !== 'home' &&
			t.key !== 'dashboard' &&
			t.key !== 'homeDashboard' &&
			t.title !== '首页' &&
			t.fullPath !== '/' &&
			t.fullPath !== '/home-dashboard',
	),
);

onMounted(() => {
	// AI Agent：首屏初始化（优先使用持久化 tabs；为空则以当前路由初始化）
	tabsStore.initByRoute(route);
});

const goHomeTab = () => {
	onChangeTab('home');
};

// AI Agent：关闭 Tab（editable-card 的 remove）
const onTabEdit = (targetKey: string | number, action: string) => {
	if (action !== 'remove') {
		return;
	}
	const nextKey = tabsStore.removeTab(String(targetKey));
	const nextTab = tabsStore.getTabByKey(nextKey);
	if (nextTab?.fullPath) {
		router.push(nextTab.fullPath);
	} else {
		router.push('/');
	}
};

// AI Agent：切换 Tab
const onChangeTab = (key: string) => {
	if (key === 'home' || key === 'dashboard' || key === 'homeDashboard') {
		router.push('/home-dashboard');
		return;
	}
	const tab = tabsStore.getTabByKey(key);
	if (tab?.fullPath) {
		router.push(tab.fullPath);
		return;
	}
	// 兜底：按 name 跳转
	router.push({ name: key });
};

// 页签快捷操作
const handleActionClick = ({ key }: { key: string }) => {
	if (key === 'closeAll') {
		tabsStore.closeAllTabs();
		router.push('/home-dashboard');
	} else if (key === 'closeOthers') {
		const targetKey = isHomeActive.value ? 'home' : activeTabKey.value;
		tabsStore.closeOtherTabs(targetKey);
		if (isHomeActive.value) {
			router.push('/home-dashboard');
		}
	} else if (key === 'refresh') {
		window.location.reload();
	}
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
.my-tabs-wrapper {
	width: 100%;
}

.tabs-right-actions {
	display: flex;
	align-items: center;
	padding-bottom: 2px;
	margin-left: 8px;

	.tabs-action-trigger {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		color: #64748b;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;

		&:hover {
			color: #1677ff;
			background: #e2e8f0;
			border-color: #cbd5e1;
		}
	}
}

.home-tab-pinned {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 28px;
	padding: 0 14px;
	margin-right: 6px;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	border-radius: 6px 6px 0 0;
	font-size: 13px;
	color: #64748b;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s ease;
	box-sizing: border-box;

	&:hover {
		color: #1e293b;
		background: #e2e8f0;
	}

	&.is-active {
		background: #ffffff !important;
		border-color: #e2e8f0 #e2e8f0 #ffffff !important;
		color: #1677ff !important;
		font-weight: 600 !important;
		z-index: 2;
	}
}

.app-tabs-main {
	:deep(.ant-tabs-nav) {
		margin-bottom: 0 !important;

		&::before {
			border-bottom: 1px solid #e2e8f0 !important;
		}
	}

	:deep(.ant-tabs-extra-content) {
		display: flex;
		align-items: flex-end;
		line-height: 1;
	}

	:deep(.ant-tabs-tab) {
		height: 28px !important;
		line-height: 26px !important;
		border-radius: 6px 6px 0 0 !important;
		transition: all 0.2s ease;
		font-size: 13px;
		padding: 0 12px !important;
		background: #f1f5f9;
		border-color: #e2e8f0 !important;
		color: #64748b;

		&:hover {
			color: #1e293b;
			background: #e2e8f0;
		}
	}

	:deep(.ant-tabs-tab-active) {
		background: #ffffff !important;
		border-color: #e2e8f0 #e2e8f0 #ffffff !important;

		.ant-tabs-tab-btn {
			color: #1677ff !important;
			font-weight: 600 !important;
		}
	}

	:deep(.ant-tabs-tab-remove) {
		color: #94a3b8;
		margin-left: 6px;

		&:hover {
			color: #ef4444 !important;
		}
	}
}
</style>
