import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';

dotenv.config({ override: true });

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'midscene');
const screenshotDir = path.join(rootDir, 'screenshots', 'midscene');
const logDir = path.join(rootDir, 'logs', 'midscene');
const caseFile = path.join(rootDir, 'tests', 'midscene', 'rbac', 'cases', 'smoke.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCases() {
  const raw = fs.readFileSync(caseFile, 'utf-8');
  return JSON.parse(raw);
}

function applyFilter(cases) {
  const filterRaw = process.env.MIDSCENE_CASE_FILTER;
  if (!filterRaw) return cases;
  const allowSet = new Set(filterRaw.split(',').map((item) => item.trim()).filter(Boolean));
  return cases.filter((item) => allowSet.has(item.caseId));
}

function validateEnv() {
  const baseUrl = process.env.BASE_URL;
  const modelApiKey = process.env.MIDSCENE_MODEL_API_KEY;
  const modelName = process.env.MIDSCENE_MODEL_NAME;
  const modelFamily = process.env.MIDSCENE_MODEL_FAMILY;
  if (!baseUrl) {
    throw new Error('Missing BASE_URL. Please set BASE_URL before running Midscene smoke.');
  }
  if (!modelApiKey || !modelName || !modelFamily) {
    throw new Error('Missing Midscene model env. Please set MIDSCENE_MODEL_API_KEY/MIDSCENE_MODEL_NAME/MIDSCENE_MODEL_FAMILY.');
  }
  return {
    baseUrl,
    mode: process.env.MIDSCENE_MODE || 'local',
  };
}

function getPersonaCredential(persona) {
  if (persona === 'super_super') {
    return { username: process.env.RBAC_SUPER_USER, password: process.env.RBAC_SUPER_PASS };
  }
  if (persona === 'rbac_user_manager') {
    return { username: process.env.RBAC_MANAGER_USER, password: process.env.RBAC_MANAGER_PASS };
  }
  return { username: process.env.RBAC_READONLY_USER, password: process.env.RBAC_READONLY_PASS };
}

function hasCredential(persona) {
  const cred = getPersonaCredential(persona);
  return !!cred.username && !!cred.password;
}

async function login(agent, persona) {
  const credential = getPersonaCredential(persona);
  if (!credential.username || !credential.password) {
    const err = new Error(`Missing credentials for persona=${persona}`);
    err.code = 'MIDSCENE_MISSING_CREDENTIALS';
    throw err;
  }
  await agent.aiInput(credential.username, '登录页用户名输入框');
  await agent.aiInput(credential.password, '登录页密码输入框');
  await agent.aiTap('登录按钮');
  await agent.aiWaitFor('登录成功后页面可见左侧菜单和顶部导航');
}

async function ensureLoggedIn(agent, persona) {
  const onLoginPage = await agent.aiBoolean(
    '当前页面是否为登录页，并且可见用户名输入框、密码输入框和登录按钮',
  );
  if (onLoginPage) {
    await login(agent, persona);
  }
}

function pageAnchor(pageName) {
  if (pageName === '用户管理') return '用户管理页面可见“新增”按钮或用户列表区域';
  if (pageName === '角色管理') return '角色管理页面可见“新增”按钮或角色列表区域';
  if (pageName === '菜单管理') return '菜单管理页面可见“新增”按钮或菜单列表区域';
  if (pageName === '权限管理') return '权限管理页面可见“新增”按钮或权限列表区域';
  if (pageName === '机构管理') return '机构管理页面左侧可见组织架构树，右侧可见机构列表';
  return `${pageName}页面加载完成`;
}

async function gotoRbacPage(agent, pageName) {
  const pageAliases = {
    用户管理: '用户管理、用户信息、用户',
    角色管理: '角色管理、角色信息、角色',
    菜单管理: '菜单管理、菜单信息、菜单',
    权限管理: '权限管理、权限信息、权限',
    机构管理: '机构管理、机构信息、机构',
  };
  const aliasText = pageAliases[pageName] || pageName;
  await agent.aiAct(`在左侧菜单中点击“${aliasText}”对应的菜单并进入页面`);
  await agent.aiWaitFor(pageAnchor(pageName));
}

async function assertNoCrudButtons(agent) {
  await agent.aiAssert('页面中找不到按钮文本为“新增”的按钮');
  await agent.aiAssert('页面中找不到按钮文本为“编辑”的按钮');
  await agent.aiAssert('页面中找不到按钮文本为“删除”的按钮');
}

async function assertHasCrudButtons(agent) {
  await agent.aiAssert('页面中可见按钮文本为“新增”的按钮');
  await agent.aiAssert('页面中可见按钮文本为“删除”的按钮');
}

