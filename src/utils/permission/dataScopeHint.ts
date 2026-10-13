/**
 * 数据范围文案的纯映射逻辑（不依赖 Pinia/Vue 运行时），便于单测直接锁定文案。
 * 口径对齐 docs/superpowers/specs/2026-08-11-rbac-batch3-product-design.md §2：
 * - 超级管理员（super_super）：不受限，查看全部机构数据。
 * - 机构管理员（admin）：本机构 + 全部子孙机构（RBAC-BE-SCOPE-002）。
 * - 普通用户（user）及未识别角色：仅本人所属机构（保守兜底，避免越权展示）。
 */

export type DataScopeLevel = 'super' | 'admin' | 'user';

export const DATA_SCOPE_HINT_TEXT: Record<DataScopeLevel, string> = {
	super: '当前数据范围：全部机构',
	admin: '当前数据范围：本机构及下级机构',
	user: '当前数据范围：仅本人所属机构',
};

/**
 * 根据是否超级管理员 + 角色编码列表，解析出数据范围等级。
 * @param superAdmin 是否超级管理员（superAdmin 优先级最高）
 * @param roleCodes 当前登录用户的角色编码列表
 */
export const resolveDataScopeLevel = (
	superAdmin: boolean,
	roleCodes: Array<string | undefined | null>,
): DataScopeLevel => {
	if (superAdmin) return 'super';
	if (roleCodes.includes('admin')) return 'admin';
	return 'user';
};

export const resolveDataScopeHintText = (
	superAdmin: boolean,
	roleCodes: Array<string | undefined | null>,
): string => DATA_SCOPE_HINT_TEXT[resolveDataScopeLevel(superAdmin, roleCodes)];
