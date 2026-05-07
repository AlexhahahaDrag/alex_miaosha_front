# Midscene RBAC 测试清单设计（本地 + CI）

## 1. 背景与目标

当前 PC 前端 RBAC 已完成阶段 2 改造，需要一套可复用、可自动执行的验收方案，覆盖以下关键链路：

- 登录后动态菜单按权限渲染
- 按钮级权限显隐
- 页面刷新后路由恢复
- 超管全权限与普通角色受限行为
- 机构管理页保持“仅机构树维护，不做用户绑定”

目标是建立双层测试体系：

- 本地验收：开发/联调阶段快速验证行为正确性
- CI 回归：PR 阶段自动执行，阻止权限回归进入主分支

## 2. 约束与前提

- CI 平台：GitHub Actions
- 环境策略：CI 直连现有测试环境（非临时起服务）
- 后端 ID 参数维持 Long（通过注解转换）
- 前端涉及业务 ID 的测试断言统一按字符串处理，避免 long 精度丢失风险
- 测试不替代后端单元测试；与 Maven RBAC 单测形成互补

## 3. 方案选型与结论

### 3.1 候选方案

1. 单套脚本同时覆盖本地和 CI
2. 双层模板：本地验收清单 + CI 回归清单
3. 仅 CI 自动化，无本地清单

### 3.2 结论（推荐）

采用方案 2（双层模板）：

- 本地清单强调业务可读性和排障效率
- CI 清单强调稳定性、可重试和产物追溯
- 能在不改变现有发布流程的前提下快速落地

## 4. 测试分层设计

### 4.1 本地验收层（Local Acceptance）

用途：开发者自测、产品验收、联调确认

特点：

- 覆盖端到端业务路径
- 用例说明偏“步骤化 + 结果可见”
- 失败后以页面行为复现为主

### 4.2 CI 回归层（PR Gate）

用途：PR 自动门禁，防止权限回归

特点：

- 仅保留稳定、高价值的最小关键集合（smoke）
- 必须产出截图/日志/失败上下文
- 支持有限重试（建议 1 次）

## 5. 用例模板规范

每条用例统一采用以下结构：

- `case_id`: 用例编号（如 `RBAC-CI-001`）
- `title`: 标题
- `level`: `smoke` / `regression`
- `persona`: `super_admin` / `normal_role` / `readonly_role`
- `precondition`: 前置数据、账号状态、菜单配置
- `steps`: 执行步骤
- `assertions`: 断言点（可见性、可操作性、结果状态）
- `artifacts`: 截图、日志关键字、页面 URL
- `owner`: 维护责任人

## 6. 清单模板（本地）

本地验收建议扩展为“权限链路 + 业务 CRUD + 分页查询”三层，共 20 条：

### 6.1 权限链路（基础）

1. `RBAC-LOCAL-001` 普通角色登录后菜单过滤
2. `RBAC-LOCAL-002` 普通角色按钮显隐（用户/角色/菜单/权限/机构页）
3. `RBAC-LOCAL-003` 超级管理员全权限按钮可见
4. `RBAC-LOCAL-004` 页面刷新后路由恢复且不丢权限状态
5. `RBAC-LOCAL-005` 机构页无“新增用户/移动用户”入口
6. `RBAC-LOCAL-006` 角色管理“用户分配”辅助入口生效

### 6.2 用户管理（主入口，机构单选 + 角色多选）

7. `RBAC-LOCAL-101` 用户分页查询：切页、页大小切换、总数更新正确
8. `RBAC-LOCAL-102` 用户条件查询：用户名筛选 + 清空后恢复默认列表
9. `RBAC-LOCAL-103` 新增用户：选择机构（单选）+ 角色（多选）并保存成功
10. `RBAC-LOCAL-104` 编辑用户：修改机构与角色后，列表与详情回显一致
11. `RBAC-LOCAL-105` 删除用户：单条删除成功，列表与总数同步刷新
12. `RBAC-LOCAL-106` 批量删除用户：多选删除成功，分页边界处理正确

