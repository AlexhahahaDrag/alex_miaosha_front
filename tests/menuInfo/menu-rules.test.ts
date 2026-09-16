import { describe, expect, it } from 'vitest';
import { rulesRef } from '@/views/user/menuInfo/config';

describe('menuInfo rulesRef (RBAC-PC-MENU-001)', () => {
	it('name/title/permissionCode/status 均要求必填', () => {
		for (const key of ['name', 'title', 'permissionCode', 'status'] as const) {
			const rules = rulesRef[key];
			expect(Array.isArray(rules) && rules.length > 0).toBe(true);
			expect(rules.some((rule) => rule.required === true)).toBe(true);
		}
	});
});
