import { loginApi } from '@/views/login/api';
import { getAuthInfo } from './typing';
import type { MenuInfo } from './typing';
import type { LoginParams } from '@/views/login/config';
import { piniaPersistConfig } from '@/config/piniaPersist';
import { message } from 'ant-design-vue';
import { refreshRouter } from '@/router';
import type { UserInfo } from '@/types/store';
import type { RoleInfoData } from '@/views/user/roleInfo/roleInfo';

export const useUserStore = defineStore(
	'app-user',
	() => {
		const userInfo = ref<UserInfo | null>(null);
		const token = ref<string | undefined>(undefined);
		const roleList = ref<any[]>([]);
		const sessionTimeout = ref(false);
		const lastUpdateTime = ref(0);
		const menuInfo = ref<MenuInfo[] | null>(null);
		const hasMenu = ref(false);
		const orgInfo = ref<any>(null);
		const roleInfo = ref<RoleInfoData | null>(null);

		const getUserInfo = computed((): UserInfo => {
			return userInfo.value || getAuthInfo('userInfo');
		});

		const getToken = computed((): string => {
			const localStorage = window.localStorage;
			return token.value || localStorage.getItem('token') || '';
		});

		const getMenuInfo = computed((): MenuInfo[] | null => {
			return menuInfo.value || getAuthInfo('menuInfo');
		});

		const getSessionTimeout = computed((): boolean => {
			return !!sessionTimeout.value;
		});

		const getLastUpdateTime = computed((): number => {
			return lastUpdateTime.value;
		});

		const getRouteStatus = computed((): boolean => {
			return hasMenu.value || getAuthInfo('hasRoute') === 'true';
		});

		const getRoleInfo = computed((): RoleInfoData => {
			return roleInfo.value || getAuthInfo('roleInfo');
		});

		const getOrgInfo = computed((): any => {
			return orgInfo.value || getAuthInfo('orgInfo');
		});

		function setToken(info: string | undefined) {
			token.value = info ? info : '';
			localStorage.setItem('token', token.value);
		}

		function setMenuInfo(info: MenuInfo[]) {
			menuInfo.value = info ? info : null;
			localStorage.setItem('menuInfo', JSON.stringify(menuInfo.value));
		}

		function changeRouteStatus(state: any) {
			hasMenu.value = state;
			localStorage.setItem('hasRoute', state);
		}

		//设置用户信息
		function setUserInfo(admin: any) {
			userInfo.value = admin;
			localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
		}

		function setRoleInfo(info: any) {
			roleInfo.value = info;
			localStorage.setItem('roleInfo', JSON.stringify(roleInfo.value));
		}

		function setOrgInfo(info: any) {
			orgInfo.value = info;
			localStorage.setItem('orgInfo', JSON.stringify(orgInfo.value));
		}

		async function login(
			params: LoginParams & {
				goHome?: boolean;
			},
		) {
			try {
				const { ...loginParams } = params;
				const {
					code,
					data,
					message: messageInfo,
				} = await loginApi(loginParams);
				if (code == '200') {
					const { token: tokenVal, admin } = data;
					// save userInfo
					setUserInfo(admin);
					// save token
					setToken(tokenVal);
					setMenuInfo(admin.menuInfoVoList);
					setRoleInfo(admin.roleInfoVo);
					setOrgInfo(admin.orgInfoVo);
					changeRouteStatus(false);
					refreshRouter();
					return admin;
				} else {
					message.error(messageInfo || '删除失败！', 3);
				}
			} catch (error: unknown) {
				console.error('错误信息：', error);
				message.error(
					'系统错误，请联系管理员！' + (error as Error).message || '未知错误',
					3,
				);
				return Promise.reject(error);
			}
		}

		return {
			userInfo,
			token,
			roleList,
			sessionTimeout,
			lastUpdateTime,
			menuInfo,
			hasMenu,
			orgInfo,
			roleInfo,
			getUserInfo,
			getToken,
			getMenuInfo,
			getSessionTimeout,
			getLastUpdateTime,
			getRouteStatus,
			getRoleInfo,
			getOrgInfo,
			setToken,
			setMenuInfo,
			changeRouteStatus,
			setUserInfo,
			setRoleInfo,
			setOrgInfo,
			login,
		};
	},
	{
		persist: piniaPersistConfig('app-user'),
	},
);
