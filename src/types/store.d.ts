import type { PermissionContext } from '@/utils/permission';

export interface UserInfo {
	id?: number;
	userId: string | number;
	username: string;
	nickName: string;
	avatar: string;
	desc?: string;
	homePath?: string;
	roles: RoleInfo[];
	avatarUrl?: string;
	orgName?: string;
	permissionContext?: Partial<PermissionContext>;
	roleInfoVoList?: Array<{ id?: string; roleName?: string; roleCode?: string }>;
}
