import type { App, DirectiveBinding } from 'vue';
import { buildPermissionSet, canAccessPermission, isSuperAdmin } from '@/utils/permission';
import { useUserStore } from '@/store/modules/user/user';

const removeElement = (el: HTMLElement) => {
	el.parentNode?.removeChild(el);
};

const mounted = (el: HTMLElement, binding: DirectiveBinding<string | string[]>) => {
	const codes = Array.isArray(binding.value) ? binding.value : [binding.value];
	const userStore = useUserStore();
	const context = userStore.getPermissionContext;
	const permissionSet = buildPermissionSet(context);
	const allowed = codes.some((code) =>
		canAccessPermission(permissionSet, code, isSuperAdmin(context)),
	);

	if (!allowed) {
		removeElement(el);
	}
};

export const setupPermissionDirective = (app: App) => {
	app.directive('permission', { mounted });
};
