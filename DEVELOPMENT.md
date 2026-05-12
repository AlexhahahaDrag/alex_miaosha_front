# Alex Miaosha Front - 开发与底层技术规范指南 (DEVELOPMENT.md)

> **定位声明**：本文件仅用于约束项目的**非业务级代码规范**、**公共组件/Hook 架构**、**Web UI 技术标准**与**工程侧约定**。业务流程、接口字段语义与业务状态流转请在业务文档中维护。

---

## 1. 全局 UI 架构与视觉标准（Web）

基于当前后台管理端（Ant Design Vue）实现，页面改造和新增需遵循以下基准：

- **布局层级（Layout Hierarchy）**：
  - 页面优先采用「筛选区 + 操作区 + 表格区 + 分页区」结构。
  - 内容容器统一使用卡片化分组，避免无边界的长内容堆叠。
  - 页面间距建议遵循 `16px / 24px` 递进，保证信息密度可控。

- **交互反馈（Interaction）**：
  - 关键操作（新增、编辑、删除、批量操作）必须提供明确反馈（`message`/`notification`/`modal`）。
  - 删除、批量变更等风险操作必须二次确认，不允许无确认直接提交。
  - 列表加载、空态、异常态应显式呈现，不使用静默失败。

- **可读性（Readability）**：
  - 表格字段命名与文案尽量语义化，避免缩写影响维护。
  - 统一中文文案，禁止乱码、半截模板表达式、拼接破损字符串进入主干代码。

---

## 2. 公共基础能力目录约定

通用能力按职责分层，避免在业务页面重复实现：

- **路由与权限**：`src/router/`、`src/utils/permission/`
- **状态管理（Pinia）**：`src/store/modules/`
- **通用组件**：`src/components/`、`src/layout/`
- **业务页面**：`src/views/`
- **工具方法**：`src/utils/`

约束：

- 可复用逻辑优先抽到公共层，不在单页复制粘贴。
- 跨模块复用时优先提炼类型与方法，再落地页面调用。

---

## 3. 公共 Hooks / 组合式能力规范

所有跨页面可复用的组合式逻辑统一收束在可维护的公共目录（如 `src/composables/`，若当前模块已有统一入口则按现有入口执行）。

- 分页、权限上下文、查询参数同步、表格选择状态等能力优先封装，不在每个页面手写重复模板。
- Hook 仅负责状态编排与流程抽象，不直接耦合具体业务文案。

---

## 4. Vue SFC 代码规范与结构约束

所有 Vue 3 组件（含重构文件）必须遵循固定结构，降低维护成本。

### 4.1 顶层标签顺序

1. `<template>`
2. `<script setup lang="ts">`
3. `<style scoped lang="less">`（如无需 less 可省略 `lang`，但样式默认 `scoped`）

### 4.2 Script 内部顺序

1. **Imports**：依赖导入
2. **Types / Constants**：类型、常量、静态配置
3. **Hooks**：`useRoute` / `useRouter` / `store` / composables 初始化
4. **State Variables**：`ref` / `reactive` / `computed` / `defineProps`
5. **Methods**：事件、请求、数据处理（`init`/`fetch` 放方法区靠后）
6. **Lifecycle**：`onMounted` 等生命周期
7. **Watchers**：`watch` / `watchEffect`
8. **Emits**：`defineEmits` 放在 script 区块末尾

---

## 5. TypeScript 与类型定义规范

- 禁止滥用 `Params`、`any` 作为兜底类型。
- 页面类型优先复用对应模块 `config` 中的公共类型定义。
- 当接口类型暂不明确时，可先保留原实现或使用 `unknown` + 显式收窄，不做错误“猜类型”。
- 复用优先级：模块 `config` 类型 > 公共类型 > 页面局部临时类型。

---

## 6. 架构与自动导入技术说明（本项目）

本项目集成 `unplugin-auto-import`、`unplugin-vue-components` 与 `unplugin-icons`，分析和编码时必须考虑以下事实：

- **隐式 API 依赖**：
  - `vue`、`vue-router`、`pinia` 常用 API 已全局自动导入。
  - 不要因“文件无 import”误判为“无依赖”。

