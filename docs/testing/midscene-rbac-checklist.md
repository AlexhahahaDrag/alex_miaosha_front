# Midscene RBAC 本地验收清单（可打勾）

## 0. 执行说明

- 环境：测试环境（与 CI 保持一致）
- 账号：
  - `super_super`（超管）
  - `rbac_user_manager`（管理权限）
  - `rbac_readonly`（只读）
- 证据要求：每条至少 1 张截图，失败必须带页面 URL 和失败断言描述
- 截图命名：`<case_id>_<step>_<pass|fail>.png`

## 1. 通用模板（复制用于每条 case）

```md
- [ ] CASE_ID: <id>
  - 标题: <title>
  - 角色: <persona>
  - 前置:
    - <precondition>
  - 步骤:
    1) <step1>
    2) <step2>
  - 断言:
    - <assert1>
    - <assert2>
  - 截图:
    - <file_name>
  - 结果:
    - [ ] pass
    - [ ] fail
  - 备注:
    - <optional>
```

## 2. 权限链路

- [ ] `RBAC-LOCAL-001` 普通角色登录后菜单过滤
  - 角色: `rbac_readonly`
  - 前置: 账号仅拥有只读菜单权限
  - 步骤: 登录 -> 展开左侧菜单 -> 对比授权菜单清单
  - 断言: 仅出现授权菜单；未授权菜单不可见
  - 截图: `RBAC-LOCAL-001_menu_pass.png`

- [ ] `RBAC-LOCAL-002` 普通角色按钮显隐
  - 角色: `rbac_readonly`
  - 前置: 账号不含 `*:add/edit/delete` 权限
  - 步骤: 进入用户/角色/菜单/权限/机构页面
  - 断言: 新增、编辑、删除按钮不可见
  - 截图: `RBAC-LOCAL-002_buttons_pass.png`

- [ ] `RBAC-LOCAL-003` 超管按钮全显
  - 角色: `super_super`
  - 前置: 超管已配置
  - 步骤: 打开五个 RBAC 页面
  - 断言: 核心按钮可见（如 `user:add`、`role:auth`、`menu:edit`）
  - 截图: `RBAC-LOCAL-003_super_pass.png`

- [ ] `RBAC-LOCAL-004` 刷新后路由恢复
  - 角色: `rbac_user_manager`
  - 前置: 有至少一个可访问管理页
  - 步骤: 打开目标页 -> 浏览器刷新
  - 断言: 不跳登录、不 404、页面可继续访问
  - 截图: `RBAC-LOCAL-004_refresh_pass.png`

- [ ] `RBAC-LOCAL-005` 机构页无用户绑定入口
  - 角色: `super_super`
  - 前置: 进入机构管理
  - 步骤: 检查页面操作区与行操作区
  - 断言: 无“新增用户/移动用户/分配用户”入口
  - 截图: `RBAC-LOCAL-005_org_restrict_pass.png`

- [ ] `RBAC-LOCAL-006` 角色管理用户分配辅助入口生效
  - 角色: `super_super`
  - 前置: 至少 1 个角色 + 2 个用户
  - 步骤: 角色页点“用户” -> 穿梭框分配 -> 保存
  - 断言: 保存成功；角色详情返回 `roleUserInfoVoList` 含目标用户
  - 截图: `RBAC-LOCAL-006_role_user_assign_pass.png`

## 3. 用户管理（主入口）

- [ ] `RBAC-LOCAL-101` 用户分页查询
  - 步骤: 切换页码、修改 pageSize
  - 断言: 列表与总数联动正确，无重复/丢失
  - 截图: `RBAC-LOCAL-101_user_pagination_pass.png`

- [ ] `RBAC-LOCAL-102` 用户条件查询与清空
  - 步骤: 输入用户名筛选 -> 清空
  - 断言: 筛选结果正确；清空恢复默认数据
  - 截图: `RBAC-LOCAL-102_user_filter_pass.png`

