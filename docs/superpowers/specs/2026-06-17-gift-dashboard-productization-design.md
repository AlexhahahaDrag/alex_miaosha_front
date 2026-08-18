# Gift Dashboard 数据产品化 + 全局壳层升级

## Phase A — Gift Dashboard

- KPI 卡片：`GiftMetricCard`（36px 数字、真实环比、SVG sparkline）
- 移除硬编码 +12.5% / 假趋势 fallback
- 空状态：`GiftEmptyState` + 路由 CTA
- 图表高度压缩、辅助指标、`trendScope` 生效
- 表格 hover、状态 Tag、操作列、loading
- 按钮/链接接 `/finance/gift/{record,person,analysis}`

## Phase B — 全局壳层

- 侧栏 `#0f172a` + Linear 风格选中态
- Alex Platform Logo
- 移除面包屑，保留 Tabs
- 顶栏通知铃铛 + 欢迎语

## 文件

- `src/views/finance/gift/dashboard/index.vue`
- `src/views/finance/gift/dashboard/components/*`
- `src/views/finance/gift/dashboard/utils/metrics.ts`
- `src/views/layout/index.vue`
- `src/views/common/my-right-info/index.vue`
