<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="620"
		:title="drawerTitle"
		:subtitle="drawerSubtitle"
		:loading="loading"
		:destroy-on-close="true"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<!-- 1. 只读模式：结构化角色详情卡片 (Read/Write Separation) -->
		<div v-if="isReadonly" class="role-detail-readonly space-y-4">
			<!-- Hero 角色概览卡片 -->
			<div
				class="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
			>
				<div
					class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/70 flex items-center justify-center text-xl shrink-0"
				>
					<IdcardOutlined />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
							{{ formState.roleName || '-' }}
						</h3>
						<span
							v-if="formState.roleCode === 'super_super'"
							class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-300/70 dark:border-amber-800"
						>
							超级管理员
						</span>
						<span
							v-if="String(formState.status) === '1'"
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							有效
						</span>
						<span
							v-else
							class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
							失效
						</span>
					</div>
					<div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
						<span class="inline-flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400">
							编码: {{ formState.roleCode || '-' }}
						</span>
						<span class="inline-flex items-center gap-1">
							已授权限: <strong class="font-mono text-slate-700 dark:text-slate-200">{{ selectPermission.length }}</strong> 项
						</span>
					</div>
				</div>
			</div>

			<!-- 管辖机构与职责说明卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3"
			>
				<div
					class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800"
				>
					<BankOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
						管辖机构与角色职责
					</span>
				</div>

				<div class="text-xs space-y-2.5">
					<div class="flex flex-col gap-1.5">
						<span class="text-slate-400">适用机构 ({{ resolvedOrgNames.length }})</span>
						<div v-if="resolvedOrgNames.length > 0" class="flex flex-wrap gap-1.5">
							<span
								v-for="name in resolvedOrgNames"
								:key="name"
								class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
							>
								<BankOutlined class="text-[11px] text-slate-400" />
								{{ name }}
							</span>
						</div>
						<span v-else class="text-slate-400 italic">暂未绑定适用机构</span>
					</div>

					<div class="flex flex-col gap-1 pt-1">
						<span class="text-slate-400">职责说明</span>
						<p
							v-if="formState.summary"
							class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed m-0 whitespace-pre-wrap"
						>
							{{ formState.summary }}
						</p>
						<span v-else class="text-slate-400 italic">暂无角色职责描述</span>
					</div>
				</div>
			</div>

			<!-- 功能权限树只读预览卡片 -->
			<div
				class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
			>
				<div
					class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
				>
					<div class="flex items-center gap-2">
						<SafetyCertificateOutlined class="text-indigo-600 dark:text-indigo-400 text-sm" />
						<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
							功能权限分配清单
						</span>
					</div>
					<span class="text-[11px] font-mono text-slate-400">
						共授权 {{ selectPermission.length }} 项
					</span>
				</div>

				<rbac-permission-tree-panel
					title="菜单与按钮权限"
					description="只读展示该角色已授权的菜单及按钮/API权限点"
					:tree-data="rbacTreeData"
					:checked-keys="selectPermission"
					:expanded-keys="expandedKeys"
					:disabled="true"
					@update:expanded-keys="(keys) => (expandedKeys = keys.map(String))"
					@expand-all="expandedKeys = allPermissionKeys"
					@collapse-all="expandedKeys = []"
				/>
			</div>
		</div>

		<!-- 2. 编辑/新增模式：标准化 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="RoleInfoForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
			class="space-y-5"
		>
			<!-- 1. 角色基础标识与绑定机构 -->
			<section>
				<div
					class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"
				>
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>角色标识与管辖机构</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="角色名称" name="roleName" class="mb-3.5">
						<a-input
							id="form_roleName"
							v-model:value="formState.roleName"
							name="roleName"
							placeholder="如：财务管理员"
							allow-clear
							class="rounded-lg"
							data-testid="rbac-role-field-name"
						/>
					</a-form-item>

					<a-form-item label="角色编码 (Code)" name="roleCode" class="mb-3.5">
						<a-input
							id="form_roleCode"
							v-model:value="formState.roleCode"
							name="roleCode"
							placeholder="如：rbac_finance_admin"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-role-field-code"
						/>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="绑定机构" name="orgIds" class="mb-3.5">
						<a-select
							id="form_orgIds"
							v-model:value="formState.orgIds"
							mode="multiple"
							:options="orgOptions"
							:field-names="{ label: 'orgName', value: 'id' }"
							placeholder="请选择角色适用的机构（支持多选）"
							allow-clear
							show-search
							option-filter-prop="orgName"
							class="w-full"
							data-testid="rbac-role-org-select"
						/>
					</a-form-item>

					<a-form-item label="生效状态" name="status" class="mb-3.5">
						<a-radio-group
							id="form_status"
							v-model:value="formState.status"
							name="status"
							button-style="solid"
							data-testid="rbac-role-field-status"
						>
							<a-radio-button
								v-for="item in statusOptions"
								:key="String(item.typeCode)"
								:value="String(item.typeCode)"
							>
								{{ item.typeName }}
							</a-radio-button>
						</a-radio-group>
					</a-form-item>
				</div>

				<a-form-item label="角色职责说明" name="summary" class="mb-0">
					<a-textarea
						id="form_summary"
						v-model:value="formState.summary"
						name="summary"
						:rows="2"
						:maxlength="150"
						show-count
						placeholder="选填，描述该角色的业务权责与适用人员范围..."
						class="rounded-lg"
						data-testid="rbac-role-field-summary"
					/>
				</a-form-item>
			</section>

			<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

			<!-- 2. 初始/关联权限树配置 -->
			<section>
				<div
					class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between"
				>
					<div class="flex items-center gap-2">
						<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
						<span>功能权限树</span>
					</div>
					<span class="text-[11px] font-mono text-slate-400">
						已选 {{ selectPermission.length }} 项
					</span>
				</div>

				<rbac-permission-tree-panel
					title="菜单与按钮权限"
					description="勾选该角色可访问的菜单及按钮/API权限点"
					:tree-data="rbacTreeData"
					:checked-keys="selectPermission"
					:expanded-keys="expandedKeys"
					:disabled="false"
					@update:checked-keys="(keys) => (selectPermission = keys.map(String))"
					@update:expanded-keys="(keys) => (expandedKeys = keys.map(String))"
					@select-all="selectPermission = allPermissionKeys"
					@clear="selectPermission = []"
					@expand-all="expandedKeys = allPermissionKeys"
					@collapse-all="expandedKeys = []"
				/>
			</section>
		</a-form>

		<template #footer>
			<div class="flex justify-end gap-2">
				<a-button :disabled="loading" @click="handleCancel">
					{{ isReadonly ? '关闭' : '取消' }}
				</a-button>
				<a-button
					v-if="!isReadonly"
					type="primary"
					:loading="loading"
					data-testid="rbac-role-detail-btn-submit"
					@click="handleOk"
				>
					保存
				</a-button>
			</div>
		</template>
	</base-rbac-drawer>
