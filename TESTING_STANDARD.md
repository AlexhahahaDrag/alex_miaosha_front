# 前端（PC 端）测试标准

> **适用项目**：`alex_miaosha_front`（Vue 3.5 + Vite 8 + TypeScript 6 + Ant Design Vue 4）
> **配套测试栈**：`@midscene/web` 1.7.x + `@playwright/test` 1.59.x
> **文档版本**：v1.0
> **最后更新**：2026-05-28
> **关联文档**：后端 `TESTING_STANDARD.md`、移动端 `TESTING_STANDARD.md`

---

## 目录

- [第一部分 · 现状诊断](#第一部分--现状诊断)
- [第二部分 · 测试方法论（PC 定制版）](#第二部分--测试方法论pc-定制版)
- [第三部分 · 标准化体系](#第三部分--标准化体系)
- [第四部分 · 30 天落地路线](#第四部分--30-天落地路线)
- [第五部分 · Anti-pattern 警示](#第五部分--anti-pattern-警示)
- [附录 A · data-testid 命名约定](#附录-a--data-testid-命名约定)
- [附录 B · Midscene 与 Playwright 选择决策树](#附录-b--midscene-与-playwright-选择决策树)
- [附录 C · 流程总图](#附录-c--流程总图)

---

## 第一部分 · 现状诊断

### 1.1 已有基建（保留并发扬）

| 项 | 评价 |
|---|---|
| Midscene + Playwright 双引擎已就位 | ⭐⭐⭐⭐⭐ |
| RBAC + Gift 三层 case：smoke / button / flow | ⭐⭐⭐⭐⭐ |
| 多 persona（super_super / rbac_user_manager / rbac_readonly） | ⭐⭐⭐⭐⭐ |
| `waitForExactApiResponse` 网络层等待替代 sleep | ⭐⭐⭐⭐ |
| 失败截图 + JSON 报告 + 日志追加 | ⭐⭐⭐⭐ |

### 1.2 缺口（按优先级）

| # | 缺口 | 风险 | 优先级 |
|---|---|---|---|
| 1 | **无单元测试框架**（无 vitest / vue-test-utils） | `formatMoney` / `normalizeGiftIds` 等工具函数无回归 | P0 |
| 2 | AI 测试大量使用中文文案做精确匹配（`+ 快速记礼`、`Excel导出` 等） | 改文案即全红 | P1 |
| 3 | 无 fixture 池 / try/finally 清理 | `codex-pc-record-${Date.now()}` 残留污染 dev 库 | P1 |
| 4 | AI 测试无负向用例 | 永远 pass 的"安慰剂测试"无人察觉 | P1 |
| 5 | 无 `data-testid` 体系 | 所有定位依赖文案或 CSS 类 | P1 |
| 6 | `MIDSCENE_CACHE` 未启用 | token 成本不可控 | P2 |
| 7 | 无 CI 工作流 | 仅本地手跑 | P2 |

---

## 第二部分 · 测试方法论（PC 定制版）

### 2.1 测试金字塔（PC 端版本）

```
          ╱╲
         ╱AI╲       ←  15%  Midscene：视觉、跨页面流程、AI 兜底
        ╱────╲              成本高，留给"人写不动"的部分
       ╱ 集成 ╲     ←  25%  Playwright（无 AI）：DOM 闭环
      ╱────────╲            如 CRUD、按钮矩阵、API 联调
     ╱   单元   ╲   ←  60%  Vitest：纯函数、composable、Pinia store
    ╱────────────╲          快、稳、便宜
```

**和后端最大的差异**：前端单元测试占比下调到 60%（因为很多业务在交互层），AI 测试上调到 15%。

### 2.2 谁测哪一层

| 测什么 | 用哪一层 | 例子 |
|---|---|---|
| 工具函数、`normalizeGiftIds`、`formatMoney` | **Vitest 单测** | 纯函数零依赖，必测 |
| Pinia store、composable（如 `useGiftFilter`） | **Vitest + @vue/test-utils** | mock 掉 API |
| 组件渲染、props、emit | **Vitest + @vue/test-utils** | 不引入路由不引入 store |
| 路由守卫、权限拦截、Axios 拦截器 | **Playwright（无 AI）** | 真实跑浏览器 |
| 跨页面 CRUD 闭环 | **Playwright（无 AI）** | 你已经在做的 GIFT-PC-RECORD-CRUD |
| 视觉合理性、模糊指令、文案语义 | **Midscene AI** | "弹窗布局合理" |

### 2.3 边界识别 · 七点法（前端版本）

任何输入框/选择器都要套这 7 个点：

| 点 | 例子（gift `amount` 输入） |
|---|---|
| far-low | 粘贴 `-99999` 是否阻止 |
| min-1 | `-0.01` 显示错误提示 |
| min | `0` 业务是否允许？|
| min+1 | `0.01` 通过 |
| typical | `200/888/1314` 通过 |
| max | `999999999.99` 通过（前端不能丢精度）|
| max+1 | `1000000000` 前端校验报错 |

特别注意（结合 `AGENTS.md` 的约束）：

> ⚠️ ID 字段**必须**保持字符串。`normalizeGiftIds` 已经实现了这点，**单元测试要锁住这个行为**：传入 `bigint`/`number` 都必须输出 `string`，否则 PR 拒绝合并。

### 2.4 前端特有的边界类型

| 边界类型 | gift 例子 | 在哪测 |
|---|---|---|
| **输入框边界** | amount 范围、人名 50 字、emoji 备注 | Vitest 或 Playwright |
| **下拉/Select 边界** | 空列表、单选项、1000 个选项性能 | Vitest |
| **表格边界** | 0 行（空状态）、1 行、100 行（分页）、虚拟滚动 | Playwright |
| **路由边界** | 直接访问需登录页（重定向）、不存在路由 404 | Playwright |
| **权限边界** | 三种角色看到不同按钮 | 已覆盖 ✓ |
| **响应式边界** | 1366×768 / 1920×1080 / 4K | Midscene 视觉 |
| **网络边界** | API 500、超时、断网、慢 3G | Playwright `route()` 拦截 |
| **状态边界** | Loading / Empty / Error / Success 四态 | Vitest 组件测 |

### 2.5 覆盖率工具 · Vitest + c8

PC 前端推荐引入：

```bash
pnpm add -D vitest @vue/test-utils @vitest/coverage-v8 jsdom
```

`vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
      exclude: [
        '**/node_modules/**',
        '**/types/**',
        '**/config/**',
        '**/*.d.ts',
        '**/mock/**',
      ],
    },
  },
});
```

跑 `pnpm vitest --coverage` 看报告。

### 2.6 Midscene token 成本控制

**单次 AI 测试调用 ≈ $0.02**。10 个 case × 5 个 aiAssert = 50 次调用 = $1。一周跑 100 次 = $100。

**降本三招**：

1. **启用缓存**：`.env.test`：
   ```
   MIDSCENE_CACHE=true
   MIDSCENE_CACHE_DIR=.midscene-cache
   ```
2. **替换文案匹配为 testid**：
   ```typescript
   // ❌
   await agent.aiAssert('页面可见"+ 快速记礼"按钮');
   // ✅
   await expect(page.getByTestId('gift-record-fab')).toBeVisible();
   ```
3. **同类断言合并**：
   ```typescript
   // ❌ 3 次 AI 调用
   await agent.aiAssert('可见礼金方向');
   await agent.aiAssert('可见金额');
   await agent.aiAssert('可见事由');
   // ✅ 1 次 AI 调用
   await agent.aiAssert('快速记礼弹窗可见礼金方向、金额、事由三个字段');
   ```

---

## 第三部分 · 标准化体系

### 3.1 命名约定

#### 测试文件
```
src/views/finance/gift/api/index.ts            ← 源文件
src/views/finance/gift/api/index.spec.ts       ← 同目录单测
tests/unit/utils/format-money.spec.ts          ← 集中式单测
tests/midscene/gift/cases/smoke.json           ← AI case 数据
scripts/midscene/run-smoke.mjs                 ← AI 执行脚本
```

#### 测试方法

```typescript
// 单元测试：should_期望_when_条件
describe('normalizeGiftIds', () => {
  it('should_convert_bigint_to_string_when_key_is_id', () => {});
  it('should_keep_value_when_key_is_not_id', () => {});
  it('should_handle_null_array', () => {});
});

// AI/E2E：{模块}-{端}-{动作}-{编号}
GIFT-PC-RECORD-CRUD-001
GIFT-PC-EXPORT-001
GIFT-BUTTON-RECORD-ADMIN-001
```

### 3.2 必测维度

| 维度 | 必测项 | 工具 |
|---|---|---|
| 工具函数 | 七点法覆盖、null/undefined、空数组、循环引用 | Vitest |
| Composable / Hook | 初始态、reactive 变化、副作用清理 | Vitest |
| Pinia Store | action 改 state、getter 派生、persist 持久化 | Vitest |
| Vue 组件 | props、emit、slot、Loading/Empty/Error 三态 | Vitest |
| API 层 | 成功、网络异常、401/403/500、超时 | Vitest mock axios |
| 路由 | 登录拦截、权限重定向、404 | Playwright |
| 跨页面流程 | CRUD 闭环、表单校验、Drawer 交互 | Playwright |
| 视觉 | 长文本截断、响应式断点、动效 | Midscene |

### 3.3 覆盖率门槛

| 范围 | Line | Branch | 备注 |
|---|---|---|---|
| 新代码 | ≥ 70% | ≥ 60% | CI 强制 |
| 关键模块（`utils/`、`api/`、`stores/`） | ≥ 80% | ≥ 70% | CI 强制 |
| Vue 组件 | ≥ 50% | ≥ 40% | 视觉部分用 AI 兜 |
| 历史代码 | 每月递增 2% | — | 不允许后退 |

### 3.4 禁止事项

| 禁止 | 替代方案 |
|---|---|
| ❌ `Thread.sleep` / `waitForTimeout(3000)` | `waitForResponse` / `waitForSelector` / `aiWaitFor` |
| ❌ 测试无 `expect` | 必须至少 1 个断言 |
| ❌ `await page.click('text=新增')` 文案精确匹配 | `getByTestId('btn-add')` |
| ❌ 把 `id` 当 number 比较 | 字符串比较，参考 `normalizeGiftIds` |
| ❌ 直接 `import { ref } from 'vue'`（项目已配 auto-import） | 不写 import |
| ❌ 测试用 `res.data` 链式访问 | 对象解构 `const { code, data, message } = await api()` |
| ❌ 测试中重复定义类型 | 从 `@/views/.../config` 导入 |
| ❌ 提交测试残留数据 | try/finally 清理 |

### 3.5 测试代码模板

#### Vitest 单元测试

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { normalizeGiftIds } from '@/views/finance/gift/api';

describe('normalizeGiftIds', () => {
  describe('happy path', () => {
    it('should_keep_object_shape_when_input_is_plain', () => {
      expect(normalizeGiftIds({ name: 'a' })).toEqual({ name: 'a' });
    });
  });

  describe('boundary value', () => {
    it.each([
      [null, null],
      [undefined, undefined],
      [[], []],
      [{}, {}],
    ])('should_handle_falsy_input %j', (input, expected) => {
      expect(normalizeGiftIds(input as any)).toEqual(expected);
    });
  });

  describe('id conversion (核心约束)', () => {
    it('should_convert_bigint_id_to_string', () => {
      expect(normalizeGiftIds({ id: 999999999999999n }))
        .toEqual({ id: '999999999999999' });
    });

    it('should_convert_number_xxxId_to_string', () => {
      expect(normalizeGiftIds({ giverPersonId: 12345 }))
        .toEqual({ giverPersonId: '12345' });
    });

    it('should_recursively_convert_nested_ids', () => {
      const input = { records: [{ id: 1n, payerId: 2 }] };
      expect(normalizeGiftIds(input))
        .toEqual({ records: [{ id: '1', payerId: '2' }] });
    });
  });

  describe('regression: 防止 ID 精度丢失', () => {
    it('should_preserve_precision_for_Long.MAX_SAFE_INTEGER+1', () => {
      const bigId = 9007199254740993n;
      expect(normalizeGiftIds({ id: bigId }))
        .toEqual({ id: '9007199254740993' });
    });
  });
});
```

#### Playwright（无 AI）DOM 闭环模板

```typescript
import { test, expect } from '@playwright/test';

test.describe('GIFT-PC-RECORD-CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // 登录...
  });

  test('should_create_query_delete_gift_record', async ({ page }) => {
    const unique = `pw-${Date.now()}`;

    try {
      await page.goto('/#/finance/gift/record');
      await page.getByTestId('btn-quick-record').click();
      await page.getByTestId('input-record-amount').fill('888.88');
      await page.getByTestId('input-record-remark').fill(unique);

      const createResponse = page.waitForResponse(
        (r) => r.url().endsWith('/gift-record-info-t') && r.request().method() === 'POST'
      );
      await page.getByTestId('btn-record-submit').click();
      const response = await createResponse;
      expect(response.status()).toBe(200);

      await expect(page.getByText(unique)).toBeVisible();
    } finally {
      // 清理：通过 API 删除而非依赖 UI（防 UI 挂掉时残留）
      // await apiDeleteByRemark(unique);
    }
  });
});
```

#### Midscene AI 测试（保留你已有的写法 + testid 化）

```typescript
await page.goto(`${baseUrl}/#/finance/gift/record`);
await agent.aiWaitFor('礼金记录页面已加载');

await page.getByTestId('btn-quick-record').click();
await page.getByTestId('input-record-amount').fill('888.88');

await agent.aiAssert('快速记礼弹窗布局合理：方向选项在顶部、金额居中、备注在底部');

await page.getByTestId('btn-record-submit').click();
```

---

## 第四部分 · 30 天落地路线

### Week 1 · 引入 Vitest + 加 testid
| 任务 | 投入 |
|---|---|
| 安装 vitest + @vue/test-utils + jsdom + coverage-v8 | 0.5 天 |
| 写第一个示范单测：`normalizeGiftIds.spec.ts` | 0.5 天 |
| gift 模块关键 DOM 加 `data-testid`（约 25 个） | 1 天 |
| 启用 `MIDSCENE_CACHE=true` | 0.2 天 |

### Week 2 · 工具层全覆盖
| 任务 | 投入 |
|---|---|
| `src/utils/*` 全部加单测，目标 line ≥80% | 2 天 |
| `src/stores/*` Pinia store 加单测 | 1.5 天 |
| `src/views/finance/gift/api/*` API 层 mock axios 测试 | 1.5 天 |

### Week 3 · AI 测试瘦身 + 补 case
| 任务 | 投入 |
|---|---|
| 把 `run-smoke.mjs` 中的文案匹配替换为 `getByTestId` | 1 天 |
| 新增 5 个业务关键 case（回礼链路 / 精度 / 离线 / 大列表 / 视觉断点） | 2 天 |
| 引入 fixture 池 + try/finally 清理 | 1 天 |

### Week 4 · CI + 度量
| 任务 | 投入 |
|---|---|
| GitHub Actions：PR 触发 vitest + 选定 AI smoke | 1 天 |
| 覆盖率 PR 评论自动化（Codecov / 自建脚本） | 1 天 |
| `tests/checklists/gift.md` 完整样板 | 0.5 天 |

---

## 第五部分 · Anti-pattern 警示

### 前端 AI 测试 7 大反模式

1. ❌ **依赖 AI 找按钮**：`aiAct('点新增按钮')` → 改 `getByTestId('btn-add').click()`
2. ❌ **AI 写"页面正常"断言**：永远不挂 = 没测
3. ❌ **测试中 hardcode 数字 ID**：用 `${Date.now()}` 生成唯一标识
4. ❌ **测试间共享 page 上下文**：每个 case 独立 `browser.newContext()`
5. ❌ **断言依赖中文文案**：产品改 "新增" 为 "添加" 即全红
6. ❌ **直接连 dev DB 跑 CRUD**：必须 fixture + 清理
7. ❌ **AI 测试用 number 类型断言 ID**：违反项目 ID 字符串约定

### Vue 组件测试 3 大反模式

8. ❌ **mount 整个 App 测一个按钮**：用 `shallowMount` 或 `mount` 单组件
9. ❌ **测试触发 `vue-router` 真实路由**：注入 mock router
10. ❌ **测试 Vant/Ant Design Vue 内部行为**：人家已经测过了，只测你自己的逻辑

---

## 附录 A · data-testid 命名约定

格式：`{模块}-{页面/区域}-{元素类型}-{动作?}`

| 元素 | 命名示例 |
|---|---|
| 按钮 | `gift-record-btn-quick-add` |
| 输入框 | `gift-record-input-amount` |
| Select | `gift-record-select-direction` |
| 表格行 | `gift-record-row-${id}`（id 必须字符串） |
| 表格列 | `gift-record-col-amount` |
| Drawer | `gift-record-drawer-create` |
| 弹窗 | `gift-record-modal-confirm-delete` |
| Tab | `gift-tab-pending-return` |

**强制规则**：
- 所有 `<a-button>` / `<van-button>` 等可点击元素 **必须** 有 testid
- 表格行 testid 必须用业务 id（字符串），不能用 index
- 复用组件（如 `<GiftRecordCard>`）的 testid 通过 props 传入，便于父组件区分

---

## 附录 B · Midscene 与 Playwright 选择决策树

```
              需要写一个测试
                    │
                    ▼
            是纯函数 / 工具吗？
              ├─ 是 → Vitest
              └─ 否
                    ▼
            只测一个 Vue 组件？
              ├─ 是 → Vitest + @vue/test-utils
              └─ 否
                    ▼
            涉及跨页面 / 多组件？
              ├─ 是
              │   │
              │   ▼
              │   断言能用 DOM 描述吗？
              │     ├─ 能 → Playwright（无 AI，便宜稳定）
              │     └─ 不能（涉及视觉/语义）→ Midscene AI
              └─ 否 → 回去拆小
```

---

## 附录 C · 流程总图

```
        ┌──────────────────────────────────────┐
        │   新功能开发开始                       │
        └────────────────┬─────────────────────┘
                         ▼
        ┌──────────────────────────────────────┐
        │ 1. 读 TESTING_STANDARD.md             │
        │ 2. 填 tests/checklists/{feature}.md  │
        │    - 字段边界（七点法）                │
        │    - 状态机                            │
        │    - 权限矩阵                          │
        │    - 用例规划（按金字塔分层）          │
        └────────────────┬─────────────────────┘
                         ▼
        ┌──────────────────────────────────────┐
        │ 3. 按金字塔分层写测试                  │
        │    - utils/api 单测 (Vitest)         │
        │    - composable/store 单测 (Vitest)  │
        │    - 组件测试 (Vitest)               │
        │    - DOM 闭环 (Playwright)           │
        │    - 视觉/语义 (Midscene AI)         │
        └────────────────┬─────────────────────┘
                         ▼
        ┌──────────────────────────────────────┐
        │ 4. 加 data-testid                     │
        │    所有可交互元素必须有 testid         │
        └────────────────┬─────────────────────┘
                         ▼
        ┌──────────────────────────────────────┐
        │ 5. CI 自动检查                         │
        │    - vitest --coverage line≥70%      │
        │    - midscene smoke 全过              │
        │    - testid lint（无 testid 元素警告） │
        │    - checklist 已更新                 │
        └────────────────┬─────────────────────┘
                         ▼
                       ✅ 合并
```

---

## 修订记录

| 版本 | 日期 | 修改人 | 内容 |
|---|---|---|---|
| v1.0 | 2026-05-28 | alex | 首版，PC 端定制 |