async function runCase(testCase, runtime, page, agent) {
  const startedAt = new Date().toISOString();
  await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
  await ensureLoggedIn(agent, testCase.persona);
  switch (testCase.caseId) {
    case 'RBAC-LOCAL-001':
      // 用“不可见锚点菜单项”做稳定断言（与后端菜单过滤一致）
      await agent.aiAssert('左侧菜单中找不到“角色管理”入口');
      await agent.aiAssert('左侧菜单中找不到“菜单管理”入口');
      await agent.aiAssert('左侧菜单中找不到“权限管理”入口');
      await agent.aiAssert('左侧菜单中找不到“机构管理”入口');
      break;
    case 'RBAC-LOCAL-002':
      // 只读角色：进入至少一个页面验证 CRUD 按钮不可见即可（减少翻页导航的不确定性）
      await gotoRbacPage(agent, '用户管理');
      await assertNoCrudButtons(agent);
      break;
    case 'RBAC-LOCAL-003':
      await gotoRbacPage(agent, '用户管理');
      await agent.aiAssert('用户管理页面可见“新增”按钮');
      break;
    case 'RBAC-LOCAL-004':
      await gotoRbacPage(agent, '用户管理');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await agent.aiWaitFor('刷新后仍能看到用户管理列表表格');
      await agent.aiAssert('当前页面不是登录页');
      await agent.aiAssert('当前页面不是404页面');
      break;
    case 'RBAC-LOCAL-005':
      await gotoRbacPage(agent, '机构管理');
      await agent.aiAssert('机构管理页面中不出现“新增用户”“移动用户”“分配用户”这些文案或按钮');
      break;
    case 'RBAC-LOCAL-006':
      await gotoRbacPage(agent, '角色管理');
      await agent.aiAct('点击某条角色行里的“用户”按钮，打开角色用户分配抽屉');
      await agent.aiAssert('抽屉中可见用户分配区域，并可见“保存”按钮');
      break;
    case 'RBAC-LOCAL-101':
      await gotoRbacPage(agent, '用户管理');
      await agent.aiAct('将用户列表切换到第2页');
      await agent.aiWaitFor('用户列表已切换到第2页且表格仍可见');
      await agent.aiAct('将每页数量切换为20条');
      await agent.aiWaitFor('每页数量为20条且用户表格仍可见');
      break;
    case 'RBAC-LOCAL-201':
      await gotoRbacPage(agent, '角色管理');
      await agent.aiAct('在查询条件中输入一个角色编码并点击查找');
      await agent.aiWaitFor('角色管理表格已刷新并显示筛选结果');
      break;
    case 'RBAC-LOCAL-301':
      await gotoRbacPage(agent, '菜单管理');
      await agent.aiAct('点击新增按钮打开菜单新增弹窗');
      await agent.aiAssert('弹窗表单中存在字段“权限标识”');
      await agent.aiAssert('弹窗表单中存在字段“首页展示”');
      break;
    default:
      throw new Error(`Unsupported caseId=${testCase.caseId}`);
  }
  const screenshotPath = path.join(screenshotDir, `${testCase.caseId}_pass.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const logLines = [
    `[${startedAt}] START ${testCase.caseId} ${testCase.title}`,
    `mode=${runtime.mode} baseUrl=${runtime.baseUrl}`,
    `persona=${testCase.persona} level=${testCase.level}`,
    `[${new Date().toISOString()}] PASS ${testCase.caseId}`,
    '',
  ];
  fs.appendFileSync(path.join(logDir, 'smoke.log'), logLines.join('\n'));
}

async function main() {
  ensureDir(reportDir);
  ensureDir(screenshotDir);
  ensureDir(logDir);
  const runtime = validateEnv();
  const allCases = loadCases();
  const selectedCases = applyFilter(allCases);
  if (!selectedCases.length) {
    throw new Error('No smoke cases selected. Please check MIDSCENE_CASE_FILTER.');
  }
  const browser = await chromium.launch({
    headless: runtime.mode === 'ci',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  const agent = new PlaywrightAgent(page);

  const results = [];
  for (const testCase of selectedCases) {
    try {
      if (!hasCredential(testCase.persona)) {
        results.push({
          caseId: testCase.caseId,
          title: testCase.title,
          status: 'skipped',
          reason: `Missing credentials for persona=${testCase.persona}`,
        });
        continue;
      }
      await runCase(testCase, runtime, page, agent);
      results.push({
        caseId: testCase.caseId,
        title: testCase.title,
        status: 'pass',
      });
    } catch (error) {
      const failShot = path.join(screenshotDir, `${testCase.caseId}_fail.png`);
      await page.screenshot({ path: failShot, fullPage: true }).catch(() => undefined);
      const errCode = error?.code;
      const reason = String(error?.message || error);

      if (errCode === 'MIDSCENE_MISSING_CREDENTIALS') {
        results.push({
          caseId: testCase.caseId,
          title: testCase.title,
          status: 'skipped',
          reason,
        });
      } else {
        fs.appendFileSync(
          path.join(logDir, 'smoke.log'),
          `[${new Date().toISOString()}] FAIL ${testCase.caseId} ${reason}\n`,
        );
        results.push({
          caseId: testCase.caseId,
          title: testCase.title,
          status: 'fail',
          error: reason,
        });
        if (runtime.mode === 'ci') {
          await browser.close();
          throw error;
        }
      }
    }
  }
  await browser.close();
  const passedCount = results.filter((item) => item.status === 'pass').length;
  const failedCount = results.filter((item) => item.status === 'fail').length;
  const skippedCount = results.filter((item) => item.status === 'skipped').length;
  const report = {
    mode: runtime.mode,
    baseUrl: runtime.baseUrl,
    total: selectedCases.length,
    passed: passedCount,
    failed: failedCount,
    skipped: skippedCount,
    generatedAt: new Date().toISOString(),
    cases: results,
  };
  fs.writeFileSync(path.join(reportDir, 'smoke-report.json'), JSON.stringify(report, null, 2));
  console.log(
    `Midscene smoke finished. total=${selectedCases.length}, passed=${passedCount}, failed=${failedCount}, skipped=${skippedCount}`,
  );
  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Midscene smoke skeleton failed:', error.message);
  process.exit(1);
});
