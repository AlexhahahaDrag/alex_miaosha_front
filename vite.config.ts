import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

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
  plugins: [vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: 'less',
        }),
      ],
    }),
    createSvgIconsPlugin({
      iconDirs: [pathResolve('src/icons/menu'), pathResolve('src/icons/finance'), pathResolve('src/icons/soft'),pathResolve('src/icons')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',//body-last|body-first默认body-last
      customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#1890ff', // 全局主色
          '@link-color': '#1890ff', // 链接色
          '@success-color': '#52c41a', // 成功色
          '@warning-color': '#faad14', // 警告色
          '@error-color': '#f5222d', // 错误色
          '@font-size-base': '14px', // 主字号
          '@heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
          '@text-color': 'rgba(0, 0, 0, 0.65)', // 主文本色
          '@text-color-secondary': 'rgba(0, 0, 0, 0.45)', // 次文本色
          '@disabled-color': 'rgba(0, 0, 0, 0.25)', // 失效色
          '@border-radius-base': '4px', //组件浮层圆角
          '@border-color-base': '#d9d9d9', // 边框色
          '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // 浮层阴影
          '@border-color-split': '#1890ff',
        },
        javascriptEnabled: true,
      },
   },
  },
  resolve: {
    alias,
  },
  server: {
    // host: '10.10.20.38',
    // port: VITE_PORT,
    // port: 10000,
    // open: VITE_OPEN,
    https: false,
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
  },
})

