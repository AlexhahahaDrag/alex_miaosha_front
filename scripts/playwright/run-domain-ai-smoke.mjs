import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config({ override: true });

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'playwright');
const screenshotDir = path.join(rootDir, 'screenshots', 'playwright');
const logDir = path.join(rootDir, 'logs', 'playwright');
const caseFile = path.join(rootDir, 'tests', 'midscene', 'rbac', 'cases', 'domain-ai-smoke.json');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadCases() {
	return JSON.parse(fs.readFileSync(caseFile, 'utf-8'));
}

async function isServerReady(url) {
	try {
		const res = await fetch(url, { method: 'HEAD' });
		return res.ok || res.status < 500;
	} catch {
		return false;
	}
}

async function startViteServerIfNeed(port = 3000) {
	const url = `http://localhost:${port}/`;
	if (await isServerReady(url)) {
		console.log(`Using existing dev server at ${url}`);
		return { url, process: null };
	}

	console.log(`Starting Vite dev server on port ${port}...`);
	const proc = spawn('npx', ['vite', '--port', String(port), '--host'], {
		cwd: rootDir,
		shell: true,
		stdio: 'ignore',
	});

	// Wait up to 15s for the server to become ready
	for (let i = 0; i < 30; i++) {
		await new Promise((r) => setTimeout(r, 500));
		if (await isServerReady(url)) {
			console.log(`Vite dev server ready at ${url}`);
			return { url, process: proc };
		}
	}
	throw new Error(`Failed to start dev server at ${url} within timeout`);
}

const mockMenus = [
	{
		id: '1',
		name: 'system',
		title: '系统管理',
		path: '/user',
		component: 'Layout',
		children: [
			{
				id: '10',
				name: 'roleInfo',
				title: '角色管理',
				path: 'roleInfo',
				component: '/src/views/user/roleInfo/index.vue',
				permissionCode: 'role:view',
			},
		],
	},
	{
		id: '2',
		name: 'product',
		title: '商品中心',
		path: '/product',
		component: 'Layout',
		children: [
			{
				id: '20',
				name: 'pmsShopProduct',
				title: '商品信息',
				path: 'pmsShopProduct',
				component: '/src/views/product/pmsShopProduct/index.vue',
				permissionCode: 'product:view',
			},
		],
	},
	{
		id: '3',
		name: 'coupon',
		title: '营销中心',
		path: '/cpn-coupon',
		component: 'Layout',
		children: [
			{
				id: '30',
				name: 'cpnCouponInfo',
				title: '优惠券管理',
				path: 'cpn-coupon-info',
				component: '/src/views/cpn-coupon/cpn-coupon-info/index.vue',
				permissionCode: 'coupon:view',
			},
		],
	},
];

function encryptPayload(data) {
	const key = Buffer.from('20230610HelloDog', 'utf-8');
	const iv = Buffer.from('1234567890123456', 'utf-8');
	const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
	encrypted += cipher.final('base64');
	return encrypted;
}

