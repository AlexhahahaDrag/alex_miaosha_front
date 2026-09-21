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
				<!-- 首页固定 Tab：支持原生右键 ContextMenu -->
				<a-dropdown :trigger="['contextmenu']" :overlayStyle="{ zIndex: 1060 }">
					<div
						class="home-tab-pinned"
						:class="{ 'is-active': isHomeActive }"
						data-testid="tab-pinned-home"
						@click="goHomeTab"
					>
						<span class="home-tab-title">首页</span>
					</div>
					<template #overlay>
						<a-menu @click="(info) => handleActionClick(info, 'home')" class="tabs-action-dropdown-menu">
							<a-menu-item key="refresh" data-testid="tabs-action-refresh">
								<template #icon><ReloadOutlined /></template>
								刷新当前
							</a-menu-item>
							<a-menu-item
								key="closeRight"
								:disabled="dynamicTabs.length === 0"
								data-testid="tabs-action-close-right"
							>
								<template #icon><ArrowRightOutlined /></template>
								关闭右侧
							</a-menu-item>
							<a-menu-item
								key="closeOthers"
								:disabled="dynamicTabs.length === 0"
								data-testid="tabs-action-close-others"
							>
								<template #icon><CloseCircleOutlined /></template>
								关闭其他
							</a-menu-item>
							<a-menu-item
								key="closeAll"
								:disabled="dynamicTabs.length === 0"
								data-testid="tabs-action-close-all"
							>
								<template #icon><MinusCircleOutlined /></template>
								关闭所有
							</a-menu-item>
							<a-menu-divider />
							<a-menu-item key="fullscreen" data-testid="tabs-action-fullscreen">
								<template #icon>
									<FullscreenExitOutlined v-if="isFullscreen" />
									<FullscreenOutlined v-else />
								</template>
								{{ isFullscreen ? '退出全屏 (Esc)' : '内容区全屏' }}
							</a-menu-item>
						</a-menu>
					</template>
				</a-dropdown>
			</template>

			<template #rightExtra>
				<div class="tabs-right-actions">
					<!-- 快捷局部微刷新按钮 -->
					<a-tooltip title="局部刷新当前页" placement="bottom">
						<a-button
							type="text"
							size="small"
							class="tabs-action-btn"
							:class="{ 'is-refreshing': isRefreshing }"
							data-testid="tabs-btn-refresh"
							@click="triggerRefresh"
						>
							<template #icon><ReloadOutlined /></template>
						</a-button>
					</a-tooltip>

					<!-- 快捷内容区全屏切换按钮 -->
					<a-tooltip :title="isFullscreen ? '退出全屏 (Esc)' : '内容区全屏'" placement="bottom">
						<a-button
							type="text"
							size="small"
							class="tabs-action-btn"
							:class="{ 'is-active': isFullscreen }"
							data-testid="tabs-btn-fullscreen"
							@click="toggleFullscreen"
						>
							<template #icon>
								<FullscreenExitOutlined v-if="isFullscreen" />
								<FullscreenOutlined v-else />
							</template>
						</a-button>
					</a-tooltip>

					<!-- 更多页签操作下拉 -->
					<a-dropdown
						:trigger="['click']"
						placement="bottomRight"
						:overlayStyle="{ zIndex: 1050 }"
					>
						<a-tooltip title="更多页签操作" placement="bottom">
							<a-button
								type="text"
								size="small"
								class="tabs-action-btn tabs-action-trigger"
								data-testid="tabs-btn-more"
							>
								<template #icon><EllipsisOutlined /></template>
							</a-button>
						</a-tooltip>
						<template #overlay>
							<a-menu @click="(info) => handleActionClick(info, isHomeActive ? 'home' : activeTabKey)" class="tabs-action-dropdown-menu">
								<a-menu-item key="refresh" data-testid="tabs-action-refresh">
									<template #icon><ReloadOutlined /></template>
									刷新当前
								</a-menu-item>
								<a-menu-item
									key="closeCurrent"
									:disabled="isHomeActive"
									data-testid="tabs-action-close-current"
								>
									<template #icon><CloseOutlined /></template>
									关闭当前标签
								</a-menu-item>
								<a-menu-item
									key="closeLeft"
									:disabled="isCloseLeftDisabled(isHomeActive ? 'home' : activeTabKey)"
									data-testid="tabs-action-close-left"
								>
									<template #icon><ArrowLeftOutlined /></template>
									关闭左侧标签
								</a-menu-item>
								<a-menu-item
									key="closeRight"
									:disabled="isCloseRightDisabled(isHomeActive ? 'home' : activeTabKey)"
									data-testid="tabs-action-close-right"
								>
									<template #icon><ArrowRightOutlined /></template>
									关闭右侧标签
								</a-menu-item>
								<a-menu-item
									key="closeOthers"
									:disabled="isCloseOthersDisabled(isHomeActive ? 'home' : activeTabKey)"
									data-testid="tabs-action-close-others"
								>
									<template #icon><CloseCircleOutlined /></template>
									关闭其他标签
								</a-menu-item>
								<a-menu-item
									key="closeAll"
									:disabled="dynamicTabs.length === 0"
									data-testid="tabs-action-close-all"
								>
									<template #icon><MinusCircleOutlined /></template>
									关闭所有标签
								</a-menu-item>
								<a-menu-divider />
								<a-menu-item key="fullscreen" data-testid="tabs-action-fullscreen">
									<template #icon>
										<FullscreenExitOutlined v-if="isFullscreen" />
										<FullscreenOutlined v-else />
									</template>
									{{ isFullscreen ? '退出全屏 (Esc)' : '内容区全屏' }}
								</a-menu-item>
							</a-menu>
						</template>
					</a-dropdown>
				</div>
			</template>

			<!-- 动态 Tab：支持原生右键 ContextMenu -->
			<a-tab-pane
				v-for="tab in dynamicTabs"
				:key="tab.key || ''"
				:closable="tab.closable"
			>
				<template #tab>
					<a-dropdown :trigger="['contextmenu']" :overlayStyle="{ zIndex: 1060 }">
						<span class="tab-title-text" :data-testid="`tab-item-${tab.key}`">{{ tab.title }}</span>
						<template #overlay>
							<a-menu @click="(info) => handleActionClick(info, tab.key)" class="tabs-action-dropdown-menu">
								<a-menu-item key="refresh">
									<template #icon><ReloadOutlined /></template>
									刷新当前
								</a-menu-item>
								<a-menu-item key="closeCurrent" :disabled="!tab.closable">
									<template #icon><CloseOutlined /></template>
									关闭标签
								</a-menu-item>
								<a-menu-item key="closeLeft" :disabled="isCloseLeftDisabled(tab.key)">
									<template #icon><ArrowLeftOutlined /></template>
									关闭左侧
								</a-menu-item>
								<a-menu-item key="closeRight" :disabled="isCloseRightDisabled(tab.key)">
									<template #icon><ArrowRightOutlined /></template>
									关闭右侧
								</a-menu-item>
								<a-menu-item key="closeOthers" :disabled="isCloseOthersDisabled(tab.key)">
									<template #icon><CloseCircleOutlined /></template>
									关闭其他
								</a-menu-item>
								<a-menu-item key="closeAll" :disabled="dynamicTabs.length === 0">
									<template #icon><MinusCircleOutlined /></template>
									关闭所有
								</a-menu-item>
								<a-menu-divider />
								<a-menu-item key="fullscreen">
									<template #icon>
										<FullscreenExitOutlined v-if="isFullscreen" />
										<FullscreenOutlined v-else />
									</template>
									{{ isFullscreen ? '退出全屏 (Esc)' : '内容区全屏' }}
								</a-menu-item>
							</a-menu>
						</template>
					</a-dropdown>
				</template>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>
