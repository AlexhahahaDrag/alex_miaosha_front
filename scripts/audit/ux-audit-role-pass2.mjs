/**
 * Pass-2: empty-state + add-role + correct relation hash for rbac_user_manager
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), override: true });
const evidence = path.join(root, '.jez', 'audit-evidence', '2026-08-19-role');
const baseUrl = (process.env.BASE_URL || 'http://localhost:3000/').replace(/\/?$/, '/');
const notes = [];

function log(t) {
	notes.push(`[${new Date().toISOString().slice(11, 19)}] ${t}`);
	console.log(t);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' }).catch(() => {});
const user = page.locator('input[placeholder*="用户名"], input[placeholder*="请输入用户名"]').first();
const pass = page.locator('input[type="password"]').first();
await user.waitFor({ state: 'visible' });
await user.fill('');
await user.pressSequentially(process.env.RBAC_MANAGER_USER, { delay: 15 });
await pass.fill('');
await pass.pressSequentially(process.env.RBAC_MANAGER_PASS, { delay: 15 });
await page.locator('.login-btn').click();
await page.waitForFunction(() => !!localStorage.getItem('token'), { timeout: 25000 });
await page.waitForTimeout(1200);

await page.locator('.ant-menu-item:has-text("角色管理")').first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(evidence, '12-pass2-role-empty.png') });

const empty = await page.locator('text=暂无数据').count();
const addBtn = await page.locator('[data-testid="rbac-role-btn-add"], button:has-text("新增"), button:has-text("添加")').count();
const queryBtn = await page.locator('[data-testid="rbac-role-btn-query"], button:has-text("查找")').count();
const scope = await page.locator('[data-testid="rbac-data-scope-hint"]').innerText().catch(() => '');
log(`empty=${empty} addBtn=${addBtn} queryBtn=${queryBtn} scope=${scope.slice(0, 80)}`);

if (addBtn > 0) {
	await page.locator('[data-testid="rbac-role-btn-add"], button:has-text("新增")').first().click();
	await page.waitForTimeout(800);
	await page.screenshot({ path: path.join(evidence, '13-pass2-add-modal.png') });
	const modal = await page.locator('.ant-modal, .ant-drawer').count();
	log(`add modal/drawer count=${modal}`);
	await page.keyboard.press('Escape');
} else {
	log('ADD_BUTTON_MISSING — persona cannot create role from toolbar');
}

await page.locator('[data-testid="rbac-role-btn-goto-relation"], button:has-text("角色-用户关系配置")').first().click();
await page.waitForTimeout(1500);
log(`after relation click url=${page.url()}`);
await page.screenshot({ path: path.join(evidence, '14-pass2-relation.png') });

const dual = await page.locator('[data-testid="rbac-dual-list"], .ant-transfer, .rbac-dual-list').count();
const roleSelect = await page.locator('.ant-select, [data-testid="rbac-role-select"]').count();
log(`relation dual=${dual} roleSelect=${roleSelect}`);

fs.writeFileSync(path.join(evidence, 'pass2-notes.json'), JSON.stringify(notes, null, 2));
await browser.close();
