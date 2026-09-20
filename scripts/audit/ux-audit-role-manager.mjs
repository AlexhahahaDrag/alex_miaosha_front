/**
 * Role-management UX audit driver (rbac_user_manager).
 * Interaction-first: login → role list → search → auth drawer → user assign → relation page.
 * Evidence: .jez/audit-evidence/2026-08-19-role/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env'), override: true });

const evidenceDir = path.join(rootDir, '.jez', 'audit-evidence', '2026-08-19-role');
const baseUrl = (process.env.BASE_URL || 'http://localhost:3000/').replace(/\/?$/, '/');
const username = process.env.RBAC_MANAGER_USER;
const password = process.env.RBAC_MANAGER_PASS;

const manifest = [];
const findings = [];
const networkLog = [];
const consoleLog = [];
let step = 0;

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ts() {
	return new Date().toISOString().slice(11, 19);
}

function logManifest(ok, text) {
	manifest.push({ t: ts(), ok, text });
	console.log(`[${ok ? '✓' : '✗'}] ${ts()} ${text}`);
}

async function shot(page, name) {
	step += 1;
	const file = `${String(step).padStart(2, '0')}-${name}.png`;
	const full = path.join(evidenceDir, file);
	await page.screenshot({ path: full, fullPage: false });
	return file;
}

async function tryClick(page, selectors, timeout = 2500) {
	for (const sel of selectors) {
		const loc = page.locator(sel).first();
		if ((await loc.count()) === 0) continue;
		try {
			await loc.click({ timeout });
			return sel;
		} catch {
			/* continue */
		}
	}
	return null;
}

async function login(page) {
	await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
	await page.waitForTimeout(1000);
	await shot(page, 'login-before');

	const userInput = page
		.locator(
			'#form_item_username, input[placeholder*="Enter your username"], input[placeholder*="用户名"], input[placeholder*="账号"]',
		)
		.first();
	const passInput = page.locator('#form_item_password, input[type="password"]').first();

	await userInput.waitFor({ state: 'visible', timeout: 15000 });

	// Mirror scripts/playwright/run-rbac-smoke.mjs — AntDV v-model needs sequential input
	await userInput.click();
	await userInput.fill('');
	await userInput.pressSequentially(username, { delay: 20 });
	const typedUser = await userInput.inputValue();
	if (typedUser !== username) {
		await userInput.evaluate((el, value) => {
			el.value = value;
			el.dispatchEvent(new Event('input', { bubbles: true }));
			el.dispatchEvent(new Event('change', { bubbles: true }));
		}, username);
	}
	logManifest(true, `Typed username="${username}" (persona rbac_user_manager)`);

	await passInput.click();
	await passInput.fill('');
	await passInput.pressSequentially(password, { delay: 20 });
	logManifest(true, `Typed password into password field`);

	await shot(page, 'login-filled');

	const loginRespPromise = page
		.waitForResponse(
			(r) => r.url().includes('/user/login') && r.request().method() === 'POST',
			{ timeout: 25000 },
		)
		.catch(() => null);

	const clicked = await tryClick(page, ['.login-btn', 'button:has-text("登录")']);
	if (!clicked) throw new Error('Login button not found');
	logManifest(true, `Clicked primary login action (${clicked})`);

	const loginResp = await loginRespPromise;
	if (loginResp) {
		logManifest(true, `Observed login network ${loginResp.status()} ${loginResp.url().split('?')[0]}`);
	} else {
		logManifest(false, 'No /user/login response within 25s');
	}

	// Wait until password field gone OR token present
	const ok = await page
		.waitForFunction(
			() => {
				const hasPwd = !!document.querySelector('input[type="password"]');
				const token = localStorage.getItem('token');
				return !hasPwd || (!!token && token.length > 8);
			},
			{ timeout: 25000 },
		)
		.then(() => true)
		.catch(() => false);

	await page.waitForTimeout(1500);
	await shot(page, 'login-after');

	const token = await page.evaluate(() => localStorage.getItem('token') || '');
	const stillLogin = (await page.locator('input[type="password"]').count()) > 0 && !token;
	if (!ok || stillLogin) {
		const toast = await page.locator('.ant-message, .ant-notification').allTextContents();
		findings.push({
			id: 'C1',
			severity: 'Critical',
			layer: 'Interaction',
			surface: '/login',
			title: 'rbac_user_manager 登录失败',
			observed: `仍在登录页; tokenLen=${token.length}; toast=${JSON.stringify(toast).slice(0, 200)}; loginStatus=${loginResp?.status?.() ?? 'n/a'}`,
			expected: '进入管理端首页并写入 token',
			evidence: '03-login-after.png',
			location: 'src/views/login/index.vue + gateway via vite proxy',
			patch: '对齐 smoke 脚本登录时序；检查加密响应解密与表单校验',
		});
		throw new Error('AUTH_FAILED');
	}
	logManifest(true, `Verified logged in (url=${page.url()}, tokenLen=${token.length})`);
}

