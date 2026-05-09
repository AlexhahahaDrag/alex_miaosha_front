# RBAC 配置域完整功能说明（机构/角色/权限/菜单）

## 1. 文档范围

本说明覆盖 PC 前端 RBAC 配置域的完整功能口径，包含：

- 既有能力（历史已上线功能）
- 本次改造能力（权限上下文兼容、动态菜单/路由、按钮权限统一）

模块范围：

- 机构管理（`orgInfo`）
- 角色管理（`roleInfo`）
- 权限管理（`permissionInfo`）
- 菜单管理（`menuInfo`）

## 2. RBAC 规则基线

- 用户只属于一个机构（`orgId` 单选）
- 用户可绑定多个角色（`roleIds` 多选）
- 用户不直接绑定权限，权限经角色下发
- 权限与菜单/按钮绑定，按钮权限码采用 `xxx:yyy`
- 机构管理仅维护组织结构，不承担用户绑定入口

## 3. 权限模型与前端控制

已统一使用 `v-permission` 做按钮级控制，主要权限码如下：

- `org:add` / `org:edit` / `org:delete`
- `role:add` / `role:edit` / `role:delete` / `role:auth`
- `permission:add` / `permission:edit` / `permission:delete`
- `menu:add` / `menu:edit` / `menu:delete`

角色管理中“授权”与“用户分配”都归为 `role:auth` 控制入口。

## 4. 登录返回与权限上下文兼容

前端已兼容两类登录结构：

1. 新结构：`permissionContext`
2. 兼容结构：`menuInfoVoList` + `roleInfoVo/roleInfoVoList` + `orgInfoVo`

能力结果：

- 登录后可正确构建菜单、角色、机构上下文
- 动态路由刷新后可恢复权限状态
- 超管（`super_super`）具备全权限放行

## 5. 菜单管理（`menuInfo`）

### 5.1 功能能力

- 分页查询菜单
- 新增菜单
- 编辑菜单
- 删除菜单（单条/批量）
- 子菜单管理（树状层级维护）

### 5.2 关键字段与行为

- `permissionCode`：菜单权限标识（影响路由/权限控制）
- `showInHome`：首页展示标记（影响首页入口呈现）
- 菜单结构字段（`path/component/redirect/icon/parentId/orderBy`）驱动动态路由构建

### 5.3 接口映射

- `POST /menu-info/page`
- `GET /menu-info?id=`
- `POST /menu-info`
- `PUT /menu-info`
- `DELETE /menu-info?ids=`

（实际请求前缀通过 `baseService.user` 组合）

## 6. 权限管理（`permissionInfo`）

### 6.1 功能能力

- 分页查询权限
- 新增权限
- 编辑权限
- 删除权限（单条/批量）

### 6.2 关键字段

- `permissionCode`：权限码（如 `menu:add`）
- `permissionName`：权限名称
- `status`：状态
- `summary`：备注

### 6.3 接口映射

- `POST /permission-info/page`
- `GET /permission-info?id=`
- `POST /permission-info`
- `PUT /permission-info`
- `DELETE /permission-info?ids=`

## 7. 角色管理（`roleInfo`）

### 7.1 功能能力

- 分页查询角色（按编码/名称筛选）
- 新增角色
- 编辑角色
- 删除角色（单条/批量）
- 角色授权（分配权限）
- 角色用户分配（辅助入口，修改 user-role 关系）

### 7.2 关键交互约束

- 角色页“用户分配”是辅助入口，必须与用户管理主入口数据一致
- 授权后应能影响对应角色下用户的菜单/按钮可见性

### 7.3 接口映射

- `POST /role-info/page`
- `GET /role-info?id=`
- `POST /role-info`
- `PUT /role-info`
- `DELETE /role-info?ids=`
- `POST /role-info/assign-users`（角色分配用户）

## 8. 机构管理（`orgInfo`）

### 8.1 功能能力

- 机构分页查询
- 新增机构
- 编辑机构
- 删除机构
- 机构树与列表联动查看

### 8.2 业务限制（强约束）

- 不允许在机构页新增用户
- 不允许在机构页移动用户
- 不允许在机构页分配用户

即：机构页仅维护组织结构，不承担用户关系维护。

### 8.3 接口映射

- `POST /org-info/page`
- `GET /org-info?id=`
- `POST /org-info`
- `PUT /org-info`
- `DELETE /org-info?ids=`

## 9. 与既有功能的兼容关系

- 保留原有 CRUD 流程，不破坏已存在页面操作习惯
- 在不升级技术栈的前提下，补齐 RBAC 权限链路
- 保持 `unplugin-auto-import` 与 `unplugin-vue-components` 兼容
- 业务 ID 在前端按字符串处理（避免 Long 精度问题）

## 10. 当前交付状态

- 配置域四模块（机构/角色/权限/菜单）已纳入统一 RBAC 口径
- 权限上下文兼容层已生效
- 动态菜单/路由与按钮权限控制已接通
- 已具备本地 smoke 与 CI 执行入口（Playwright 纯选择器）