### 6.3 角色管理（权限配置 + 用户分配辅助入口）

13. `RBAC-LOCAL-201` 角色分页与筛选：角色编码/名称查询、翻页一致性
14. `RBAC-LOCAL-202` 新增/编辑角色：字段保存成功并可再次查询回显
15. `RBAC-LOCAL-203` 角色权限配置：授权后按钮显隐随角色变化
16. `RBAC-LOCAL-204` 角色分配用户：穿梭框保存后用户角色关系生效
17. `RBAC-LOCAL-205` 角色删除：删除后列表刷新，已删角色不可再授权

### 6.4 菜单/权限/机构管理（RBAC 配置域）

18. `RBAC-LOCAL-301` 菜单 CRUD：新增/编辑/删除 + `permissionCode/showInHome` 生效
19. `RBAC-LOCAL-302` 权限 CRUD + 分页查询：权限码查询、翻页、删除回收验证
20. `RBAC-LOCAL-303` 机构 CRUD + 分页查询：树选中联动列表，且无用户绑定入口

### 6.5 本地执行建议

- `smoke`（每次开发自测）：`001~006` + `101` + `201` + `301`
- `full-local`（提测前）：执行 `001~303` 全部条目
- 每条用例至少保留 1 张关键截图（操作前/后各一张更佳）

## 7. 清单模板（CI）

### 7.1 PR 必跑（smoke）

1. `RBAC-CI-001` normal_role 菜单过滤
2. `RBAC-CI-002` normal_role 按钮显隐
3. `RBAC-CI-003` super_admin 全权限
4. `RBAC-CI-004` 刷新后路由恢复
5. `RBAC-CI-005` 机构页限制验证

### 7.2 夜间扩展（regression）

1. `RBAC-CI-101` 角色分配用户闭环
2. `RBAC-CI-102` 用户机构/角色编辑闭环
3. `RBAC-CI-103` 菜单 permissionCode/showInHome 生效验证

## 8. 基线数据设计

需固定测试账号与权限快照：

- `super_super`：全权限
- `rbac_user_manager`：部分管理权限
- `rbac_readonly`：只读权限

需固定权限码范围：

- `user:add|edit|delete`
- `role:add|edit|delete|auth`
- `menu:add|edit|delete`
- `permission:add|edit|delete`
- `org:add|edit|delete`

需固定菜单树和角色授权，避免环境漂移导致误报。

## 9. GitHub Actions 集成模板

工作流建议：

- 触发：`pull_request` + `workflow_dispatch`
- 环境：注入测试环境 URL 与账号密钥（GitHub Secrets）
- 执行：
  - `npm ci`
  - `npm run test:midscene:ci`
- 产物归档：
  - `reports/midscene/**`
  - `screenshots/**`
  - `logs/**`

失败时必须保留：

- case_id
- 失败页面 URL
- persona
- 最近一次接口关键响应摘要

## 10. 通过标准与失败策略

通过标准：

- PR smoke 用例全部通过
- 不允许越权访问（critical）
- 不允许未授权按钮可见（critical）

失败策略：

- 允许 flaky 重试 1 次
- 重试后仍失败则阻断合并
- 必须上传完整调试产物

## 11. 落地实施顺序

1. 先实现 PR smoke（5 条）
2. 接入 GitHub Actions 与产物上传
3. 增加本地验收脚本与文档
4. 补齐夜间回归（3 条）

## 12. 风险与缓解

风险：

- 测试环境数据变更导致偶发失败
- 页面异步加载时序造成 flaky

缓解：

- 固定 RBAC 基线数据
- 用显式等待/稳定锚点替代硬编码 sleep
- 对关键断言保留截图和日志

## 13. 验收输出

该设计完成后，交付物应包括：

- `docs/testing/midscene-rbac-checklist.md`（测试清单）
- `npm run test:midscene:local`（本地入口）
- `npm run test:midscene:ci`（CI 入口）
- `.github/workflows/rbac-midscene.yml`（工作流）

