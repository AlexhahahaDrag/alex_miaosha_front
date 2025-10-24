import IconHome from '~icons/my-menu-svg/home';
import IconAccountRecordInfo from '~icons/my-menu-svg/accountRecordInfo';
import IconDict from '~icons/my-menu-svg/dict';
import IconFinance from '~icons/my-menu-svg/finance';
import IconFinanceAnalysis from '~icons/my-menu-svg/financeAnalysis';
import IconFinanceManager from '~icons/my-menu-svg/financeManager';
import IconGoodsManager from '~icons/my-menu-svg/goodsManager';
import IconHomepage from '~icons/my-menu-svg/homepage';
import IconOrder from '~icons/my-menu-svg/order';
import IconOrderManager from '~icons/my-menu-svg/orderManager';
import IconProduct from '~icons/my-menu-svg/product';
import IconPromotion from '~icons/my-menu-svg/promotion';
import IconSeckill from '~icons/my-menu-svg/seckill';
import IconShopFinance from '~icons/my-menu-svg/shopFinance';
import IconShopFinanceAnalysis from '~icons/my-menu-svg/shopFinanceAnalysis';
import IconUser from '~icons/my-menu-svg/user';
import IconUserManager from '~icons/my-menu-svg/userManager';

import IconHuabei from '~icons/my-soft-svg/huabei';
import IconJingdong from '~icons/my-soft-svg/jingdong';
import IconMeituan from '~icons/my-soft-svg/meituan';
import IconRedPacket from '~icons/my-soft-svg/redPacket';
import IconTaobao from '~icons/my-soft-svg/taobao';
import IconWeChat from '~icons/my-soft-svg/weChat';
import IconWhiteBar from '~icons/my-soft-svg/whiteBar';
import IconZhifubao from '~icons/my-soft-svg/zhifubao';

// 创建图标组件映射表;
export const iconComponentMap: Record<string, any> = {
	// 菜单图标
	'menu-home': IconHome,
	'menu-accountRecordInfo': IconAccountRecordInfo,
	'menu-dict': IconDict,
	'menu-finance': IconFinance,
	'menu-financeAnalysis': IconFinanceAnalysis,
	'menu-financeManager': IconFinanceManager,
	'menu-goodsManager': IconGoodsManager,
	'menu-homepage': IconHomepage,
	'menu-order': IconOrder,
	'menu-orderManager': IconOrderManager,
	'menu-product': IconProduct,
	'menu-promotion': IconPromotion,
	'menu-seckill': IconSeckill,
	'menu-shopFinance': IconShopFinance,
	'menu-shopFinanceAnalysis': IconShopFinanceAnalysis,
	'menu-user': IconUser,
	'menu-userManager': IconUserManager,
	// 软件图标
	'soft-huabei': IconHuabei,
	'soft-jingdong': IconJingdong,
	'soft-meituan': IconMeituan,
	'soft-redPacket': IconRedPacket,
	'soft-taobao': IconTaobao,
	'soft-weChat': IconWeChat,
	'soft-whiteBar': IconWhiteBar,
	'soft-zhifubao': IconZhifubao,
};

// 弹窗信息
export interface ModelInfo {
	open?: boolean;
	title?: string;
	width?: string;
	id?: number | undefined | null;
	confirmLoading?: boolean;
}
