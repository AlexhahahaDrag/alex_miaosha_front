## Learned User Preferences

- 前端 PC 端所有弹窗与抽屉（基于 `<BaseRbacDrawer>`、`<a-drawer>` 或 `<a-modal>`）在承载详情查看（`readonly`）或数据编辑（`edit`）时，**必须引入 `detailLoading` 全生命周期受控与骨架屏防穿透规范**：
  1. **前置重置与 Loading**：在打开抽屉调用详情查询接口前，必须前置设置 `detailLoading.value = true` 并清空 `formState.value = {}`，彻底杜绝历史脏数据闪现；
  2. **异步闭环防死锁**：接口查询必须使用 `try/finally`，确保无论成功或异常均在 `finally` 中执行 `detailLoading.value = false`；
  3. **骨架屏平滑过渡**：抽屉主体必须内置 `v-if="detailLoading"` 现代骨架屏（`a-skeleton`），严格按照「骨架屏 ➔ 只读电子凭证卡片 (`v-else-if="isReadonly"`) ➔ 录入表单 (`a-form v-else`)」三态顺序渲染；
  4. **底部操作栏受控隐藏**：在数据加载期间，抽屉/模态框底部的「保存/提交」等操作按钮必须彻底隐藏（抽屉配置 `:show-footer="!isReadonly && !detailLoading"`，模态框配置 `<template v-if="!detailLoading" #footer>`），严禁在数据未返回来时提前暴露操作按钮引发误触或提交空数据；
  5. **模式判定防闪烁**：副标题与模式专有逻辑统一采用 `isEdit = computed(() => Boolean(modelInfo.value?.id || formState.value?.id))` 等稳定属性判定，严禁在异步数据未返回前仅以 `formState.id` 误判为新增模式。

- 前端侧边栏菜单导航（src/layout/components/my-navbar/index.vue）在 <a-sub-menu> 与 <a-menu-item> 中必须配置 <template #icon> 插槽，统一调用 @/config/icons.ts 中的 resolveMenuIcon(item.icon, item.key) 动态解析并渲染 SVG 图标组件；路由配置（routes）中静态路由（如 home）必须配置 meta.icon，动态路由由 buildRouteRecord 透传 item.icon，CustomNavbarMenuItem 统一维护 icon 字段。

## Knowledge Base (my_alex_brain)
- 本项目在专属全栈知识库 `D:\project\my_alex_brain` 中维护了完整的工程规约（`01-Standards/PC端开发规则与组件范式.md`）与各垂直业务功能包（`02-Features/` 下各模块的 PRD、TechSpec 与避坑SOP）。
- 修改前端页面的业务逻辑、接口请求、组件状态或权限流转后，**必须同步更新 `D:\project\my_alex_brain` 对应功能包或规范文档**，确保知识库与代码逻辑保持 100% 实时同步。

