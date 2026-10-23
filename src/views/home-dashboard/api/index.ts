import { getDataOne, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';

export interface MicroServiceHealthData {
	serviceId: string;
	name: string;
	port: number;
	desc: string;
	status: 'UP' | 'DOWN' | 'DEGRADED';
	latency: number;
	lastCheckTime: string;
}

export interface SuperAdminDashboardData {
	totalUsers: number;
	activeOrgs: number;
	totalTurnover: number;
	clusterQps: number;
	serviceNodes: MicroServiceHealthData[];
	trendDates: string[];
	trendQps: number[];
	trendOrders: number[];
}

export interface OrgAdminDashboardData {
	orgId: string;
	orgName: string;
	memberCount: number;
	roleCount: number;
	adminName: string;
	monthExpense: number;
	monthIncome: number;
}

export interface SystemAuditLogData {
	id: string;
	title: string;
	description: string;
	operator: string;
	operateTime: string;
	tag: string;
	tagColor: string;
}

const dashboardBase = `${baseService.user}/dashboard`;

/**
 * 获取超级管理员工作台全景看板
 */
export function getSuperAdminDashboard(): Promise<ResponseBody<SuperAdminDashboardData>> {
	return getDataOne<SuperAdminDashboardData>(`${dashboardBase}/super/overview`);
}

/**
 * 获取机构/家庭管理员工作台大盘
 */
export function getOrgAdminDashboard(): Promise<ResponseBody<OrgAdminDashboardData>> {
	return getDataOne<OrgAdminDashboardData>(`${dashboardBase}/org/overview`);
}

/**
 * 实时探测微服务集群各节点健康状态
 */
export function getMicroServicesHealth(): Promise<ResponseBody<MicroServiceHealthData[]>> {
	return getDataOne<MicroServiceHealthData[]>(`${dashboardBase}/services/health`);
}

/**
 * 获取系统审计与核心动态时间线
 */
export function getSystemAuditTimeline(): Promise<ResponseBody<SystemAuditLogData[]>> {
	return getDataOne<SystemAuditLogData[]>(`${dashboardBase}/audit/timeline`);
}
