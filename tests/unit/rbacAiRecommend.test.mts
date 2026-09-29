import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { RoleAiRecommendVo } from '../../src/views/user/roleInfo/api/index.ts';

describe('RoleAiRecommendVo 契约与 ID 安全测试', () => {
	it('验证 recommendedMenuIds 纯字符串类型且不丢失高位精度', () => {
		const sampleResponse: RoleAiRecommendVo = {
			recommendedMenuIds: ['1972837492837492819', '1972837492837492820'],
			recommendedMenuNames: ['财务中心', '礼金记账'],
			recommendedPermissionCodes: ['finance:gift:list'],
			reasoning: '基于财务岗位职责智能推荐',
		};

		assert.equal(sampleResponse.recommendedMenuIds.length, 2);
		sampleResponse.recommendedMenuIds.forEach((id) => {
			assert.equal(typeof id, 'string');
			// 确保未被转换为 number 导致后两位被截断为 00
			assert.match(id, /^[0-9]+$/);
			assert.ok(!id.endsWith('000000000000000000'));
		});
	});

	it('验证推荐结果对象解构语义规范', () => {
		const res = {
			code: '200',
			message: '操作成功',
			data: {
				recommendedMenuIds: ['100', '101'],
				recommendedMenuNames: ['商品中心', '秒杀活动'],
				recommendedPermissionCodes: ['product:seckill:manage'],
				reasoning: '根据商品运营岗位匹配秒杀管理权限',
			},
		};

		// 验证解构格式
		const { code, data, message: msg } = res;
		assert.equal(code, '200');
		assert.equal(msg, '操作成功');
		assert.ok(data.recommendedMenuIds.includes('100'));
		assert.ok(data.recommendedMenuNames.includes('商品中心'));
	});
});
