# T01 企业权限底座接口契约与数据模型确认

## 1. 结论

阶段一实现可以沿用现有 `alex_miaosha_front` 前端 API 封装和 `alex_miaosha` 用户服务模块，但仍存在若干必须补齐的接口能力：

- 角色列表缺少 `绑定用户数`、`权限数量` 统计字段。
- 机构删除缺少“存在下级机构 / 已绑定用户”阻断契约。
- 菜单删除缺少“存在子节点”阻断契约。
- 菜单查询缺少 `permissionCode` 过滤。
- 角色权限配置、用户角色配置、机构用户配置缺少面向差异保存的明确 VO/接口。
- Controller 中仍有新增/编辑用户返回 Entity 的问题，后续后端补强应统一返回 VO/Boolean。

## 2. 前端现有 API

| 模块 | 文件 | 已有接口 | 阶段一可复用性 |
| --- | --- | --- | --- |
| 用户管理 | `src/views/user/userManager/api/index.ts` | `/user/page`、详情、增删改、`/user/list` | 可复用；需扩展类型与并行加载流程 |
| 角色管理 | `src/views/user/roleInfo/api/index.ts` | `/role-info/page`、详情、增删改、`/assign-users` | 可复用；列表统计和删除阻断需后端补齐 |
| 机构管理 | `src/views/user/orgInfo/api/index.ts` | `/org-info/page`、详情、增删改 | 可复用；删除阻断与树表数据需补齐 |
| 菜单管理 | `src/views/user/menuInfo/api/index.ts` | `/menu-info/page`、详情、增删改 | 可复用；需补 `/list` 封装和 `permissionCode` 查询 |
| 角色用户关系 | `src/views/user/roleUserInfo/api/index.ts` | `/role-user-info/page`、详情、增删改 | 需去掉 `any`，补分配视图所需 Query/VO |
| 机构用户关系 | `src/views/user/orgUserInfo/api/index.ts` | `/org-user-info/page`、详情、增删改 | 需去掉 `any`，补添加/移出/移动语义接口 |

## 3. 后端现有契约

| 模块 | Controller | 当前能力 | 缺口 |
| --- | --- | --- | --- |
| 用户 | `TUserController` | `/page`、详情、增删改、登录、`/list` | add/update 返回 `TUser` Entity；数据隔离需确认 |
| 角色 | `RoleInfoController` | `/page`、详情、增删改、`/assign-users` | 统计字段、删除绑定阻断、权限差异保存接口 |
| 机构 | `OrgInfoController` | `/page`、详情、增删改 | 删除子机构/绑定用户阻断；树/懒加载契约 |
| 菜单 | `MenuInfoController` | `/page`、`/list`、详情、增删改 | `permissionCode` 查询、子节点删除阻断、节点类型字段 |
| 角色用户 | `RoleUserInfoController` | 基础 CRUD / page | 面向“角色分配用户”的已分配/可分配查询和差异保存 |
| 机构用户 | `OrgUserInfoController` | 基础 CRUD / page | 添加、移出、跨机构移动用户的语义接口 |

## 4. 字段契约

### 4.1 用户分页 Query

现有 `TUserVo` 已包含阶段一需要的核心查询字段：

| 字段 | 类型 | 状态 | 说明 |
| --- | --- | --- | --- |
| `keyword` | `String` | 已有 | 用户名、昵称、手机号综合查询 |
| `orgId` | `Long` | 已有 | 当前机构过滤 |
| `roleId` | `String` | 已有 | 单角色过滤 |
| `roleIds` | `List<Long>` | 已有 | 多角色过滤 |
| `orgCode` | `String` | 已有 | 机构编码模糊过滤 |
| `status` | `String` | 已有 | 用户状态 |

Mapper 当前已经通过 `exists` 子查询过滤 `roleId/roleIds/orgId`，并在分页主查询中按用户字段 `group by`，可避免角色 join 导致同一用户重复出现。前端仍需在表格渲染前做一次 ID 去重保护。

### 4.2 用户分页 VO

现有 `TUserVo` 已包含：

- `orgId`
- `orgName`
- `orgCode`
- `roleId`
- `roleIds`
- `roleInfoVoList`
- `roleName`
- `roleCode`
- `permissionContext`
- `permissionCodes`
- `buttonPermissionCodes`

阶段一建议前端类型 `UserManagerInfo` 与后端保持一致：`orgId`、`roleIds` 使用字符串展示时可以保留 string，但提交前需统一转换为后端可接受的 Long / Long[]。

### 4.3 角色分页 Query / VO

现有 `RoleInfoVo` 支持：

- `roleCode`
- `roleName`
- `status`
- `permissionList`
- `rolePermissionInfoVoList`
- `roleUserInfoVoList`

