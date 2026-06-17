# 登录页企业级视觉升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改动左侧卡通人物、不引入 i18n 的前提下，升级登录页品牌包装、Aurora 背景、弱化粒子、全中文表单与页脚。

**Architecture:** 单文件为主改造 `src/views/login/index.vue`（新增页顶品牌、左侧文案叠加层、页脚；调整 flex 比例与表单样式）；粒子参数在 `config/index.ts` 弱化。人物相关 template/script/style 块保持不动。

**Tech Stack:** Vue 3 SFC、Ant Design Vue 4、Less、tsparticles（保留）

**Spec:** `docs/superpowers/specs/2026-06-17-login-page-redesign-design.md`

---

## File Map

| 文件                              | 职责                                   |
| --------------------------------- | -------------------------------------- |
| `src/views/login/index.vue`       | 页面结构、品牌层、表单中文、样式 token |
| `src/views/login/config/index.ts` | 粒子 options 弱化                      |

---

### Task 1: 弱化 tsparticles 配置

**Files:**

- Modify: `src/views/login/config/index.ts`

- [ ] **Step 1: 更新 `options` 粒子参数**

```typescript
export const options = {
	fullScreen: {
		enable: true,
		zIndex: -1,
	},
	background: {
		color: {
			value: 'transparent',
		},
	},
	// ... interactivity 保持不变 ...
	particles: {
		color: {
			value: '#94a3b8',
		},
		links: {
			color: '#64748b',
			distance: 150,
			enable: true,
			opacity: 0.25,
			width: 1,
		},
		// collisions、move 保持不变
		number: {
			density: {
				enable: true,
				area: 800,
			},
			value: 40,
		},
		opacity: {
			value: 0.3,
		},
		// shape、size 保持不变
	},
	detectRetina: true,
};
```

- [ ] **Step 2: 运行 type-check**

Run: `npm run type-check`
Expected: 无新增错误

---

### Task 2: Aurora 背景与页级布局骨架

**Files:**

- Modify: `src/views/login/index.vue`（template 顶部 + style `.login-wrapper`）

- [ ] **Step 1: 调整 `.login-wrapper` 为 column 布局并加 Aurora**

在 `<template>` 中，`login-wrapper` 内、`vue-particles` 之后、`login-container` 之前插入页顶品牌与页脚占位；同时将 wrapper 改为 column：

```vue
<div class="login-wrapper" @mousemove="handleMouseMove">
	<vue-particles ... />

	<header class="login-brand-header">
		<div class="login-logo">A</div>
		<div class="login-brand-text">
			<h1>Alex Platform</h1>
			<p>Enterprise Management System</p>
		</div>
	</header>

	<div class="login-container">
		<!-- 现有 login-visual + login-content 不变 -->
	</div>

	<footer class="login-page-footer">
		<span>© 2026 Alex Technology</span>
		<span>Version 0.1.0</span>
	</footer>
</div>
```

```less
.login-wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	position: relative;
	align-items: center;
	justify-content: center;
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
}
```

- [ ] **Step 2: 添加页顶品牌样式**

```less
.login-brand-header {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;
	z-index: 10;

	.login-logo {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #fff;
		font-size: 22px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-brand-text {
		h1 {
			margin: 0;
			font-size: 24px;
			font-weight: 700;
			color: #fff;
		}
		p {
			margin: 4px 0 0;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.55);
		}
	}
}
```

- [ ] **Step 3: 添加页脚样式**

```less
.login-page-footer {
	position: absolute;
	bottom: 24px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	gap: 48px;
	font-size: 13px;
	color: rgba(255, 255, 255, 0.35);
	z-index: 10;
}
```

- [ ] **Step 4: 更新容器尺寸**

```less
.login-container {
	width: 90%;
	max-width: 1400px;
	height: 75vh;
	min-height: 680px;
	// 其余 glass 样式保持
}
```

---

### Task 3: 左侧文案叠加层（不碰人物）

**Files:**

- Modify: `src/views/login/index.vue`（`.login-visual` 内、`character-container` 之前）

- [ ] **Step 1: 在 template 插入 copy 层**

在 `.login-visual` 内、`character-container` **之前**添加：

```vue
<div class="login-visual__copy">
	<h2 class="copy-title">Alex Platform</h2>
	<p class="copy-slogan">统一管理 · 统一权限 · 统一数据</p>
	<ul class="copy-features">
		<li><check-circle-outlined /> 用户管理</li>
		<li><check-circle-outlined /> 数据分析</li>
		<li><check-circle-outlined /> 工作流引擎</li>
	</ul>
</div>
```

