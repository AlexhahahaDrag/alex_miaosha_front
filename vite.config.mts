import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

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
export default defineConfig({
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
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: 'less',
        }),
      ],
      dirs: ['src/views', 'src/layout', 'src/router'],
    }),
    createSvgIconsPlugin({
      iconDirs: [
        pathResolve('src/icons/menu'),
        pathResolve('src/icons/finance'),
        pathResolve('src/icons/soft'),
        pathResolve('src/icons'),
      ],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last', //body-last|body-first默认body-last
      customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
    }),
    visualizer(),
    viteCompression(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
      scss: {
        api: 'modern-compiler', // or 'modern'
      },
    },
  },
  resolve: {
    alias,
  },
  server: {
    host: '0.0.0.0',
    // port: VITE_PORT,
    port: 3000,
    open: true,
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://localhost:30001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        //静态资源分类打包
        chunkFileNames: 'static/js/chunkName-[hash].js',
        entryFileNames: 'static/js/chunkName-[hash].js',
        assetFileNames: 'static/[ext]/chunkName-[hash].[ext]',
        manualChunks(id: string) {
          //静态资源分拆打包
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
});
