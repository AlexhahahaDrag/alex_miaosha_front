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
const caseFile = path.join(
	rootDir,
	'tests',
	'midscene',
	'rbac',
	'cases',
	'smoke.json',
);

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
	const allowSet = new Set(
		filterRaw
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean),
	);
	return cases.filter((item) => allowSet.has(item.caseId));
}

function validateEnv() {
	const baseUrl = process.env.BASE_URL;
	const modelApiKey = process.env.MIDSCENE_MODEL_API_KEY;
	const modelName = process.env.MIDSCENE_MODEL_NAME;
	const modelFamily = process.env.MIDSCENE_MODEL_FAMILY;
	if (!baseUrl) {
		throw new Error(
			'Missing BASE_URL. Please set BASE_URL before running Midscene smoke.',
		);
	}
	if (!modelApiKey || !modelName || !modelFamily) {
		throw new Error(
			'Missing Midscene model env. Please set MIDSCENE_MODEL_API_KEY/MIDSCENE_MODEL_NAME/MIDSCENE_MODEL_FAMILY.',
		);
	}
	return {
		baseUrl,
		mode: process.env.MIDSCENE_MODE || 'local',
	};
}

function getPersonaCredential(persona) {
	if (persona === 'super_super') {
		return {
			username: process.env.RBAC_SUPER_USER,
			password: process.env.RBAC_SUPER_PASS,
		};
	}
	if (persona === 'rbac_user_manager') {
		return {
			username: process.env.RBAC_MANAGER_USER,
			password: process.env.RBAC_MANAGER_PASS,
		};
	}
	return {
		username: process.env.RBAC_READONLY_USER,
		password: process.env.RBAC_READONLY_PASS,
	};
}

function hasCredential(persona) {
	const cred = getPersonaCredential(persona);
	return !!cred.username && !!cred.password;
}

async function login(page, agent, persona) {
	const credential = getPersonaCredential(persona);
	if (!credential.username || !credential.password) {
		const err = new Error(`Missing credentials for persona=${persona}`);
		err.code = 'MIDSCENE_MISSING_CREDENTIALS';
		throw err;
	}

	const usernameInput = page.getByPlaceholder('Enter your username');
	const passwordInput = page.locator('input[type="password"]');
	const loginButton = page.getByRole('button', { name: 'Log in' });

	await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
	await usernameInput.click();
	await usernameInput.fill('');
	await usernameInput.pressSequentially(credential.username);
	const usernameValue = await usernameInput.inputValue();
	if (usernameValue !== credential.username) {
		await usernameInput.evaluate((input, value) => {
			if (input instanceof HTMLInputElement) {
				input.value = value;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.dispatchEvent(new Event('change', { bubbles: true }));
			}
		}, credential.username);
	}
	await passwordInput.click();
	await passwordInput.fill('');
	await passwordInput.pressSequentially(credential.password);
	await loginButton.click();
	await page
		.waitForURL((url) => !url.hash.includes('/login'), {
			timeout: 15000,
			waitUntil: 'domcontentloaded',
		})
		.catch(() => undefined);
	const stillOnLoginPage =
		page.url().includes('/login') ||
		(await page
			.getByPlaceholder('Enter your username')
			.isVisible()
			.catch(() => false)) ||
		(await page
			.locator('body')
			.innerText({ timeout: 5000 })
			.then((text) => text.includes('Alex 管理系统') && text.includes('Log in'))
			.catch(() => false));
	if (stillOnLoginPage) {
		throw new Error(
			`Login failed for persona=${persona}. Please verify backend API and credentials before running gift button cases.`,
		);
	}
	await page
		.locator('body')
		.waitFor({ state: 'visible', timeout: 10000 })
		.catch(() => undefined);
	const pageText = await page.locator('body').innerText({ timeout: 10000 });
	if (!pageText.includes('首页') || !pageText.includes('财务管理')) {
		throw new Error('登录后未检测到后台左侧菜单和顶部导航');
	}
}

async function ensureLoggedIn(page, agent, persona) {
	const onLoginPage =
		page.url().includes('/login') ||
		(await page
			.getByPlaceholder('Enter your username')
			.isVisible()
			.catch(() => false));
	if (onLoginPage) {
		await login(page, agent, persona);
	}
}