<script setup lang="ts">
import {
	EllipsisOutlined,
	ReloadOutlined,
	CloseOutlined,
	CloseCircleOutlined,
	MinusCircleOutlined,
	ArrowLeftOutlined,
	ArrowRightOutlined,
	FullscreenOutlined,
	FullscreenExitOutlined,
} from '@ant-design/icons-vue';
import router from '@/router';
import { useTabsStore } from '@/store/modules/tabs';
import type { TabItem } from '@/store/modules/tabs';

const route = useRoute();
const tabsStore = useTabsStore();
const reloadRouteView = inject<() => void>('reloadRouteView');

// AI Agent：tabs/activeKey 都交给 Pinia 管理并持久化，刷新后可恢复
const activeTabKey = computed<string>({
	get: () => tabsStore.getActiveKey,
	set: (val) => tabsStore.setActive(val),
});

const isFullscreen = computed(() => tabsStore.getIsContentFullscreen);

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

// 禁用状态感知函数
const isCloseLeftDisabled = (key: string) => {
	if (key === 'home') return true;
	const index = dynamicTabs.value.findIndex((t) => t.key === key);
	return index <= 0;
};

const isCloseRightDisabled = (key: string) => {
	if (key === 'home') {
		return dynamicTabs.value.length === 0;
	}
	const index = dynamicTabs.value.findIndex((t) => t.key === key);
	return index === -1 || index >= dynamicTabs.value.length - 1;
};

