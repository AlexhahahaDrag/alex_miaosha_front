import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import terser from '@rollup/plugin-terser';
import { splitVendorChunkPlugin } from 'vite';

const pathResolve = (dir: string): any => {
  return resolve(__dirname, "./", dir);
};

//設置別名
const alias: Record<string, string> = {
  "@": pathResolve("src"),
  "@v": pathResolve("src/views"),
  "@u": pathResolve("src/utils"),
  "@a": pathResolve("src/api"),
  "@r": pathResolve("src/router"),
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
      dirs: ['src/views', 'src/layout', 'src/router',],
    }),
    createSvgIconsPlugin({
      iconDirs: [pathResolve('src/icons/menu'), pathResolve('src/icons/finance'), pathResolve('src/icons/soft'), pathResolve('src/icons')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',//body-last|body-first默认body-last
      customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
    }),
    splitVendorChunkPlugin(),
  ],
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
    // port: VITE_PORT,
    port: 3000,
    open: true,
    proxy: {
      // 选项写法
      "/api": {
        // target: "http://123.249.83.33:30001",
        target: "http://localhost:30001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    emptyOutDir: true,
    minify: true,
    target: 'es2015',
    rollupOptions: {
      plugins: [
        terser({
          format: {
            comments: false, // 移除注释
          },
          compress: {
            drop_console: true, // 移除console
            drop_debugger: true, // 移除debugger
            // pure_funcs: ['console.log'], // 移除特定的函数调用
          },
          // mangle: {
          //   properties: {
          //     // 压缩属性名（谨慎使用，确保不会压缩到不应该压缩的属性名）
          //     // regex: /^_/ // 仅作为示例，压缩所有下划线开头的属性名
          //   },
          // },
          // 启用更高级的压缩选项
          // module: true,
          // toplevel: true, // 最高级别的变量和函数名也压缩
        }),
      ]
    }
  },
})

