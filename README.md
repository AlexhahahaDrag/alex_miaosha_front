# ⚡ Alex 管理系统前端 (PC 端)

<div align="center">

![Logo](https://img.shields.io/badge/⚡-Alex_管理系统-ff6b6b?style=for-the-badge&logo=lightning&logoColor=white)

_🚀 基于 Vue 3 + TypeScript + Vite + Ant Design Vue 4 + Tailwind CSS 构建的现代化企业级后台系统_

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant_Design_Vue-4.x-0170FE?style=flat-square&logo=ant-design&logoColor=white)](https://antdv.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-3.x-FFD93D?style=flat-square&logo=vue.js&logoColor=black)](https://pinia.vuejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12.x-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/AlexhahahaDrag/alex_miaosha_front?style=flat-square&logo=github)](https://github.com/AlexhahahaDrag/alex_miaosha_front/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AlexhahahaDrag/alex_miaosha_front?style=flat-square&logo=github)](https://github.com/AlexhahahaDrag/alex_miaosha_front/network)

</div>

---

## 📖 项目简介

**Alex 管理系统前端 (PC 端)** 是一套面向企业数字化运营、电商秒杀、智能财务核算与权限管理的现代化微服务管理端中台。采用 Vue 3 Composition API、TypeScript 与 Ant Design Vue 4 构建，深度融入 **领域 AI 智能交互** 与 **暗黑主题模式**，提供高可用、易扩展的工程化体验。

### ✨ 核心特性

- 🤖 **领域 AI 深度交互**：集成记礼自然语言识别、优惠券智能策划、商品营销文案生成、角色权限智能匹配四大业务 AI 交互矩阵。
- 🎨 **暗黑模式与主题定制**：基于 Pinia Theme Store 与 Ant Design Vue 4 动态算法，支持白天/暗黑模式一键切换与主题色自定义。
- 👥 **精细化 RBAC 权限管控**：动态路由加载、菜单级别与按钮级别权限指令管控，配合组织机构数据权限上下文。
- 🎁 **完整礼尚往来财务体系**：亲友档案、事由配置、收礼/送礼/回礼双向流转闭环、往来账目对账及多维可视化报表。
- 📊 **高性能可视化看板**：基于 ECharts 6.x 按需加载与响应式自适应容器，打造多业务大屏与财务分析看板。
- 🧪 **AI 驱动的自动化测试**：集成 `@midscene/web` 与 `@playwright/test`，实现无侵入式智能 UI 冒烟测试与权限矩阵测试。
- ⚡ **极致工程化体验**：组件与 API 自动导入、Tailwind CSS 工具类支持、严格 TypeScript 类型推导与路由懒加载。

---

## 🛠️ 技术栈

### 核心框架与基础库

```
🖼️ 前端核心    Vue 3.5 (Composition API, <script setup>)
🔷 开发语言    TypeScript 5.x (严格模式)
⚡ 构建工具    Vite 6.x
🎨 UI 组件库   Ant Design Vue v4.2+
🌊 原子化 CSS  Tailwind CSS 3.x + Less
```

### 状态管理与网络通信

```
🗃️ 状态管理    Pinia 3.x + pinia-plugin-persistedstate (支持主题、用户态与多标签持久化)
🧭 路由架构    Vue Router 4.x (支持动态路由权限生成、面包屑、Keep-Alive 缓存)
🌐 HTTP 客户端 Axios 1.x (带统一请求拦截、Token 自动刷新与统一错误处理)
```

### 可视化、算法与工具库

```
📊 图表分析    ECharts 6.x (按需引入核心图表模块)
🔢 精确数值    BigNumber.js + Math.js (防 JavaScript 浮点数与大整数精度丢失)
🔐 编解码      Crypto-ES (敏感数据传输加解密)
⏳ 时间工具    Day.js (轻量化日期格式化与计算)
✨ 视觉特效    TSParticles (登录页粒子动效)
🤖 AI/E2E 测试 Midscene Web + Playwright
```

---

## 🏗️ 目录结构

```text
alex_miaosha_front/
├── 🎯 src/
│   ├── 📡 api/             # 统一 API 请求层 (按业务模块划分)
│   ├── 🎨 assets/          # 静态资源 (图片、SVG 图标等)
│   ├── 🧩 components/      # 全局公共业务组件 (图表卡片、通用表格、AI 弹窗等)
│   ├── ⚙️ config/          # 全局配置 (环境常量、系统配置、菜单配置)
│   ├── 🖼️ layout/          # 中台布局框架 (Header, Sidebar, TabsView, Content)
│   ├── 🧭 router/          # 路由配置与动态权限守卫
│   ├── 🗃️ store/           # Pinia 状态中心 (user, theme, tabs, permission)
│   ├── 🎨 style/           # 全局样式与 Tailwind 入口
│   ├── 📝 types/           # 全局 TypeScript 契约与类型定义
│   ├── 🛠️ utils/           # 通用工具库 (日期、加密、权限、防抖节流)
│   └── 📄 views/           # 页面业务组件
│       ├── dashboard/      # 首页看板与综合数据统计
│       ├── user/           # 用户、角色、组织机构与菜单配置
│       ├── product/        # 商品 SKU、分类与 AI 营销文案
│       ├── finance/        # 财务记账、优惠券与礼尚往来管理
│       └── login/          # 登录与鉴权交互
├── 🧪 tests/               # 自动化测试 (Midscene 冒烟与单元测试)
│   ├── midscene/           # AI 驱动的 UI 冒烟用例
│   └── playwright/         # 权限与业务流程端到端测试
├── 📜 scripts/             # 自动化测试与执行脚本
└── 📋 package.json         # 项目依赖与 pnpm 配置
```

---

## 🎯 业务功能模块

<table>
<tr>
<td width="50%" valign="top">

### 👥 用户与权限中心 (RBAC)

- 🔐 **认证中心**：JWT 令牌验证、登录过期自动拉取/刷新
- 👤 **用户管理**：账号管理、状态控制、关联组织分配
- 🏢 **组织机构**：多层级部门架构树管理与数据范围隔离
- 🎭 **角色管理**：功能菜单、操作按钮权限与数据权限分配
- 🤖 **AI 角色推荐**：输入岗位描述智能推荐匹配的权限集

### 🛍️ 商品与营销管理

- 📦 **商品管理**：商品 SKU、规格属性、分类与上下架
- 🏷️ **秒杀配置**：库存独立管控、抢购时间段配置
- 🎫 **优惠券管理**：满减/折扣券规则配置、发放与核销流水
- 🤖 **AI 营销助手**：商品卖点智能润色、优惠券营销策略 AI 策划

</td>
<td width="50%" valign="top">

### 🎁 礼尚往来财务中心

- 📊 **数据概览 (`dashboard`)**：收支对比、亲友往来排行榜、近一年资金流折线图
- 👥 **亲友档案 (`person`)**：往来亲友、关系类型（预设/自定义）、人情总览
- 🏷️ **事由管理 (`event`)**：婚礼、满月、乔迁等事件配置与历史台账
- 📝 **礼金记录 (`record`)**：收礼/送礼/回礼登记、待回金额跟踪
- 📈 **统计分析 (`analysis`)**：人情往来深度对账、年度/分类多维分析
- 🤖 **AI 礼金助手**：自然语言语音/文本解析一键录单、智能还礼金额四档测算

### ⚙️ 系统基础与配置

- 🌓 **主题配置**：白天/暗黑模式自适应切换、个性化主题色
- 📑 **标签导航**：多页签拖拽、持久化与快速右键关闭
- 🛡️ **安全脱敏**：前端 ID 字符串安全归一化处理（防 JS 精度丢失）

</td>
</tr>
</table>

---

## 🚀 快速开始

### 环境要求

- **Node.js**：`>= 18.0.0` (推荐 LTS 20.x)
- **包管理器**：**pnpm** `>= 9.0.0` (项目严格基于 `pnpm@12.4.2` 构建)

### 1. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/AlexhahahaDrag/alex_miaosha_front.git

# 进入目录
cd alex_miaosha_front

# 使用 pnpm 安装依赖
pnpm install
```

### 2. 启动开发环境

```bash
# 启动本地开发服务 (支持 HMR 热更新)
pnpm dev

# 以测试模式配置启动
pnpm test

# 生产环境模式预览启动
pnpm prod
```

### 3. 构建与产物预览

```bash
# 构建测试环境包
pnpm build:test

# 构建生产环境标准包
pnpm build:prod

# 本地预览打包产物
pnpm preview
```

---

## 🧪 自动化测试套件

项目引入了 **Midscene + Playwright** 现代化 AI 自动化测试方案，涵盖端到端权限矩阵与核心业务冒烟：

```bash
# 运行单元测试
pnpm test:unit

# 运行领域 AI (Domain AI) 自动化冒烟测试
pnpm test:ai:smoke

# 运行 RBAC 角色与权限矩阵冒烟测试
pnpm test:rbac:smoke:local

# 运行 Midscene 全量 UI 冒烟测试
pnpm test:midscene:local

# 代码规范与类型检查
pnpm lint
pnpm type-check
```

---

## 🔧 开发规约与核心范式

1. **ID 安全规约**：
   - 所有的主键与关联 ID 在前后端交互时严格保持为 `string` 字符串类型，禁止转为 JavaScript `number`，避免低位截断变成 `00`。
2. **API 请求解构**：
   - 统一采用对象解构风格：`const { code, data, message } = await api()`，禁止链式 `res.code` 读取。
3. **按需与自动导入**：
   - 已配置 `unplugin-auto-import`，常用 API（`ref`, `computed`, `watch` 等）与 Ant Design Vue 组件严禁在页面内手动冗余 `import`。
4. **主题适配规范**：
   - 自定义组件样式优先使用 Tailwind CSS 类名或引入主题 Less 变量，确保白天与暗黑模式（Dark Mode）切换时色彩层次自适应。

---

## 🔗 相关项目

- 📦 **后端微服务仓库**：[AlexhahahaDrag/alex_miaosha](https://github.com/AlexhahahaDrag/alex_miaosha)
- 📱 **移动端前端仓库**：[AlexhahahaDrag/alex_miaosha_mobile](https://github.com/AlexhahahaDrag/alex_miaosha_mobile)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详情参见 [LICENSE](LICENSE)。
