# RBAC 配置域完整测试说明（机构/角色/权限/菜单）

## 1. 测试目标

验证机构、角色、权限、菜单四个模块在“既有功能 + 本次 RBAC 改造”下均可稳定工作，重点覆盖：

- 页面 CRUD 与分页查询
- 按钮权限显隐
- 动态菜单/路由
- 关键业务约束（机构页不绑定用户）

## 2. 测试分层

### 2.1 Smoke（日常开发）

最小关键链路，阻断回归：

- `RBAC-LOCAL-001` 菜单过滤
- `RBAC-LOCAL-002` 按钮显隐
- `RBAC-LOCAL-003` 超管权限
- `RBAC-LOCAL-004` 刷新路由恢复
- `RBAC-LOCAL-005` 机构页限制
- `RBAC-LOCAL-006` 角色分配用户入口
- `RBAC-LOCAL-101` 用户分页
- `RBAC-LOCAL-201` 角色分页筛选
- `RBAC-LOCAL-301` 菜单管理关键能力

### 2.2 Full Local（提测前）

执行完整本地清单 `RBAC-LOCAL-001 ~ RBAC-LOCAL-303`，覆盖 CRUD + 分页 + 权限链路闭环。

## 3. 测试环境与账号

- 环境：测试环境（与 CI 同源）
- 账号：
  - `super_super`（超管）
  - `rbac_user_manager`（管理角色）
  - `rbac_readonly`（只读角色）

说明：若后两类账号缺失，相关 case 会被标记为 `skipped`，不应误判为功能失败。

## 4. 执行方式

### 4.1 自动化（Playwright）

- 本地：`npm run test:rbac:smoke:local`
- CI：`npm run test:rbac:smoke:ci`

产物：

- 报告：`reports/playwright/smoke-report.json`
- 截图：`screenshots/playwright/`
- 日志：`logs/playwright/`

### 4.2 手工验收

使用清单：`docs/testing/midscene-rbac-checklist.md`

每条用例至少 1 张截图；失败必须记录 URL + 断言点。

## 5. 模块测试点（含存量+改造）

## 5.1 机构管理（org）

- 列表分页与筛选正常
- 新增/编辑/删除机构正常
- 机构树与列表联动正常
- 页面不存在“新增用户/移动用户/分配用户”入口（强校验）
- 按钮权限：`org:add/org:edit/org:delete`

## 5.2 角色管理（role）

- 列表分页与筛选正常
- 新增/编辑/删除角色正常
- 角色授权流程生效（`role:auth`）
- 角色用户分配流程生效（辅助入口）
- 用户角色关系在用户管理侧回显一致
- 按钮权限：`role:add/role:edit/role:delete/role:auth`

## 5.3 权限管理（permission）

- 列表分页与筛选正常
- 新增/编辑/删除权限正常
- 权限码可查询、可回显
- 删除后授权链路不可命中已删除权限
- 按钮权限：`permission:add/permission:edit/permission:delete`

## 5.4 菜单管理（menu）

- 列表分页与筛选正常
- 新增/编辑/删除菜单正常
- 子菜单管理可维护层级
- `permissionCode` 生效（影响可访问菜单/路由）
- `showInHome` 生效（影响首页展示）
- 按钮权限：`menu:add/menu:edit/menu:delete`

## 6. 权限链路专项测试

- 只读角色：不可见增删改按钮
- 管理角色：仅可见授权范围内按钮
- 超管角色：管理按钮全可见
- 刷新页面后权限状态不丢失
- 动态路由不应出现越权菜单

## 7. 通过标准

- 自动化：`failed=0`
- 手工：关键清单项全部 pass
- 不允许出现以下阻断问题：
  - 越权菜单可见
  - 越权按钮可操作
  - 机构页出现用户绑定入口

## 8. 失败处理与回归要求

- 首次失败先复跑 1 次排除偶发时序问题
- 若复跑仍失败，必须附：
  - case_id
  - 页面 URL
  - 失败断言
  - 截图与日志路径
- 修复后至少回归：
  - 对应模块 case
  - 权限链路 case（`001~006`）

## 9. 当前基线结果（记录）

- Playwright smoke 最近基线：`total=9, passed=4, failed=0, skipped=5`
- `skipped` 原因为测试账号缺失（`rbac_user_manager` / `rbac_readonly`）

该基线可用于后续补齐账号后的全量闭环对比。