- [ ] `RBAC-LOCAL-103` 新增用户（机构单选+角色多选）
  - 步骤: 新增用户 -> 选 `orgId` -> 选多个 `roleIds` -> 保存
  - 断言: 创建成功；列表可见；详情回显机构和角色
  - 截图: `RBAC-LOCAL-103_user_create_pass.png`

- [ ] `RBAC-LOCAL-104` 编辑用户机构与角色
  - 步骤: 编辑已存在用户 -> 修改机构/角色 -> 保存
  - 断言: 修改成功；刷新后回显一致
  - 截图: `RBAC-LOCAL-104_user_update_pass.png`

- [ ] `RBAC-LOCAL-105` 删除用户（单条）
  - 步骤: 行删除 -> 确认
  - 断言: 删除成功；列表减少；总数更新
  - 截图: `RBAC-LOCAL-105_user_delete_pass.png`

- [ ] `RBAC-LOCAL-106` 批量删除用户
  - 步骤: 多选 -> 批量删除
  - 断言: 批量删除成功；分页边界正常（空页回退上一页）
  - 截图: `RBAC-LOCAL-106_user_batch_delete_pass.png`

## 4. 角色管理

- [ ] `RBAC-LOCAL-201` 角色分页与筛选
  - 步骤: 按角色编码/名称查询 + 翻页
  - 断言: 结果准确，分页稳定
  - 截图: `RBAC-LOCAL-201_role_pagination_pass.png`

- [ ] `RBAC-LOCAL-202` 新增/编辑角色
  - 步骤: 新增角色 -> 编辑角色
  - 断言: 保存成功；列表与详情一致
  - 截图: `RBAC-LOCAL-202_role_crud_pass.png`

- [ ] `RBAC-LOCAL-203` 角色权限配置
  - 步骤: 打开授权抽屉 -> 勾选权限 -> 保存
  - 断言: 权限保存成功；对应角色按钮显隐发生变化
  - 截图: `RBAC-LOCAL-203_role_auth_pass.png`

- [ ] `RBAC-LOCAL-204` 角色分配用户闭环
  - 步骤: 打开用户分配抽屉 -> 分配用户 -> 重新登录目标用户
  - 断言: 目标用户菜单/按钮权限按新角色生效
  - 截图: `RBAC-LOCAL-204_role_assign_user_pass.png`

- [ ] `RBAC-LOCAL-205` 角色删除
  - 步骤: 删除角色
  - 断言: 删除成功；被删角色不可再用于授权
  - 截图: `RBAC-LOCAL-205_role_delete_pass.png`

## 5. 菜单/权限/机构管理

- [ ] `RBAC-LOCAL-301` 菜单 CRUD + 动态字段
  - 步骤: 新增菜单（含 `permissionCode/showInHome`）-> 编辑 -> 删除
  - 断言: 保存成功；登录后动态路由与首页展示符合配置
  - 截图: `RBAC-LOCAL-301_menu_crud_pass.png`

- [ ] `RBAC-LOCAL-302` 权限 CRUD + 分页
  - 步骤: 新增权限 -> 查询 -> 编辑 -> 删除
  - 断言: 权限码可查询；分页正确；删除后不可再授权命中
  - 截图: `RBAC-LOCAL-302_permission_crud_pass.png`

- [ ] `RBAC-LOCAL-303` 机构 CRUD + 分页 + 树联动
  - 步骤: 新增子机构 -> 编辑 -> 删除；切换树节点查看列表
  - 断言: 树与列表联动正确；无用户绑定操作
  - 截图: `RBAC-LOCAL-303_org_crud_pass.png`

## 6. 执行档位

- `smoke`（日常开发）
  - `001~006` + `101` + `201` + `301`
- `full-local`（提测前）
  - 全部 `001~303`

## 7. 结果汇总

- 执行人:
- 执行时间:
- 通过数:
- 失败数:
- 阻断项:
  - <case_id + 原因 + URL>
- 结论:
  - [ ] 可提测
  - [ ] 需修复后重测

