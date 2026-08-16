import { computed } from 'vue';
import { usePermission } from '@/composables/usePermission';

export function useGiftOrgScope() {
	const { permissionContext, isSuperAdmin } = usePermission();

	const hasOrgScope = computed(() => !!permissionContext.value?.orgInfo?.id);

	const isOrgAdmin = computed(() => {
		if (isSuperAdmin.value) {
			return true;
		}
		return (
			permissionContext.value?.roleList?.some(
				(role) =>
					role.roleCode?.includes('admin') && !role.roleCode?.includes('super'),
			) ?? false
		);
	});

	const orgScopeHint = computed(() => {
		if (isSuperAdmin.value) {
			return '超级管理员可管理系统全部亲友与事由';
		}
		if (!hasOrgScope.value || !isOrgAdmin.value) {
			return '';
		}
		const orgName = permissionContext.value?.orgInfo?.orgName || '家庭组';
		return `家庭组管理员可选择「${orgName}」下全部亲友与事由`;
	});

	const orgMemberHint = computed(() => {
		if (isSuperAdmin.value) {
			return '超级管理员可选择系统全部成员';
		}
		if (!hasOrgScope.value) {
			return '未加入家庭组时，家庭成员侧仅可选择本人';
		}
		const orgName = permissionContext.value?.orgInfo?.orgName || '家庭组';
		if (isOrgAdmin.value) {
			return `家庭组管理员可选择「${orgName}」全部成员`;
		}
		return '普通成员仅可选择本人作为家庭成员';
	});

	return {
		hasOrgScope,
		isOrgAdmin,
		orgScopeHint,
		orgMemberHint,
	};
}
