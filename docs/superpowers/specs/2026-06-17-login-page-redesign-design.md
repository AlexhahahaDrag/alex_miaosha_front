# 登录页企业级视觉升级设计

## 1. 背景与目标

当前 PC 端登录页（`src/views/login/index.vue`）功能可用，但品牌文案、表单视觉与整体产品感偏脚手架风格。目标是在**不改动左侧卡通人物**、**不引入 vue-i18n** 的前提下，将登录页提升至「企业级通用管理平台」观感。

### 1.1 成功标准

- 页顶与左侧具备清晰品牌叙事（Alex Platform）
- 登录区表单全中文，主按钮与 focus 态使用 Ant Design 企业蓝
- 背景由纯黑粒子升级为 Aurora 渐变 + 弱化粒子
- 页脚展示版权与版本号
- 登录业务逻辑、左侧人物交互逻辑零回归

### 1.2 明确不做

- vue-i18n 及语言切换 UI
- 替换或删除左侧卡通人物（含鼠标追踪、眨眼、输入 focus 联动）
- 左侧 ECharts 动态图表
- 大范围组件拆分（首版仅改 `index.vue` + `config/index.ts`）

## 2. 约束与前提

| 约束     | 说明                                                              |
| -------- | ----------------------------------------------------------------- |
| 左侧人物 | `character-container` 及内部 DOM/Script/Character 样式 **零改动** |
| 文案语言 | 全中文（表单 label、placeholder、按钮、页脚）                     |
| 粒子     | **保留并弱化** tsparticles，背景色透明以透出 Aurora               |
| 技术栈   | Vue 3 + Ant Design Vue 4 + Less，沿用现有登录 API/Store           |
| 响应式   | `<992px` 继续隐藏左侧视觉区，页顶品牌与页脚保留                   |

## 3. 布局结构

```text
┌──────────────────────────────────────────────────┐
│  [A]  Alex Platform                              │  页顶品牌（卡片外）
│      Enterprise Management System                │
├──────────────────────────┬───────────────────────┤
│  左侧文案叠加层           │                       │
│  Alex Platform           │     用户登录           │
│  统一管理·统一权限·统一数据 │     企业级管理平台      │
│  ✓ 用户管理              │     用户名 / 密码       │
│  ✓ 数据分析              │     [ 登 录 ]          │
│  ✓ 工作流引擎            │                       │
│      (卡通人物原样)       │                       │
├──────────────────────────┴───────────────────────┤
│  © 2026 Alex Technology              v0.1.0      │
└──────────────────────────────────────────────────┘
         flex 1.65 : 1  (≈ 62% : 38%)
```

### 3.1 容器尺寸

- `.login-wrapper`：Aurora 全屏背景；`flex-direction: column` 以容纳页顶品牌 + 卡片 + 页脚
- `.login-container`：`max-width: 1400px`，`min-height: 680px`，`height: 75vh`
- `.login-visual`：`flex: 1.65`
- `.login-content`：`flex: 1`

## 4. 视觉规范

### 4.1 设计 Token

| Token                  | 值                                                   |
| ---------------------- | ---------------------------------------------------- |
| `@login-primary`       | `#1677ff`                                            |
| `@login-primary-hover` | `#4096ff`                                            |
| `@login-radius`        | `10px`                                               |
| `@login-btn-height`    | `48px`                                               |
| Aurora 底色            | `linear-gradient(135deg, #0f172a, #111827, #1e293b)` |
| 文案 muted             | `rgba(255,255,255,.55)`                              |

### 4.2 页顶品牌区

- Logo：CSS 方块字母 **「A」**，渐变 `#1677ff → #4096ff`，圆角 8px
- 主标题：**Alex Platform**
- 副标题：**Enterprise Management System**（英文副标保留产品国际化气质，非 i18n 切换）

### 4.3 左侧文案叠加层（新增 `.login-visual__copy`）

绝对定位 `top: 48px; left: 48px; z-index: 3`，内容：

```text
Alex Platform
统一管理 · 统一权限 · 统一数据

✓ 用户管理
✓ 数据分析
✓ 工作流引擎
```

- 图标：`CheckCircleOutlined`
- 不修改 `.character-container` 及子元素
- 微调 `.visual-gradient`：顶部略加深以保证文案可读

### 4.4 背景：Aurora + 弱化粒子

**Aurora（`.login-wrapper`）：**

```css
background:
	radial-gradient(
		ellipse 80% 50% at 20% 40%,
		rgba(22, 119, 255, 0.12),
		transparent
	),
	radial-gradient(
		ellipse 60% 40% at 80% 60%,
		rgba(64, 150, 255, 0.1),
		transparent
	),
	linear-gradient(135deg, #0f172a, #111827, #1e293b);
```

**粒子（`config/index.ts` → `options`）：**

| 参数                      | 现值      | 目标                                |
| ------------------------- | --------- | ----------------------------------- |
| `background.color.value`  | `#000`    | `transparent`                       |
| `particles.number.value`  | `80`      | `40`                                |
| `particles.links.opacity` | `0.5`     | `0.25`                              |
| `particles.opacity.value` | `0.5`     | `0.3`                               |
| `particles.links.color`   | `#ffffff` | `rgba(255,255,255,.4)` 或 `#64748b` |

### 4.5 右侧登录表单

| 元素        | 文案/样式                                                             |
| ----------- | --------------------------------------------------------------------- |
| 标题        | 用户登录                                                              |
| 副标题      | 企业级管理平台                                                        |
| Label       | 用户名 / 密码                                                         |
| Placeholder | 请输入用户名 / 请输入密码                                             |
| 记住我      | 30 天内免登录                                                         |
| 忘记密码    | 忘记密码？（占位，无后端）                                            |
| 按钮        | 登 录；`#1677ff` / hover `#4096ff`；高 48px；圆角 10px                |
| Input focus | `border-color: #1677ff`；`box-shadow: 0 0 0 2px rgba(22,119,255,.15)` |
| 链接色      | `#1677ff`（替换 `#7c4dff`）                                           |

### 4.6 页脚

```text
© 2026 Alex Technology                    Version 0.1.0
```

- 版本号读取 `package.json` 的 `version`（构建时可 `import pkg from '../../../package.json'` 或使用常量 `0.1.0`）
- 样式：`rgba(255,255,255,.35)`，`position: absolute; bottom: 24px`

## 5. 文件改动范围

| 文件                              | 改动                                                                      |
| --------------------------------- | ------------------------------------------------------------------------- |
| `src/views/login/index.vue`       | 模板（页顶、左侧 copy、页脚、中文表单）；样式（布局、Aurora、表单、页脚） |
| `src/views/login/config/index.ts` | 弱化 `options` 粒子参数                                                   |

**不改动：** 登录 API、Store、路由、人物 Script 逻辑块。

## 6. 验证

- `npm run dev` 目视检查桌面与 `<992px` 移动端
- `npm run type-check`
- `npm run lint`
- 手动：登录成功跳转、`Remember me` 回填、Enter 提交、人物 eye focus 联动仍正常

## 7. 预期评分

| 维度   | 现况 | 目标 |
| ------ | ---- | ---- |
| UI     | 7    | 8    |
| 专业度 | 6.5  | 8    |
| 品牌感 | 5    | 7.5  |
| 产品感 | 6    | 7.5  |

## 8. 审批记录

- 2026-06-17：确认保留弱化粒子、全中文、左侧人物不修改、不做 vue-i18n