- **组件自动解析**：
  - Ant Design Vue 组件通过 `AntDesignVueResolver` 自动注册。
  - `src/components`、`src/layout` 下组件可自动解析。

- **图标自动解析**：
  - 使用 `my-i-*` 前缀解析项目 SVG 图标集合（menu/finance/soft）。

- **声明文件约束**：
  - `components.d.ts`、`src/auto-imports.d.ts` 为生成文件，禁止手动修改。

---

## 7. API 调用与响应解构规范

- **统一使用解构响应**：

```ts
const { code, data, message } = await api();
```

- **推荐实践**：
  - 业务请求优先使用 `async/await`，减少多层 `then` 嵌套。
  - 列表查询、详情查询、提交操作统一按 `code/data/message` 解构处理。
  - 错误提示统一从 `message` 兜底，不直接吞错。

---

## 8. 开发同步协议（Sync Protocol）

> [!IMPORTANT]
> 当发生以下变更时，必须同步更新本文件：
>
> 1. 全局编码规范调整；
> 2. 公共组件/Hook 目录结构调整；
> 3. 自动导入、组件解析、图标解析策略变更；
> 4. API 调用范式变更（如统一响应结构、错误处理机制）。  
>    业务功能细节不在本文件扩写，保持“工程规范文档”定位。

---

## 9. 项目目录示例树（Front）

以下目录用于帮助新成员快速定位，不要求逐层一一存在，但职责划分需保持一致：

```text
alex_miaosha_front/
├── src/
│   ├── api/                  # 请求封装与接口入口
│   ├── assets/               # 静态资源（含自定义图标集合）
│   ├── components/           # 全局公共组件
│   ├── config/               # 全局配置
│   ├── layout/               # 布局组件
│   ├── router/               # 路由与动态路由装配
│   ├── store/
│   │   └── modules/          # Pinia 模块
│   ├── style/                # 全局样式
│   ├── types/                # 全局类型
│   ├── utils/                # 工具与权限相关逻辑
│   └── views/                # 业务页面
├── docs/                     # 文档（测试/规范等）
└── vite.config.mts           # Vite 与自动导入核心配置
```

---

## 10. 新增页面快速落地清单

新增或重构页面时，按以下顺序自检：

1. 是否遵循 SFC 结构顺序（template/script/style）与 script 内部声明顺序。
2. 是否优先复用模块 `config` 类型，避免 `Params` / 大面积 `any`。
3. API 是否统一使用 `const { code, data, message } = await api()`。
4. 是否处理加载态、空态、错误态与危险操作确认。
5. 是否符合自动导入约束（不误加重复 import，不手改生成声明文件）。

---

## 11. 礼尚往来管理页面落地规范

礼尚往来管理端页面统一放在 `src/views/finance/gift/`，并按以下目录组织：

```text
src/views/finance/gift/
├── api/
├── config/
├── dashboard/
├── person/
├── event/
├── record/
└── analysis/
```

### 页面规范

- 页面顺序必须与菜单顺序一致：数据概览、亲友管理、事由管理、礼金记录、统计报表。
- 管理端使用 Ant Design Vue，列表页采用搜索区 + 统计区 + 表格区 + Drawer/Modal 表单模式。
- 礼金记录与回礼管理不拆页面，通过 `direction`、`returnedFlag`、`pendingReturnAmount` 等列体现。
- 搜索区需要支持重置和折叠扩展；高频筛选项优先展示，低频筛选项放入展开区。
- 表格操作按钮必须走现有权限判断，按钮权限统一使用 `gift:view`、`gift:add`、`gift:edit`、`gift:delete`、`gift:export`。

### 代码规范

- 页面类型、枚举、表格列、筛选项优先放在 `config` 中复用。
- 接口统一放在 `api` 中，页面中使用 `const { code, data, message } = await api()` 方式解构。
- 不手动修改 `components.d.ts`、`src/auto-imports.d.ts` 等生成文件。
- 新增 Midscene/RBAC smoke 用例时，统一维护在 `tests/midscene/rbac/cases/smoke.json`。
