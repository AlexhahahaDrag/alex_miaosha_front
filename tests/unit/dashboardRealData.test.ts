import { describe, it, expect, vi, beforeEach } from 'vitest';

// 隔离 Node 单测环境下对路由及 .vue 布局组件的级联解析
vi.mock('@/router', () => ({
	refreshRouter: vi.fn(),
	router: { addRoute: vi.fn(), push: vi.fn() },
}));

import {
	getSuperAdminDashboard,
	getOrgAdminDashboard,
	getMicroServicesHealth,
	getSystemAuditTimeline,
	type SuperAdminDashboardData,
	type OrgAdminDashboardData,
	type MicroServiceHealthData,
} from '@/views/home-dashboard/api';
import * as requestModule from '@/utils/request';

describe('PC 端 Dashboard 全景真数据与微服务探针契约测试', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('getSuperAdminDashboard 应正确请求 /dashboard/super/overview 并返回全景指标', async () => {
		const mockData: SuperAdminDashboardData = {
			totalUsers: 15800,
			activeOrgs: 120,
			totalTurnover: 980000,
			clusterQps: 3600,
			serviceNodes: [],
			trendDates: ['10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23'],
			trendQps: [2100, 2400, 2800, 3100, 2900, 3300, 3600],
			trendOrders: [120, 150, 180, 210, 190, 260, 310],
		};

		vi.spyOn(requestModule, 'getDataOne').mockResolvedValue({
			code: '200',
			data: mockData,
			message: 'success',
		});

		const { code, data } = await getSuperAdminDashboard();
		expect(code).toBe('200');
		expect(data).toBeDefined();
		expect(data?.totalUsers).toBe(15800);
		expect(data?.activeOrgs).toBe(120);
		expect(data?.trendDates.length).toBe(7);
	});

	it('getOrgAdminDashboard 应正确请求 /dashboard/org/overview 并返回机构在册成员', async () => {
		const mockOrg: OrgAdminDashboardData = {
			orgId: '2001',
			orgName: '华东大区研发中心',
			memberCount: 56,
			roleCount: 6,
			adminName: 'alex',
			monthExpense: 18000,
			monthIncome: 45000,
		};

		vi.spyOn(requestModule, 'getDataOne').mockResolvedValue({
			code: '200',
			data: mockOrg,
			message: 'success',
		});

		const { code, data } = await getOrgAdminDashboard();
		expect(code).toBe('200');
		expect(data?.orgId).toBe('2001');
		expect(typeof data?.orgId).toBe('string');
		expect(data?.memberCount).toBe(56);
		expect(data?.orgName).toBe('华东大区研发中心');
	});

	it('getMicroServicesHealth 应正确返回 6 个微服务探针状态与延迟', async () => {
		const mockNodes: MicroServiceHealthData[] = [
			{
				serviceId: 'alex-gateway',
				name: 'Spring Cloud 统一网关',
				port: 30001,
				desc: '路由转发、统一鉴权、分布式限流',
				status: 'UP',
				latency: 14,
				lastCheckTime: '2026-10-23 16:30:00',
			},
			{
				serviceId: 'alex-user-dev',
				name: '用户权限微服务',
				port: 30006,
				desc: '用户认证、RBAC、机构管理、权限上下文',
				status: 'UP',
				latency: 1,
				lastCheckTime: '2026-10-23 16:30:00',
			},
		];

		vi.spyOn(requestModule, 'getDataOne').mockResolvedValue({
			code: '200',
			data: mockNodes,
			message: 'success',
		});

		const { code, data } = await getMicroServicesHealth();
		expect(code).toBe('200');
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBe(2);
		expect(data?.[0].status).toBe('UP');
		expect(data?.[1].port).toBe(30006);
	});

	it('getSystemAuditTimeline 应正确返回安全与操作审计流', async () => {
		const mockLogs = [
			{
				id: 'evt-101',
				title: '分布式限流规则动态热加载',
				description: 'Redis 滑动窗口限流器成功拦截恶意刷量请求',
				operator: 'SecurityLimiter',
				operateTime: '2026-10-23 16:00:00',
				tag: '风控安全',
				tagColor: 'orange',
			},
		];

		vi.spyOn(requestModule, 'getDataOne').mockResolvedValue({
			code: '200',
			data: mockLogs,
			message: 'success',
		});

		const { code, data } = await getSystemAuditTimeline();
		expect(code).toBe('200');
		expect(data?.[0].id).toBe('evt-101');
		expect(data?.[0].operator).toBe('SecurityLimiter');
	});
});
