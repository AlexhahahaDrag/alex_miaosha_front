/**
 * 为不走 Vite auto-import 的 vitest 环境注入常用 Vue API，
 * 以便可直接 import 依赖 ref/reactive 的业务 config。
 */
import { computed, reactive, ref, watch, watchEffect, toValue } from 'vue';
import { defineStore } from 'pinia';

Object.assign(globalThis, { ref, reactive, computed, watch, watchEffect, toValue, defineStore });

// Node 单测环境内存 localStorage 与 window 垫片
if (typeof globalThis.localStorage === 'undefined') {
	const storage = new Map<string, string>();
	const localStoragePolyfill = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, String(value)),
		removeItem: (key: string) => storage.delete(key),
		clear: () => storage.clear(),
		get length() {
			return storage.size;
		},
		key: (i: number) => Array.from(storage.keys())[i] ?? null,
	};
	Object.defineProperty(globalThis, 'localStorage', {
		value: localStoragePolyfill,
		writable: true,
	});
}

if (typeof (globalThis as any).window === 'undefined') {
	Object.defineProperty(globalThis, 'window', {
		value: {
			localStorage: (globalThis as any).localStorage,
			addEventListener: () => {},
			removeEventListener: () => {},
			location: { reload: () => {} },
		},
		writable: true,
	});
}