const isCloseOthersDisabled = (key: string) => {
	if (key === 'home') {
		return dynamicTabs.value.length === 0;
	}
	return dynamicTabs.value.length <= 1;
};

// 局部无感微刷新状态与触发
const isRefreshing = ref(false);
const triggerRefresh = () => {
	if (isRefreshing.value) return;
	isRefreshing.value = true;
	if (reloadRouteView) {
		reloadRouteView();
	} else {
		window.location.reload();
	}
	setTimeout(() => {
		isRefreshing.value = false;
	}, 600);
};

const toggleFullscreen = () => {
	tabsStore.toggleContentFullscreen();
};

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

// 页签操作综合派发
const handleActionClick = (
	{ key }: { key: string | number } | any,
	targetKey?: string,
) => {
	const actionKey = String(key);
	const currentTarget =
		targetKey || (isHomeActive.value ? 'home' : activeTabKey.value);

	switch (actionKey) {
		case 'refresh':
			triggerRefresh();
			break;
		case 'closeCurrent':
			if (currentTarget && currentTarget !== 'home') {
				onTabEdit(currentTarget, 'remove');
			}
			break;
		case 'closeLeft':
			if (currentTarget && currentTarget !== 'home') {
				const nextKey = tabsStore.closeLeftTabs(currentTarget);
				const nextTab = tabsStore.getTabByKey(nextKey);
				if (nextTab?.fullPath) {
					router.push(nextTab.fullPath);
				}
			}
			break;
		case 'closeRight':
			if (currentTarget) {
				const nextKey = tabsStore.closeRightTabs(currentTarget);
				if (currentTarget === 'home') {
					router.push('/home-dashboard');
				} else {
					const nextTab = tabsStore.getTabByKey(nextKey);
					if (nextTab?.fullPath) {
						router.push(nextTab.fullPath);
					}
				}
			}
			break;
		case 'closeOthers':
			tabsStore.closeOtherTabs(currentTarget);
			if (currentTarget === 'home') {
				router.push('/home-dashboard');
			} else {
				const currentTab = tabsStore.getTabByKey(currentTarget);
				if (currentTab?.fullPath) {
					router.push(currentTab.fullPath);
				}
			}
			break;
		case 'closeAll':
			tabsStore.closeAllTabs();
			router.push('/home-dashboard');
			break;
		case 'fullscreen':
			toggleFullscreen();
			break;
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
	gap: 6px;
	padding-bottom: 2px;
	margin-left: 10px;

	.tabs-action-btn {
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px; /* Tailwind rounded-lg */
		color: #94a3b8; /* Tailwind text-slate-400 */
		background: transparent;
		border: 1px solid transparent;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		padding: 0;
		cursor: pointer;

		:deep(.anticon) {
			font-size: 14px;
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
		}

		/* Tailwind Hover 风格：彻底告别灰色，改用轻透天空蓝微光 (Tailwind bg-blue-50 + text-blue-600) */
		&:hover {
			color: #2563eb; /* Tailwind text-blue-600 */
			background: #eff6ff; /* Tailwind bg-blue-50 */
			border-color: #dbeafe; /* Tailwind border-blue-100 */
			transform: scale(1.12);
			box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08); /* Tailwind shadow-sm */

			:deep(.anticon) {
				color: #2563eb;
			}
		}

		/* Tailwind Active: 弹性点击反馈 */
		&:active {
			transform: scale(0.95);
			background: #dbeafe; /* Tailwind bg-blue-100 */
		}

		/* 全屏激活态 */
		&.is-active {
			color: #2563eb;
			background: #eff6ff;
			border-color: #bfdbfe; /* Tailwind border-blue-200 */

			&:hover {
				color: #1d4ed8; /* Tailwind text-blue-700 */
				background: #dbeafe;
			}
		}

		&.is-refreshing :deep(.anticon) {
			animation: tabs-spin 0.6s linear infinite;
		}
	}
}

@keyframes tabs-spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.tab-title-text {
	display: inline-block;
	user-select: none;
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

:deep(.tabs-action-dropdown-menu) {
	border-radius: 8px;
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
	padding: 4px;
	border: 1px solid #f0f0f0;
	min-width: 136px;
}
</style>
