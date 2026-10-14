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
	return resolve(import.meta.dirname, './', dir);
};

//設置別名
const alias: Record<string, string> = {
	'@': pathResolve('src'),
	'@v': pathResolve('src/views'),
	'@u': pathResolve('src/utils'),
	'@r': pathResolve('src/router'),
};
const vendorLibs = ['axios', 'lodash-es', 'dayjs', 'bignumber.js', 'crypto-es'];

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
				// 自动扫描并导入业务组合式函数
				dirs: ['src/composables'],
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
				dirs: [
					'src/components',
					'src/layout',
					'src/views',
				],
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
		esbuild:
			isProduction ?
				{
					drop: ['console', 'debugger'],
				}
			:	undefined,
		build: {
			target: 'esnext',
			minify: isProduction,
			modulePreload: {
				polyfill: false,
			},
			rollupOptions: {
				output: {
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					manualChunks(id) {
						if (!id.includes('node_modules')) {
							return;
						}

						// 1. 核心响应式与路由状态框架
						if (
							/[\\/]node_modules[\\/](vue|@vue[\\/][^\\/]+|vue-router|pinia|pinia-plugin-persistedstate|@vueuse[\\/][^\\/]+)[\\/]/.test(
								id,
							)
						) {
							return 'framework';
						}

						// 2. Ant Design 图标库
						if (/[\\/]node_modules[\\/]@ant-design[\\/]icons-vue[\\/]/.test(id)) {
							return 'antd-icons';
						}

						// 3. Ant Design Vue 核心组件库与底层依赖
						if (
							/[\\/]node_modules[\\/](ant-design-vue|@ant-design[\\/]cssinjs|@ctrl[\\/]tinycolor|async-validator)[\\/]/.test(
								id,
							)
						) {
							return 'antd-vendor';
						}

						// 4. ECharts 图表库与 zrender 渲染引擎
						if (/[\\/]node_modules[\\/](echarts|zrender)[\\/]/.test(id)) {
							return 'echarts-vendor';
						}

						// 5. 粒子特效（按需大包，独立异步化）
						if (/[\\/]node_modules[\\/]@tsparticles[\\/]/.test(id)) {
							return 'particles-vendor';
						}

						// 6. 常用通用工具库（axios, lodash-es, dayjs, bignumber.js, crypto-es, nprogress）
						if (
							/[\\/]node_modules[\\/](axios|lodash-es|dayjs|bignumber\.js|crypto-es|nprogress)[\\/]/.test(
								id,
							)
						) {
							return 'utils-vendor';
						}
					},

				},
				treeshake: true,
			},
			outDir: env.VITE_OUTPUT_DIR || 'dist',
			reportCompressedSize: false,
			chunkSizeWarningLimit: 1200,
			sourcemap: false,
		},
		envPrefix: 'VITE_',
		// 优化依赖处理
		optimizeDeps: {
			include: [
				'vue',
				'vue-router',
				'pinia',
				'ant-design-vue',
				'ant-design-vue/es',
				'@ant-design/icons-vue',
				'dayjs',
				'axios',
				'lodash-es',
			],
			exclude: ['@tsparticles/slim'],
		},
	};
});