async function gotoRoleInfo(page) {
	await tryClick(page, [
		'.ant-menu-submenu-title:has-text("用户管理")',
		'.ant-menu-title-content:has-text("用户管理")',
		'span:has-text("用户管理")',
	]);
	await page.waitForTimeout(400);
	const clicked = await tryClick(page, [
		'[data-testid="menu-roleInfo"]',
		'.ant-menu-item:has-text("角色管理")',
		'.ant-menu-title-content:has-text("角色管理")',
		'a:has-text("角色管理")',
		'span:has-text("角色管理")',
	]);
	if (!clicked) {
		await page.goto(`${baseUrl}#/user/roleInfo`, { waitUntil: 'domcontentloaded' });
		logManifest(true, `Deep-linked to #/user/roleInfo (menu click missed)`);
	} else {
		logManifest(true, `Opened 角色管理 via menu (${clicked})`);
	}
	await page.waitForTimeout(1500);
	await shot(page, 'role-list');
}

async function inventoryRolePage(page) {
	const selectors = [
		'[data-testid="role-search-code"]',
		'[data-testid="role-search-name"]',
		'[data-testid="role-btn-search"]',
		'[data-testid="role-btn-reset"]',
		'[data-testid="role-btn-add"]',
		'[data-testid="role-btn-batch-delete"]',
		'[data-testid="rbac-data-scope-hint"]',
		'.ant-table',
		'.ant-pagination',
	];
	const present = [];
	for (const sel of selectors) {
		if ((await page.locator(sel).count()) > 0) present.push(sel);
	}
	logManifest(true, `Element inventory on role list: ${present.length}/${selectors.length} present`);
	return { selectors, present };
}

async function searchRole(page) {
	const codeInput = page
		.locator(
			'[data-testid="role-search-code"], input[placeholder*="编码"], input[placeholder*="roleCode"]',
		)
		.first();
	const nameInput = page
		.locator('[data-testid="role-search-name"], input[placeholder*="名称"], input[placeholder*="名称"]')
		.first();

	if ((await codeInput.count()) === 0 && (await nameInput.count()) === 0) {
		findings.push({
			id: 'H1',
			severity: 'High',
			layer: 'Interaction',
			surface: '#/user/roleInfo',
			title: '角色列表搜索框不可发现',
			observed: '未找到 roleCode/roleName 搜索输入',
			expected: '可按编码/名称过滤',
			evidence: '04-role-list.png',
			location: 'src/views/user/roleInfo/index.vue',
			patch: '补 searchable 表单项与 data-testid',
		});
		logManifest(false, 'Could not type into role search (inputs missing)');
		return;
	}

	const target = (await nameInput.count()) > 0 ? nameInput : codeInput;
	await target.click({ clickCount: 3 });
	await page.keyboard.press('Backspace');
	await target.pressSequentially('admin', { delay: 30 });
	logManifest(true, `Typed "admin" into role search input`);
	await shot(page, 'role-search-typed');

	const searchBtn = await tryClick(page, [
		'[data-testid="role-btn-search"]',
		'button:has-text("查询")',
		'button:has-text("搜索")',
	]);
	logManifest(!!searchBtn, `Triggered search${searchBtn ? ` (${searchBtn})` : ' (auto/debounce?)'}`);
	await page.waitForTimeout(1200);
	await shot(page, 'role-search-result');
}