function pageAnchor(pageName) {
	if (pageName === 'giftDashboard')
		return '礼尚往来数据概览页面已加载，可见统计卡片或近期礼金记录';
	if (pageName === 'giftPerson')
		return '亲友管理页面已加载，可见查询区域、表格或空状态';
	if (pageName === 'giftEvent')
		return '事由管理页面已加载，可见查询区域、表格或空状态';
	if (pageName === 'giftRecord')
		return '礼金记录页面已加载，可见查询区域、汇总卡片、表格或空状态';
	if (pageName === 'giftAnalysis')
		return '统计报表页面已加载，可见统计卡片或趋势图表区域';
	if (pageName === '用户管理')
		return '用户管理页面可见“新增”按钮或用户列表区域';
	if (pageName === '角色管理')
		return '角色管理页面可见“新增”按钮或角色列表区域';
	if (pageName === '菜单管理')
		return '菜单管理页面可见“新增”按钮或菜单列表区域';
	if (pageName === '权限管理')
		return '权限管理页面可见“新增”按钮或权限列表区域';
	if (pageName === '机构管理')
		return '机构管理页面左侧可见组织架构树，右侧可见机构列表';
	return `${pageName}页面加载完成`;
}

async function gotoGiftPage(page, agent, runtime, routePath, pageName) {
	await page.goto(`${runtime.baseUrl}/#${routePath}`, {
		waitUntil: 'domcontentloaded',
	});
	const pageTitleMap = {
		giftDashboard: '财务概览',
		giftPerson: '亲友管理',
		giftEvent: '事由管理',
		giftRecord: '礼金记录',
		giftAnalysis: '统计报表',
	};
	const expectedTitle = pageTitleMap[pageName];
	if (expectedTitle) {
		try {
			await assertMainText(
				page,
				expectedTitle,
				`${expectedTitle} 页面未正确加载到主内容区`,
			);
		} catch (error) {
			const menuItem = page.locator(`.ant-menu-item[title="${expectedTitle}"]`);
			if ((await menuItem.count()) === 1) {
				await menuItem.click();
				await assertMainText(
					page,
					expectedTitle,
					`${expectedTitle} 页面未正确加载到主内容区`,
				);
			} else {
				throw error;
			}
		}
		return;
	}
	await agent.aiWaitFor(pageAnchor(pageName));
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

async function assertMainText(page, expectedText, message) {
	const main = page.locator('main');
	const deadline = Date.now() + 15000;
	let mainText = '';
	while (Date.now() < deadline) {
		mainText = await main.innerText({ timeout: 5000 });
		if (mainText.includes(expectedText)) {
			return mainText;
		}
		await page.waitForTimeout(300);
	}
	if (!mainText.includes(expectedText)) {
		throw new Error(
			message || `Expected main content to include ${expectedText}`,
		);
	}
	return mainText;
}

async function resetSession(page, runtime) {
	await page.context().clearCookies();
	await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
	await page
		.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		})
		.catch(() => undefined);
	await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
}

function assertTextIncludes(text, expected, scopeName) {
	if (!text.includes(expected)) {
		throw new Error(`${scopeName} 应显示按钮或入口：${expected}`);
	}
}

function assertTextExcludes(text, forbidden, scopeName) {
	if (text.includes(forbidden)) {
		throw new Error(`${scopeName} 不应显示按钮或入口：${forbidden}`);
	}
}

function assertAnyText(text, expectedItems, scopeName) {
	if (!expectedItems.some((item) => text.includes(item))) {
		throw new Error(`${scopeName} 应至少显示：${expectedItems.join(' / ')}`);
	}
}

async function assertVisibleDrawerButtons(page, expectedButtons, scopeName) {
	const drawer = page.locator('.ant-drawer:visible');
	await drawer.waitFor({ state: 'visible', timeout: 10000 });
	for (const buttonName of expectedButtons) {
		const count = await page.getByRole('button', { name: buttonName }).count();
		if (count < 1) {
			throw new Error(`${scopeName} 应显示按钮：${buttonName}`);
		}
	}
	return drawer;
}

