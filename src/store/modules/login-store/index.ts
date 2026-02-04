import { piniaPersistConfig } from '@/config/piniaPersist';

interface LoginState {
	loginInfo: string;
}

// 登录信息存储
export const useLoginStore = defineStore(
	'app-login',
	() => {
		const loginInfo = ref<string>('');

		const getLoginInfo = computed((): string => {
			return loginInfo.value || '';
		});

		function setLoginInfo(info: string) {
			loginInfo.value = info;
		}

		return {
			loginInfo,
			getLoginInfo,
			setLoginInfo,
		};
	},
	{
		persist: piniaPersistConfig('app-login'),
	},
);
