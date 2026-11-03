import { describe, it, expect, vi } from 'vitest';

// 为 vue-router 提供轻量 mock，避免在 Node 环境初始化真实 WebHashHistory DOM 监听
vi.mock('vue-router', () => ({
	createRouter: () => ({
		beforeEach: vi.fn(),
		afterEach: vi.fn(),
		addRoute: vi.fn(),
	}),
	createWebHashHistory: () => ({}),
	RouterView: { name: 'RouterView' },
}));

// 为虚拟模块 ~icons 提供 mock
vi.mock('~icons/my-menu-svg/home', () => ({ default: { name: 'IconHome' } }));
vi.mock('~icons/my-menu-svg/accountRecordInfo', () => ({ default: { name: 'IconAccountRecordInfo' } }));
vi.mock('~icons/my-menu-svg/dict', () => ({ default: { name: 'IconDict' } }));
vi.mock('~icons/my-menu-svg/finance', () => ({ default: { name: 'IconFinance' } }));
vi.mock('~icons/my-menu-svg/financeAnalysis', () => ({ default: { name: 'IconFinanceAnalysis' } }));
vi.mock('~icons/my-menu-svg/financeManager', () => ({ default: { name: 'IconFinanceManager' } }));
vi.mock('~icons/my-menu-svg/goodsManager', () => ({ default: { name: 'IconGoodsManager' } }));
vi.mock('~icons/my-menu-svg/homepage', () => ({ default: { name: 'IconHomepage' } }));
vi.mock('~icons/my-menu-svg/order', () => ({ default: { name: 'IconOrder' } }));
vi.mock('~icons/my-menu-svg/orderManager', () => ({ default: { name: 'IconOrderManager' } }));
vi.mock('~icons/my-menu-svg/product', () => ({ default: { name: 'IconProduct' } }));
vi.mock('~icons/my-menu-svg/promotion', () => ({ default: { name: 'IconPromotion' } }));
vi.mock('~icons/my-menu-svg/shopFinance', () => ({ default: { name: 'IconShopFinance' } }));
vi.mock('~icons/my-menu-svg/shopFinanceAnalysis', () => ({ default: { name: 'IconShopFinanceAnalysis' } }));
vi.mock('~icons/my-menu-svg/user', () => ({ default: { name: 'IconUser' } }));
vi.mock('~icons/my-menu-svg/userManager', () => ({ default: { name: 'IconUserManager' } }));

vi.mock('~icons/my-soft-svg/huabei', () => ({ default: { name: 'IconHuabei' } }));
vi.mock('~icons/my-soft-svg/jingdong', () => ({ default: { name: 'IconJingdong' } }));
vi.mock('~icons/my-soft-svg/meituan', () => ({ default: { name: 'IconMeituan' } }));
vi.mock('~icons/my-soft-svg/redPacket', () => ({ default: { name: 'IconRedPacket' } }));
vi.mock('~icons/my-soft-svg/taobao', () => ({ default: { name: 'IconTaobao' } }));
vi.mock('~icons/my-soft-svg/weChat', () => ({ default: { name: 'IconWeChat' } }));
vi.mock('~icons/my-soft-svg/whiteBar', () => ({ default: { name: 'IconWhiteBar' } }));
vi.mock('~icons/my-soft-svg/zhifubao', () => ({ default: { name: 'IconZhifubao' } }));

vi.mock('~icons/my-finance-svg/cash', () => ({ default: { name: 'IconCash' } }));
vi.mock('~icons/my-finance-svg/card', () => ({ default: { name: 'IconCard' } }));
vi.mock('~icons/my-finance-svg/telCharge', () => ({ default: { name: 'IconTelCharge' } }));
vi.mock('~icons/my-finance-svg/gasCharge', () => ({ default: { name: 'IconGasCharge' } }));
vi.mock('~icons/my-finance-svg/waterCharge', () => ({ default: { name: 'IconWaterCharge' } }));
vi.mock('~icons/my-finance-svg/electricCharge', () => ({ default: { name: 'IconElectricCharge' } }));

// 为 Layout.vue 提供组件 mock
vi.mock('@/layout/index.vue', () => ({ default: { name: 'Layout' } }));

import { resolveMenuIcon, iconComponentMap } from '@/config/icons';
import { routes } from '@/router/index';

describe('菜单 SVG 图标解析与路由配置规范 (Menu SVG Icon Tests)', () => {
	it('静态首页路由应当显式配置 icon: "home"', () => {
		const homeRoute = routes.find((r) => r.name === 'home');
		expect(homeRoute).toBeDefined();
		expect(homeRoute?.meta?.icon).toBe('home');
	});

	it('resolveMenuIcon 应当成功解析各大一级菜单图标', () => {
		// 1. 首页
		expect(resolveMenuIcon('home', 'home')).toBeDefined();
		expect(resolveMenuIcon('home', 'home')).toBe(iconComponentMap['menu-home']);

		// 2. 系统管理 (userManagerIcon)
		expect(resolveMenuIcon('userManagerIcon', 'user')).toBeDefined();
		expect(resolveMenuIcon('userManagerIcon', 'user')).toBe(iconComponentMap['menu-userManager']);

		// 3. 财务管理 (financeManager / finance)
		expect(resolveMenuIcon('financeManager', 'finance')).toBeDefined();
		expect(resolveMenuIcon('financeManager', 'finance')).toBe(iconComponentMap['menu-financeManager']);

		// 4. 消费券管理 (cpnCouponManager / cpnCoupon)
		expect(resolveMenuIcon('cpnCouponManager', 'cpnCoupon')).toBeDefined();
		expect(resolveMenuIcon('cpnCouponManager', 'cpnCoupon')).toBe(iconComponentMap['menu-promotion']);

		// 5. 个人财务 (selfFinance)
		expect(resolveMenuIcon('financeManager', 'selfFinance')).toBeDefined();
		expect(resolveMenuIcon('financeManager', 'selfFinance')).toBe(iconComponentMap['menu-financeManager']);

		// 6. 礼尚往来管理 (gift 别名映射为红包图标)
		expect(resolveMenuIcon(undefined, 'gift')).toBeDefined();
		expect(resolveMenuIcon(undefined, 'gift')).toBe(iconComponentMap['soft-redPacket']);

		// 7. 系统配置 / 字典 (dict)
		expect(resolveMenuIcon('dict', 'dict')).toBeDefined();
		expect(resolveMenuIcon('dict', 'dict')).toBe(iconComponentMap['menu-dict']);

		// 8. 账户流水信息 (accountRecordInfo)
		expect(resolveMenuIcon('accountRecordInfo', 'accountRecordInfo')).toBeDefined();
		expect(resolveMenuIcon('accountRecordInfo', 'accountRecordInfo')).toBe(iconComponentMap['menu-accountRecordInfo']);
	});

	it('resolveMenuIcon 在未知图标且未知路由名时应安全回退为 null', () => {
		expect(resolveMenuIcon(undefined, undefined)).toBeNull();
		expect(resolveMenuIcon('non_exist_icon', 'unknown_menu')).toBeNull();
		expect(resolveMenuIcon('', '')).toBeNull();
	});
});
