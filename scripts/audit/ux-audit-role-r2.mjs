/**
 * Role UX re-audit r2 — rbac_user_manager
 * Uses correct data-testids learned from r1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env'), override: true });

const evidenceDir = path.join(
	rootDir,
	'.jez',
	'audit-evidence',
	'2026-08-19-role-r2',
);
const baseUrl = (process.env.BASE_URL || 'http://localhost:3000/').replace(
	/\/?$/,
	'/',
);
const username = process.env.RBAC_MANAGER_USER;
const password = process.env.RBAC_MANAGER_PASS;

const manifest = [];
const findings = [];
const consoleLog = [];
const networkBad = [];
let step = 0;
const started = Date.now();

function ensureDir(d) {
	if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}
function ts() {
	return new Date().toISOString().slice(11, 19);
}
function logM(ok, text) {
	manifest.push({ t: ts(), ok, text });
	console.log(`[${ok ? '✓' : '✗'}] ${ts()} ${text}`);
}
async function shot(page, name) {
	step += 1;
	const file = `${String(step).padStart(2, '0')}-${name}.png`;
	await page.screenshot({
		path: path.join(evidenceDir, file),
		fullPage: false,
	});
	return file;
}
async function tryClick(page, selectors, timeout = 3000) {
	for (const sel of selectors) {
		const loc = page.locator(sel).first();
		if ((await loc.count()) === 0) continue;
		try {
			if (!(await loc.isVisible().catch(() => false))) continue;
			await loc.click({ timeout });
			return sel;
		} catch {
			/* next */
		}
	}
	return null;
}

ensureDir(evidenceDir);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
	viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

page.on('console', (msg) => {
	const type = msg.type();
	if (type === 'error' || type === 'warning') {
		consoleLog.push({ type, text: msg.text(), t: ts() });
	}
});
page.on('response', (res) => {
	const s = res.status();
	if (s >= 400) networkBad.push({ status: s, url: res.url(), t: ts() });
});

