import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import type { ConfigEnv, UserConfig } from 'vite';
import * as dotenv from 'dotenv';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import IconsResolver from 'unplugin-icons/resolver';

const pathResolve = (dir: string): any => {
	return resolve(__dirname, './', dir);
};

//設置別名
const alias: Record<string, string> = {
	'@': pathResolve('src'),
	'@v': pathResolve('src/views'),
	'@u': pathResolve('src/utils'),
	'@a': pathResolve('src/api'),
	'@r': pathResolve('src/router'),
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
	// 直接加载环境变量文件
	dotenv.config({ path: `.env.${mode}` });

	// 使用 Vite 的方式加载环境变量
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	console.log('Environment variables:', env);

	const isProduction = mode === 'production';
	const isBuild = command === 'build';

	return {
		define: {
			__VUE_OPTIONS_API__: JSON.stringify(true), // 启用或禁用 Vue 2 的 Options API
			__VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 生产环境下启用或禁用 Vue Devtools
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true), // 生产环境下，当水合错误发生时提供额外的信息
		},
		plugins: [
			vue(),
			AutoImport({
				// 指定需要自动导入的库
				imports: ['vue', 'vue-router', 'pinia'],
				// Vite特定的配置
				dts: 'src/auto-imports.d.ts', // 生成自动导入类型声明文件
				// 其他配置...
				eslintrc: {
					enabled: true,
				},
			}),
			Icons({
				autoInstall: false, // 自动安装图标库
				customCollections: {
					'my-menu-svg': FileSystemIconLoader(
						'src/assets/menu',
						(svg: any) => svg,
					),
					'my-finance-svg': FileSystemIconLoader(
						'src/assets/finance',
						(svg: any) => svg,
					),
					'my-soft-svg': FileSystemIconLoader(
						'src/assets/soft',
						(svg: any) => svg,
					),
				},
				transform(svg) {
					// apply fill to this icon on this collection
					return svg.replace(/^<svg /, '<svg fill="currentColor" ');
				},
				compiler: 'vue3',
			}),
			Components({
				resolvers: [
					AntDesignVueResolver({
						importStyle: 'less',
					}),
					IconsResolver({
						prefix: 'my-i',
						alias: {
							menu: 'my-menu-svg',
							finance: 'my-finance-svg',
							soft: 'my-soft-svg',
						},
						customCollections: ['my-menu-svg', 'my-finance-svg', 'my-soft-svg'],
					}),
				],
				dirs: ['src/views', 'src/layout', 'src/router'],
			}),
			// 只在开发环境或需要分析时启用 visualizer
			!isBuild && visualizer(),
			// 条件性启用压缩插件
			isProduction &&
				viteCompression({
					algorithm: 'gzip',
					threshold: 10240, // 只压缩大于10kb的文件
				}),
		].filter(Boolean),
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
				scss: {
					api: 'modern-compiler',
				},
			},
		},
		resolve: {
			alias,
		},
		server: {
			host: '0.0.0.0',
			port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 3000,
			open: env.VITE_OPEN === 'true',
			proxy: {
				'/api': {
					target: env.VITE_APP_BASE_API || 'http://120.48.156.47:30001',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		build: {
			// 使用 esbuild 替代 terser 来减少内存使用
			minify: isProduction ? 'esbuild' : false,
			// 增加构建内存限制
			rollupOptions: {
				// 限制并行处理的文件数
				maxParallelFileOps: 3,
				output: {
					//静态资源分类打包
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					// 优化代码分割策略，减少chunk数量
					manualChunks: {
						// 将 Vue 相关库打包在一起
						vue: ['vue', 'vue-router'],
						// 将 Ant Design Vue 单独打包
						'ant-design': ['ant-design-vue'],
						// 将工具库打包在一起
						utils: ['lodash', 'moment', 'dayjs', 'axios'],
						// 将图表库打包在一起
						charts: ['echarts'],
						// 将其他第三方库打包在一起
						vendor: ['crypto-js', 'mathjs', 'bignumber.js'],
					},
				},
				// 优化构建性能
				treeshake: {
					preset: 'smallest',
				},
			},
			outDir: env.VITE_OUTPUT_DIR || 'dist',
			// 增加构建超时时间
			chunkSizeWarningLimit: 1500,
			// 启用源码映射（可选，会增加构建时间和内存使用）
			sourcemap: false,
		},
		envPrefix: 'VITE_',
		// 优化依赖处理
		optimizeDeps: {
			include: ['vue', 'vue-router', 'ant-design-vue'],
			exclude: ['@tsparticles/slim'],
		},
	};
});
