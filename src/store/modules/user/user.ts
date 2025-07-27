import { loginApi } from '@/api/user/login';
import { defineStore } from 'pinia';
import { getAuthInfo } from './typing';
import type { MenuInfo, UserState } from './typing';
import type { LoginParams } from '@/api/user/login';
import { piniaPersistConfig } from '@/config/piniaPersist';
import { message } from 'ant-design-vue';
import { refreshRouter } from '@/router';

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useUserStore = defineStore('app-user', {
	state: (): UserState => ({
		userInfo: null,
		token: undefined,
		roleList: [],
		sessionTimeout: false,
		lastUpdateTime: 0,
		menuInfo: null,
		hasMenu: false,
		orgInfo: null,
		roleInfo: null,
	}),

	getters: {
		getUserInfo(): any {
			return this.userInfo || getAuthInfo('userInfo');
		},
		getToken(): string {
			let localStorage = window.localStorage;
			return this.token || localStorage.getItem('token') || '';
		},
		getMenuInfo(): MenuInfo[] | null {
			return this.menuInfo || getAuthInfo('menuInfo');
		},
		getSessionTimeout(): boolean {
			return !!this.sessionTimeout;
		},
		getLastUpdateTime(): number {
			return this.lastUpdateTime;
		},
		getRouteStatus(): Boolean {
			return this.hasMenu || localStorage.getItem('hasRoute') === 'true';
		},
		getRoleInfo(): any {
			return this.roleInfo || getAuthInfo('roleInfo');
		},
		getOrgInfo(): any {
			return this.orgInfo || getAuthInfo('orgInfo');
		},
	},
	actions: {
		setToken(info: string | undefined) {
			this.token = info ? info : '';
			localStorage.setItem('token', this.token);
		},
		setMenuInfo(info: MenuInfo[]) {
			this.menuInfo = info ? info : null;
			localStorage.setItem('menuInfo', JSON.stringify(this.menuInfo));
		},
		changeRouteStatus(state: any) {
			this.hasMenu = state;
			localStorage.setItem('hasRoute', state);
		},
		//设置用户信息
		setUserInfo(admin: any) {
			this.userInfo = admin;
			localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
		},
		setRoleInfo(roleInfo: any) {
			this.roleInfo = roleInfo;
			localStorage.setItem('roleInfo', JSON.stringify(this.roleInfo));
		},
		setOrgInfo(orgInfo: any) {
			this.orgInfo = orgInfo;
			localStorage.setItem('orgInfo', JSON.stringify(this.orgInfo));
		},
		async login(params: LoginParams) {
			try {
				const data = await loginApi(params);
				if (data.code == '200') {
					const { token, admin } = data.data;
					// save userInfo
					this.setUserInfo(admin);
					// save token
					this.setToken(token);
					this.setMenuInfo(admin.menuInfoVoList);
					this.setRoleInfo(admin.roleInfoVo);
					this.setOrgInfo(admin.orgInfoVo);
					this.changeRouteStatus(false);
					refreshRouter();
					return admin;
				} else {
					message.error((data && data.message) || '删除失败！', 3);
				}
			} catch (error: any) {
				message.error(error?.message || '系统错误，请联系管理员！', 3);
				return Promise.reject(error);
			}
		},
	},
	persist: piniaPersistConfig('app-user'),
});