try {
	// --- Login ---
	await page
		.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 })
		.catch(() => {});
	await page.waitForTimeout(800);
	await shot(page, 'login-before');

	const userInput = page
		.locator('input[placeholder*="用户名"], input[placeholder*="请输入用户名"]')
		.first();
	const passInput = page.locator('input[type="password"]').first();
	await userInput.waitFor({ state: 'visible', timeout: 15000 });
	await userInput.click();
	await userInput.fill('');
	await userInput.pressSequentially(username, { delay: 20 });
	logM(true, `Typed username (persona rbac_user_manager)`);
	await passInput.click();
	await passInput.fill('');
	await passInput.pressSequentially(password, { delay: 20 });
	logM(true, `Typed password`);
	await shot(page, 'login-filled');

	const loginWait = page
		.waitForResponse(
			(r) => r.url().includes('/user/login') && r.request().method() === 'POST',
			{
				timeout: 25000,
			},
		)
		.catch(() => null);
	await page.locator('.login-btn').click();
	logM(true, `Clicked login`);
	const loginResp = await loginWait;
	logM(!!loginResp, `Login network status=${loginResp?.status() ?? 'n/a'}`);
	await page.waitForFunction(() => !!localStorage.getItem('token'), {
		timeout: 25000,
	});
	await page.waitForTimeout(1200);
	await shot(page, 'login-after');
	logM(true, `Logged in url=${page.url()}`);

	// --- Expand 用户管理 + open 角色管理 ---
	await tryClick(page, [
		'.ant-menu-submenu-title:has-text("用户管理")',
		'.ant-menu-title-content:has-text("用户管理")',
	]);
	await page.waitForTimeout(400);
	const roleMenu = await tryClick(page, [
		'.ant-menu-item:has-text("角色管理")',
		'[data-menu-id="roleInfo"]',
	]);
	if (!roleMenu) {
		await page.goto(`${baseUrl}#/user/roleInfo`, {
			waitUntil: 'domcontentloaded',
		});
		logM(true, `Deep-linked #/user/roleInfo`);
	} else {
		logM(true, `Opened 角色管理 (${roleMenu})`);
	}
	await page.waitForTimeout(1500);
	await shot(page, 'role-list');

	// Inventory with real testids
	const inventory = [
		'rbac-data-scope-hint',
		'rbac-role-search-rolecode',
		'rbac-role-btn-query',
		'rbac-role-btn-reset',
		'rbac-role-btn-add',
		'rbac-role-btn-batch-delete',
		'rbac-role-btn-goto-relation',
		'rbac-role-table',
	];
	const present = [];
	for (const id of inventory) {
		if ((await page.locator(`[data-testid="${id}"]`).count()) > 0)
			present.push(id);
	}
	logM(
		true,
		`testid inventory ${present.length}/${inventory.length}: ${present.join(',')}`,
	);

	const scopeText = await page
		.locator('[data-testid="rbac-data-scope-hint"]')
		.innerText()
		.catch(() => '');
	const empty = (await page.locator('text=暂无数据').count()) > 0;
	const addVisible = await page
		.locator('[data-testid="rbac-role-btn-add"]')
		.isVisible()
		.catch(() => false);
	const rowCount = await page
		.locator('[data-testid="rbac-role-table"] .ant-table-row')
		.count();
	logM(
		true,
		`scope="${scopeText.slice(0, 40)}" empty=${empty} addVisible=${addVisible} rows=${rowCount}`,
	);

	if (empty && !addVisible) {
		findings.push({
			id: 'C-EMPTY',
			severity: 'Critical',
			layer: 'Interaction',
			surface: '#/user/roleInfo',
			title: '机构管理员角色列表空且无新增',
			observed: `暂无数据 + addVisible=false; scope=${scopeText}`,
			expected: '可见本机构角色，或空态引导+新增入口',
			evidence: '04-role-list.png',
			location: 'roleInfo/index.vue + role:add 权限种子 + DataPermission',
			patch: '授 role:add 或改空态；核对 operator/org 归属数据',
		});
	} else if (empty) {
		findings.push({
			id: 'H-EMPTY',
			severity: 'High',
			layer: 'Interaction',
			surface: '#/user/roleInfo',
			title: '角色列表空，无法进入授权/用户行操作',
			observed: `rows=0; addVisible=${addVisible}`,
			expected: '有数据或可新建后授权',
			evidence: '04-role-list.png',
			location: 'DataPermission / seed',
			patch: '补本机构角色种子或放宽可见范围',
		});
	}

	// Search thread
	const nameInput = page
		.locator(
			'[data-testid="rbac-role-search-rolename"], input[placeholder*="角色名称"], .ant-form-item:has-text("角色名称") input',
		)
		.first();
	if ((await nameInput.count()) > 0) {
		await nameInput.click();
		await nameInput.fill('');
		await nameInput.pressSequentially('admin', { delay: 25 });
		logM(true, `Typed "admin" into role name search`);
		await shot(page, 'search-typed');
		const q = await tryClick(page, [
			'[data-testid="rbac-role-btn-query"]',
			'button:has-text("查找")',
		]);
		logM(!!q, `Clicked 查找 (${q})`);
		await page.waitForTimeout(1200);
		await shot(page, 'search-result');
	} else {
		logM(false, `Role name search input missing`);
	}

	// Row actions if any
	const authBtn = page
		.locator('[data-testid="rbac-role-row-authorize"]')
		.first();
	if (
		(await authBtn.count()) > 0 &&
		(await authBtn.isVisible().catch(() => false))
	) {
		await authBtn.click();
		logM(true, `Clicked 授权`);
		await page.waitForTimeout(1000);
		await shot(page, 'auth-drawer');
		const tree =
			(await page
				.locator('.ant-tree, [data-testid="rbac-permission-tree"]')
				.count()) > 0;
		logM(tree, `Permission tree present=${tree}`);
		await tryClick(page, ['.ant-drawer-close', 'button:has-text("取消")']);
	} else {
		logM(false, `授权行按钮不可用 (rows=${rowCount})`);
	}

	// Add modal if available
	if (addVisible) {
		await page.locator('[data-testid="rbac-role-btn-add"]').click();
		logM(true, `Clicked 新增`);
		await page.waitForTimeout(800);
		await shot(page, 'add-modal');
		await page.keyboard.press('Escape');
	} else {
		logM(false, `新增按钮不可见`);
		findings.push({
			id: 'H-ADD-MISSING',
			severity: 'High',
			layer: 'Interaction',
			surface: '#/user/roleInfo toolbar',
			title: '无新增按钮（权限或未渲染）',
			observed: 'data-testid=rbac-role-btn-add 不可见',
			expected: 'manager 可新增本机构角色，或 disabled+说明',
			evidence: '04-role-list.png',
			location: 'v-permission="\'role:add\'"',
			patch: '授予 role:add 或空态解释只读',
		});
	}

	// Relation page
	const beforeUrl = page.url();
	const rel = await tryClick(page, [
		'[data-testid="rbac-role-btn-goto-relation"]',
		'button:has-text("角色-用户关系配置")',
	]);
	logM(!!rel, `Clicked 关系配置 (${rel})`);
	await page.waitForTimeout(2000);
	const afterUrl = page.url();
	await shot(page, 'relation');
	logM(true, `Relation navigation ${beforeUrl} → ${afterUrl}`);

	const bodyText = await page
		.locator('body')
		.innerText()
		.catch(() => '');
	const blank =
		!bodyText.trim() ||
		(await page.evaluate(() => {
			const root = document.querySelector('#app') || document.body;
			return (root?.innerText || '').trim().length < 20;
		}));
	const dual =
		(await page
			.locator('[data-testid="rbac-dual-list"], .rbac-dual-list, .ant-transfer')
			.count()) > 0;
	const rolePicker = (await page.locator('.ant-select').count()) > 0;
	logM(!blank, `Relation blank=${blank} dual=${dual} rolePicker=${rolePicker}`);

	if (
		blank ||
		(afterUrl.includes('roleInfo') && !afterUrl.includes('role-user'))
	) {
		// check console for router warn
		findings.push({
			id: 'C-RELATION-BLANK',
			severity: 'Critical',
			layer: 'Interaction',
			surface: 'role→relation',
			title: '角色-用户关系配置导航失败/白屏',
			observed: `url=${afterUrl}; blank=${blank}; dual=${dual}`,
			expected: '进入 #/user/role-user-info 并见角色选择+双栏',
			evidence: `${String(step).padStart(2, '0')}-relation.png`,
			location: 'roleInfo/index.vue router.push + router/index.ts',
			patch: "push({ path: '/user/role-user-info' }) 并验证 hash 路由",
		});
	}

	// Direct hash navigation sanity
	await page.goto(`${baseUrl}#/user/role-user-info`, {
		waitUntil: 'domcontentloaded',
	});
	await page.waitForTimeout(1500);
	await shot(page, 'relation-deeplink');
	const dual2 =
		(await page
			.locator('[data-testid="rbac-dual-list"], .rbac-dual-list, .ant-transfer')
			.count()) > 0;
	const emptyHint =
		(await page.locator('.ant-empty').count()) > 0 ||
		(await page.getByText('请先选择角色').count()) > 0;
	logM(
		true,
		`Deeplink relation dual=${dual2} emptyHint=${emptyHint} url=${page.url()}`,
	);
	if (!dual2 && !emptyHint && !rolePicker) {
		findings.push({
			id: 'H-RELATION-ROUTE',
			severity: 'High',
			layer: 'Architecture',
			surface: '#/user/role-user-info',
			title: '直达关系页未呈现预期 UI',
			observed: `url=${page.url()} dual=${dual2} emptyHint=${emptyHint}`,
			expected: '双栏或「请先选择角色」空态',
			evidence: `${String(step).padStart(2, '0')}-relation-deeplink.png`,
			location: 'roleUserInfo/index.vue + 静态路由',
			patch: '核对 hideInMenu 路由是否注册、组件是否加载',
		});
	} else {
		logM(true, `Relation page UI present (picker/empty/dual)`);
	}

	// Back to role list for axe/perf
	await page.goto(`${baseUrl}#/user/roleInfo`, {
		waitUntil: 'domcontentloaded',
	});
	await page.waitForTimeout(1000);

	// Multi-pane
	for (const w of [1280, 1024, 768]) {
		await page.setViewportSize({ width: w, height: 900 });
		await page.waitForTimeout(300);
		const ox = await page.evaluate(
			() =>
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth + 2,
		);
		await shot(page, `vp-${w}`);
		logM(true, `Viewport ${w} overflowX=${ox}`);
		if (ox) {
			findings.push({
				id: `H-LAYOUT-${w}`,
				severity: 'High',
				layer: 'Visual',
				surface: `#/user/roleInfo@${w}`,
				title: `横向溢出 @${w}`,
				observed: 'scrollWidth > clientWidth',
				expected: '无横向滚动',
				evidence: `${String(step).padStart(2, '0')}-vp-${w}.png`,
				location: 'layout CSS',
				patch: '收紧操作列',
			});
		}
	}
	await page.setViewportSize({ width: 1440, height: 900 });

	// axe
	await page.addScriptTag({
		url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
	});
	await page.waitForTimeout(600);
	const axe = await page.evaluate(async () => {
		if (!window.axe) return { violations: [] };
		const r = await window.axe.run(document, { resultTypes: ['violations'] });
		return r.violations || [];
	});
	fs.writeFileSync(
		path.join(evidenceDir, 'axe.json'),
		JSON.stringify(axe, null, 2),
	);
	const axeC = axe.filter((v) => v.impact === 'critical');
	const axeS = axe.filter((v) => v.impact === 'serious');
	logM(true, `axe critical=${axeC.length} serious=${axeS.length}`);
	for (const v of axeC) {
		findings.push({
			id: `A11Y-C-${v.id}`,
			severity: 'Critical',
			layer: 'Visual',
			surface: '#/user/roleInfo',
			title: `axe critical: ${v.id}`,
			observed: v.help,
			expected: '0 critical',
			evidence: 'axe.json',
			location: v.nodes?.[0]?.target?.join(' ') || 'DOM',
			patch: v.help,
			tag: 'shell-noise',
		});
	}
	for (const v of axeS) {
		findings.push({
			id: `A11Y-S-${v.id}`,
			severity: 'High',
			layer: 'Visual',
			surface: '#/user/roleInfo',
			title: `axe serious: ${v.id}`,
			observed: v.help,
			expected: '0 serious',
			evidence: 'axe.json',
			location: v.nodes?.[0]?.target?.join(' ') || 'DOM',
			patch: v.help,
			tag: 'shell-noise',
		});
	}

	const perf = await page.evaluate(() => {
		const nav = performance.getEntriesByType('navigation')[0];
		const paints = performance.getEntriesByType('paint');
		const lcp = performance.getEntriesByType('largest-contentful-paint').at(-1);
		return {
			lcp: lcp?.startTime || nav?.loadEventEnd || 0,
			fcp:
				paints.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
			cls: 0,
		};
	});
	fs.writeFileSync(
		path.join(evidenceDir, 'perf.json'),
		JSON.stringify(perf, null, 2),
	);
	logM(true, `Perf LCP~=${Math.round(perf.lcp)}ms`);

	const consoleErrors = consoleLog.filter((c) => c.type === 'error').length;
	const consoleWarnings = consoleLog.filter((c) => c.type === 'warning').length;
	const net5xx = networkBad.filter((n) => n.status >= 500).length;
	const net403404 = networkBad.filter(
		(n) => n.status === 403 || n.status === 404,
	).length;

	if (consoleErrors > 0) {
		findings.push({
			id: 'C-CONSOLE',
			severity: 'Critical',
			layer: 'Feedback',
			surface: 'walkthrough',
			title: `Console errors=${consoleErrors}`,
			observed: consoleLog
				.filter((c) => c.type === 'error')
				.slice(0, 3)
				.map((c) => c.text)
				.join(' | '),
			expected: '0',
			evidence: 'console.json',
			location: 'runtime',
			patch: '修抛错源',
		});
	}
	if (consoleWarnings > 0) {
		findings.push({
			id: 'H-CONSOLE',
			severity: 'High',
			layer: 'Feedback',
			surface: 'walkthrough',
			title: `Console warnings=${consoleWarnings}`,
			observed: consoleLog
				.filter((c) => c.type === 'warning')
				.slice(0, 5)
				.map((c) => c.text.slice(0, 120))
				.join(' | '),
			expected: '0',
			evidence: 'console.json',
			location: 'runtime',
			patch: '消警告或 allowlist',
		});
	}
	if (net5xx > 0) {
		findings.push({
			id: 'C-5XX',
			severity: 'Critical',
			layer: 'Architecture',
			surface: 'API',
			title: `5xx=${net5xx}`,
			observed: networkBad
				.filter((n) => n.status >= 500)
				.slice(0, 3)
				.map((n) => `${n.status} ${n.url}`)
				.join(' | '),
			expected: '0',
			evidence: 'network.json',
			location: 'gateway/backend',
			patch: '修接口',
		});
	}

	fs.writeFileSync(
		path.join(evidenceDir, 'console.json'),
		JSON.stringify(consoleLog, null, 2),
	);
	fs.writeFileSync(
		path.join(evidenceDir, 'network.json'),
		JSON.stringify(networkBad, null, 2),
	);
	fs.writeFileSync(
		path.join(evidenceDir, 'manifest.json'),
		JSON.stringify(manifest, null, 2),
	);
	fs.writeFileSync(
		path.join(evidenceDir, 'findings-raw.json'),
		JSON.stringify(findings, null, 2),
	);

	const gaps = [];
	for (let i = 1; i < manifest.length; i++) {
		const a = manifest[i - 1].t.split(':').map(Number);
		const b = manifest[i].t.split(':').map(Number);
		gaps.push(
			Math.max(
				0,
				b[0] * 3600 + b[1] * 60 + b[2] - (a[0] * 3600 + a[1] * 60 + a[2]),
			),
		);
	}
	const medianGap =
		gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0;

	const summary = {
		round: 'r2',
		persona: 'rbac_user_manager',
		elapsedMin: Number(((Date.now() - started) / 60000).toFixed(2)),
		manifestCount: manifest.length,
		medianGapSec: medianGap,
		screenshots: step,
		consoleErrors,
		consoleWarnings,
		net5xx,
		net403404,
		axeCritical: axeC.length,
		axeSerious: axeS.length,
		perf,
		presentTestids: present,
		rowCount,
		addVisible,
		empty,
		findingCount: findings.length,
	};
	fs.writeFileSync(
		path.join(evidenceDir, 'summary.json'),
		JSON.stringify(summary, null, 2),
	);
	console.log(JSON.stringify(summary, null, 2));
} catch (err) {
	fs.writeFileSync(
		path.join(evidenceDir, 'fatal.json'),
		JSON.stringify({ error: String(err), stack: err.stack }, null, 2),
	);
	console.error(err);
	process.exitCode = 1;
} finally {
	await browser.close();
}
