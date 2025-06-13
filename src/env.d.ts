/// <reference types="vite/client" />

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_MODE: string;
  readonly VITE_PORT: string;
  readonly VITE_APP_BASE_API: string;
  readonly VITE_APP_TITLE: string;

  // 其他自定义环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "particles.vue3";