</template>

<script lang="ts" setup>
import {
	IdcardOutlined,
	BankOutlined,
	SafetyCertificateOutlined,
} from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { RbacTreeNode } from '@/components/rbac';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	rulesRef,
	type RoleInfoData,
	type RolePermissionItem,
} from '@/views/user/roleInfo/config';
import {
	getRoleInfoDetail,
	addRoleInfo,
	editRoleInfo,
	assignRolePermissions,
	assignRoleOrgs,
} from '@/views/user/roleInfo/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getPermissionInfoList } from '@/views/user/permissionInfo/api';
import type { PermissionInfo } from '@/views/user/permissionInfo/config';

const { getDictByType } = useDictInfo('is_valid');

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const formState = ref<RoleInfoData>({ orgIds: [], status: '1' });
const initialOrgIds = ref<string[]>([]);
const orgOptions = ref<OrgInfoData[]>([]);
const permissionTree = ref<PermissionInfo[]>([]);
const selectPermission = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const statusOptions = computed(() => {
	const dict = getDictByType('is_valid');
	if (Array.isArray(dict) && dict.length > 0) {
		return dict;
	}
	return [
		{ typeCode: '1', typeName: '有效' },
		{ typeCode: '0', typeName: '失效' },
	];
});

const resolvedOrgNames = computed<string[]>(() => {
	const ids = formState.value.orgIds || [];
	if (ids.length > 0 && orgOptions.value.length > 0) {
		const orgMap = new Map(
			orgOptions.value.map((o) => [String(o.id), o.orgName || String(o.id)]),
		);
		const names = ids
			.map((id) => orgMap.get(String(id)))
			.filter((n): n is string => Boolean(n));
		if (names.length > 0) return names;
	}
	if (formState.value.orgNames) {
		return formState.value.orgNames
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
});

const drawerTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	if (isReadonly.value) return '查看角色明细';
	return modelInfo.value?.id ? '编辑角色明细' : '新增角色明细';
});

const drawerSubtitle = computed(() => {
	if (formState.value.roleCode) {
		return `编码: ${formState.value.roleCode}`;
	}
	return isReadonly.value
		? '只读浏览模式'
		: '配置角色基础标识、适用机构范围与功能权限';
});

