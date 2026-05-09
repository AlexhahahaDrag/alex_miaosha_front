import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import type { PermissionContext } from '@/utils/permission';

export interface UserState {
	id?: string;
	userInfo: UserManagerInfo;
	token?: string;
	roleList: RoleInfoData[];
	sessionTimeout?: boolean;
	lastUpdateTime: number;
	menuInfo: MenuInfoData[] | null;
	hasMenu: boolean;
	roleInfo: RoleInfoData[];
	orgInfo: OrgInfoData;
	permissionContext: PermissionContext | null;
}

export function getAuthInfo(type: string) {
	let infoStr = localStorage.getItem(type);
	if (infoStr) {
		return JSON.parse(infoStr);
	}
	return null;
}
