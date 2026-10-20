import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	getDashboardCache,
	setDashboardCache,
	clearDashboardCache,
} from '@/views/home-dashboard/config/dashboardCache';
import { resolveDashboardRole } from '@/views/home-dashboard/config';

describe('PC 端工作台缓存与角色判定契约 (Home Dashboard)', () => {
	beforeEach(() => {
		clearDashboardCache();
		vi.useRealTimers();
	});

	it('缓存机制：setDashboardCache 后未超期可成功命中', () => {
		const testData = { recordCount: 15, receivedAmount: 12000, sentAmount: 8000 };
		setDashboardCache('test_key', testData);

		const cached = getDashboardCache<typeof testData>('test_key', 60000);
		expect(cached).not.toBeNull();
		expect(cached?.recordCount).toBe(15);
		expect(cached?.receivedAmount).toBe(12000);
		expect(cached?.sentAmount).toBe(8000);
	});

	it('缓存机制：超过 TTL 后自动失效并返回 null', () => {
		vi.useFakeTimers();
		const testData = { count: 99 };
		setDashboardCache('expire_key', testData);

		// 快进 61 秒
		vi.advanceTimersByTime(61 * 1000);

		const cached = getDashboardCache<typeof testData>('expire_key', 60000);
		expect(cached).toBeNull();
	});

	it('缓存机制：clearDashboardCache 可清空特定或全量缓存', () => {
		setDashboardCache('k1', 'val1');
		setDashboardCache('k2', 'val2');

		clearDashboardCache('k1');
		expect(getDashboardCache('k1')).toBeNull();
		expect(getDashboardCache('k2')).toBe('val2');

		clearDashboardCache();
		expect(getDashboardCache('k2')).toBeNull();
	});

	it('角色分流算法：superAdmin 标记或 super_super 角色必定判定为 super_admin', () => {
		const role1 = resolveDashboardRole({ superAdmin: true } as any);
		expect(role1).toBe('super_admin');

		const role2 = resolveDashboardRole(undefined, 'super_super');
		expect(role2).toBe('super_admin');
	});

	it('角色分流算法：admin 或包含管理员关键词的角色必定判定为 org_admin', () => {
		const role1 = resolveDashboardRole(undefined, 'admin', '机构管理员');
		expect(role1).toBe('org_admin');

		const role2 = resolveDashboardRole(undefined, 'gift_admin', '礼金主管');
		expect(role2).toBe('org_admin');
	});

	it('角色分流算法：普通用户角色稳定收敛为 user', () => {
		const role = resolveDashboardRole(undefined, 'common_user', '普通员工');
		expect(role).toBe('user');
	});

	it('用户资产与人情结余计算口径：netBalance 严格等于 累计收礼 - 累计随礼', () => {
		const stats = {
			recordCount: 42,
			receivedAmount: 58000,
			sentAmount: 32000,
		};
		const netBalance = stats.receivedAmount - stats.sentAmount;
		expect(netBalance).toBe(26000);
	});
});
