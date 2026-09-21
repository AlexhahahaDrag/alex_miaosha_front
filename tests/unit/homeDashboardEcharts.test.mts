import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 锁住首页不得同步全量 import('echarts')：
 * Vite 8.0.10 预构建全量 echarts 会因 install 执行顺序错乱，
 * 在 registerClass 处抛 Cannot read properties of undefined (reading 'type')，
 * 导致登录后跳转 /home-dashboard 失败。
 *
 * 运行：npm run test:unit
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homeDashboardPath = path.resolve(
	__dirname,
	'../../src/views/home-dashboard/index.vue',
);

describe('home-dashboard echarts 加载契约', () => {
	it('禁止同步全量 import echarts，必须走 loadEcharts', () => {
		const targetFiles = [
			homeDashboardPath,
			path.resolve(__dirname, '../../src/views/home-dashboard/components/super-admin/SuperAdminDashboard.vue'),
			path.resolve(__dirname, '../../src/views/home-dashboard/components/org-admin/OrgAdminDashboard.vue'),
			path.resolve(__dirname, '../../src/views/home-dashboard/components/user/UserDashboard.vue'),
		];

		for (const file of targetFiles) {
			const source = fs.readFileSync(file, 'utf8');

			assert.match(
				source,
				/from ['"]@\/utils\/echarts\/loadEcharts['"]/,
				`${path.basename(file)} 应通过 loadEcharts 异步加载`,
			);
			assert.doesNotMatch(
				source,
				/import\s+\*\s+as\s+echarts\s+from\s+['"]echarts['"]/,
				`${path.basename(file)} 禁止 import * as echarts from "echarts"`,
			);
			assert.doesNotMatch(
				source,
				/from\s+['"]echarts['"]/,
				`${path.basename(file)} 禁止任何直接 from "echarts" 的同步导入`,
			);
		}
	});
});
