import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import type { ConfigEnv, UserConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import IconsResolver from 'unplugin-icons/resolver';

const pathResolve = (dir: string): string => {
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
const vendorLibs = ['axios', 'lodash-es', 'dayjs', 'bignumber.js', 'crypto-js'];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
	// 使用 Vite 的方式加载环境变量
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	const isProduction = mode === 'production';
	const isBuild = command === 'build';
	const isAnalyze = env.VITE_ANALYZE === 'true';

	return {
		define: {
			__VUE_OPTIONS_API__: JSON.stringify(true), // 启用或禁用 Vue 2 的 Options API
			__VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 生产环境下启用或禁用 Vue Devtools
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(!isProduction), // 生产环境关闭水合详情以减小体积
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
				dirs: ['src/components', 'src/layout'],
			}),
			// 仅在构建分析模式下启用，避免影响日常开发
			isBuild &&
				isAnalyze &&
				visualizer({
					filename: 'dist/stats.html',
					open: false,
					gzipSize: true,
					brotliSize: true,
				}),
			// 条件性启用压缩插件
			isProduction &&
				viteCompression({
					algorithm: 'gzip',
					threshold: 10240, // 只压缩大于10kb的文件
				}),
			isProduction &&
				viteCompression({
					algorithm: 'brotliCompress',
					ext: '.br',
					threshold: 10240,
				}),
		].filter(Boolean),
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
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
					target: env.VITE_APP_BASE_API || 'http://localhost:30001',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		build: {
			target: 'esnext',
			minify: isProduction,
			modulePreload: {
				polyfill: false,
			},
			// 增加构建内存限制
			rollupOptions: {
				output: {
					//静态资源分类打包
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					// 优化代码分割策略，减少chunk数量
					manualChunks(id) {
						if (id.includes('node_modules')) {
							// 核心框架
							if (
								id.includes('node_modules/vue') ||
								id.includes('node_modules/pinia') ||
								id.includes('node_modules/vue-router')
							) {
								return 'framework';
							}
							// UI 组件库
							if (
								id.includes('node_modules/ant-design-vue') ||
								id.includes('node_modules/@ant-design/icons-vue')
							) {
								return 'ui-antd';
							}
							// 图表库
							if (
								id.includes('node_modules/echarts') ||
								id.includes('node_modules/zrender')
							) {
								return 'charts';
							}
							// 常用工具库
							if (
								vendorLibs.some((lib) => id.includes(`node_modules/${lib}`))
							) {
								return 'utils';
							}
							return 'vendor';
						}
					},
				},
				// 优化构建性能
				treeshake: true,
			},
			outDir: env.VITE_OUTPUT_DIR || 'dist',
			// 减少构建阶段体积统计开销
			reportCompressedSize: false,
			// 增加构建超时时间
			chunkSizeWarningLimit: 1000,
			// 启用源码映射（可选，会增加构建时间和内存使用）
			sourcemap: false,
			// 移除 console/debugger
			terserOptions:
				isProduction ?
					{
						compress: {
							drop_console: true,
							drop_debugger: true,
						},
					}
				:	undefined,
		},
		envPrefix: 'VITE_',
		// 优化依赖处理
		optimizeDeps: {
			include: ['vue', 'vue-router', 'ant-design-vue', 'dayjs', 'axios'],
			exclude: ['@tsparticles/slim'],
		},
	};
});
