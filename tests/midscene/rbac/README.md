# RBAC Smoke（Playwright 纯选择器）

该目录维护 RBAC smoke 用例清单；执行采用 Playwright 纯选择器，不依赖 Midscene 视觉模型。

## 目录

- `cases/smoke.json`: smoke 用例列表（与 `midscene-rbac-checklist.md` 对应）
- `scripts/playwright/run-rbac-smoke.mjs`: 本地/CI 统一入口

## 环境变量

- `BASE_URL`: 测试环境地址（必填）
- `RBAC_SMOKE_MODE`: `local` 或 `ci`（可选，默认 `local`）
- `RBAC_CASE_FILTER`: 仅运行指定用例（可选，逗号分隔）

账号密钥建议（在 CI 通过 secrets 注入）：

- `RBAC_SUPER_USER` / `RBAC_SUPER_PASS`
- `RBAC_MANAGER_USER` / `RBAC_MANAGER_PASS`
- `RBAC_READONLY_USER` / `RBAC_READONLY_PASS`

## 执行

- 本地：`npm run test:rbac:smoke:local`
- CI：`npm run test:rbac:smoke:ci`
- 指定用例：`RBAC_CASE_FILTER=RBAC-LOCAL-001,RBAC-LOCAL-003 npm run test:rbac:smoke:local`

## 下一步

输出目录：

- `reports/playwright/smoke-report.json`
- `screenshots/playwright/`
- `logs/playwright/smoke.log`
