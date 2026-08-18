# ⚡ Alex 管理系统前端

<div align="center">

![Logo](https://img.shields.io/badge/⚡-Alex_管理系统-ff6b6b?style=for-the-badge&logo=lightning&logoColor=white)

_🚀 基于 Vue 3 + TypeScript + Vite 构建的现代化后台管理系统_

[![Vue](https://img.shields.io/badge/Vue-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant_Design_Vue-0170FE?style=flat-square&logo=ant-design&logoColor=white)](https://antdv.com/)
[![Pinia](https://img.shields.io/badge/Pinia-FFD93D?style=flat-square&logo=vue.js&logoColor=black)](https://pinia.vuejs.org/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/AlexhahahaDrag/alex_miaosha_front?style=flat-square&logo=github)](https://github.com/AlexhahahaDrag/alex_miaosha_front/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AlexhahahaDrag/alex_miaosha_front?style=flat-square&logo=github)](https://github.com/AlexhahahaDrag/alex_miaosha_front/network)

</div>

## 📖 项目简介

Alex 管理系统前端是一个功能丰富的后台管理系统，面向业务运营与日常管理场景。采用最新的前端技术栈，提供了完整的管理端解决方案。

### ✨ 核心特性

- 🎯 **业务管理** - 面向运营与日常管理的业务能力支持
- 👥 **用户权限管理** - 基于角色的权限控制系统
- 💰 **财务管理** - 订单财务、账目记录、数据分析
- 📊 **数据可视化** - 基于 ECharts 的业务数据分析
- 🔐 **安全可靠** - 数据加密传输，Token 认证
- 📱 **响应式设计** - 完美适配各种设备尺寸
- ⚡ **性能优化** - 代码分割、懒加载、构建优化

## 🛠️ 技术栈

### 核心框架

```
🖼️ 前端框架    Vue (Composition API)
🔷 开发语言    TypeScript
⚡ 构建工具    Vite
🎨 UI 组件库   Ant Design Vue
```

### 状态管理与路由

```
🗃️ 状态管理    Pinia + 持久化存储
🧭 路由管理    Vue Router (动态路由)
🌐 HTTP 客户端 Axios
```

### 工具库与插件

```
📊 图表可视化   ECharts
🎨 样式预处理   Less + SASS
🔢 数值计算    BigNumber.js + Math.js
🔐 加密工具    Crypto-js
⭐ 粒子效果    TSParticles
🔧 自动导入    unplugin-vue-components
```

### 开发工具

```
📋 代码规范    ESLint + Prettier
🪝 Git 钩子   Husky + lint-staged
📦 包管理     Yarn
🔨 构建优化    Rollup + Terser + Compression
```

## 🏗️ 系统架构

```
alex_miaosha_front/
├── 🎯 src/
│   ├── 📡 api/           # API 接口层
│   ├── 🎨 assets/        # 静态资源
│   ├── 🧩 components/    # 全局组件
│   ├── ⚙️ config/        # 配置文件
│   ├── 🖼️ layout/        # 布局组件
│   ├── 🧭 router/        # 路由配置
│   ├── 🗃️ store/         # 状态管理
│   ├── 🎨 style/         # 全局样式
│   ├── 📝 types/         # 类型定义
│   ├── 🛠️ utils/         # 工具函数
│   └── 📄 views/         # 页面组件
├── 🐳 docker/           # Docker 配置
└── 📋 配置文件
```

## 🎯 功能模块

<table>
<tr>
<td width="50%">

### 👥 用户管理

- 🔐 用户认证与授权
- 👤 用户信息管理
- 🏢 组织架构管理
- 🎭 角色权限配置

### 📦 商品管理

- 🛍️ 商品信息管理
- 🏷️ 商品分类管理
- 🎨 商品属性管理
- 📊 库存批次管理

</td>
<td width="50%">

### 💰 财务管理

- 💳 订单财务统计
- 📊 财务数据分析
- 🎁 礼品卡管理
- 💰 账户记录查询

### 🧩 运营与业务管理

- 📈 数据看板与运营分析
- 🧾 订单处理与业务流转
- 🛒 购物车与交易相关管理
- ⚙️ 配置与字典管理

</td>
</tr>
</table>

## 🚀 快速开始

### 环境要求

```bash
📋 Node.js
📦 Yarn
```

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/AlexhahahaDrag/alex_miaosha_front.git

# 进入项目目录
cd alex_miaosha_front

# 安装依赖
yarn install
```

### 启动项目

```bash
# 开发环境
yarn dev

# 测试环境
yarn dev:test

# 生产环境预览
yarn dev:prod
```

### 构建部署

```bash
# 构建测试环境
yarn build:test

# 构建生产环境
yarn build:prod

# 预览构建结果
yarn preview
```

## 📸 项目截图

<div align="center">

### 🏠 Dashboard 主页

![Dashboard](https://via.placeholder.com/800x400/4FC08D/FFFFFF?text=Dashboard+主页)

### 📊 数据分析

![Analytics](https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=数据分析页面)

### 🛍️ 商品管理

![Products](https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=商品管理页面)

</div>

## 🔧 开发规范

### 代码风格

- ✅ 使用 Vue 3 Composition API
- ✅ TypeScript 严格模式
- ✅ ESLint + Prettier 格式化
- ✅ 组件自动导入
- ✅ 保存时自动格式化 (Format on Save)

### 命名规范

``typescript
// 组件文件
UserManager.vue

// 工具文件
request.ts

// 类型文件
userManagerTs.ts

// 页面目录
user-manager/

```

### 项目结构规范

``vue
<template>
	<!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入依赖
// defineProps / defineEmits
// 响应式数据
// 计算属性
// 方法定义
// 生命周期钩子
</script>

<style lang="less" scoped>
/* 组件样式 */
</style>
```

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t alex-miaosha-front .

# 运行容器
docker run -p 80:80 alex-miaosha-front
```

### Nginx 配置

项目包含了完整的 Nginx 配置文件，支持：

- ✅ 静态资源缓存
- ✅ Gzip 压缩
- ✅ SSL 支持
- ✅ 单页应用路由

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 贡献步骤

1. 🍴 Fork 本仓库
2. 🌿 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔃 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系我们

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-@AlexhahahaDrag-181717?style=flat-square&logo=github)](https://github.com/AlexhahahaDrag)
[![Email](https://img.shields.io/badge/Email-734663446@qq.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:734663446@qq.com)

</div>

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by Alex Team

</div>

---

## 礼尚往来管理

管理端已新增礼尚往来管理页面，统一放在 `src/views/finance/gift/` 下，页面顺序与菜单顺序保持一致：

1. 数据概览 - 礼尚往来管理：`dashboard`
2. 亲友管理 - 礼尚往来管理：`person`
3. 事由管理 - 礼尚往来管理：`event`
4. 礼金记录 - 礼尚往来管理：`record`
5. 统计报表 - 礼尚往来管理：`analysis`

页面复用现有管理端框架、Ant Design Vue、路由权限和按钮权限逻辑。礼金记录与回礼管理不拆成两个页面，统一在礼金记录列表中通过方向、回礼状态、待回金额列展示。

常用验证：

```bash
npm run build
```

Midscene 用例已补充到 `tests/midscene/rbac/cases/smoke.json`，可在具备运行环境后执行现有 smoke 脚本。