阶段一需补充：

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `boundUserCount` | `Long` / `Integer` | 角色列表绑定用户数 |
| `permissionCount` | `Long` / `Integer` | 角色列表权限数量 |
| `updateTime` | `LocalDateTime` | 列表更新时间展示，来自 BaseVo |

删除角色前必须以 `role_user_info` 中未删除绑定关系为准，不应只依赖前端列表统计值。

### 4.4 机构 Query / VO

现有 `OrgInfoVo` 支持：

- `orgCode`
- `orgName`
- `orgShortName`
- `parentId`
- `status`
- `parentOrgName`

阶段一需补充或确认：

| 能力 | 契约 |
| --- | --- |
| 树表 | 可通过 `/org-info/page` 全量取数前端组树，或新增 `/tree` / lazy endpoint |
| 删除阻断 | 后端在删除前检查子机构与 `org_user_info` 绑定 |
| 绑定数量 | 可选返回 `childrenCount`、`boundUserCount` 用于前端提示 |
| 层级调整 | 若不做拖拽，需提供 `parentId` 更新能力作为替代 |

### 4.5 菜单 Query / VO

现有 `MenuInfoVo` 支持：

- `name`
- `path`
- `title`
- `component`
- `parentId`
- `status`
- `showInHome`
- `permissionCode`
- `children`

当前 `MenuInfoMapper.xml` 的查询条件尚未包含 `permissionCode`，阶段一需要补齐：

```xml
<if test = "menuInfoVo.permissionCode != null">
  and permission_code like concat('%', #{menuInfoVo.permissionCode}, '%')
</if>
```

阶段一还需要明确节点类型字段。若后端暂不新增 `nodeType`，前端可临时按以下规则推断：

- `parentId` 为空且 `component` 为空：目录
- `component` 不为空：菜单
- `permissionCode` 不为空且无路由组件：按钮权限

长期建议后端新增显式 `nodeType`。

## 5. 绑定与配置接口契约

### 5.1 角色分配用户

现有：

- `POST /role-info/assign-users`
- body: `{ roleId: Long, userIds: Long[] }`

阶段一页面还需要：

| 能力 | 推荐契约 |
| --- | --- |
| 查询已分配用户 | `POST /role-user-info/assigned-users`，body: `{ roleId, keyword, orgId, pageNum, pageSize }` |
| 查询可分配用户 | `POST /role-user-info/assignable-users`，body: `{ roleId, keyword, orgId, pageNum, pageSize }` |
| 差异保存 | 可继续用 `/role-info/assign-users` 全量覆盖，但前端需保留初始集合计算差异 |

### 5.2 用户分配角色

现有 Service：

- `RoleUserInfoService.assignRoles(Long userId, List<Long> roleIds)`

前端用户新增/编辑可以继续通过用户保存流程携带 `roleIds`。若要独立接口，建议新增：

- `POST /role-user-info/assign-roles`
- body: `{ userId: Long, roleIds: Long[] }`

### 5.3 机构调整用户

现有 Service：

- `OrgUserInfoService.assignSingleOrg(Long userId, Long orgId)`

阶段一需要页面语义：

| 能力 | 推荐契约 |
| --- | --- |
| 添加用户到机构 | `POST /org-user-info/assign-single-org` |
| 移出机构 | `POST /org-user-info/remove-user` 或 `DELETE /org-user-info` 指定关系 id |
| 跨机构移动 | 复用 `assignSingleOrg`，保证单主机构模型 |
| 未分配用户查询 | `POST /user/page`，约定 `orgId` 为空且附加 `unassignedOrg=true`，或新增专用接口 |

## 6. 数据隔离契约

阶段一必须确认所有用户与机构相关查询都受当前账号权限上下文约束：

- 用户分页：限制在可见机构范围内。
- 机构树：只返回可见机构节点。
- 用户角色配置：可分配用户不能越过可见机构。
- 机构用户配置：不可操作越权机构或用户。

若后端当前没有统一数据范围过滤，建议在 Service 层引入当前用户 permission context / org scope，并在 SQL 中使用 `exists` 或机构范围集合过滤。

## 7. TDD 实现建议

第一批先红后绿用例：

- `RBAC-S1-SMOKE-001`：用户管理首屏全量查询与三源加载。
- `RBAC-S1-SMOKE-002`：机构树筛选与用户去重。
- `RBAC-S1-SMOKE-005`：角色权限 Drawer 差异预览。
- `RBAC-S1-SMOKE-006`：菜单节点类型与权限码联动提示。
- `RBAC-S1-SMOKE-007`：用户角色配置主流程。
- `RBAC-S1-SEC-001`：只读角色按钮不可见。

这些用例中的页面行为断言必须通过 Midscene.js 执行，Playwright 只承担页面启动、登录、截图和网络响应辅助。
