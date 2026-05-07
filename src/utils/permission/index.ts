import type { MenuInfo } from '@/store/modules/user/typing';

export interface PermissionRole {
	roleCode?: string;
	permissionList?: Array<{ permissionCode?: string }>;
}

export interface PermissionContext {
	orgInfo?: any;
	roleList: PermissionRole[];
	permissionCodes: string[];
	buttonPermissionCodes: string[];
	menuList: MenuInfo[];
	superAdmin: boolean;
}

export interface LoginAdminWithPermissionContext {
	permissionContext?: Partial<PermissionContext>;
	menuInfoVoList?: MenuInfo[];
	roleInfoVo?: PermissionRole;
	roleInfoVoList?: PermissionRole[];
	orgInfoVo?: any;
	permissionCodes?: string[];
	buttonPermissionCodes?: string[];
}

const uniq = (codes: Array<string | undefined | null>) =>
	Array.from(new Set(codes.filter((code): code is string => !!code)));

export const normalizePermissionContext = (
	admin?: LoginAdminWithPermissionContext | null,
): PermissionContext => {
	const permissionContext = admin?.permissionContext || {};
	const legacyRoleList = admin?.roleInfoVoList?.length
		? admin.roleInfoVoList
		: admin?.roleInfoVo
			? [admin.roleInfoVo]
			: [];

	const roleList = permissionContext.roleList?.length
		? permissionContext.roleList
		: legacyRoleList;
	const permissionCodes = uniq([
		...(permissionContext.permissionCodes || []),
		...(admin?.permissionCodes || []),
		...roleList.flatMap((role) =>
			(role.permissionList || []).map((permission) => permission.permissionCode),
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
		menuList: permissionContext.menuList?.length
			? permissionContext.menuList
			: admin?.menuInfoVoList || [],
		superAdmin:
			permissionContext.superAdmin === true ||
			roleList.some((role) => role?.roleCode === 'super_super'),
	};
};

export const buildPermissionSet = (context?: Partial<PermissionContext> | null) =>
	new Set<string>([
		...(context?.permissionCodes || []),
		...(context?.buttonPermissionCodes || []),
	]);

export const isSuperAdmin = (contextOrRole?: Partial<PermissionContext> | PermissionRole | null) => {
	if (!contextOrRole) return false;
	if ('superAdmin' in contextOrRole && contextOrRole.superAdmin === true) return true;
	if ('roleList' in contextOrRole) {
		return !!contextOrRole.roleList?.some((role) => role?.roleCode === 'super_super');
	}
	if ('roleCode' in contextOrRole) return contextOrRole.roleCode === 'super_super';
	return false;
};

export const canAccessPermission = (
	permissionSet: Set<string>,
	permissionCode?: string,
	superAdmin = false,
) => {
	if (superAdmin) return true;
	if (!permissionCode) return false;
	return permissionSet.has(permissionCode);
};