async function openAuthDrawer(page) {
	const authBtn = await tryClick(page, [
		'[data-testid="role-row-auth"]',
		'button:has-text("授权")',
		'a:has-text("授权")',
		'.ant-btn:has-text("授权")',
	]);
	if (!authBtn) {
		findings.push({
			id: 'H2',
			severity: 'High',
			layer: 'Interaction',
			surface: '#/user/roleInfo',
			title: '授权入口不可达',
			observed: '列表行上找不到「授权」按钮',
			expected: '行操作含授权并打开权限树抽屉',
			evidence: '04-role-list.png',
			location: 'src/views/user/roleInfo/index.vue',
			patch: '确保 role:auth 按钮对 rbac_user_manager 可见',
		});
		logManifest(false, 'Auth drawer trigger not found');
		return false;
	}
	logManifest(true, `Clicked 授权 (${authBtn})`);
	await page.waitForTimeout(1200);
	await shot(page, 'auth-drawer');

	const drawer = page.locator('.ant-drawer, [data-testid="role-auth-drawer"]').first();
	const open = (await drawer.count()) > 0 && (await drawer.isVisible().catch(() => false));
	logManifest(open, `Verified auth drawer/modal visible=${open}`);

	const tree = page.locator(
		'.ant-tree, [data-testid="rbac-permission-tree"], .rbac-permission-tree, .menu-tree',
	);
	const hasTree = (await tree.count()) > 0;
	logManifest(hasTree, `Permission tree present=${hasTree}`);
	if (!hasTree) {
		findings.push({
			id: 'H3',
			severity: 'High',
			layer: 'Feedback',
			surface: '#/user/roleInfo auth drawer',
			title: '授权抽屉无权限树',
			observed: '打开授权后未见树组件',
			expected: 'RbacPermissionTreePanel 渲染可勾选节点',
			evidence: '07-auth-drawer.png',
			location: 'src/views/user/roleInfo/authorizationDetail/index.vue',
			patch: '检查 permissionList 加载与空态提示',
		});
	}

	const diff = page.locator('[data-testid="rbac-diff-preview"], .rbac-diff-preview');
	if ((await diff.count()) === 0) {
		findings.push({
			id: 'M1',
			severity: 'Medium',
			layer: 'Feedback',
			surface: '#/user/roleInfo auth drawer',
			title: '授权无差异预览',
			observed: '保存前看不到增删权限 Diff',
			expected: '与角色用户页一样有 DiffPreview',
			evidence: '07-auth-drawer.png',
			location: 'src/views/user/roleInfo/authorizationDetail/index.vue',
			patch: '接入 RbacDiffPreview，提交前展示 added/removed',
		});
	}

	// Close without destructive save (ask-first for destructive; closing is fine)
	await tryClick(page, [
		'.ant-drawer-close',
		'button:has-text("取消")',
		'[aria-label="Close"]',
	]);
	await page.waitForTimeout(500);
	logManifest(true, 'Closed auth drawer without saving (non-destructive)');
	return true;
}

async function openUserAssign(page) {
	const btn = await tryClick(page, [
		'[data-testid="role-row-users"]',
		'button:has-text("用户")',
		'a:has-text("用户")',
	]);
	if (!btn) {
		logManifest(false, 'User-assign drawer trigger not found on row');
		findings.push({
			id: 'M2',
			severity: 'Medium',
			layer: 'Interaction',
			surface: '#/user/roleInfo',
			title: '行内「用户」分配入口缺失或被权限隐藏',
			observed: '点不到用户分配抽屉',
			expected: '行操作可打开 Transfer 分配',
			evidence: '04-role-list.png',
			location: 'src/views/user/roleInfo/index.vue',
			patch: '核对按钮权限码与 data-testid',
		});
		return;
	}
	logManifest(true, `Clicked 用户 assign (${btn})`);
	await page.waitForTimeout(1200);
	await shot(page, 'user-assign-drawer');
	const transfer = page.locator('.ant-transfer, [data-testid="role-user-transfer"]');
	logManifest((await transfer.count()) > 0, `Transfer present=${(await transfer.count()) > 0}`);
	await tryClick(page, ['.ant-drawer-close', 'button:has-text("取消")']);
	await page.waitForTimeout(400);
}

async function openRelationPage(page) {
	const btn = await tryClick(page, [
		'[data-testid="role-btn-relation"]',
		'button:has-text("关系配置")',
		'button:has-text("用户配置")',
		'a:has-text("角色用户")',
	]);
	if (!btn) {
		await page.goto(`${baseUrl}#/user/role-user-info`, { waitUntil: 'domcontentloaded' });
		logManifest(true, 'Deep-linked #/user/role-user-info');
	} else {
		logManifest(true, `Opened relation page (${btn})`);
	}
	await page.waitForTimeout(1500);
	await shot(page, 'role-user-relation');

	const empty = page.locator('.ant-empty, [data-testid="role-user-empty"]');
	const dual = page.locator('[data-testid="rbac-dual-list"], .rbac-dual-list');
	logManifest(true, `Relation empty=${(await empty.count()) > 0} dualList=${(await dual.count()) > 0}`);

	// first-time-user: if empty only "请先选择角色" without picker labels
	const bodyText = await page.locator('body').innerText();
	if (bodyText.includes('请先选择角色') && !bodyText.includes('选择角色')) {
		findings.push({
			id: 'M3',
			severity: 'Medium',
			layer: 'Delight',
			surface: '#/user/role-user-info',
			title: '首次进入关系页缺少引导',
			observed: '空态提示选择角色，但选择器可能不够醒目',
			expected: '首屏突出角色选择器 + 一步说明',
			evidence: '10-role-user-relation.png',
			location: 'src/views/user/roleUserInfo/index.vue',
			patch: '空态旁放置角色 Select 并标注「先选角色再分配」',
		});
	}
}

