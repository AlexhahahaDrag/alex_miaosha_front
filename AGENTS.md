## ⚡ 分级执行指令（Execution Modes - 最高优先级）

本项目采用**双轨分级执行机制**，默认开启极速模式以保证敏捷开发响应速度：

1. **极速模式（Fast Execution — 默认行为）**
   - **适用范围**：常规页面样式调整、单点 Bug 修复、局部逻辑修改、组件细节微调、明确的单文件或小范围需求。
   - **执行规范**：
     - **直接修改代码**：精准定位后立即修改目标代码，**禁止**先生成 Implementation Plan Artifact 并停下等待 `Proceed`。
     - **免自动全量跑测**：**不要**自动运行全量 Vitest 或 Maven 测试（仅在涉及复杂核心算法或用户明确要求时，按需只跑单个受影响的测试文件）。
     - **免同步知识库**：**不要**自动读写 `my_alex_brain` 知识库。
     - **免浏览器自动走查**：**不要**强制启动浏览器（`chrome-devtools-mcp`）进行截屏走查。
     - **代码红线不降级**：极速模式下仍须严格遵守代码工程红线（ID 字符串防精度丢失、响应解构、禁止重复手动 `import`、`DateUtils` 时区安全等）。

2. **完整流程（Full Workflow — 仅按需显式触发）**
   - **触发条件**：仅当用户明确指令**「完整流程」**、**「规划方案」**、**「先出方案」**、**「/plan」**，或任务涉及**全新独立大模块开发 / 数据库表结构设计 / 跨端重大 API 契约重构**时触发。
   - **执行规范**：严格执行「输出 Plan Artifact 停下等待 `Proceed` ➔ 按测试金字塔执行测试验证 ➔ 同步更新 `my_alex_brain` 知识库 ➔ 浏览器工具视觉走查」。

---

## Learned User Preferences

- 前端 PC 端所有弹窗与抽屉（基于 `<BaseRbacDrawer>`、`<a-drawer>` 或 `<a-modal>`）在承载详情查看（`readonly`）或数据编辑（`edit`）时，**必须引入 `detailLoading` 全生命周期受控与骨架屏防穿透规范**：
  1. **前置重置与 Loading**：在打开抽屉调用详情查询接口前，必须前置设置 `detailLoading.value = true` 并清空 `formState.value = {}`，彻底杜绝历史脏数据闪现；
  2. **异步闭环防死锁**：接口查询必须使用 `try/finally`，确保无论成功或异常均在 `finally` 中执行 `detailLoading.value = false`；
  3. **骨架屏平滑过渡**：抽屉主体必须内置 `v-if="detailLoading"` 现代骨架屏（`a-skeleton`），严格按照「骨架屏 ➔ 只读电子凭证卡片 (`v-else-if="isReadonly"`) ➔ 录入表单 (`a-form v-else`)」三态顺序渲染；
  4. **底部操作栏受控隐藏**：在数据加载期间，抽屉/模态框底部的「保存/提交」等操作按钮必须彻底隐藏（抽屉配置 `:show-footer="!isReadonly && !detailLoading"`，模态框配置 `<template v-if="!detailLoading" #footer>`），严禁在数据未返回来时提前暴露操作按钮引发误触或提交空数据；
  5. **模式判定防闪烁**：副标题与模式专有逻辑统一采用 `isEdit = computed(() => Boolean(modelInfo.value?.id || formState.value?.id))` 等稳定属性判定，严禁在异步数据未返回前仅以 `formState.id` 误判为新增模式。

- 前端侧边栏菜单导航（src/layout/components/my-navbar/index.vue）在 <a-sub-menu> 与 <a-menu-item> 中必须配置 <template #icon> 插槽，统一调用 @/config/icons.ts 中的 resolveMenuIcon(item.icon, item.key) 动态解析并渲染 SVG 图标组件；路由配置（routes）中静态路由（如 home）必须配置 meta.icon，动态路由由 buildRouteRecord 透传 item.icon，CustomNavbarMenuItem 统一维护 icon 字段。

## Knowledge Base (my_alex_brain)
- 本项目在专属全栈知识库 `F:\workplace\project\myself\my_alex_brain` 中维护了完整的工程规约（`01-Standards/PC端开发规则与组件范式.md`）与各垂直业务功能包（`02-Features/` 下各模块的 PRD、TechSpec 与避坑SOP）。
- **【完整流程触发】**仅在完整流程或发生重大业务契约、核心组件范式变更时，同步更新 `F:\workplace\project\myself\my_alex_brain` 对应功能包或规范文档；常规极速修改免自动更新。

