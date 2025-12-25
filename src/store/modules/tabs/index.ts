import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * AI Agent：
 * Tabs 持久化 store
 * 目标：刷新页面后，保留所有打开的 Tab（以及当前激活的 Tab）
 *
 * 说明：
 * - 这里用 pinia-plugin-persistedstate 做持久化
 * - storage 选择 sessionStorage：满足“刷新保留”，但关闭浏览器后清空（更贴近“会话”体验）
 *   若你希望“关闭浏览器也保留”，把 storage 改成 localStorage 即可。
 */

export interface TabItem {
	/**
	 * Tab 的唯一 key（优先用 route.name；没有 name 时兜底用 fullPath）
	 */
	key: string;
	/**
	 * 展示标题
	 */
	title: string;
	/**
	 * 跳转目标：用 fullPath 能覆盖 params/query 的场景
	 */
	fullPath: string;
	/**
	 * 是否可关闭
	 */
	closable: boolean;
}

export interface TabsState {
	activeKey: string;
	tabs: TabItem[];
}

const DEFAULT_HOME_KEY = 'home';
const DEFAULT_DASHBOARD_KEY = 'dashboard';

const buildKeyFromRoute = (route: RouteLocationNormalizedLoaded): string => {
	return String(route?.name || route?.fullPath || '');
};

const buildTitleFromRoute = (route: RouteLocationNormalizedLoaded): string => {
	return String(route?.meta?.title || route?.name || route?.path || '未命名');
};

const isHomeLike = (key: string) =>
	key === DEFAULT_HOME_KEY || key === DEFAULT_DASHBOARD_KEY;

/**
 * AI Agent：确保 home tab 始终存在且位于最左端（第 0 个）
 * - 解决刷新恢复/路由变化导致 tabs 顺序漂移的问题
 * - 不改变除 home 之外的 tab 相对顺序
 */
const normalizeTabsOrder = (tabs: TabItem[]): TabItem[] => {
	const list = Array.isArray(tabs) ? [...tabs] : [];

	// 1) 去重：只保留一个 home
	const firstHomeIndex = list.findIndex((t) => t.key === DEFAULT_HOME_KEY);
	if (firstHomeIndex > -1) {
		for (let i = list.length - 1; i >= 0; i--) {
			if (i !== firstHomeIndex && list[i]?.key === DEFAULT_HOME_KEY) {
				list.splice(i, 1);
			}
		}
	}

	// 2) 若缺少 home，则补一个（永远不可关闭）
	let homeIndex = list.findIndex((t) => t.key === DEFAULT_HOME_KEY);
	if (homeIndex === -1) {
		list.unshift({
			key: DEFAULT_HOME_KEY,
			title: '首页',
			fullPath: '/',
			closable: false,
		});
		homeIndex = 0;
	}

	// 3) home 放到最左端
	if (homeIndex > 0) {
		const [home] = list.splice(homeIndex, 1);
		list.unshift(home);
	}
	return list;
};

export const useTabsStore = defineStore('app-tabs', {
	state: (): TabsState => ({
		activeKey: '',
		tabs: [],
	}),
	getters: {
		getActiveKey(): string {
			return this.activeKey || '';
		},
		getTabs(): TabItem[] {
			return this.tabs || [];
		},
	},
	actions: {
		/**
		 * AI Agent：初始化（首次进入页面时调用）
		 * - 若持久化已恢复 tabs，则只同步 activeKey
		 * - 若 tabs 为空，则以当前路由初始化（并补上首页 tab）
		 */
		initByRoute(route: RouteLocationNormalizedLoaded) {
			const key = buildKeyFromRoute(route);
			this.activeKey = key;

			if (Array.isArray(this.tabs) && this.tabs.length > 0) {
				// AI Agent：刷新恢复后也要保证 home 在最左端
				this.tabs = normalizeTabsOrder(this.tabs);
				// 已有持久化 tabs，只确保 activeKey 指向存在的 tab
				const exist = this.tabs.find((t) => t.key === key);
				if (!exist && key) {
					this.upsertTabByRoute(route);
				}
				return;
			}

			// 首次初始化：补一个首页 tab + 当前 tab
			const homeTab: TabItem = {
				key: DEFAULT_HOME_KEY,
				title: '首页',
				fullPath: '/',
				closable: false,
			};
			this.tabs = [homeTab];
			this.upsertTabByRoute(route);
		},

		/**
		 * AI Agent：根据路由新增/更新 Tab（路由变化时调用）
		 */
		upsertTabByRoute(route: RouteLocationNormalizedLoaded) {
			const key = buildKeyFromRoute(route);
			if (!key) {
				return;
			}

			const tab: TabItem = {
				key,
				title: buildTitleFromRoute(route),
				fullPath: route.fullPath || route.path || '/',
				closable: !isHomeLike(key),
			};

			const index = this.tabs.findIndex((t) => t.key === key);
			if (index > -1) {
				// 更新 fullPath/title（例如 query 变化、title 更新）
				this.tabs.splice(index, 1, { ...this.tabs[index], ...tab });
			} else {
				this.tabs.push(tab);
			}

			// AI Agent：任何变更后都做一次排序归一化，确保 home 永远在最左端
			this.tabs = normalizeTabsOrder(this.tabs);
			this.activeKey = key;
		},

		/**
		 * AI Agent：切换激活 Tab
		 */
		setActive(key: string) {
			this.activeKey = key || '';
		},

		/**
		 * AI Agent：移除 Tab
		 * @returns nextKey 删除后建议跳转的 key（为空则表示无需跳转）
		 */
		removeTab(key: string): string {
			if (!key) {
				return '';
			}
			// 首页类 tab 不允许删除
			if (isHomeLike(key)) {
				return this.activeKey;
			}

			const index = this.tabs.findIndex((t) => t.key === key);
			if (index === -1) {
				return this.activeKey;
			}

			this.tabs.splice(index, 1);
			// AI Agent：删除后也要保证 home 永远在最左端
			this.tabs = normalizeTabsOrder(this.tabs);

			// 若删的是当前激活 tab，则激活相邻 tab
			if (this.activeKey === key) {
				const next = this.tabs[Math.max(0, index - 1)];
				this.activeKey = next?.key || this.tabs[0]?.key || '';
				return this.activeKey;
			}
			return this.activeKey;
		},

		/**
		 * AI Agent：通过 key 获取 tab（用于跳转）
		 */
		getTabByKey(key: string): TabItem | undefined {
			return this.tabs.find((t) => t.key === key);
		},
	},
	persist: {
		key: 'app-tabs',
		storage: window.sessionStorage,
	},
});
