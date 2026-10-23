import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { storeToRefs } from 'pinia';
import { toRaw } from 'vue';

// 隔离 Node 单测环境下对路由及 .vue 布局组件的级联解析
vi.mock('@/router', () => ({
	refreshRouter: vi.fn(),
	router: { addRoute: vi.fn(), push: vi.fn() },
}));

import { useThemeStore } from '@/store/modules/theme';
import { useTabsStore } from '@/store/modules/tabs';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

describe('PC 端 Pinia 消费规范与深拷贝防污染契约测试 (vuejs-skills)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	describe('1. storeToRefs 响应式解构防断裂', () => {
		it('解构出的 primaryColor 与 isDark 在 Store 更新时自动保持响应式', () => {
			const themeStore = useThemeStore();
			const { primaryColor, isDark } = storeToRefs(themeStore);

			expect(primaryColor.value).toBe(themeStore.primaryColor);
			expect(isDark.value).toBe(false);

			// 修改主题色与暗黑模式
			themeStore.setPrimaryColor('#10b981');
			themeStore.toggleDark(true);

			expect(primaryColor.value).toBe('#10b981');
			expect(isDark.value).toBe(true);
		});

		it('tabsStore 经 storeToRefs 解构后 getIsContentFullscreen 状态自适应联动', () => {
			const tabsStore = useTabsStore();
			const { getIsContentFullscreen } = storeToRefs(tabsStore);

			expect(getIsContentFullscreen.value).toBe(false);

			tabsStore.toggleContentFullscreen(true);
			expect(getIsContentFullscreen.value).toBe(true);
		});

		it('usePermission 基于 storeToRefs 的 permissionContext 具有完整响应性', () => {
			const userStore = useUserStore();
			const { permissionContext, isSuperAdmin } = usePermission();

			expect(permissionContext.value).toBeNull();
			expect(isSuperAdmin.value).toBe(false);

			// 设置权限上下文
			userStore.setPermissionContext({
				roleList: [{ id: '1', roleCode: 'admin', roleName: '机构管理员' }],
				menuTree: [],
				permissionCodes: ['user:add'],
			});

			expect(permissionContext.value?.permissionCodes).toContain('user:add');
		});
	});

	describe('2. 共享菜单树深拷贝防污染 (toRaw + structuredClone)', () => {
		it('structuredClone(toRaw(...)) 深拷贝彻底断绝嵌套 children 对象的就地污染', () => {
			const mockMenuTree: MenuInfoData[] = [
				{
					id: '1001',
					name: 'finance',
					title: '财务管理',
					path: '/finance',
					children: [
						{
							id: '1002',
							name: 'gift',
							title: '礼尚往来',
							path: '/finance/gift',
							children: [],
						},
					],
				},
			];

			const userStore = useUserStore();
			userStore.setMenuInfo(mockMenuTree);

			// 模拟动态路由注册过程中的深拷贝（使用 toRaw 剥离 Proxy 代理外壳）
			const clonedMenus: MenuInfoData[] = structuredClone(toRaw(userStore.getMenuInfo!));

			// 修改副本中的子节点
			clonedMenus[0].title = '篡改后的标题';
			clonedMenus[0].children![0].title = '篡改后的子菜单';

			// 断言：Store 内的原始对象保持未污染
			const originalMenus = userStore.getMenuInfo!;
			expect(originalMenus[0].title).toBe('财务管理');
			expect(originalMenus[0].children![0].title).toBe('礼尚往来');
		});
	});
});
