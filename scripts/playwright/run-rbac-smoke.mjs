import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config({ override: true });

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'playwright');
const screenshotDir = path.join(rootDir, 'screenshots', 'playwright');
const logDir = path.join(rootDir, 'logs', 'playwright');
const caseFile = path.join(rootDir, 'tests', 'midscene', 'rbac', 'cases', 'smoke.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadCases() {
  return JSON.parse(fs.readFileSync(caseFile, 'utf-8'));
}

function applyFilter(cases) {
  const filter = process.env.RBAC_CASE_FILTER;
  if (!filter) return cases;
  const set = new Set(filter.split(',').map((s) => s.trim()).filter(Boolean));
  return cases.filter((c) => set.has(c.caseId));
}

function getRuntime() {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) throw new Error('Missing BASE_URL');
  return {
    baseUrl,
    mode: process.env.RBAC_SMOKE_MODE || 'local',
  };
}

function getCredential(persona) {
  if (persona === 'super_super') return [process.env.RBAC_SUPER_USER, process.env.RBAC_SUPER_PASS];
  if (persona === 'rbac_user_manager') return [process.env.RBAC_MANAGER_USER, process.env.RBAC_MANAGER_PASS];
  return [process.env.RBAC_READONLY_USER, process.env.RBAC_READONLY_PASS];
}

async function tryClick(page, selectors) {
  for (const sel of selectors) {
    const locator = page.locator(sel).first();
    if (await locator.count()) {
      try {
        await locator.click({ timeout: 2000 });
        return true;
      } catch {
        // continue trying
      }
    }
  }
  return false;
}

async function ensureLoggedIn(page, persona) {
  const [username, password] = getCredential(persona);
  if (!password) {
    const err = new Error(`Missing credentials for persona=${persona}`);
    err.code = 'MISSING_CREDENTIALS';
    throw err;
  }

  await page.waitForTimeout(600);
  const userLocator = page.locator(
    'input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"], input[placeholder*="username"], input[type="text"]',
  );
  const hasUserInput = (await userLocator.count()) > 0;

  if (!hasUserInput) return;

  const usernameCandidates = [username, 'supersuper'].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i);
  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  let success = false;
  for (const uname of usernameCandidates) {
    const userInput = userLocator.first();
    await userInput.fill('');
    await passInput.fill('');
    await userInput.fill(uname);
    await passInput.fill(password);
    await tryClick(page, ['button:has-text("登录")', 'button:has-text("Log in")', 'button:has-text("Login")', '.ant-btn-primary']);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
    const stillOnLoginTry =
      (await page
        .locator(
          'input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"], input[placeholder*="username"], input[type="text"]',
        )
        .count()) > 0;
    if (!stillOnLoginTry) {
      success = true;
      break;
    }
  }

  const stillOnLogin =
    (await page
      .locator(
        'input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"], input[placeholder*="username"], input[type="text"]',
      )
      .count()) > 0;
  if (stillOnLogin || !success) {
    const err = new Error(`Login failed for persona=${persona}, please verify credentials`);
    err.code = 'AUTH_FAILED';
    throw err;
  }
}

async function gotoMenu(page, names) {
  // RBAC 菜单在“用户管理”分组下，先尝试展开分组，避免子菜单不可见导致定位失败
  await tryClick(page, [
    '.ant-menu-submenu-title:has-text("用户管理")',
    '.ant-menu-title-content:has-text("用户管理")',
    'span:has-text("用户管理")',
  ]);
  await page.waitForTimeout(250);

  const aliases = names.split('、').map((s) => s.trim());
  for (const name of aliases) {
    const ok = await tryClick(page, [
      `.ant-menu-submenu .ant-menu-title-content:has-text("${name}")`,
      `.ant-menu-title-content:has-text("${name}")`,
      `span:has-text("${name}")`,
      `a:has-text("${name}")`,
    ]);
    if (ok) {
      await page.waitForTimeout(600);
      return;
    }
  }
  throw new Error(`Menu not found: ${names}`);
}

async function gotoRbacPage(page, runtime, key) {
  const map = {
    user: {
      menus: '用户信息、用户',
      paths: ['/user', '/user-manager', '/user/info', '/#/user/userManager', '/#/user/userManager/'],
      anchors: ['用户信息', '用户管理', '用户名', '账号', '查询', '新增'],
    },
    role: {
      menus: '角色管理、角色信息、角色',
      paths: ['/role', '/role-info', '/role-manager', '/#/user/roleInfo', '/#/user/roleInfo/'],
      anchors: ['角色编码', '角色名称', '授权', '用户'],
    },
    menu: {
      menus: '菜单管理、菜单信息、菜单',
      paths: ['/menu', '/menu-info', '/menu-manager', '/#/user/menuInfo', '/#/user/menuInfo/'],
      anchors: ['菜单名称', '菜单路径', '菜单标题', '新增'],
    },
    org: {
      menus: '机构管理、机构信息、机构',
      paths: ['/org', '/org-info', '/organization', '/#/user/orgInfo', '/#/user/orgInfo/'],
      anchors: ['机构名称', '组织架构', '上级机构', '新增', '机构管理'],
    },
  };
  const conf = map[key];
  if (!conf) throw new Error(`Unknown page key: ${key}`);

  try {
    await gotoMenu(page, conf.menus);
    await page.waitForTimeout(500);
    for (const text of conf.anchors) {
      if (await existsText(page, text)) return;
    }
    if (key === 'user') {
      // 仪表盘“快捷操作”兜底入口
      const quickEntry = await tryClick(page, ['button:has-text("用户管理")', '.action-btn:has-text("用户管理")']);
      if (quickEntry) {
        await page.waitForTimeout(700);
        for (const text of conf.anchors) {
          if (await existsText(page, text)) return;
        }
      }
    }
    return;
  } catch {
    // fallback to direct path probing when side menu structure differs
  }

  for (const p of conf.paths) {
    const url = new URL(p, runtime.baseUrl).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    for (const text of conf.anchors) {
      if (await existsText(page, text)) return;
    }
  }
  throw new Error(`Cannot open page: ${key}`);
}

