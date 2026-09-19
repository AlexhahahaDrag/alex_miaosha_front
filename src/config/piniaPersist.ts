import type { PersistenceOptions } from 'pinia-plugin-persistedstate';

/**
 * @description pinia持久化参数配置
 * @param key
 */
export const piniaPersistConfig = (key: string, paths?: string[]) => {
	const persist: PersistenceOptions = {
		key,
		storage: window.localStorage,
		paths,
	};
	return persist;
};
