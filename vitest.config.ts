import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

/**
 * 单测独立配置：优先级高于 vite.config.mts，
 * 避免加载 Rolldown 构建插件链（unplugin 系列）拖慢/干扰纯逻辑单测。
 */
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		include: ['tests/unit/**/*.spec.ts'],
		environment: 'node',
	},
});
