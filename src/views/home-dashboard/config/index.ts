import type { PermissionContext } from '@/utils/permission';

export type DashboardRoleType = 'super_admin' | 'org_admin' | 'user';

/** 微服务探针配置 */
export interface MicroServiceNode {
	name: string;
	serviceId: string;
	port: number;
	status: 'online' | 'degraded' | 'offline';
	desc: string;
	latency: number;
}

export const MICRO_SERVICES: MicroServiceNode[] = [
	{
		name: '用户服务',
		serviceId: 'alex-user-dev',
		port: 30006,
		status: 'online',
		desc: 'RBAC权限与多租户用户体系',
		latency: 18,
	},
	{
		name: '商品微服务',
		serviceId: 'alex-product-dev',
		port: 30007,
		status: 'online',
		desc: 'SPU/SKU商品与秒杀库存管理',
		latency: 24,
	},
	{
		name: '财务与礼尚往来',
		serviceId: 'alex-finance-dev',
		port: 30008,
		status: 'online',
		desc: '礼簿人情档案与记账核算',
		latency: 21,
	},
	{
		name: 'OSS对象存储',
		serviceId: 'alex-oss-dev',
		port: 30009,
		status: 'online',
		desc: 'MinIO/云存储文件流式传输',
		latency: 35,
	},
	{
		name: 'AI智能分析服务',
		serviceId: 'alex-ai-dev',
		port: 30010,
		status: 'online',
		desc: 'DeepSeek双路由与规则降级',
		latency: 42,
	},
];

/** 快捷入口定义 */
export interface QuickActionItem {
	title: string;
	icon: string;
	path: string;
	color: string;
	desc?: string;
	testId: string;
}

/** 超管快捷入口 */
export const SUPER_ADMIN_ACTIONS: QuickActionItem[] = [
	{
		title: '用户权限中心',
		icon: 'UserOutlined',
		path: '/user/user-info',
		color: '#1890ff',
		desc: '用户账户维护与权限分配',
		testId: 'dash-super-action-user',
	},
	{
		title: '角色与授权',
		icon: 'SafetyCertificateOutlined',
		path: '/user/role-info',
		color: '#722ed1',
		desc: '配置角色绑定与菜单权限码',
		testId: 'dash-super-action-role',
	},
	{
		title: '组织架构总览',
		icon: 'ApartmentOutlined',
		path: '/user/org-info',
		color: '#13c2c2',
		desc: '维护多级机构树与层级关系',
		testId: 'dash-super-action-org',
	},
	{
		title: '系统操作日志',
		icon: 'FileSearchOutlined',
		path: '/user/operate-log',
		color: '#fa8c16',
		desc: '高风险行为审计与请求追踪',
		testId: 'dash-super-action-log',
	},
];

/** 机构管理员快捷入口 */
export const ORG_ADMIN_ACTIONS: QuickActionItem[] = [
	{
		title: '部门成员管理',
		icon: 'TeamOutlined',
		path: '/user/org-user-info',
		color: '#1890ff',
		desc: '维护本部门员工与职务调动',
		testId: 'dash-org-action-member',
	},
	{
		title: '商品管理',
		icon: 'AppstoreOutlined',
		path: '/product/product-info',
		color: '#52c41a',
		desc: '本机构商品上下架与库存盘点',
		testId: 'dash-org-action-product',
	},
	{
		title: '秒杀活动运营',
		icon: 'ThunderboltOutlined',
		path: '/seckill/seckill-activity',
		color: '#fa541c',
		desc: '创建与管理机构限时秒杀',
		testId: 'dash-org-action-seckill',
	},
	{
		title: '礼尚往来大盘',
		icon: 'AccountBookOutlined',
		path: '/finance/gift/event',
		color: '#eb2f96',
		desc: '部门人情往来与重大事件簿',
		testId: 'dash-org-action-gift',
	},
];

/** 普通用户快捷入口 */
export const USER_ACTIONS: QuickActionItem[] = [
	{
		title: '随礼记一笔',
		icon: 'PlusCircleOutlined',
		path: '/finance/gift/record',
		color: '#1890ff',
		desc: '快速登记送礼或收礼流水',
		testId: 'dash-user-action-add-gift',
	},
	{
		title: '我的人情档案',
		icon: 'ContactsOutlined',
		path: '/finance/gift/person',
		color: '#52c41a',
		desc: '查看往来亲友与收支结余',
		testId: 'dash-user-action-person',
	},
	{
		title: '秒杀专区',
		icon: 'ShoppingOutlined',
		path: '/seckill/seckill-activity',
		color: '#fa8c16',
		desc: '浏览参与热门爆款抢购活动',
		testId: 'dash-user-action-shop',
	},
	{
		title: '个人中心',
		icon: 'UserOutlined',
		path: '/user/user-info',
		color: '#722ed1',
		desc: '查看个人资料与修改安全密码',
		testId: 'dash-user-action-profile',
	},
];

/**
 * 判断某个角色是否属于管理员类型（支持 admin、family_admin、gift_admin 等业务垂直管理员）
 */
export const isAdministratorRole = (role?: {
	roleCode?: string;
	roleName?: string;
} | null): boolean => {
	if (!role) return false;
	const code = role.roleCode?.toLowerCase() || '';
	const name = role.roleName || '';
	return (
		code === 'admin' ||
		code.endsWith('_admin') ||
		code.includes('admin') ||
		name.includes('管理员') ||
		name.includes('主管') ||
		name.includes('经理')
	);
};

/**
 * 角色分流判定函数
 */
export const resolveDashboardRole = (
	permissionContext: PermissionContext | null | undefined,
	roleCode?: string,
	roleName?: string,
): DashboardRoleType => {
	// 1. 超级管理员拥有全平台最高权限
	if (
		permissionContext?.superAdmin ||
		roleCode === 'super_super' ||
		permissionContext?.roleList?.some((r) => r?.roleCode === 'super_super')
	) {
		return 'super_admin';
	}

	// 2. 机构/部门/垂直管理员判定（支持 admin、family_admin、gift_admin 等）
	if (
		isAdministratorRole({ roleCode, roleName }) ||
		permissionContext?.roleList?.some((r: any) =>
			isAdministratorRole({
				roleCode: r?.roleCode,
				roleName: r?.roleName,
			}),
		)
	) {
		return 'org_admin';
	}

	// 3. 默认为普通用户个人工作台
	return 'user';
};
