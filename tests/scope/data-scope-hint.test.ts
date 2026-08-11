import { describe, expect, it } from 'vitest';
import {
	DATA_SCOPE_HINT_TEXT,
	resolveDataScopeHintText,
	resolveDataScopeLevel,
} from '@/composables/dataScopeHint';

// RBAC-PC-SCOPE-001/002：数据范围提示文案锁定
// 口径参考 docs/superpowers/specs/2026-08-11-rbac-batch3-product-design.md §2
describe('useDataScopeHint 文案映射', () => {
	it('超级管理员（super_super）始终解析为 super，展示“全部机构”', () => {
		expect(resolveDataScopeLevel(true, [])).toBe('super');
		expect(resolveDataScopeLevel(true, ['user'])).toBe('super');
		expect(DATA_SCOPE_HINT_TEXT.super).toBe('当前数据范围：全部机构');
	});

	it('机构管理员（admin）解析为 admin，展示“本机构及下级机构”', () => {
		expect(resolveDataScopeLevel(false, ['admin'])).toBe('admin');
		expect(DATA_SCOPE_HINT_TEXT.admin).toBe('当前数据范围：本机构及下级机构');
	});

	it('普通用户（user）或未识别角色兜底解析为 user，展示“仅本人所属机构”', () => {
		expect(resolveDataScopeLevel(false, ['user'])).toBe('user');
		expect(resolveDataScopeLevel(false, [])).toBe('user');
		expect(resolveDataScopeLevel(false, [undefined, null])).toBe('user');
		expect(DATA_SCOPE_HINT_TEXT.user).toBe('当前数据范围：仅本人所属机构');
	});

	it('resolveDataScopeHintText 直接返回对应文案', () => {
		expect(resolveDataScopeHintText(true, [])).toBe('当前数据范围：全部机构');
		expect(resolveDataScopeHintText(false, ['admin'])).toBe(
			'当前数据范围：本机构及下级机构',
		);
		expect(resolveDataScopeHintText(false, ['user'])).toBe(
			'当前数据范围：仅本人所属机构',
		);
	});

	it('admin 优先级低于 superAdmin：同时命中时以 super 为准', () => {
		expect(resolveDataScopeLevel(true, ['admin'])).toBe('super');
	});
});
