import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin,
	normalizePermissionContext,
} from '@/utils/permission';

const admin = {
	permissionContext: {
		roleList: [{ roleCode: 'admin' }],
		orgInfo: { id: '10', orgName: '总公司' },
		permissionCodes: ['user:list'],
		buttonPermissionCodes: ['user:add'],
		superAdmin: false,
	},
	roleInfoVo: { roleCode: 'old', permissionList: [] },
	orgInfoVo: null,
};

const context = normalizePermissionContext(admin as any);
const permissionSet = buildPermissionSet(context);

if ('menuList' in context) {
	throw new Error('PermissionContext should not include menuList');
}

if (!canAccessPermission(permissionSet, 'user:add', false)) {
	throw new Error('buttonPermissionCodes should be part of permission checks');
}

if (isSuperAdmin(context)) {
	throw new Error('role list from permissionContext should be preferred over legacy roleInfoVo');
}
