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

async function startViteServerIfNeed(port = 3100) {
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
	{
		id: '4',
		name: 'finance',
		title: '财务中心',
		path: '/finance',
		component: 'Layout',
		children: [
			{
				id: '40',
				name: 'giftRecord',
				title: '礼金记录',
				path: 'gift/record',
				component: '/src/views/finance/gift/record/index.vue',
				permissionCode: 'gift:view',
			},
			{
				id: '41',
				name: 'giftDashboard',
				title: '数据概览',
				path: 'gift/dashboard',
				component: '/src/views/finance/gift/gift-dashboard/index.vue',
				permissionCode: 'gift:view',
			},
			{
				id: '42',
				name: 'financeManager',
				title: '收支明细',
				path: 'financeManager',
				component: '/src/views/selfFinance/financeManager/index.vue',
				permissionCode: 'finance:view',
			},
		],
	},
];

const PERSONA_CONFIGS = {
	super_super: {
		user: { id: '1', username: 'superman', realName: '超级管理员' },
		roleInfo: { roleCode: 'super_super', roleName: '超级管理员' },
		permCtx: {
			superAdmin: true,
			roleList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
			permissionCodes: ['*'],
			buttonPermissionCodes: ['*'],
			currentOrgId: '20',
		},
	},
	family_admin: {
		user: { id: '1', username: 'admin_dad', realName: '家庭管理员爸爸' },
		roleInfo: { roleCode: 'family_admin', roleName: '家庭管理员' },
		permCtx: {
			superAdmin: false,
			roleList: [{ roleCode: 'family_admin', roleName: '家庭管理员' }],
			currentOrgId: '20',
			permissionCodes: [
				'finance:view',
				'finance:financeManager:query',
				'finance:financeManager:add',
				'finance:financeManager:edit',
				'finance:financeManager:delete',
				'finance:financeManager:budget:view',
				'finance:financeManager:budget:edit',
			],
			buttonPermissionCodes: [
				'finance:view',
				'finance:financeManager:query',
				'finance:financeManager:add',
				'finance:financeManager:edit',
				'finance:financeManager:delete',
				'finance:financeManager:budget:view',
				'finance:financeManager:budget:edit',
			],
		},
	},
	family_member: {
		user: { id: '2', username: 'member_kid', realName: '普通成员小袋子' },
		roleInfo: { roleCode: 'family_member', roleName: '家庭成员' },
		permCtx: {
			superAdmin: false,
			roleList: [{ roleCode: 'family_member', roleName: '家庭成员' }],
			currentOrgId: '20',
			permissionCodes: [
				'finance:view',
				'finance:financeManager:query',
				'finance:financeManager:add',
				'finance:financeManager:edit',
				'finance:financeManager:delete',
				'finance:financeManager:budget:view',
			],
			buttonPermissionCodes: [
				'finance:view',
				'finance:financeManager:query',
				'finance:financeManager:add',
				'finance:financeManager:edit',
				'finance:financeManager:delete',
				'finance:financeManager:budget:view',
			],
		},
	},
};

let currentPersonaKey = 'super_super';

async function switchPersona(page, personaKey = 'super_super', baseUrl = 'http://localhost:3100/') {
	if (currentPersonaKey === personaKey && page.url() && page.url() !== 'about:blank') {
		return;
	}
	currentPersonaKey = personaKey;
	const p = PERSONA_CONFIGS[personaKey] || PERSONA_CONFIGS.super_super;
	if (!page.url() || page.url() === 'about:blank') {
		await page.goto(baseUrl);
	}
	await page.evaluate(
		({ user, roleInfo, permCtx, menus }) => {
			window.localStorage.setItem('token', 'mock-e2e-token-xyz');
			window.localStorage.setItem('userInfo', JSON.stringify(user));
			window.localStorage.setItem('roleInfo', JSON.stringify(roleInfo));
			window.localStorage.setItem('menuInfo', JSON.stringify(menus));
			window.localStorage.setItem('permissionContext', JSON.stringify(permCtx));
			window.localStorage.setItem(
				'app-user',
				JSON.stringify({
					token: 'mock-e2e-token-xyz',
					userInfo: user,
					roleInfo: roleInfo,
					menuInfo: menus,
					hasMenu: true,
					permissionContext: permCtx,
				}),
			);
		},
		{ user: p.user, roleInfo: p.roleInfo, permCtx: p.permCtx, menus: mockMenus },
	);
	await page.reload();
}