async function multiPaneSpot(page) {
	for (const width of [1280, 1024, 768]) {
		await page.setViewportSize({ width, height: 900 });
		await page.waitForTimeout(400);
		const overflow = await page.evaluate(() => {
			const doc = document.documentElement;
			return {
				scrollWidth: doc.scrollWidth,
				clientWidth: doc.clientWidth,
				overflowX: doc.scrollWidth > doc.clientWidth + 2,
			};
		});
		await shot(page, `viewport-${width}`);
		logManifest(true, `Viewport ${width}: overflowX=${overflow.overflowX}`);
		if (overflow.overflowX) {
			findings.push({
				id: `H-layout-${width}`,
				severity: 'High',
				layer: 'Visual',
				surface: `${page.url()} @${width}`,
				title: `横向溢出 @${width}`,
				observed: `scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`,
				expected: '无横向滚动条',
				evidence: `${String(step).padStart(2, '0')}-viewport-${width}.png`,
				location: 'roleInfo / layout CSS',
				patch: '收紧表格操作列或改用折叠操作菜单',
			});
		}
	}
	await page.setViewportSize({ width: 1440, height: 900 });
}

async function injectAxe(page) {
	await page.addScriptTag({
		url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
	});
	await page.waitForTimeout(500);
	const result = await page.evaluate(async () => {
		if (!window.axe) return { error: 'axe missing' };
		return window.axe.run(document, { resultTypes: ['violations'] });
	});
	const critical = (result.violations || []).filter((v) => v.impact === 'critical');
	const serious = (result.violations || []).filter((v) => v.impact === 'serious');
	fs.writeFileSync(
		path.join(evidenceDir, 'axe-roleInfo.json'),
		JSON.stringify(result.violations || [], null, 2),
		'utf-8',
	);
	logManifest(
		true,
		`axe-core: critical=${critical.length} serious=${serious.length} total=${(result.violations || []).length}`,
	);
	for (const v of critical) {
		findings.push({
			id: `A11Y-C-${v.id}`,
			severity: 'Critical',
			layer: 'Visual',
			surface: '#/user/roleInfo',
			title: `axe critical: ${v.id}`,
			observed: v.help,
			expected: '无 critical a11y 违规',
			evidence: 'axe-roleInfo.json',
			location: v.nodes?.[0]?.target?.join(' ') || 'DOM',
			patch: v.help,
		});
	}
	for (const v of serious) {
		findings.push({
			id: `A11Y-S-${v.id}`,
			severity: 'High',
			layer: 'Visual',
			surface: '#/user/roleInfo',
			title: `axe serious: ${v.id}`,
			observed: v.help,
			expected: '无 serious a11y 违规',
			evidence: 'axe-roleInfo.json',
			location: v.nodes?.[0]?.target?.join(' ') || 'DOM',
			patch: v.help,
		});
	}
	return { critical: critical.length, serious: serious.length };
}

async function perfSample(page) {
	const metrics = await page.evaluate(() => {
		const nav = performance.getEntriesByType('navigation')[0];
		const paints = performance.getEntriesByType('paint');
		const lcpEntry = performance.getEntriesByType('largest-contentful-paint').at(-1);
		return {
			lcp: lcpEntry?.startTime || nav?.loadEventEnd || 0,
			cls: 0,
			domContentLoaded: nav?.domContentLoadedEventEnd || 0,
			fcp: paints.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
		};
	});
	fs.writeFileSync(path.join(evidenceDir, 'perf.json'), JSON.stringify(metrics, null, 2));
	logManifest(true, `Perf sample LCP~=${Math.round(metrics.lcp)}ms FCP=${Math.round(metrics.fcp)}ms`);
	return metrics;
}

