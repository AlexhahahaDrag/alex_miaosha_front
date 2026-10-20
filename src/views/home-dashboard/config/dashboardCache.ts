/**
 * 工作台轻量级 SWR / 内存缓存层
 * 默认 TTL: 60 秒，避免用户在侧边栏高频切换路由时引发全量接口风暴
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 60 * 1000;

export function getDashboardCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
	const entry = cacheStore.get(key);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > ttlMs) {
		cacheStore.delete(key);
		return null;
	}
	return entry.data as T;
}

export function setDashboardCache<T>(key: string, data: T): void {
	cacheStore.set(key, { data, timestamp: Date.now() });
}

export function clearDashboardCache(key?: string): void {
	if (key) {
		cacheStore.delete(key);
	} else {
		cacheStore.clear();
	}
}
