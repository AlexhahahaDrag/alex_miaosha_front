# 企业权限底座管理端重构与升级进度

## 阶段状态

| 阶段 | 状态 | 验证命令 |
| --- | --- | --- |
| Brainstorming / 现状梳理 | 已完成 | `Get-Content progress.md -Encoding UTF8` |
| 新 Stitch 原型设计 | 已完成 | `Get-Content progress.md -Encoding UTF8` |
| Linear / Vercel 风格统一修改 | 已完成 | `Get-Content progress.md -Encoding UTF8` |
| 测试用例设计 | 已完成 | `Get-Content docs\testing\rbac-stage1-midscene-test-design.md -Encoding UTF8` |
| 任务拆解 | 已完成 | `Get-Content docs\superpowers\rbac-stage1-task-breakdown.md -Encoding UTF8` |
| TDD 实现 | 进行中 | 待完成 |
| 原型对比 | 未开始 | 待完成 |
| 自动化测试 | 未开始 | 待完成 |
| Review | 未开始 | 待完成 |

## 拆解任务

| 任务 | 状态 | 涉及范围 | 验证命令 |
| --- | --- | --- | --- |
| Brainstorming / 现状梳理报告 | 已完成 | 用户、机构、角色、菜单、权限关系链路 | `Get-Content progress.md -Encoding UTF8` |
| 新 Stitch 原型项目创建与 6 个页面绘制 | 已完成 | Stitch 原型 | `Get-Content progress.md -Encoding UTF8` |
| Linear / Vercel 风格确认与页面重绘 | 已完成 | Stitch 原型 | `Get-Content progress.md -Encoding UTF8` |
| 阶段一 Midscene.js 测试用例设计 | 已完成 | 用户、机构、角色、菜单、用户角色配置、机构用户配置 | `Get-Content docs\testing\rbac-stage1-midscene-test-design.md -Encoding UTF8` |
| 阶段一实施任务拆解 | 已完成 | 前端页面、后端接口、公共交互、Midscene 测试 | `Get-Content docs\superpowers\rbac-stage1-task-breakdown.md -Encoding UTF8` |
| T01 接口契约与数据模型确认 | 已完成 | 前端 API、后端 Query/VO/DTO、绑定关系、删除阻断 | `Get-Content docs\superpowers\rbac-stage1-interface-contract.md -Encoding UTF8` |
| Q01 阶段一 Midscene smoke 用例文件落地 | 已完成 | `tests/midscene/rbac/cases/stage1-smoke.json` | `node -e "JSON.parse(require('fs').readFileSync('tests/midscene/rbac/cases/stage1-smoke.json','utf8')); console.log('stage1-smoke.json ok')"` |
| Q03 Midscene runner case 加载扩展 | 已完成 | `scripts/midscene/run-smoke.mjs` | `& 'C:\Users\majf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check scripts\midscene\run-smoke.mjs` |
| T02 权限底座公共 UI 契约 | 已完成 | `src/components/rbac` | `$out = & 'C:\Users\majf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\node_modules\vue-tsc\bin\vue-tsc.js --noEmit 2>&1; if ($out -match 'src/components/rbac') { $out | Select-String 'src/components/rbac'; exit 1 } else { 'no rbac component type errors in vue-tsc output' }` |
| B01 用户分页 Query/VO 多维过滤字段落地 | 已完成 | `alex_miaosha_user/user_api/src/main/java/com/alex/api/user/userInfo/vo/TUserVo.java` | `Set-Location D:\project\alex_miaosha; mvn -pl alex_miaosha_user/user_boot -am test` |
| B02 用户分页 SQL 防重与机构/角色过滤修正 | 已完成 | `alex_miaosha_user/user_boot/src/main/java/com/alex/user/user/mapper/TUserMapper.xml` | `Set-Location D:\project\alex_miaosha; mvn -pl alex_miaosha_user/user_boot -am test` |
| B03 角色统计字段与删除绑定阻断 | 已完成 | `RoleInfoVo.java`、`RoleInfoMapper.xml`、`RoleInfoServiceImp.java` | `Set-Location D:\project\alex_miaosha; mvn -pl alex_miaosha_user/user_boot -am test` |
| B04 机构删除子级/绑定用户阻断 | 已完成 | `OrgInfoServiceImp.java` | `Set-Location D:\project\alex_miaosha; mvn -pl alex_miaosha_user/user_boot -am test` |
| B05 菜单权限标识查询与子节点删除阻断 | 已完成 | `MenuInfoMapper.xml`、`MenuInfoServiceImp.java` | `Set-Location D:\project\alex_miaosha; mvn -pl alex_miaosha_user/user_boot -am test` |
| T03 用户管理重构 | 已完成 | `src/views/user/userManager` | `$out = & 'C:\Users\majf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\node_modules\vue-tsc\bin\vue-tsc.js --noEmit 2>&1; if ($out -match 'src/views/user/userManager|src/components/rbac') { $out | Select-String 'src/views/user/userManager|src/components/rbac'; exit 1 } else { 'no userManager or rbac component type errors in vue-tsc output' }` |
| Q04 Midscene 页面导航 helper | 已完成 | `scripts/midscene/run-smoke.mjs` | `& 'C:\Users\majf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check scripts\midscene\run-smoke.mjs` |

## Stitch 原型

| 页面 | 初版 screenId | Linear / Vercel screenId | 状态 |
| --- | --- | --- | --- |
| 用户管理 | `cf17a38a2f8a4ccf98f176f52cfcabb7` | `a9e7270bdb824544a402375eded7cddb` | 已完成 |
| 机构管理 | `70fa9a84c75347819cac0307a69df313` | `e64096a771024a759efe127c9661f85f` | 已完成 |
| 角色管理 | `4e24203a779a45fa9bbd7316d432eb59` | `17f3eb1fdb984d348e37e00076125550` | 已完成 |
| 菜单管理 | `768d4f066c01448c9598f88b7e74cb2b` | `55ddf398af824491a12d7f1bea413aa2` | 已完成 |
| 用户角色配置 | `0dcb95d144b248e7b3cfb2bee2316af3` | `5f4acd00fdf246378d29c5b9d78b716f` | 已完成 |
| 机构用户配置 | `ae37ba04f0ec45369aeb2250dcad2584` | `453008b5f28e48858bd46a7f148338cb` | 已完成 |

Stitch projectId: `4092005836948894964`

Design system: `assets/8ae474ec67f44658828468d7d4097579`（Technical Precision / Linear Vercel RBAC Console）

> 本轮已重新创建名为 `企业权限底座管理端重构` 的 Stitch 项目，未沿用旧 projectId / screenId。