async function main() {
	ensureDir(evidenceDir);
	if (!username || !password) {
		throw new Error('Missing RBAC_MANAGER_USER/PASS in .env');
	}

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	page.on('console', (msg) => {
		const type = msg.type();
		if (type === 'error' || type === 'warning') {
			consoleLog.push({ type, text: msg.text(), t: ts() });
		}
	});
	page.on('response', (res) => {
		const status = res.status();
		const url = res.url();
		if (status >= 400) networkLog.push({ status, url, t: ts() });
	});

	const started = Date.now();
	try {
		await login(page);
		await gotoRoleInfo(page);
		await inventoryRolePage(page);
		await searchRole(page);
		await openAuthDrawer(page);
		await openUserAssign(page);
		await openRelationPage(page);
		await page.goto(`${baseUrl}#/user/roleInfo`, { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(1000);
		await multiPaneSpot(page);
		await page.goto(`${baseUrl}#/user/roleInfo`, { waitUntil: 'networkidle' }).catch(() => {});
		await page.waitForTimeout(800);
		const axe = await injectAxe(page);
		const perf = await perfSample(page);

		const consoleErrors = consoleLog.filter((c) => c.type === 'error').length;
		const consoleWarnings = consoleLog.filter((c) => c.type === 'warning').length;
		const net5xx = networkLog.filter((n) => n.status >= 500).length;
		const net404 = networkLog.filter((n) => n.status === 404 || n.status === 403).length;

		if (consoleErrors > 0) {
			findings.push({
				id: 'C-CONSOLE',
				severity: 'Critical',
				layer: 'Feedback',
				surface: 'walkthrough',
				title: `Console errors = ${consoleErrors}`,
				observed: consoleLog
					.filter((c) => c.type === 'error')
					.slice(0, 5)
					.map((c) => c.text)
					.join(' | '),
				expected: '0 console errors',
				evidence: 'console.json',
				location: 'runtime',
				patch: '修复抛错来源',
			});
		}
		if (consoleWarnings > 0) {
			findings.push({
				id: 'H-CONSOLE',
				severity: 'High',
				layer: 'Feedback',
				surface: 'walkthrough',
				title: `Console warnings = ${consoleWarnings}`,
				observed: consoleLog
					.filter((c) => c.type === 'warning')
					.slice(0, 5)
					.map((c) => c.text)
					.join(' | '),
				expected: '0 console warnings',
				evidence: 'console.json',
				location: 'runtime',
				patch: '消除告警或写入 audit-config allowlist',
			});
		}
		if (net5xx > 0) {
			findings.push({
				id: 'C-5XX',
				severity: 'Critical',
				layer: 'Architecture',
				surface: 'API',
				title: `Network 5xx = ${net5xx}`,
				observed: networkLog
					.filter((n) => n.status >= 500)
					.slice(0, 5)
					.map((n) => `${n.status} ${n.url}`)
					.join(' | '),
				expected: '0 5xx',
				evidence: 'network.json',
				location: 'backend / gateway',
				patch: '修复失败接口',
			});
		}

		fs.writeFileSync(path.join(evidenceDir, 'console.json'), JSON.stringify(consoleLog, null, 2));
		fs.writeFileSync(path.join(evidenceDir, 'network.json'), JSON.stringify(networkLog, null, 2));
		fs.writeFileSync(path.join(evidenceDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
		fs.writeFileSync(path.join(evidenceDir, 'findings-raw.json'), JSON.stringify(findings, null, 2));

		const elapsedMin = ((Date.now() - started) / 60000).toFixed(1);
		const gaps = [];
		for (let i = 1; i < manifest.length; i++) {
			const a = manifest[i - 1].t.split(':').map(Number);
			const b = manifest[i].t.split(':').map(Number);
			const sa = a[0] * 3600 + a[1] * 60 + a[2];
			const sb = b[0] * 3600 + b[1] * 60 + b[2];
			gaps.push(Math.max(0, sb - sa));
		}
		const medianGap =
			gaps.length === 0
				? 0
				: gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)];

		const summary = {
			persona: 'rbac_user_manager',
			baseUrl,
			elapsedMin,
			manifestCount: manifest.length,
			medianGapSec: medianGap,
			screenshots: step,
			consoleErrors,
			consoleWarnings,
			net5xx,
			net404,
			axe,
			perf,
			findingCount: findings.length,
		};
		fs.writeFileSync(path.join(evidenceDir, 'summary.json'), JSON.stringify(summary, null, 2));
		console.log(JSON.stringify(summary, null, 2));
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	fs.writeFileSync(
		path.join(evidenceDir, 'fatal.json'),
		JSON.stringify({ error: String(err), stack: err.stack }, null, 2),
	);
	process.exit(1);
});
