import { defineStore } from 'pinia';
import { piniaPersistConfig } from '@/config/piniaPersist';

interface LoginState {
	loginInfo: string;
}

// 登录信息存储
export const useLoginStore = defineStore('app-login', {
	state: (): LoginState => ({
		loginInfo: '',
	}),

	getters: {
		getLoginInfo(): string {
			return this.loginInfo || '';
		},
	},
	actions: {
		setLoginInfo(info: string) {
			this.loginInfo = info;
		},
	},
	persist: piniaPersistConfig('app-login'),
});