let isBudgetOverStatus = false;

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
			const p = PERSONA_CONFIGS[currentPersonaKey] || PERSONA_CONFIGS.super_super;
			return fulfillEncrypted(route, {
				code: '200',
				message: '登录成功',
				data: {
					token: 'mock-e2e-token-xyz',
					admin: {
						id: p.user.id,
						username: p.user.username,
						realName: p.user.realName,
						roleInfoVoList: p.permCtx.roleList,
						permissionContext: p.permCtx,
					},
					userInfo: p.user,
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

		if (pathname.includes('/gift-record-info') && pathname.includes('/ai-parse')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					direction: 'GIVE',
					amount: 800,
					personName: '王五',
					eventTypeName: '结婚',
					eventType: 'wedding',
					remark: '随了大学同学王五结婚礼金800元',
				},
			});
		}

		if (pathname.includes('/gift-record-info') && pathname.includes('/recommend-amount')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					recommendAmounts: [500, 600, 800, 1000],
					aiReasoning: '根据亲友关系【大学同学】及历史往来均值，推荐 800 元',
					aiGreetingTip: '新婚燕尔，百年好合！',
				},
			});
		}

		if (pathname.includes('/gift-record-info') && pathname.includes('/mark-returned')) {
			return fulfillEncrypted(route, {
				code: '200',
				message: '操作成功',
				data: true,
			});
		}

		if (pathname.includes('/gift-record-info') && pathname.includes('/summary')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					totalGiveAmount: 800,
					totalReceiveAmount: 1200,
					receiveAmount: 1200,
					giveAmount: 800,
					netAmount: 400,
					totalCount: 2,
					recordCount: 2,
				},
			});
		}

		if (pathname.includes('/gift-record-info') && pathname.includes('/page')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					records: [
						{
							id: '10001',
							direction: 'GIVE',
							amount: 800,
							personName: '王五',
							receiverPersonName: '王五',
							eventName: '结婚典礼',
							eventType: 'wedding',
							payTime: '2026-10-01 12:00:00',
							remark: '随礼800元',
							returnedFlag: 0,
						},
						{
							id: '10002',
							direction: 'RECEIVE',
							amount: 1000,
							personName: '赵六',
							giverPersonName: '赵六',
							eventName: '乔迁新居',
							eventType: 'housewarming',
							payTime: '2026-10-05 10:00:00',
							remark: '乔迁礼金',
							returnedFlag: 0,
						},
					],
					total: 2,
					current: 1,
					size: 10,
				},
			});
		}

		if (pathname.includes('/gift-analysis/trend')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{ label: '2026-05', giveAmount: 500, receiveAmount: 800 },
					{ label: '2026-06', giveAmount: 600, receiveAmount: 1000 },
					{ label: '2026-07', giveAmount: 400, receiveAmount: 1200 },
					{ label: '2026-08', giveAmount: 700, receiveAmount: 900 },
					{ label: '2026-09', giveAmount: 500, receiveAmount: 1500 },
					{ label: '2026-10', giveAmount: 800, receiveAmount: 1800 },
				],
			});
		}

		if (pathname.includes('/gift-analysis/person-ranking')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{ name: '王五', personName: '王五', amount: 1800, direction: 'RECEIVE', percent: 80 },
					{ name: '李四', personName: '李四', amount: 1200, direction: 'GIVE', percent: 60 },
				],
			});
		}

		if (pathname.includes('/gift-person-info') && pathname.includes('/summary')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					personCount: 15,
					pendingReturnCount: 3,
					pendingReturnAmount: 1200,
				},
			});
		}

		if (pathname.includes('/gift-event-info') && pathname.includes('/list')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{
						id: '20001',
						eventName: '结婚典礼',
						eventType: 'wedding',
						eventTime: '2026-10-01 12:00:00',
					},
				],
			});
		}

		if (pathname.includes('/gift-person-info') && pathname.includes('/list')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{
						id: '30001',
						personName: '王五',
						relationType: '大学同学',
					},
				],
			});
		}

		if (pathname.includes('event-type-option') || pathname.includes('relation-option')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [],
			});
		}

		if (pathname.includes('org-member-options')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{
						id: '1',
						personName: '超级管理员',
						bindUserId: '1',
					},
				],
			});
		}

		if (pathname.includes('/finance-budget/status')) {
			if (isBudgetOverStatus) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						id: '7002',
						budgetMonth: '2026-10',
						budgetAmount: 2000,
						actualExpense: 2850,
						remainingAmount: -850,
						usagePercent: 142.5,
						isOverBudget: true,
						isInherited: false,
						categoryCodes: [],
					},
				});
			}
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					id: '7001',
					budgetMonth: '2026-10',
					budgetAmount: 3000,
					actualExpense: 1200,
					remainingAmount: 1800,
					usagePercent: 40,
					isOverBudget: false,
					isInherited: false,
					categoryCodes: [],
				},
			});
		}

		if (pathname.includes('/finance-budget/ai/recommend') || pathname.includes('/finance-budget/ai-recommend')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					avgMonthlyExpense: 2600,
					recommendAmount: 2600,
					savingAmount: 2210,
					moderateAmount: 2600,
					relaxedAmount: 2990,
					recommendedCategories: ['餐饮美食', '交通出行'],
					healthAdvice: '近3月平均支出约 2,600 元，建议本月适度控制在 2,600 元以内，重点关注餐饮与交通。',
					dailyLimitSuggest: 86.67,
					isFallback: false,
				},
			});
		}

		if (pathname.includes('/finance-budget/ai/parse') || pathname.includes('/finance-budget/ai-parse')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					hasBudget: true,
					amount: 2500,
					hasCategories: true,
					categories: ['餐饮美食', '交通出行'],
					reasoning: '根据指令，设定月度预算为 2500 元，重点管控餐饮美食、交通出行分类。',
				},
			});
		}

		if (pathname.includes('/finance-budget/categories')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: ['餐饮美食', '交通出行', '数码电器', '服饰鞋包', '日用百货'],
			});
		}

		if (pathname.includes('/finance-budget/save')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: true,
			});
		}

		if (pathname.includes('/finance-info/summary')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					totalExpense: isBudgetOverStatus ? 2850 : 1200,
					totalIncome: 5000,
					totalBalance: isBudgetOverStatus ? 2150 : 3800,
					totalCount: 10,
				},
			});
		}

		if (pathname.includes('/finance-info/page')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: {
					records: [
						{
							id: '6001',
							name: '【管理员】全家电费缴纳',
							amount: 320,
							belongTo: '1',
							incomeAndExpenses: 'expense',
							typeCode: '住房物业',
							isValid: '1',
							infoDate: '2026-10-10',
						},
						{
							id: '6002',
							name: '【普通成员】文具图书购买',
							amount: 85,
							belongTo: '2',
							incomeAndExpenses: 'expense',
							typeCode: '休闲娱乐',
							isValid: '1',
							infoDate: '2026-10-12',
						},
					],
					total: 2,
					current: 1,
					size: 10,
				},
			});
		}

		if (pathname.includes('/user/list')) {
			return fulfillEncrypted(route, {
				code: '200',
				data: [
					{
						id: '1',
						nickName: '超级管理员',
						username: 'superman',
					},
				],
			});
		}

		return fulfillEncrypted(route, { code: '200', data: {} });
	});
}