async function setupRouteMocks(page) {
	function fulfillEncrypted(route, data) {
		return route.fulfill({
			status: 200,
			contentType: 'text/plain; charset=utf-8',
			body: encryptPayload(data),
		});
	}

	// 严格仅拦截以 /api/am- 开头的微服务后端接口，绝不拦截 Vite 源码或构建资源
	await page.route((url) => url.pathname.startsWith('/api/am-'), async (route) => {
		const url = new URL(route.request().url());
		const pathname = url.pathname;

		if (pathname.includes('/dict-info/')) {
			return fulfillEncrypted(route, { code: '200', data: [] });
		}

		if (pathname.includes('/login/')) {
			return fulfillEncrypted(route, {
				code: '200',
				message: '登录成功',
				data: {
					token: 'mock-e2e-token-xyz',
					admin: {
						id: '1',
						username: 'superman',
						realName: '超级管理员',
						roleInfoVoList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
						permissionContext: {
							superAdmin: true,
							roleList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
							permissionCodes: ['*'],
							buttonPermissionCodes: ['*'],
							currentOrgId: '1',
						},
					},
					userInfo: { id: '1', username: 'superman', realName: '超级管理员' },
					menuInfo: mockMenus,
				},
			});
		}

		if (pathname.includes('/user/menus')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: mockMenus,
			});
		}

		if (pathname.includes('/cpn-coupon-info/ai-plan')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					couponName: '✨ AI 智能爆款拉新券',
					totalQuantity: 500,
					unitValue: 20,
					minSpend: 100,
					validDays: 7,
					strategyReasoning: '针对拉新获客，设定 20 元满减门槛促成首单裂变',
					discountRate: '8折优惠',
					marketingCopy: '新人狂欢，首单满100立减20元！',
				},
			});
		}

		if (pathname.includes('/cpn-coupon-info/page')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					records: [
						{
							id: '9901',
							couponName: '新客专享满减券',
							totalQuantity: 100,
							remainingQuantity: 80,
							unitValue: 20,
							minSpend: 100,
							status: '1',
						},
					],
					total: 1,
					current: 1,
					size: 10,
				},
			});
		}

		if (pathname.includes('/pms-shop-product/ai-copy')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					title: '【官方正品】智能降噪旗舰无线蓝牙耳机',
					slogan: '一键静噪，沉浸原声世界',
					sellingPoints: ['40dB 深度混合主动降噪', '30小时超长复合续航', '双麦通话降噪'],
					marketingDescription: '搭载新一代声学芯片与镀钛振膜，无论通勤还是运动，畅享纯净天籁之音。',
					discountText: '限时 5 折狂欢秒杀',
				},
			});
		}

		if (pathname.includes('/pms-shop-product/')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					records: [
						{
							id: '8801',
							name: '旗舰降噪无线蓝牙耳机',
							price: '199.00',
							comparePrice: '399.00',
							source: 'tmall',
						},
					],
					total: 1,
					current: 1,
					size: 10,
				},
			});
		}

		if (pathname.includes('/role-info/ai-recommend-permissions')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					recommendedMenuIds: ['100', '101', '102'],
					recommendedMenuNames: ['财务中心', '礼金管理', '优惠券管理'],
					recommendedPermissionCodes: ['finance:gift:list', 'finance:coupon:list'],
					reasoning: '根据角色名称【财务出纳员】及职责，智能匹配财务中心及下属礼金管理、优惠券管理权限。',
				},
			});
		}

		if (pathname.includes('/role-info/page')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					records: [
						{
							id: '7701',
							roleName: '财务出纳员',
							roleCode: 'FINANCE_CASHIER',
							description: '负责日常礼金台账、红包往来与优惠券核销',
						},
					],
					total: 1,
					current: 1,
					size: 10,
				},
			});
		}

		if (pathname.includes('/role-info')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					id: '7701',
					roleName: '财务出纳员',
					roleCode: 'FINANCE_CASHIER',
					description: '负责日常礼金台账与红包往来',
					permissionList: [
						{
							id: '100',
							permissionName: '财务中心',
							children: [
								{ id: '101', permissionName: '礼金管理' },
								{ id: '102', permissionName: '优惠券管理' },
							],
						},
						{
							id: '200',
							permissionName: '系统设置',
							children: [{ id: '201', permissionName: '参数配置' }],
						},
					],
					rolePermissionInfoVoList: [{ id: '100' }],
				},
			});
		}

		return fulfillEncrypted(route, { code: '200', data: {} });
	});
}

async function executeCase(page, c, runtime) {
	console.log(`Running case ${c.caseId}: ${c.title}...`);

	switch (c.caseId) {
		case 'AI-COUPON-001': {
			await page.goto(`${runtime.baseUrl}#/cpn-coupon/cpn-coupon-info`);
			const addBtn = page.locator('[data-testid="btn-add-coupon"]').first();
			await addBtn.waitFor({ state: 'visible', timeout: 10000 });
			await addBtn.click();

			// 断言 AI 营销策划栏存在
			const aiBar = page.locator('[data-testid="ai-plan-bar"]').first();
			await aiBar.waitFor({ state: 'visible', timeout: 5000 });

			// 点击生成方案按钮
			const genBtn = page.locator('[data-testid="btn-generate-ai-plan"]').first();
			await genBtn.click();

			// 等待 AI 方案结果卡片展示
			const resultCard = page.locator('[data-testid="ai-plan-result"]').first();
			await resultCard.waitFor({ state: 'visible', timeout: 5000 });

			// 断言方案文案与折扣标签渲染成功
			const reasonText = await resultCard.innerText();
			if (!reasonText.includes('策略考量') || !reasonText.includes('8折优惠')) {
				throw new Error('AI 营销方案生成结果内容断言失败');
			}
			break;
		}

		case 'AI-PRODUCT-001': {
			await page.goto(`${runtime.baseUrl}#/product/pmsShopProduct`);
			const openAiCopyBtn = page.locator('[data-testid="btn-open-ai-copy"]').first();
			await openAiCopyBtn.waitFor({ state: 'visible', timeout: 10000 });
			await openAiCopyBtn.click();

			// 等待弹窗唤起并输入商品名称
			const nameInput = page.locator('[data-testid="ai-copy-input-name"]').first();
			await nameInput.waitFor({ state: 'visible', timeout: 5000 });
			await nameInput.fill('降噪无线耳机');

			// 点击生成
			const genBtn = page.locator('[data-testid="btn-generate-ai-copy"]').first();
			await genBtn.click();

			// 等待结果与一键应用按钮可见
			const applyBtn = page.locator('[data-testid="btn-apply-ai-copy"]').first();
			await applyBtn.waitFor({ state: 'visible', timeout: 5000 });

			// 执行一键应用
			await applyBtn.click();
			break;
		}

		case 'AI-ROLE-001': {
			await page.goto(`${runtime.baseUrl}#/user/roleInfo`);
			// 点击行内“授权”操作按钮
			const authBtn = page.locator('[data-testid="rbac-role-row-authorize"]').first();
			await authBtn.waitFor({ state: 'visible', timeout: 10000 });
			await authBtn.click();

			// 等待授权抽屉与 AI 推荐栏
			const aiRecBar = page.locator('[data-testid="rbac-ai-recommend-bar"]').first();
			await aiRecBar.waitFor({ state: 'visible', timeout: 6000 });

			// 点击 AI 推荐按钮
			const recBtn = page.locator('[data-testid="btn-ai-recommend-permissions"]').first();
			await recBtn.click();

			// 等待推荐分析结果与树节点标记
			const reasonBox = page.locator('.ai-reasoning-box').first();
			await reasonBox.waitFor({ state: 'visible', timeout: 5000 });

			// 断言树中至少出现带有 [✨ AI推荐] 标记的节点
			const treeNodeText = page.locator('.ant-tree-title:has-text("[✨ AI推荐]")').first();
			await treeNodeText.waitFor({ state: 'visible', timeout: 5000 });
			break;
		}

		default:
			throw new Error(`Unsupported case ID: ${c.caseId}`);
	}
}