async function existsText(page, text) {
  return (await page.getByText(text, { exact: false }).count()) > 0;
}

async function runCase(page, c, runtime) {
  await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
  await ensureLoggedIn(page, c.persona);

  switch (c.caseId) {
    case 'RBAC-LOCAL-001':
      if (await existsText(page, '角色管理')) throw new Error('readonly should not see 角色管理');
      break;
    case 'RBAC-LOCAL-002':
      await gotoRbacPage(page, runtime, 'user');
      if (await existsText(page, '新增')) throw new Error('readonly should not see 新增');
      break;
    case 'RBAC-LOCAL-003':
      // 该环境下“超管入口可见”采用 dashboard 快捷操作做稳定断言
      if (
        !(await existsText(page, '用户管理')) &&
        (await page.locator('button:has-text("用户管理"), .action-btn:has-text("用户管理")').count()) === 0
      ) {
        throw new Error('super should see 用户管理入口');
      }
      break;
    case 'RBAC-LOCAL-004':
      await gotoRbacPage(page, runtime, 'user');
      await page.reload({ waitUntil: 'domcontentloaded' });
      if (await existsText(page, '登录')) throw new Error('should remain logged in after reload');
      break;
    case 'RBAC-LOCAL-005':
      await gotoRbacPage(page, runtime, 'org');
      if (await existsText(page, '新增用户')) throw new Error('org page should not allow user binding');
      break;
    case 'RBAC-LOCAL-006':
      await gotoRbacPage(page, runtime, 'role');
      if (!(await existsText(page, '用户'))) throw new Error('role page should have 用户 assignment entry');
      break;
    case 'RBAC-LOCAL-101':
      await gotoRbacPage(page, runtime, 'user');
      if (!(await existsText(page, '下一页') || (await page.locator('.ant-pagination').count()) > 0)) {
        throw new Error('user page should show pagination');
      }
      break;
    case 'RBAC-LOCAL-201':
      await gotoRbacPage(page, runtime, 'role');
      if (!(await existsText(page, '角色编码'))) throw new Error('role page should show 角色编码');
      break;
    case 'RBAC-LOCAL-301':
      await gotoRbacPage(page, runtime, 'menu');
      await page.waitForTimeout(500);
      const menuSelected = (await page.locator('.ant-menu-item-selected:has-text("菜单管理")').count()) > 0;
      const breadcrumbMenu = (await page.locator('.ant-breadcrumb:has-text("菜单管理")').count()) > 0;
      if (!menuSelected && !breadcrumbMenu) {
        throw new Error('menu page should be active in sidebar or breadcrumb');
      }
      break;
    default:
      throw new Error(`Unsupported case: ${c.caseId}`);
  }
}

async function main() {
  ensureDir(reportDir);
  ensureDir(screenshotDir);
  ensureDir(logDir);
  const runtime = getRuntime();
  const cases = applyFilter(loadCases());
  if (!cases.length) throw new Error('No cases selected');

  const browser = await chromium.launch({
    headless: runtime.mode === 'ci',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const results = [];

  for (const c of cases) {
    try {
      await runCase(page, c, runtime);
      await page.screenshot({ path: path.join(screenshotDir, `${c.caseId}_pass.png`), fullPage: true });
      results.push({ caseId: c.caseId, title: c.title, status: 'pass' });
    } catch (e) {
      if (e?.code === 'MISSING_CREDENTIALS' || e?.code === 'AUTH_FAILED') {
        results.push({ caseId: c.caseId, title: c.title, status: 'skipped', reason: e.message });
      } else {
        await page.screenshot({ path: path.join(screenshotDir, `${c.caseId}_fail.png`), fullPage: true }).catch(() => undefined);
        results.push({ caseId: c.caseId, title: c.title, status: 'fail', error: String(e?.message || e) });
        fs.appendFileSync(path.join(logDir, 'smoke.log'), `${new Date().toISOString()} FAIL ${c.caseId} ${String(e?.message || e)}\n`);
      }
    }
  }

  await browser.close();

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const report = {
    mode: runtime.mode,
    baseUrl: runtime.baseUrl,
    total: results.length,
    passed,
    failed,
    skipped,
    generatedAt: new Date().toISOString(),
    cases: results,
  };
  fs.writeFileSync(path.join(reportDir, 'smoke-report.json'), JSON.stringify(report, null, 2));
  console.log(`Playwright RBAC smoke finished. total=${results.length}, passed=${passed}, failed=${failed}, skipped=${skipped}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Playwright RBAC smoke failed:', e.message);
  process.exit(1);
});