async function executeCase(page, c, runtime) {
	console.log(`Running case ${c.caseId}: ${c.title}...`);
	if (c.persona) {
		await switchPersona(page, c.persona, runtime.baseUrl);
	}

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

		case 'AI-GIFT-PC-001': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/record`);
			const openBtn = page.locator('[data-testid="gift-record-open-drawer"]').first();
			await openBtn.waitFor({ state: 'visible', timeout: 10000 });
			await openBtn.click();

			// 等待抽屉唤起及 AI 记账输入框可见并输入测试文本
			const aiInput = page.locator('[data-testid="gift-record-ai-input"] input, input[data-testid="gift-record-ai-input"]').first();
			await aiInput.waitFor({ state: 'visible', timeout: 8000 });
			await aiInput.fill('随了大学同学王五结婚礼金800元');

			// 点击智能解析按钮
			const aiBtn = page.locator('[data-testid="gift-record-ai-btn"]').first();
			await aiBtn.click();

			// 等待表单金额项自动回填为 800
			const amountInput = page.locator('[data-testid="gift-record-form-amount"] input').first();
			await amountInput.waitFor({ state: 'visible', timeout: 5000 });

			// 等待数值填入并断言
			await page.waitForFunction(
				() => {
					const el = document.querySelector('[data-testid="gift-record-form-amount"] input');
					return el && el.value && el.value.includes('800');
				},
				null,
				{ timeout: 5000 },
			);

			const amountVal = await amountInput.inputValue();
			if (!amountVal.includes('800')) {
				throw new Error(`AI 智能记账要素回填金额断言失败: expected to include 800, got '${amountVal}'`);
			}

			// 关闭抽屉保持状态纯净
			const closeBtn1 = page.locator('.ant-drawer-close').first();
			if (await closeBtn1.count() && await closeBtn1.isVisible()) {
				await closeBtn1.click();
				await page.locator('.ant-drawer-open').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
			}
			break;
		}

		case 'GIFT-E2E-PC-DASHBOARD': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/dashboard`);

			// 1. 等待图表容器挂载
			const trendCard = page.locator('[data-testid="gift-dashboard-trend-chart"]').first();
			await trendCard.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 验证亲友排行榜全部跳转按钮
			const rankingBtn = page.locator('[data-testid="gift-dashboard-ranking-all"]').first();
			await rankingBtn.waitFor({ state: 'visible', timeout: 5000 });

			// 3. 验证最近往来流水入口并点击穿透
			const recordAllBtn = page.locator('[data-testid="gift-dashboard-record-all"]').first();
			await recordAllBtn.waitFor({ state: 'visible', timeout: 5000 });
			await recordAllBtn.click();

			// 4. 断言路由成功穿透至台账页
			await page.waitForFunction(() => window.location.hash.includes('/finance/gift/record'), null, { timeout: 5000 });
			break;
		}

		case 'GIFT-E2E-PC-FLOW-RETURN': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/record`);

			// 1. 等待表格渲染出 RECEIVE 记录并存在“标记已回”按钮
			const markBtn = page.locator('[data-testid="gift-record-mark-returned"]').first();
			await markBtn.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 侦听 mark-returned 接口请求触发
			const [request] = await Promise.all([
				page.waitForRequest((req) => req.url().includes('mark-returned') && (req.method() === 'PUT' || req.method() === 'POST')),
				markBtn.click(),
			]);
			if (!request) {
				throw new Error('标记已回礼请求未正常触发');
			}

			// 3. 打开快速记礼抽屉
			const openBtn = page.locator('[data-testid="gift-record-open-drawer"]').first();
			await openBtn.click();

			const formDrawer = page.locator('.ant-drawer-content').first();
			await formDrawer.waitFor({ state: 'visible', timeout: 5000 });

			// 4. 关闭抽屉保持状态纯净
			const closeBtn2 = page.locator('.ant-drawer-close').first();
			if (await closeBtn2.count() && await closeBtn2.isVisible()) {
				await closeBtn2.click();
				await page.locator('.ant-drawer-open').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
			}
			break;
		}

		case 'GIFT-E2E-PC-FORM-LINKAGE': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/record`);

			// 1. 如果抽屉未打开则打开
			const existingDrawer = page.locator('.ant-drawer-open').first();
			if (!(await existingDrawer.count()) || !(await existingDrawer.isVisible())) {
				const openBtn = page.locator('[data-testid="gift-record-open-drawer"]').first();
				await openBtn.waitFor({ state: 'visible', timeout: 10000 });
				await openBtn.click();
			}

			// 2. 测试快捷人情事件 Tag 点击联动
			const quickEventTag = page.locator('[data-testid="gift-record-quick-event-tag"]').first();
			if (await quickEventTag.count()) {
				await quickEventTag.click();
			}

			// 3. 测试大额礼金与精度 (999999999.99)
			const amountInput = page.locator('[data-testid="gift-record-form-amount"] input').first();
			await amountInput.waitFor({ state: 'visible', timeout: 5000 });
			await amountInput.fill('999999999.99');

			// 4. 断言数值完全保留且不产生浮点截断
			await page.waitForFunction(() => {
				const el = document.querySelector('[data-testid="gift-record-form-amount"] input');
				return el && el.value && el.value.includes('999999999.99');
			}, null, { timeout: 5000 });

			// 5. 点击快捷金额 Tag (如 800)
			const quickAmountTag = page.locator('[data-testid="gift-record-quick-amount-tag"]').first();
			if (await quickAmountTag.count()) {
				await quickAmountTag.click();
				await page.waitForFunction(() => {
					const el = document.querySelector('[data-testid="gift-record-form-amount"] input');
					return el && el.value && el.value.length > 0 && !el.value.includes('999999999.99');
				}, null, { timeout: 5000 });
			}

			// 6. 完工关闭抽屉
			const closeBtn3 = page.locator('.ant-drawer-close').first();
			if (await closeBtn3.count() && await closeBtn3.isVisible()) {
				await closeBtn3.click();
				await page.locator('.ant-drawer-open').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
			}
			break;
		}

		case 'AI-BUDGET-001': {
			isBudgetOverStatus = false;
			await page.goto(`${runtime.baseUrl}#/home-dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);
			const openModalBtn = page.locator('[data-testid="btn-open-budget-modal"]').first();
			await openModalBtn.waitFor({ state: 'visible', timeout: 10000 });
			await openModalBtn.click();

			try {
				// 1. 等待 AI 适度档推荐卡片可见（弹窗打开时自闭环触发测算）
				const moderateCard = page.locator('[data-testid="btn-apply-tier-moderate"]').first();
				try {
					await moderateCard.waitFor({ state: 'visible', timeout: 6000 });
				} catch {
					// 若尚未就绪，手动触发测算
					const recommendBtn = page.locator('[data-testid="btn-fetch-ai-recommend"]').first();
					await recommendBtn.click();
					await moderateCard.waitFor({ state: 'visible', timeout: 8000 });
				}

				// 2. 点击适度档推荐 (2600)
				await moderateCard.click();

				// 3. 断言输入框金额已填入 2600
				await page.waitForFunction(() => {
					const el = document.querySelector('[data-testid="budget-amount-input"] input') || document.querySelector('[data-testid="budget-amount-input"]');
					const val = el ? (el.value || el.innerText || '') : '';
					return val.includes('2600');
				}, null, { timeout: 8000 });
			} finally {
				// 4. 关闭弹窗
				const closeBtn = page.locator('.ant-modal-close').first();
				if (await closeBtn.count() && await closeBtn.isVisible()) {
					await closeBtn.click();
					await page.locator('.ant-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
				}
			}
			break;
		}

		case 'AI-BUDGET-002': {
			isBudgetOverStatus = false;
			await page.goto(`${runtime.baseUrl}#/home-dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);
			const openModalBtn = page.locator('[data-testid="btn-open-budget-modal"]').first();
			await openModalBtn.waitFor({ state: 'visible', timeout: 10000 });
			await openModalBtn.click();

			try {
				// 1. 展开口语指令区
				const cmdInput = page.locator('[data-testid="ai-command-input"] input, input[data-testid="ai-command-input"]').first();
				const toggleExpandBtn = page.locator('[data-testid="btn-toggle-ai-expand"]').first();
				await toggleExpandBtn.waitFor({ state: 'visible', timeout: 5000 });

				if (!await cmdInput.isVisible()) {
					await toggleExpandBtn.click();
					await cmdInput.waitFor({ state: 'visible', timeout: 5000 });
				}

				// 2. 输入口语化指令
				await cmdInput.fill('帮我设2500预算，重点管餐饮和交通');

				// 3. 点击 AI 解析回填
				const parseBtn = page.locator('[data-testid="btn-ai-parse-command"]').first();
				await parseBtn.click();

				// 4. 断言输入框金额已更新为 2500
				await page.waitForFunction(() => {
					const el = document.querySelector('[data-testid="budget-amount-input"] input') || document.querySelector('[data-testid="budget-amount-input"]');
					const val = el ? (el.value || el.innerText || '') : '';
					return val.includes('2500');
				}, null, { timeout: 8000 });
			} finally {
				// 5. 关闭弹窗
				const closeBtn = page.locator('.ant-modal-close').first();
				if (await closeBtn.count() && await closeBtn.isVisible()) {
					await closeBtn.click();
					await page.locator('.ant-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
				}
			}
			break;
		}

		case 'BUDGET-E2E-STATUS-OVER': {
			isBudgetOverStatus = true;
			await page.goto(`${runtime.baseUrl}#/home-dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 1. 断言超支标签可见
			const overTag = page.locator('[data-testid="budget-over-tag"]').first();
			await overTag.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 断言剩余金额展示负数超支 (850)
			const remainingVal = page.locator('[data-testid="budget-remaining-value"]').first();
			await remainingVal.waitFor({ state: 'visible', timeout: 5000 });
			const valText = await remainingVal.innerText();
			if (!valText.includes('850')) {
				throw new Error(`超支金额未正确展示: 预期包含 850，实际为 ${valText}`);
			}

			isBudgetOverStatus = false;
			break;
		}

		case 'RBAC-PC-MEMBER-OWNER-PROTECT': {
			await page.goto(`${runtime.baseUrl}#/home-dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 1. 等待表格行加载 (包含两行：6001 为管理员账目，6002 为普通成员账目)
			const tableRowAdmin = page.locator('tr[data-row-key="6001"]').first();
			await tableRowAdmin.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 断言他人记录 (ID=1) 对应的多选复选框处于 disabled 状态
			const adminCheckbox = tableRowAdmin.locator('input[type="checkbox"]').first();
			const isAdminDisabled = await adminCheckbox.isDisabled();
			if (!isAdminDisabled) {
				throw new Error('普通家庭成员视角下，他人账目的多选复选框应处于禁用状态');
			}

			// 3. 断言他人记录操作列中不渲染“编辑”和“删除”按钮，仅渲染“查看”按钮
			const editBtnInAdminRow = tableRowAdmin.locator('[data-testid="btn-edit-finance"]');
			const delBtnInAdminRow = tableRowAdmin.locator('[data-testid="btn-delete-finance"]');
			const viewBtnInAdminRow = tableRowAdmin.locator('[data-testid="btn-view-finance"]');
			if ((await editBtnInAdminRow.count()) > 0) {
				throw new Error('普通家庭成员视角下，他人账目操作列不应展示编辑按钮');
			}
			if ((await delBtnInAdminRow.count()) > 0) {
				throw new Error('普通家庭成员视角下，他人账目操作列不应展示删除按钮');
			}
			if ((await viewBtnInAdminRow.count()) === 0) {
				throw new Error('普通家庭成员视角下，他人账目操作列应展示查看按钮');
			}

			// 4. 校验自己记录 (ID=2, row 6002) Checkbox 可用且展示编辑/删除按钮
			const tableRowMember = page.locator('tr[data-row-key="6002"]').first();
			const memberCheckbox = tableRowMember.locator('input[type="checkbox"]').first();
			const isMemberDisabled = await memberCheckbox.isDisabled();
			if (isMemberDisabled) {
				throw new Error('普通家庭成员视角下，自己账目的多选复选框应处于可用状态');
			}
			const editBtnInMemberRow = tableRowMember.locator('[data-testid="btn-edit-finance"]');
			if ((await editBtnInMemberRow.count()) === 0) {
				throw new Error('普通家庭成员视角下，自己账目应展示编辑按钮');
			}

			// 5. 打开预算弹窗
			const openModalBtn = page.locator('[data-testid="btn-open-budget-modal"]').first();
			await openModalBtn.waitFor({ state: 'visible', timeout: 5000 });
			await openModalBtn.click();

			try {
				// 6. 断言预算弹窗中只读提示条存在且预算金额输入框处于 disabled 状态
				const readonlyAlert = page.locator('[data-testid="budget-readonly-alert"]').first();
				await readonlyAlert.waitFor({ state: 'visible', timeout: 5000 });

				const isInputDisabled = await page.evaluate(() => {
					const wrapper = document.querySelector('[data-testid="budget-amount-input"]');
					const input = wrapper?.querySelector('input') || wrapper;
					return (
						input?.disabled === true ||
						input?.hasAttribute('disabled') ||
						wrapper?.classList.contains('ant-input-number-disabled') ||
						wrapper?.classList.contains('ant-input-number-affix-wrapper-disabled')
					);
				});
				if (!isInputDisabled) {
					throw new Error('普通家庭成员视角下，预算额度输入框应处于禁用状态');
				}

				// 7. 断言保存配置按钮不渲染
				const saveBtn = page.locator('[data-testid="btn-save-budget"]');
				if ((await saveBtn.count()) > 0 && (await saveBtn.first().isVisible())) {
					throw new Error('普通家庭成员视角下，预算弹窗不应渲染保存配置按钮');
				}
			} finally {
				const closeBtn = page.locator('[data-testid="btn-close-budget"]').first();
				if ((await closeBtn.count()) && (await closeBtn.isVisible())) {
					await closeBtn.click();
					await page.locator('.ant-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
				}
			}
			break;
		}

		case 'RBAC-PC-ADMIN-FULL-MANAGE': {
			await page.goto(`${runtime.baseUrl}#/home-dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 1. 等待表格数据加载
			const tableRowMember = page.locator('tr[data-row-key="6002"]').first();
			await tableRowMember.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 断言管理员可管理家庭成员账目 (Checkbox 可用，编辑与删除按钮均渲染)
			const memberCheckbox = tableRowMember.locator('input[type="checkbox"]').first();
			const isMemberDisabled = await memberCheckbox.isDisabled();
			if (isMemberDisabled) {
				throw new Error('家庭管理员视角下，全家账目的多选复选框应处于可用状态');
			}
			const editBtnInMemberRow = tableRowMember.locator('[data-testid="btn-edit-finance"]');
			const delBtnInMemberRow = tableRowMember.locator('[data-testid="btn-delete-finance"]');
			if ((await editBtnInMemberRow.count()) === 0) {
				throw new Error('家庭管理员视角下，全家成员账目应展示编辑按钮');
			}
			if ((await delBtnInMemberRow.count()) === 0) {
				throw new Error('家庭管理员视角下，全家成员账目应展示删除按钮');
			}

			// 3. 打开预算弹窗
			const openModalBtn = page.locator('[data-testid="btn-open-budget-modal"]').first();
			await openModalBtn.waitFor({ state: 'visible', timeout: 5000 });
			await openModalBtn.click();

			try {
				// 4. 断言保存配置按钮可见且可用
				const saveBtn = page.locator('[data-testid="btn-save-budget"]').first();
				await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
				await saveBtn.click();

				// 5. 等待弹窗保存关闭
				await page.locator('.ant-modal').waitFor({ state: 'hidden', timeout: 8000 });
			} finally {
				const closeBtn = page.locator('.ant-modal-close').first();
				if ((await closeBtn.count()) && (await closeBtn.isVisible())) {
					await closeBtn.click();
					await page.locator('.ant-modal').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
				}
			}
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
	const server = await startViteServerIfNeed(3100);

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

	// 注入 localStorage mock 状态以维持登录态（若已注入则不覆盖）
	await context.addInitScript((menus) => {
		if (window.localStorage.getItem('token')) {
			return;
		}
		const user = { id: '1', username: 'superman', realName: '超级管理员' };
		const roleInfo = { roleCode: 'super_super', roleName: '超级管理员' };
		const permCtx = {
			superAdmin: true,
			roleList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
			permissionCodes: ['*'],
			buttonPermissionCodes: ['*'],
			currentOrgId: '20',
		};
		window.localStorage.setItem('token', 'mock-e2e-token-xyz');
		window.localStorage.setItem('userInfo', JSON.stringify(user));
		window.localStorage.setItem('roleInfo', JSON.stringify(roleInfo));
		window.localStorage.setItem('menuInfo', JSON.stringify(menus));
		window.localStorage.setItem('permissionContext', JSON.stringify(permCtx));
		window.localStorage.setItem(
			'app-user',
			JSON.stringify({
				token: 'mock-e2e-token-xyz',
				userInfo: user,
				roleInfo: roleInfo,
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

	// 预热 Vite Dev Server，确保依赖预打包完全就绪
	await page.goto(`${server.url}#/home-dashboard`);
	await page.waitForLoadState('networkidle').catch(() => {});

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