async function assertGiftAdminButtonMatrix(page, agent, runtime) {
	await assertGiftDashboardAdminButtons(page, agent, runtime);
	await assertGiftPersonAdminButtons(page, agent, runtime);
	await assertGiftEventAdminButtons(page, agent, runtime);
	await assertGiftRecordAdminButtons(page, agent, runtime);
	await assertGiftAnalysisAdminButtons(page, agent, runtime);
}

async function assertGiftUserButtonMatrix(page, agent, runtime) {
	await assertGiftDashboardUserButtons(page, agent, runtime);
	await assertGiftPersonUserButtons(page, agent, runtime);
	await assertGiftEventUserButtons(page, agent, runtime);
	await assertGiftRecordUserButtons(page, agent, runtime);
	await assertGiftAnalysisUserButtons(page, agent, runtime);
}

async function assertGiftDashboardAdminButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/dashboard',
		'giftDashboard',
	);
	const text = await assertMainText(page, '财务概览');
	for (const item of [
		'+ 新增礼金记录',
		'查看全部排行榜',
		'全部记录 >',
		'查看详细预测',
	]) {
		assertTextIncludes(text, item, '数据概览');
	}
}

async function assertGiftDashboardUserButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/dashboard',
		'giftDashboard',
	);
	const text = await assertMainText(page, '财务概览');
	for (const item of ['查看全部排行榜', '全部记录 >', '查看详细预测']) {
		assertTextIncludes(text, item, '数据概览');
	}
	assertTextIncludes(text, '+ 新增礼金记录', '数据概览');
}

async function assertGiftPersonAdminButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/person',
		'giftPerson',
	);
	const text = await assertMainText(page, '亲友管理');
	for (const item of [
		'+ 添加联系人',
		'查询结果',
		'重 置',
		'导出数据',
		'批量标签',
	]) {
		assertTextIncludes(text, item, '亲友管理');
	}
	if (!text.includes('暂无数据')) {
		for (const item of ['详情', '编辑', '删除']) {
			assertTextIncludes(text, item, '亲友管理行操作');
		}
	}
	await page.getByRole('button', { name: '+ 添加联系人' }).click();
	const drawer = await assertVisibleDrawerButtons(page, [], '亲友管理新增抽屉');
	const drawerText = await drawer.innerText({ timeout: 10000 });
	for (const item of ['新增联系人']) {
		assertTextIncludes(drawerText, item, '亲友管理新增抽屉');
	}
}

async function assertGiftPersonUserButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/person',
		'giftPerson',
	);
	const text = await assertMainText(page, '亲友管理');
	for (const item of ['+ 添加联系人', '查询结果', '重 置', '批量标签']) {
		assertTextIncludes(text, item, '亲友管理');
	}
	assertTextExcludes(text, '导出数据', '亲友管理');
	if (!text.includes('暂无数据')) {
		for (const item of ['详情', '编辑', '删除']) {
			assertTextIncludes(text, item, '亲友管理行操作');
		}
	}
}

async function assertGiftEventAdminButtons(page, agent, runtime) {
	await gotoGiftPage(page, agent, runtime, '/finance/gift/event', 'giftEvent');
	const text = await assertMainText(page, '事由管理');
	for (const item of ['+ 新增事由', '查询结果', '重 置', '展开']) {
		assertTextIncludes(text, item, '事由管理');
	}
	if (!text.includes('暂无数据')) {
		for (const item of ['编辑', '删除']) {
			assertTextIncludes(text, item, '事由管理行操作');
		}
	}
	await page.getByRole('button', { name: '+ 新增事由' }).click();
	const drawer = await assertVisibleDrawerButtons(page, [], '事由管理新增抽屉');
	const drawerText = await drawer.innerText({ timeout: 10000 });
	for (const item of ['新增事由']) {
		assertTextIncludes(drawerText, item, '事由管理新增抽屉');
	}
}

