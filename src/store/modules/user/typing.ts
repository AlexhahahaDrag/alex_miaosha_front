import type { Nullable } from '@/types/global';
import type { UserInfo } from '@/types/store';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { PermissionContext } from '@/utils/permission';

export interface UserState {
	id?: string;
	userInfo: Nullable<UserInfo>;
	token?: string;
	roleList: RoleInfoData[];
	sessionTimeout?: boolean;
	lastUpdateTime: number;
	menuInfo: MenuInfo[] | null;
	hasMenu: boolean;
	roleInfo: RoleInfoData;
	orgInfo: any;
	permissionContext: PermissionContext | null;
}

export interface MenuInfo {
	id: string;
	name: string;
	path: string;
	title: string;
	component: string;
	redirect: string;
	icon: string;
	hideInMenu: string;
	showInHome: string;
	parentId: string;
	summary: string;
	status: string;
	children: MenuInfo[];
	permissionCode: string;
}

export function getAuthInfo(type: string) {
	let infoStr = localStorage.getItem(type);
	if (infoStr) {
		return JSON.parse(infoStr);
	}
	return null;
}
