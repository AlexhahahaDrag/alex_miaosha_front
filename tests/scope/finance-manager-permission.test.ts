import { describe, expect, it } from 'vitest';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin,
	normalizePermissionContext,
} from '@/utils/permission';

describe('PC 端财务流水与属主权限矩阵契约', () => {
	const memberContext = normalizePermissionContext({
		roleInfoVo: {
			roleCode: 'family_member',
			roleName: '家庭成员',
			permissionList: [
				{ permissionCode: 'finance:financeManager:query' },
				{ permissionCode: 'finance:financeManager:add' },
				{ permissionCode: 'finance:financeManager:edit' },
				{ permissionCode: 'finance:financeManager:delete' },
				{ permissionCode: 'finance:financeManager:budget:view' },
			],
		},
	} as never);

	const adminContext = normalizePermissionContext({
		roleInfoVo: {
			roleCode: 'family_admin',
			roleName: '家庭管理员',
			permissionList: [
				{ permissionCode: 'finance:financeManager:query' },
				{ permissionCode: 'finance:financeManager:add' },
				{ permissionCode: 'finance:financeManager:edit' },
				{ permissionCode: 'finance:financeManager:delete' },
				{ permissionCode: 'finance:financeManager:budget:view' },
				{ permissionCode: 'finance:financeManager:budget:edit' },
			],
		},
	} as never);

	const superAdminContext = normalizePermissionContext({
		roleInfoVo: {
			roleCode: 'super_super',
			roleName: '超级管理员',
			permissionList: [],
		},
		permissionContext: {
			superAdmin: true,
			roleList: [{ roleCode: 'super_super' }],
		},
	} as never);

	it('基础按钮权限：家庭成员拥有查看/增/删/改，但无预算编辑权限', () => {
		const set = buildPermissionSet(memberContext);
		const superAdmin = isSuperAdmin(memberContext);

		expect(
			canAccessPermission(set, 'finance:financeManager:query', superAdmin),
		).toBe(true);
		expect(
			canAccessPermission(set, 'finance:financeManager:add', superAdmin),
		).toBe(true);
		expect(
			canAccessPermission(set, 'finance:financeManager:edit', superAdmin),
		).toBe(true);
		expect(
			canAccessPermission(set, 'finance:financeManager:delete', superAdmin),
		).toBe(true);
		expect(
			canAccessPermission(
				set,
				'finance:financeManager:budget:edit',
				superAdmin,
			),
		).toBe(false);
	});

	it('管理员与超管拥有预算管理全量编辑权限', () => {
		const adminSet = buildPermissionSet(adminContext);
		expect(
			canAccessPermission(
				adminSet,
				'finance:financeManager:budget:edit',
				isSuperAdmin(adminContext),
			),
		).toBe(true);

		const superSet = buildPermissionSet(superAdminContext);
		expect(
			canAccessPermission(
				superSet,
				'finance:financeManager:budget:edit',
				isSuperAdmin(superAdminContext),
			),
		).toBe(true);
	});

	it('流水属主权限判定：家庭成员仅可编辑/删除本人流水，他人流水只读', () => {
		const currentUserId = '1001';
		const myRecord = { id: '9001', belongTo: '1001' };
		const otherRecord = { id: '9002', belongTo: '1002' };

		const isFamilyAdminOrSuper = (ctx: typeof memberContext) => {
			if (isSuperAdmin(ctx)) return true;
			return ctx.roleList.some(
				(r) => r.roleCode === 'admin' || r.roleCode === 'family_admin',
			);
		};

		const canEditRecord = (
			item: { belongTo?: string },
			ctx: typeof memberContext,
		) => {
			const isSuper = isSuperAdmin(ctx);
			const set = buildPermissionSet(ctx);
			if (!canAccessPermission(set, 'finance:financeManager:edit', isSuper))
				return false;
			if (isFamilyAdminOrSuper(ctx)) return true;
			return String(item.belongTo || '') === String(currentUserId);
		};

		const canDeleteRecord = (
			item: { belongTo?: string },
			ctx: typeof memberContext,
		) => {
			const isSuper = isSuperAdmin(ctx);
			const set = buildPermissionSet(ctx);
			if (!canAccessPermission(set, 'finance:financeManager:delete', isSuper))
				return false;
			if (isFamilyAdminOrSuper(ctx)) return true;
			return String(item.belongTo || '') === String(currentUserId);
		};

		// 1. 家庭成员（仅可操作本人流水）
		expect(canEditRecord(myRecord, memberContext)).toBe(true);
		expect(canEditRecord(otherRecord, memberContext)).toBe(false);
		expect(canDeleteRecord(myRecord, memberContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, memberContext)).toBe(false);

		// 2. 家庭管理员（可操作全家流水）
		expect(canEditRecord(myRecord, adminContext)).toBe(true);
		expect(canEditRecord(otherRecord, adminContext)).toBe(true);
		expect(canDeleteRecord(myRecord, adminContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, adminContext)).toBe(true);

		// 3. 超级管理员（可操作全家流水）
		expect(canEditRecord(myRecord, superAdminContext)).toBe(true);
		expect(canEditRecord(otherRecord, superAdminContext)).toBe(true);
		expect(canDeleteRecord(myRecord, superAdminContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, superAdminContext)).toBe(true);
	});
});