async function assertGiftEventUserButtons(page, agent, runtime) {
	await gotoGiftPage(page, agent, runtime, '/finance/gift/event', 'giftEvent');
	const text = await assertMainText(page, '事由管理');
	for (const item of ['+ 新增事由', '查询结果', '重 置', '展开']) {
		assertTextIncludes(text, item, '事由管理');
	}
	if (!text.includes('暂无数据')) {
		for (const item of ['编辑', '删除']) {
			assertTextIncludes(text, item, '事由管理行操作');
		}
	}
}

async function assertGiftRecordAdminButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/record',
		'giftRecord',
	);
	const text = await assertMainText(page, '礼金记录');
	for (const item of ['Excel导出', '+ 快速记礼', '查询结果', '重 置', '展开']) {
		assertTextIncludes(text, item, '礼金记录');
	}
	if (!text.includes('暂无数据')) {
		assertAnyText(
			text,
			['编辑', '删除', '待回礼', '标记已回'],
			'礼金记录行操作',
		);
	}
	await page.getByRole('button', { name: '+ 快速记礼' }).click();
	const drawer = await assertVisibleDrawerButtons(page, [], '快速记礼抽屉');
	const drawerText = await drawer.innerText({ timeout: 10000 });
	for (const item of ['快速记礼', '随礼', '金额']) {
		assertTextIncludes(drawerText, item, '快速记礼抽屉');
	}
}

async function assertGiftRecordUserButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/record',
		'giftRecord',
	);
	const text = await assertMainText(page, '礼金记录');
	for (const item of ['+ 快速记礼', '查询结果', '重 置', '展开']) {
		assertTextIncludes(text, item, '礼金记录');
	}
	assertTextExcludes(text, 'Excel导出', '礼金记录');
	if (!text.includes('暂无数据')) {
		assertAnyText(
			text,
			['编辑', '删除', '待回礼', '标记已回'],
			'礼金记录行操作',
		);
	}
}

async function assertGiftAnalysisAdminButtons(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/analysis',
		'giftAnalysis',
	);
	const text = await assertMainText(page, '统计报表');
	for (const item of ['导出报表', '打 印', '刷 新']) {
		assertTextIncludes(text, item, '统计报表');
	}
}

async function assertGiftAnalysisUserButtons(page, agent, runtime) {
	await page.goto(`${runtime.baseUrl}/#/finance/gift/analysis`, {
		waitUntil: 'domcontentloaded',
	});
	await page
		.waitForLoadState('networkidle', { timeout: 15000 })
		.catch(() => {});
	const text = await page.locator('body').innerText({ timeout: 10000 });
	for (const item of ['统计报表', '导出报表', '打 印']) {
		assertTextExcludes(text, item, 'gift_user');
	}
}

async function waitForApiResponse(page, urlPart, method, action) {
	const responsePromise = page.waitForResponse(
		(response) => {
			const url = new URL(response.url());
			return (
				url.pathname.includes(urlPart) &&
				response.request().method().toUpperCase() === method.toUpperCase() &&
				response.status() >= 200 &&
				response.status() < 300
			);
		},
		{ timeout: 15000 },
	);
	await action();
	return responsePromise;
}

async function waitForExactApiResponse(page, pathnameSuffix, method, action) {
	const responsePromise = page.waitForResponse(
		(response) => {
			const url = new URL(response.url());
			return (
				url.pathname.endsWith(pathnameSuffix) &&
				response.request().method().toUpperCase() === method.toUpperCase()
			);
		},
		{ timeout: 15000 },
	);
	await action();
	const response = await responsePromise;
	if (response.status() < 200 || response.status() >= 300) {
		throw new Error(
			`${method.toUpperCase()} ${pathnameSuffix} returned ${response.status()}`,
		);
	}
	return response;
}

async function waitForGiftSearchResponse(page, urlPart, keyword, action) {
	const responsePromise = page.waitForResponse(
		(response) => {
			const url = new URL(response.url());
			if (
				!url.pathname.includes(urlPart) ||
				response.request().method().toUpperCase() !== 'POST' ||
				response.status() < 200 ||
				response.status() >= 300
			) {
				return false;
			}
			const postData = response.request().postData() || '';
			return postData.includes(keyword);
		},
		{ timeout: 15000 },
	);
	await action();
	return responsePromise;
}

