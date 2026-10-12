import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 首页 Transition 容器与角色初始状态守卫测试：
 * 1. 动态组件必须被稳定具键的原生 DOM 容器 (<div :key="currentActiveRole">) 包裹，
 *    严禁 <transition> 直接裸包 <component :is>，防止 Vue 3 out-in 离开钩子中
 *    因子组件 DOM 销毁导致 Cannot read properties of null (reading 'parentNode')。
 * 2. currentActiveRole 必须直连 actualRoleType.value 进行初始化，
 *    杜绝硬编码 'user' 产生的挂载瞬间状态抖动与二重过渡竞态。
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homeDashboardPath = path.resolve(
	__dirname,
	'../../src/views/home-dashboard/index.vue',
);

describe('home-dashboard 过渡容器与角色初始化契约', () => {
	it('transition 内部必须包裹稳定的具键原生容器 div', () => {
		const source = fs.readFileSync(homeDashboardPath, 'utf8');

		// 验证 transition 内部存在包裹容器
		assert.match(
			source,
			/<transition[^>]*>[\s\S]*?<div\s+:key="currentActiveRole"[^>]*class="dashboard-content-container"[^>]*>[\s\S]*?<component\s+:is="activeDashboardComponent"/,
			'首页动态看板组件必须包裹在带 key 的 .dashboard-content-container 容器内',
		);

		// 禁止裸 component 直接挂载 key 作为 transition 的直接子节点
		assert.doesNotMatch(
			source,
			/<transition[^>]*>\s*<component\s+:is="activeDashboardComponent"\s+:key="currentActiveRole"\s*\/>\s*<\/transition>/,
			'禁止 <transition> 直接裸包裹 <component :is="..." :key="...">',
		);
	});

	it('currentActiveRole 初始值必须绑定 actualRoleType.value 防抖动', () => {
		const source = fs.readFileSync(homeDashboardPath, 'utf8');

		assert.match(
			source,
			/const\s+currentActiveRole\s*=\s*ref<DashboardRoleType>\(\s*actualRoleType\.value\s*\);/,
			'currentActiveRole 应直接使用 actualRoleType.value 初始化',
		);

		assert.doesNotMatch(
			source,
			/const\s+currentActiveRole\s*=\s*ref<DashboardRoleType>\(\s*['"]user['"]\s*\);/,
			'禁止将 currentActiveRole 硬编码初始化为 "user"',
		);
	});
});
