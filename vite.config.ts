import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { getThemeVariables } from 'ant-design-vue/dist/theme';

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
        modifyVars: { ...getThemeVariables() },
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
    open: true,
    https: false,
    proxy: {
      // 选项写法
      "/api": {
        target: "http://123.249.83.33:30001",
        // target: "http://localhost:30001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    emptyOutDir: true,
  },
})

