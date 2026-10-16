import type { OrgInfoData } from '@/views/user/orgInfo/config';

export interface PermissionRole {
	roleCode?: string;
	roleName?: string;
	permissionList?: Array<{ permissionCode?: string }>;
}

export interface PermissionContext {
	orgInfo?: OrgInfoData | null;
	roleList: PermissionRole[];
	permissionCodes: string[];
	buttonPermissionCodes: string[];
	superAdmin: boolean;
}

export interface LoginAdminWithPermissionContext {
	permissionContext?: Partial<PermissionContext>;
	roleInfoVo?: PermissionRole;
	roleInfoVoList?: PermissionRole[];
	orgInfoVo?: OrgInfoData | null;
	permissionCodes?: string[];
	buttonPermissionCodes?: string[];
}

const uniq = (codes: Array<string | undefined | null>) =>
	Array.from(new Set(codes.filter((code): code is string => !!code)));

export const normalizePermissionContext = (
	admin?: LoginAdminWithPermissionContext | null,
): PermissionContext => {
	const permissionContext = admin?.permissionContext || {};
	const legacyRoleList =
		admin?.roleInfoVoList?.length ? admin.roleInfoVoList
			: admin?.roleInfoVo ? [admin.roleInfoVo]
				: [];

	const roleList =
		permissionContext.roleList?.length ?
			permissionContext.roleList
			:	legacyRoleList;
	const permissionCodes = uniq([
		...(permissionContext.permissionCodes || []),
		...(admin?.permissionCodes || []),
		...roleList.flatMap((role) =>
			(role.permissionList || []).map(
				(permission) => permission.permissionCode,
			),
		),
	]);
	const buttonPermissionCodes = uniq([
		...(permissionContext.buttonPermissionCodes || []),
		...(admin?.buttonPermissionCodes || []),
	]);

	return {
		orgInfo: permissionContext.orgInfo || admin?.orgInfoVo || null,
		roleList,
		permissionCodes,
		buttonPermissionCodes,
		superAdmin:
			permissionContext.superAdmin === true ||
			roleList.some((role) => role?.roleCode === 'super_super'),
	};
};

export const buildPermissionSet = (
	context?: Partial<PermissionContext> | null,
) =>
	new Set<string>([
		...(context?.permissionCodes || []),
		...(context?.buttonPermissionCodes || []),
	]);

export const isSuperAdmin = (
	contextOrRole?: Partial<PermissionContext> | PermissionRole | null,
): boolean => {
	if (!contextOrRole) return false;
	if ('superAdmin' in contextOrRole && contextOrRole.superAdmin === true)
		return true;
	if ('roleList' in contextOrRole && Array.isArray(contextOrRole.roleList)) {
		return (contextOrRole.roleList as PermissionRole[]).some(
			(role: PermissionRole) => role?.roleCode === 'super_super',
		);
	}
	if (
		'roleCode' in contextOrRole &&
		typeof contextOrRole.roleCode === 'string'
	)
		return contextOrRole.roleCode === 'super_super';
	return false;
};

export const canAccessPermission = (
	permissionSet: Set<string>,
	permissionCode?: string,
	superAdmin = false,
) => {
	if (superAdmin) return true;
	if (!permissionCode) return false;
	if (permissionSet.has(permissionCode)) return true;
	// 兼容支持 selfFinance 与 finance 前缀平滑互转
	if (permissionCode.startsWith('selfFinance:')) {
		const legacyCode = permissionCode.replace('selfFinance:', 'finance:');
		if (permissionSet.has(legacyCode)) return true;
	} else if (permissionCode.startsWith('finance:')) {
		const newCode = permissionCode.replace('finance:', 'selfFinance:');
		if (permissionSet.has(newCode)) return true;
	}
	return false;
};