const toRbacTree = (nodes: PermissionInfo[]): RbacTreeNode[] =>
	(nodes || []).map((node) => ({
		key: String(node.id ?? ''),
		title: node.permissionName ?? '',
		children: node.children?.length ? toRbacTree(node.children) : undefined,
	}));

const collectAllKeys = (nodes: RbacTreeNode[]): string[] =>
	nodes.flatMap((node) => [
		String(node.key),
		...(node.children?.length ? collectAllKeys(node.children) : []),
	]);

const rbacTreeData = computed(() => toRbacTree(permissionTree.value));
const allPermissionKeys = computed(() => collectAllKeys(rbacTreeData.value));

const normalizeOrgIds = (ids?: string[] | null): string[] =>
	(ids || []).map((id: string) => String(id)).filter(Boolean);

const orgIdsChanged = (next: string[], prev: string[]) => {
	if (next.length !== prev.length) {
		return true;
	}
	const prevSet = new Set(prev);
	return next.some((id) => !prevSet.has(id));
};

const handleOk = () => {
	if (isReadonly.value || !formRef.value) return;
	loading.value = true;
	formRef.value
		.validateFields()
		.then(() => saveRoleInfoManager())
		.catch(() => {
			loading.value = false;
		});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveRoleInfoManager = async () => {
	try {
		const payload: RoleInfoData = { ...formState.value };
		delete payload.permissionList;
		delete payload.rolePermissionInfoVoList;
		delete payload.roleUserInfoVoList;
		payload.orgIds = normalizeOrgIds(payload.orgIds);

		const isEdit = Boolean(payload.id);
		let roleId = '';

		if (isEdit) {
			const { code, message: messageInfo } = await editRoleInfo(payload);
			if (code !== '200') {
				message.error(messageInfo || '保存失败！');
				return;
			}
			roleId = String(payload.id);
		} else {
			const { code, data, message: messageInfo } = await addRoleInfo(payload);
			if (code !== '200') {
				message.error(messageInfo || '保存失败！');
				return;
			}
			roleId = data != null ? String(data) : '';
		}

		if (!roleId) {
			message.error('角色已保存，但无法获取角色 ID，请稍后在授权中配置权限');
			modelInfo.value.open = false;
			emit('success');
			return;
		}

		if (isEdit && orgIdsChanged(payload.orgIds || [], initialOrgIds.value)) {
			const { code: orgCode, message: orgMessage } = await assignRoleOrgs(
				roleId,
				payload.orgIds || [],
			);
			if (orgCode !== '200') {
				message.error(orgMessage || '角色已保存，机构绑定失败');
				return;
			}
		}

		const permissionIds = selectPermission.value.map((id) => String(id));
		const { code: assignCode, message: assignMessage } =
			await assignRolePermissions(roleId, permissionIds);
		if (assignCode === '200') {
			message.success(assignMessage || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
		} else {
			message.error(assignMessage || '角色已保存，权限分配失败');
		}
	} finally {
		loading.value = false;
	}
};

const loadOrgOptions = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getOrgInfoPage({ status: '1' }, 1, 1000);
	if (code === '200') {
		orgOptions.value = (data?.records || []).map((item) => ({
			...item,
			id: item.id != null ? String(item.id) : item.id,
		}));
	} else {
		message.error(messageInfo || '获取机构列表失败！');
	}
};

const init = async () => {
	loading.value = true;
	permissionTree.value = [];
	selectPermission.value = [];
	expandedKeys.value = [];
	formState.value = { orgIds: [], status: '1' };
	initialOrgIds.value = [];

	try {
		await loadOrgOptions();

		const roleId = modelInfo.value?.id;
		if (roleId) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getRoleInfoDetail(String(roleId));
			if (code === '200' && data) {
				const orgIds = normalizeOrgIds(data.orgIds);
				formState.value = {
					...data,
					id: String(data.id),
					status:
						data.status !== undefined && data.status !== null
							? String(data.status)
							: '1',
					orgIds,
				};
				initialOrgIds.value = [...orgIds];
				permissionTree.value = data.permissionList || [];
				selectPermission.value = (data.rolePermissionInfoVoList || [])
					.map((item: RolePermissionItem) =>
						String(item.permissionId || item.id || ''),
					)
					.filter(Boolean);
			} else {
				message.error(messageInfo || '查询详情失败！');
			}
		} else {
			const { code, data, message: messageInfo } =
				await getPermissionInfoList();
			if (code === '200' && Array.isArray(data)) {
				permissionTree.value = data;
			} else {
				message.error(messageInfo || '获取权限树失败！');
			}
		}
	} finally {
		loading.value = false;
	}
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{ immediate: true },
);
</script>
