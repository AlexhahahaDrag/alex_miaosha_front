import { computed } from 'vue';
import { usePermission } from '@/composables/usePermission';
import {
	DATA_SCOPE_HINT_TEXT,
	resolveDataScopeLevel,
	type DataScopeLevel,
} from '@/composables/dataScopeHint';

export type { DataScopeLevel };
export { DATA_SCOPE_HINT_TEXT };

/**
 * RBAC-PC-SCOPE-001：列表页数据范围提示。
 * 挂到 user/org/role 列表页顶栏，文案随当前登录用户的角色变化。
 */
export const useDataScopeHint = () => {
	const { permissionContext, isSuperAdmin } = usePermission();

	const scopeLevel = computed<DataScopeLevel>(() =>
		resolveDataScopeLevel(
			isSuperAdmin.value,
			(permissionContext.value?.roleList || []).map((role) => role.roleCode),
		),
	);

	const scopeHintText = computed(() => DATA_SCOPE_HINT_TEXT[scopeLevel.value]);

	return { scopeLevel, scopeHintText };
};
