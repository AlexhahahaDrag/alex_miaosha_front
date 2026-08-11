# 开发笔记（DEVELOPMENT）

> 按 `.cursorrules` 要求：功能变动需同步记录，避免遗漏上下文。

## RBAC 批次 3（2026-08-11）

- **机构表批量删除**：`src/views/user/orgInfo/index.vue` 表格新增 `rowSelection` + 批量删除按钮（`data-testid="rbac-org-batch-delete"`），复用已支持逗号串 `ids` 的 `deleteOrgInfo`。
- **机构树数据源**：机构管理左树改为消费后端 `POST /org-info/tree`（`getOrgInfoTree`），不再前端拼树。
- **rbac 组件接线**：`orgInfoDetail` 由 `a-modal` 改为 `BaseRbacDrawer`；`roleInfo/authorizationDetail` 的权限树由旧 `menu-tree` 改为 `RbacPermissionTreePanel`。
- **用户启停**：`userManager` 列表状态列改为 `a-switch`，调用新增的 `PUT /user/status`（`updateUserStatus`），行内 loading 防连点。
- **独立关系配置页**（RBAC-PC-RELATION-001）：
  - `src/views/user/orgUserInfo/index.vue`：机构-用户关系（单用户唯一有效机构），路由 `/user/org-user-info`。
  - `src/views/user/roleUserInfo/index.vue`：角色-用户关系（全量替换），路由 `/user/role-user-info`。
  - 两页均使用 `RbacDualListSelector` 编辑草稿 + `RbacDiffPreview` 预览变更 + 保存后落库；原有角色/机构详情内的快捷分配入口保留，同时在列表页新增跳转按钮。
  - 两条路由暂以静态路由（`hideInMenu: true`）挂在 `home` 布局下，尚未在后端菜单树注册；如需侧边栏可见，需后续补充菜单数据。
- **数据范围提示**（RBAC-PC-SCOPE-001/002）：新增 `useDataScopeHint()`（`src/composables/useDataScopeHint.ts`，纯映射逻辑拆到 `dataScopeHint.ts` 便于单测），挂到用户/机构/角色列表页顶栏；口径：超级管理员「全部机构」、机构管理员「本机构及下级机构」、普通用户「仅本人所属机构」。单测见 `tests/scope/data-scope-hint.test.ts`。
