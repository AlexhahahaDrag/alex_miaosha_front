import { beforeEach, describe, expect, it } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTabsStore } from '@/store/modules/tabs';

describe('useTabsStore (Ponytail Tab Management)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('初始与关闭所有标签，首页始终位于第 0 位且不可关闭', () => {
		const store = useTabsStore();
		store.initByRoute({
			name: 'user',
			path: '/user',
			fullPath: '/user',
			meta: { title: '用户管理' },
		} as any);

		expect(store.getTabs.length).toBe(2);
		expect(store.getTabs[0].key).toBe('home');
		expect(store.getTabs[0].closable).toBe(false);

		store.closeAllTabs();
		expect(store.getTabs.length).toBe(1);
		expect(store.getTabs[0].key).toBe('home');
		expect(store.getActiveKey).toBe('home');
	});

	it('closeLeftTabs 仅关闭指定 tab 左侧的业务标签，保留首页和自身', () => {
		const store = useTabsStore();
		store.initByRoute({ name: 'home', path: '/' } as any);
		store.upsertTabByRoute({
			name: 'user',
			path: '/user',
			fullPath: '/user',
			meta: { title: '用户' },
		} as any);
		store.upsertTabByRoute({
			name: 'role',
			path: '/role',
			fullPath: '/role',
			meta: { title: '角色' },
		} as any);
		store.upsertTabByRoute({
			name: 'product',
			path: '/product',
			fullPath: '/product',
			meta: { title: '商品' },
		} as any);

		// Tabs: [home, user, role, product]
		expect(store.getTabs.map((t) => t.key)).toEqual([
			'home',
			'user',
			'role',
			'product',
		]);

		// 关闭 role 左侧
		store.closeLeftTabs('role');
		// 应该剩下 [home, role, product]
		expect(store.getTabs.map((t) => t.key)).toEqual(['home', 'role', 'product']);
	});

	it('closeRightTabs 仅关闭指定 tab 右侧的业务标签', () => {
		const store = useTabsStore();
		store.initByRoute({ name: 'home', path: '/' } as any);
		store.upsertTabByRoute({
			name: 'user',
			path: '/user',
			fullPath: '/user',
			meta: { title: '用户' },
		} as any);
		store.upsertTabByRoute({
			name: 'role',
			path: '/role',
			fullPath: '/role',
			meta: { title: '角色' },
		} as any);
		store.upsertTabByRoute({
			name: 'product',
			path: '/product',
			fullPath: '/product',
			meta: { title: '商品' },
		} as any);

		// 关闭 user 右侧
		store.closeRightTabs('user');
		// 应该剩下 [home, user]
		expect(store.getTabs.map((t) => t.key)).toEqual(['home', 'user']);
	});

	it('toggleContentFullscreen 全屏状态切换正确', () => {
		const store = useTabsStore();
		expect(store.getIsContentFullscreen).toBe(false);

		store.toggleContentFullscreen();
		expect(store.getIsContentFullscreen).toBe(true);

		store.toggleContentFullscreen(false);
		expect(store.getIsContentFullscreen).toBe(false);

		store.toggleContentFullscreen(true);
		expect(store.getIsContentFullscreen).toBe(true);
	});
});