async function main() {
	ensureDir(reportDir);
	ensureDir(screenshotDir);
	ensureDir(logDir);

	const cases = loadCases();
	const server = await startViteServerIfNeed(3000);

	let browser;
	const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
	try {
		browser = await chromium.launch({
			headless: true,
			args: launchArgs,
		});
	} catch (err) {
		console.warn(`Default chromium failed (${err.message}), trying msedge channel...`);
		try {
			browser = await chromium.launch({
				headless: true,
				channel: 'msedge',
				args: launchArgs,
			});
		} catch (err2) {
			console.warn(`msedge failed (${err2.message}), trying chrome channel...`);
			browser = await chromium.launch({
				headless: true,
				channel: 'chrome',
				args: launchArgs,
			});
		}
	}

	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});

	// 注入 localStorage mock 状态以维持登录态
	await context.addInitScript((menus) => {
		const user = { id: '1', username: 'superman', realName: '超级管理员' };
		const permCtx = {
			superAdmin: true,
			roleList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
			permissionCodes: ['*'],
			buttonPermissionCodes: ['*'],
			currentOrgId: '1',
		};
		window.localStorage.setItem('token', 'mock-e2e-token-xyz');
		window.localStorage.setItem('userInfo', JSON.stringify(user));
		window.localStorage.setItem('menuInfo', JSON.stringify(menus));
		window.localStorage.setItem('permissionContext', JSON.stringify(permCtx));
		window.localStorage.setItem(
			'app-user',
			JSON.stringify({
				token: 'mock-e2e-token-xyz',
				userInfo: user,
				menuInfo: menus,
				hasMenu: true,
				permissionContext: permCtx,
			}),
		);
	}, mockMenus);

	const page = await context.newPage();
	page.on('console', (msg) => console.log(`[BROWSER ${msg.type()}]`, msg.text()));
	page.on('pageerror', (err) => console.error('[BROWSER_PAGE_ERR]', err));
	await setupRouteMocks(page);

	const results = [];

	for (const c of cases) {
		try {
			await executeCase(page, c, { baseUrl: server.url });
			const shotPath = path.join(screenshotDir, `${c.caseId}_pass.png`);
			await page.screenshot({ path: shotPath, fullPage: true });
			results.push({ caseId: c.caseId, title: c.title, status: 'pass' });
			console.log(`✅ PASS: ${c.caseId}`);
		} catch (err) {
			const failShotPath = path.join(screenshotDir, `${c.caseId}_fail.png`);
			await page.screenshot({ path: failShotPath, fullPage: true }).catch(() => undefined);
			results.push({ caseId: c.caseId, title: c.title, status: 'fail', error: err.message });
			console.error(`❌ FAIL: ${c.caseId} - ${err.message}`);
		}
	}

	await browser.close();
	if (server.process) {
		server.process.kill();
	}

	const passed = results.filter((r) => r.status === 'pass').length;
	const failed = results.filter((r) => r.status === 'fail').length;

	const report = {
		total: results.length,
		passed,
		failed,
		generatedAt: new Date().toISOString(),
		cases: results,
	};

	fs.writeFileSync(path.join(reportDir, 'domain-ai-report.json'), JSON.stringify(report, null, 2));

	console.log(`\n======================================================`);
	console.log(`Domain AI Smoke Finished: Total=${results.length}, Passed=${passed}, Failed=${failed}`);
	console.log(`======================================================\n`);

	if (failed > 0) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Fatal execution error:', err);
	process.exit(1);
});
