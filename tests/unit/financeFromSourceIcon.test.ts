import { describe, it, expect, vi } from 'vitest';

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

import { iconComponentMap } from '@/config/icons';

describe('财务支付方式图标精确映射契约', () => {
	it('衍生话费渠道（hfw/hfm/hfmj）必须精确映射为话费图标且不可为 undefined', () => {
		const baseTelIcon = iconComponentMap['finance-hf'];
		expect(baseTelIcon).toBeDefined();

		expect(iconComponentMap['finance-hfw']).toBe(baseTelIcon);
		expect(iconComponentMap['finance-hfm']).toBe(baseTelIcon);
		expect(iconComponentMap['finance-hfmj']).toBe(baseTelIcon);
	});

	it('衍生电费渠道（dfw/dfm）必须精确映射为电费图标且不可为 undefined', () => {
		const baseElectricIcon = iconComponentMap['finance-df'];
		expect(baseElectricIcon).toBeDefined();

		expect(iconComponentMap['finance-dfw']).toBe(baseElectricIcon);
		expect(iconComponentMap['finance-dfm']).toBe(baseElectricIcon);
	});

	it('非枚举的任意字符串不得被意外匹配（防止模糊匹配误判）', () => {
		expect(iconComponentMap['finance-other_hfw']).toBeUndefined();
		expect(iconComponentMap['finance-hf_xyz']).toBeUndefined();
		expect(iconComponentMap['finance-df_abc']).toBeUndefined();
	});
});
