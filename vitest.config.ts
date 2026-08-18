import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * 单测独立配置：不加载 vite.config 的 Rolldown/插件链，
 * 避免 vitest 与 Vite 8 运行时冲突。
 */
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// 既有 permission-context 为裸断言脚本，非 vitest describe；排除以免误跑
		exclude: ['tests/permission/**'],
		setupFiles: ['tests/setup.ts'],
	},
});