async function waitForGiftRecordAmountResponse(page, amount, action) {
	const responsePromise = page.waitForResponse(
		(response) => {
			const url = new URL(response.url());
			if (
				!url.pathname.includes('/gift-record-info-t/page') ||
				response.request().method().toUpperCase() !== 'POST' ||
				response.status() < 200 ||
				response.status() >= 300
			) {
				return false;
			}
			const postData = response.request().postData() || '';
			return (
				postData.includes(`"amountMin":${amount}`) &&
				postData.includes(`"amountMax":${amount}`)
			);
		},
		{ timeout: 15000 },
	);
	await action();
	return responsePromise;
}

async function searchCurrentGiftPage(page, keyword) {
	const keywordInput = page.locator('.filter-panel input').first();
	await keywordInput.fill(keyword);
	const hash = new URL(page.url()).hash;
	const searchUrlPart = hash.includes('/finance/gift/event')
		? '/gift-event-info-t/business-page'
			: hash.includes('/finance/gift/person')
				? '/gift-person-info-t/business-page'
				: '';
	if (searchUrlPart) {
		await waitForGiftSearchResponse(page, searchUrlPart, keyword, () =>
			page.getByRole('button', { name: '查询结果' }).click(),
		);
	} else {
		await page.getByRole('button', { name: '查询结果' }).click();
	}
	await page
		.waitForLoadState('networkidle', { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(300);
}

async function searchGiftRecordByAmount(page, amount) {
	const amountInputs = page.locator('.filter-panel .ant-input-number-input');
	await amountInputs.nth(0).fill(String(amount));
	await amountInputs.nth(1).fill(String(amount));
	await waitForGiftRecordAmountResponse(page, amount, () =>
		page.getByRole('button', { name: '查询结果' }).click(),
	);
	await page
		.waitForLoadState('networkidle', { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(300);
}

async function assertTableRowVisible(page, keyword, scopeName) {
	const row = page.locator('.ant-table-tbody tr').filter({ hasText: keyword });
	const rowCount = await row.count();
	if (rowCount < 1) {
		const mainText = await page.locator('main').innerText({ timeout: 10000 });
		throw new Error(`${scopeName} 未查询到测试数据：${keyword}\n${mainText}`);
	}
	return row.first();
}

async function confirmRowDelete(page, row, urlPart) {
	const deleteText = row.getByText('删除', { exact: true }).last();
	if ((await deleteText.count()) > 0) {
		await deleteText.click();
	} else {
		await row.locator('.ant-btn-dangerous').last().click();
	}
	const confirmButton = page
		.locator(
			'.ant-popover:not(.ant-popover-hidden) .ant-popconfirm-buttons .ant-btn-primary, .ant-popover:not(.ant-popover-hidden) .ant-popover-buttons .ant-btn-primary',
		)
		.last();
	await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
	if (urlPart) {
		await waitForApiResponse(page, urlPart, 'DELETE', () =>
			confirmButton.click({ force: true }),
		);
	} else {
		await confirmButton.click({ force: true });
	}
	await page
		.waitForLoadState('networkidle', { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(1000);
}

async function waitMainTextExcludes(page, keyword, scopeName) {
	const deadline = Date.now() + 10000;
	let latestText = '';
	while (Date.now() < deadline) {
		latestText = await page.locator('main').innerText({ timeout: 10000 });
		if (!latestText.includes(keyword)) {
			return;
		}
		await page.waitForTimeout(300);
	}
	throw new Error(`${scopeName} 不应显示按钮或入口：${keyword}`);
}

async function closeAnyDrawer(page) {
	const drawer = page.locator('.ant-drawer-open').last();
	if ((await drawer.count()) < 1) {
		return;
	}
	await page.waitForTimeout(300);
	await page
		.evaluate(() => {
			const closeButtons = Array.from(
				document.querySelectorAll('.ant-drawer-open .ant-drawer-close'),
			);
			closeButtons.forEach((button) => {
				if (button instanceof HTMLElement) {
					button.click();
				}
			});
			const actionButtons = Array.from(
				document.querySelectorAll('.ant-drawer-open .profile-actions button'),
			);
			const lastAction = actionButtons.at(-1);
			if (lastAction instanceof HTMLElement) {
				lastAction.click();
			}
		})
		.catch(() => {});
	await page.keyboard.press('Escape').catch(() => {});
	await page
		.waitForFunction(
			() => document.querySelectorAll('.ant-drawer-open').length === 0,
			{ timeout: 5000 },
		)
		.catch(() => {});
	await page
		.locator('.ant-drawer-content-wrapper')
		.last()
		.waitFor({ state: 'hidden', timeout: 5000 })
		.catch(() => {});
	await page
		.locator('.ant-drawer-mask')
		.last()
		.waitFor({ state: 'hidden', timeout: 5000 })
		.catch(() => {});
}

async function assertGiftPcPersonCrud(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/person',
		'giftPerson',
	);
	const unique = `codex-pc-person-${Date.now()}`;
	await page.getByRole('button', { name: '+ 添加联系人' }).click();
	await page.locator('.ant-drawer input').nth(0).fill(unique);
	await page.locator('.ant-drawer input').nth(1).fill('13800009999');
	const saveRefreshPromise = page
		.waitForResponse(
			(response) =>
				new URL(response.url()).pathname.includes(
					'/gift-person-info-t/business-page',
				) &&
				response.request().method().toUpperCase() === 'POST' &&
				response.status() >= 200 &&
				response.status() < 300,
			{ timeout: 15000 },
		)
		.catch(() => null);
	await waitForExactApiResponse(page, '/gift-person-info-t', 'POST', () =>
		page.locator('.ant-drawer .ant-drawer-footer .ant-btn-primary').click(),
	);
	await saveRefreshPromise;
	await closeAnyDrawer(page);
	await searchCurrentGiftPage(page, unique);
	let row = await assertTableRowVisible(page, unique, '亲友管理');
	await waitForApiResponse(page, '/gift-person-info-t/profile', 'GET', () =>
		row.getByText('详情', { exact: true }).click(),
	);
	await page
		.locator('.ant-drawer:visible .profile-head')
		.waitFor({ state: 'visible', timeout: 10000 });
	const profileText = await page.locator('.ant-drawer-open').last().innerText({
		timeout: 10000,
	});
	assertTextIncludes(profileText, unique, '亲友详情抽屉');
	await closeAnyDrawer(page);
	row = await assertTableRowVisible(page, unique, '亲友管理');
	await confirmRowDelete(page, row, '/gift-person-info-t');
	await searchCurrentGiftPage(page, unique);
	await waitMainTextExcludes(page, unique, '亲友删除后列表');
}

async function assertGiftPcEventCrud(page, agent, runtime) {
	await gotoGiftPage(page, agent, runtime, '/finance/gift/event', 'giftEvent');
	const unique = `codex-pc-event-${Date.now()}`;
	await page.getByRole('button', { name: '+ 新增事由' }).click();
	await page.locator('.ant-drawer input').nth(0).fill(unique);
	await page.locator('.ant-drawer .ant-select-selector').first().click();
	await page
		.locator(
			'.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
		)
		.first()
		.click();
	await waitForExactApiResponse(page, '/gift-event-info-t', 'POST', () =>
		page.locator('.ant-drawer .ant-drawer-footer .ant-btn-primary').click(),
	);
	await closeAnyDrawer(page);
	await searchCurrentGiftPage(page, unique);
	const row = await assertTableRowVisible(page, unique, '事由管理');
	await confirmRowDelete(page, row, '/gift-event-info-t');
	await searchCurrentGiftPage(page, unique);
	await waitMainTextExcludes(page, unique, '事由删除后列表');
}

async function assertGiftPcRecordCrud(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/record',
		'giftRecord',
	);
	const unique = `codex-pc-record-${Date.now()}`;
	const amount = Number(`88${String(Date.now()).slice(-4)}`);
	await page.getByRole('button', { name: '+ 快速记礼' }).click();
	const drawerInputs = page.locator('.ant-drawer input:not([type="radio"])');
	await page.locator('.ant-drawer .ant-input-number-input').first().fill(String(amount));
	await drawerInputs.nth(2).fill('1');
	await drawerInputs.nth(3).fill('1');
	await page
		.locator('.ant-drawer .ant-picker-input input')
		.click();
	await page.locator('.ant-picker-now-btn').last().click();
	await page.locator('.ant-drawer textarea').fill(unique);
	const saveRefreshPromise = page
		.waitForResponse(
			(response) =>
				new URL(response.url()).pathname.includes('/gift-record-info-t/page') &&
				response.request().method().toUpperCase() === 'POST' &&
				response.status() >= 200 &&
				response.status() < 300,
			{ timeout: 15000 },
		)
		.catch(() => null);
	await waitForExactApiResponse(page, '/gift-record-info-t', 'POST', () =>
		page.locator('.ant-drawer .ant-btn-primary').last().click({ force: true }),
	);
	await saveRefreshPromise;
	await closeAnyDrawer(page);
	await searchGiftRecordByAmount(page, amount);
	const row = await assertTableRowVisible(page, unique, '礼金记录');
	await confirmRowDelete(page, row, '/gift-record-info-t');
	await searchGiftRecordByAmount(page, amount);
	await waitMainTextExcludes(page, unique, '礼金记录删除后列表');
}

async function assertGiftPcExportAction(page, agent, runtime) {
	await gotoGiftPage(
		page,
		agent,
		runtime,
		'/finance/gift/record',
		'giftRecord',
	);
	const downloadPromise = page
		.waitForEvent('download', { timeout: 3000 })
		.catch(() => null);
	const requestPromise = page.waitForRequest(
		(request) =>
			request.url().includes('/gift-record-info-t') &&
			request.url().toLowerCase().includes('export'),
		{ timeout: 3000 },
	).catch(() => null);
	await page.getByRole('button', { name: 'Excel导出' }).click();
	const result = await Promise.race([
		downloadPromise.then((download) => (download ? 'download' : null)),
		requestPromise.then((request) => (request ? 'request' : null)),
		new Promise((resolve) => setTimeout(() => resolve('none'), 3200)),
	]);
	if (!result || result === 'none') {
		throw new Error('礼金记录 Excel导出按钮未触发下载或导出请求');
	}
}

async function runCase(testCase, runtime, page, agent) {
	const startedAt = new Date().toISOString();
	await resetSession(page, runtime);
	await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
	await ensureLoggedIn(page, agent, testCase.persona);
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
			await agent.aiWaitFor('刷 新后仍能看到用户管理列表表格');
			await agent.aiAssert('当前页面不是登录页');
			await agent.aiAssert('当前页面不是404页面');
			break;
		case 'RBAC-LOCAL-005':
			await gotoRbacPage(agent, '机构管理');
			await agent.aiAssert(
				'机构管理页面中不出现“新增用户”“移动用户”“分配用户”这些文案或按钮',
			);
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
			await agent.aiWaitFor('角色管理表格已刷 新并显示筛选结果');
			break;
		case 'RBAC-LOCAL-301':
			await gotoRbacPage(agent, '菜单管理');
			await agent.aiAct('点击新增按钮打开菜单新增弹窗');
			await agent.aiAssert('弹窗表单中存在字段“权限标识”');
			await agent.aiAssert('弹窗表单中存在字段“首页展示”');
			break;
		case 'GIFT-ADMIN-001':
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/dashboard',
				'giftDashboard',
			);
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/person',
				'giftPerson',
			);
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/event',
				'giftEvent',
			);
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/record',
				'giftRecord',
			);
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/analysis',
				'giftAnalysis',
			);
			break;
		case 'GIFT-ADMIN-002':
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/record',
				'giftRecord',
			);
			{
				const recordText = await assertMainText(
					page,
					'礼金记录',
					'礼金记录页面未正确加载到主内容区',
				);
				for (const item of [
					'礼金方向',
					'人员',
					'事由',
					'金额',
					'查询结果',
					'重 置',
				]) {
					assertTextIncludes(recordText, item, '礼金记录筛选区');
				}
				await page.getByRole('button', { name: '+ 快速记礼' }).click();
				const drawer = await assertVisibleDrawerButtons(
					page,
					[],
					'快速记礼抽屉',
				);
				const drawerText = await drawer.innerText({ timeout: 10000 });
				for (const item of ['快速记礼', '随礼', '金额']) {
					assertTextIncludes(drawerText, item, '快速记礼抽屉');
				}
			}
			break;
		case 'GIFT-ADMIN-003':
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/person',
				'giftPerson',
			);
			await assertMainText(
				page,
				'亲友管理',
				'亲友管理页面未正确加载到主内容区',
			);
			await gotoGiftPage(
				page,
				agent,
				runtime,
				'/finance/gift/record',
				'giftRecord',
			);
			{
				const recordText = await assertMainText(
					page,
					'礼金记录',
					'礼金记录页面未正确加载到主内容区',
				);
				if (!recordText.includes('Excel导出')) {
					throw new Error('gift_admin 角色在礼金记录页面应可见 Excel导出 按钮');
				}
				if (
					!recordText.includes('暂无数据') &&
					!recordText.includes('编辑') &&
					!recordText.includes('删除')
				) {
					throw new Error(
						'礼金记录页面有数据时应可见行操作，列表为空时应可见空状态',
					);
				}
			}
			break;
		case 'GIFT-BUTTON-ADMIN-001':
			await assertGiftAdminButtonMatrix(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-USER-001':
			await assertGiftUserButtonMatrix(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-DASHBOARD-ADMIN-001':
			await assertGiftDashboardAdminButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-DASHBOARD-USER-001':
			await assertGiftDashboardUserButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-PERSON-ADMIN-001':
			await assertGiftPersonAdminButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-PERSON-USER-001':
			await assertGiftPersonUserButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-EVENT-ADMIN-001':
			await assertGiftEventAdminButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-EVENT-USER-001':
			await assertGiftEventUserButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-RECORD-ADMIN-001':
			await assertGiftRecordAdminButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-RECORD-USER-001':
			await assertGiftRecordUserButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-ANALYSIS-ADMIN-001':
			await assertGiftAnalysisAdminButtons(page, agent, runtime);
			break;
		case 'GIFT-BUTTON-ANALYSIS-USER-001':
			await assertGiftAnalysisUserButtons(page, agent, runtime);
			break;
		case 'GIFT-PC-PERSON-CRUD-001':
			await assertGiftPcPersonCrud(page, agent, runtime);
			break;
		case 'GIFT-PC-EVENT-CRUD-001':
			await assertGiftPcEventCrud(page, agent, runtime);
			break;
		case 'GIFT-PC-RECORD-CRUD-001':
			await assertGiftPcRecordCrud(page, agent, runtime);
			break;
		case 'GIFT-PC-EXPORT-001':
			await assertGiftPcExportAction(page, agent, runtime);
			break;
		default:
			throw new Error(`Unsupported caseId=${testCase.caseId}`);
	}
	const screenshotPath = path.join(
		screenshotDir,
		`${testCase.caseId}_pass.png`,
	);
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
		throw new Error(
			'No smoke cases selected. Please check MIDSCENE_CASE_FILTER.',
		);
	}
	const browser = await chromium.launch({
		headless: runtime.mode === 'ci',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	const results = [];
	for (const testCase of selectedCases) {
		const context = await browser.newContext({
			viewport: { width: 1400, height: 900 },
		});
		const page = await context.newPage();
		const agent = new PlaywrightAgent(page);
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
			await page
				.screenshot({ path: failShot, fullPage: true })
				.catch(() => undefined);
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
		} finally {
			await context.close().catch(() => undefined);
		}
	}
	await browser.close();
	const passedCount = results.filter((item) => item.status === 'pass').length;
	const failedCount = results.filter((item) => item.status === 'fail').length;
	const skippedCount = results.filter(
		(item) => item.status === 'skipped',
	).length;
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
	fs.writeFileSync(
		path.join(reportDir, 'smoke-report.json'),
		JSON.stringify(report, null, 2),
	);
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