- [ ] **Step 2: 补充 icon import**

```typescript
import {
	UserOutlined,
	LockOutlined,
	CheckCircleOutlined,
} from '@ant-design/icons-vue';
```

- [ ] **Step 3: 添加 copy 层样式并调整 flex 比例**

```less
.login-visual {
	flex: 1.65;
	// 现有 align-items: flex-end 等保持

	.login-visual__copy {
		position: absolute;
		top: 48px;
		left: 48px;
		z-index: 3;
		max-width: 320px;

		.copy-title {
			margin: 0 0 8px;
			font-size: 28px;
			font-weight: 700;
			color: rgba(255, 255, 255, 0.9);
		}
		.copy-slogan {
			margin: 0 0 24px;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.55);
		}
		.copy-features {
			list-style: none;
			padding: 0;
			margin: 0;
			li {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
				font-size: 15px;
				color: rgba(255, 255, 255, 0.75);
				.anticon {
					color: #1677ff;
				}
			}
		}
	}

	.visual-gradient {
		background:
			radial-gradient(
				circle at 50% 20%,
				rgba(0, 0, 0, 0.35) 0%,
				transparent 50%
			),
			radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
	}
}

.login-content {
	flex: 1;
}
```

- [ ] **Step 4: 移动端隐藏 copy 层**

```less
@media (max-width: 992px) {
	.login-brand-header {
		margin-bottom: 20px;
		.login-brand-text h1 {
			font-size: 20px;
		}
	}
	.login-page-footer {
		position: relative;
		bottom: auto;
		margin-top: 24px;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
}
```

---

### Task 4: 右侧表单全中文 + 企业蓝样式

**Files:**

- Modify: `src/views/login/index.vue`（template 表单区 + `.login-content` 样式）

- [ ] **Step 1: 替换表单文案**

```vue
<div class="title-container">
	<h1 class="main-title">用户登录</h1>
	<p class="sub-title">企业级管理平台</p>
</div>

<a-form-item label="用户名" name="username">
	<a-input
		placeholder="请输入用户名"
		...
	/>
</a-form-item>

<a-form-item label="密码" name="password">
	<a-input-password
		placeholder="请输入密码"
		...
	/>
</a-form-item>

<a-checkbox>30 天内免登录</a-checkbox>
<span class="forgot-link">忘记密码？</span>

<a-button ...>登 录</a-button>
```

- [ ] **Step 2: 更新表单样式**

```less
.login-content {
	:deep(.ant-input-affix-wrapper-large),
	:deep(.ant-input-password-large) {
		border-radius: 10px;
		&:hover,
		&:focus-within {
			border-color: #1677ff;
			box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
		}
	}

	.form-footer .forgot-link {
		color: #1677ff;
	}

	.login-btn {
		height: 48px;
		border-radius: 10px;
		background-color: #1677ff;
		border: none;
		&:hover {
			background-color: #4096ff;
		}
	}
}
```

- [ ] **Step 3: 运行 lint 与 type-check**

Run: `npm run lint && npm run type-check`
Expected: 通过，`--max-warnings=0`

---

### Task 5: 文档与 graphify 同步

**Files:**

- Modify: `DEVELOPMENT.md`（若存在登录页说明段落则补一句视觉升级）

- [ ] **Step 1: 运行 graphify**

Run: `npm run graphify:update` 或 `graphify update .`（按项目脚本）
Expected: 图谱更新成功

- [ ] **Step 2: 手动冒烟**

1. 打开 `/login`，确认 Aurora + 弱化粒子可见
2. 确认左侧人物交互（鼠标、用户名/密码 focus）正常
3. 确认登录成功后跳转首页
4. 缩放到 `<992px` 确认左侧隐藏、表单可用

---

## Plan Self-Review

| Spec 章节            | 对应 Task       |
| -------------------- | --------------- |
| 页顶品牌             | Task 2          |
| 左侧 copy + 人物不动 | Task 3          |
| Aurora + 弱化粒子    | Task 1 + Task 2 |
| 62:38 布局           | Task 3          |
| 全中文表单           | Task 4          |
| 页脚                 | Task 2          |
| 不做 i18n            | 全 plan 无 i18n |
| 验证                 | Task 5          |

无 TBD/占位符；人物 script 块 intentionally 不列入 task。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-17-login-page-redesign.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — 每个 Task 派发独立 subagent，任务间 review
2. **Inline Execution** — 本会话内按 Task 顺序直接改代码

Which approach?
