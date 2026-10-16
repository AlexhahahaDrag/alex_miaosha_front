<template>
	<base-rbac-drawer
		:open="!!modelInfo.open"
		:width="560"
		:title="drawerTitle"
		:subtitle="drawerSubtitle"
		:loading="loading"
		:destroy-on-close="true"
		@update:open="(open: boolean) => (modelInfo.open = open)"
		@save="handleOk"
		@cancel="handleCancel"
	>
		<a-form
			ref="formRef"
			name="PermissionInfoForm"
			layout="vertical"
			:model="formState"
			:rules="isReadonly ? {} : rulesRef"
			class="space-y-5"
		>
			<!-- 1. 权限标识与层级归属 -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
					<span>权限标识与层级归属</span>
				</div>

				<a-form-item label="上级权限" name="parentId" class="mb-3.5">
					<a-tree-select
						v-model:value="formState.parentId"
						:tree-data="treeSelectData"
						:field-names="{ label: 'permissionName', value: 'id', children: 'children' }"
						:disabled="isReadonly"
						placeholder="请选择上级权限（选根目录则为顶级权限模块）"
						allow-clear
						show-search
						tree-node-filter-prop="permissionName"
						tree-default-expand-all
						class="w-full rounded-lg"
						data-testid="rbac-perm-field-parent"
					/>
				</a-form-item>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
					<a-form-item label="权限名称" name="permissionName" class="mb-3.5">
						<a-input
							v-model:value="formState.permissionName"
							:disabled="isReadonly"
							placeholder="如：新增权限点"
							allow-clear
							class="rounded-lg"
							data-testid="rbac-perm-field-name"
						/>
					</a-form-item>

					<a-form-item label="权限编码 (Code)" name="permissionCode" class="mb-3.5">
						<a-input
							v-model:value="formState.permissionCode"
							:disabled="isReadonly"
							placeholder="如：permission:add"
							allow-clear
							class="rounded-lg font-mono"
							data-testid="rbac-perm-field-code"
						/>
					</a-form-item>
				</div>

				<a-form-item label="关联资源 (URL / Options)" name="options" class="mb-0">
					<a-input
						v-model:value="formState.options"
						:disabled="isReadonly"
						placeholder="选填，如：/api/v1/permission-info 或接口路径标识"
						allow-clear
						class="rounded-lg font-mono"
						data-testid="rbac-perm-field-options"
					/>
				</a-form-item>
			</section>

			<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

			<!-- 2. 状态与业务说明 -->
			<section>
				<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
					<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
					<span>状态与业务说明</span>
				</div>

				<a-form-item label="生效状态" name="status" class="mb-3.5">
					<a-radio-group
						v-model:value="formState.status"
						:disabled="isReadonly"
						button-style="solid"
						data-testid="rbac-perm-field-status"
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

				<a-form-item label="职责与范围说明" name="summary" class="mb-0">
					<a-textarea
						v-model:value="formState.summary"
						:disabled="isReadonly"
						:rows="3"
						:maxlength="150"
						show-count
						placeholder="选填，描述该权限点控制的具体操作范围或适用角色..."
						class="rounded-lg"
						data-testid="rbac-perm-field-summary"
					/>
				</a-form-item>
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
					data-testid="rbac-perm-detail-btn-submit"
					@click="handleOk"
				>
					保存
				</a-button>
			</div>
		</template>
	</base-rbac-drawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	getPermissionInfoDetail,
	addPermissionInfo,
	editPermissionInfo,
	getPermissionInfoList,
} from '@/views/user/permissionInfo/api';
import { rulesRef, type PermissionInfo } from '@/views/user/permissionInfo/config';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const emit = defineEmits(['success']);

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formState = ref<PermissionInfo>({});
const permissionTree = ref<PermissionInfo[]>([]);

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

const drawerTitle = computed(() => {
	if (modelInfo.value?.title) return modelInfo.value.title;
	if (isReadonly.value) return '查看权限明细';
	return modelInfo.value?.id ? '编辑权限明细' : '新增权限明细';
});

const drawerSubtitle = computed(() => {
	if (formState.value.permissionCode) {
		return `编码: ${formState.value.permissionCode}`;
	}
	return isReadonly.value ? '只读浏览模式' : '配置按钮/API 权限点标识、层级与状态';
});

// 递归标准化 ID 为 string，并在编辑时禁用自身及其所有子孙节点（防止自选成环）
const normalizeAndGuardTree = (
	nodes: PermissionInfo[],
	editingId: string | undefined,
	ancestorDisabled = false,
): PermissionInfo[] => {
	if (!Array.isArray(nodes)) return [];
	return nodes.map((node) => {
		const strId = String(node.id ?? '');
		const isSelfOrDescendant = ancestorDisabled || (Boolean(editingId) && strId === editingId);
		return {
			...node,
			id: strId,
			disabled: isSelfOrDescendant,
			children: node.children
				? normalizeAndGuardTree(node.children, editingId, isSelfOrDescendant)
				: undefined,
		};
	});
};

const treeSelectData = computed<PermissionInfo[]>(() => {
	const editingId = modelInfo.value?.id ? String(modelInfo.value.id) : undefined;
	return [
		{
			id: '0',
			permissionName: '根目录 (顶级权限分组)',
			permissionCode: 'root',
			children: normalizeAndGuardTree(permissionTree.value, editingId),
		},
	];
});

const handleOk = () => {
	if (isReadonly.value || !formRef.value) return;
	loading.value = true;
	formRef.value
		.validateFields()
		.then(() => savePermissionInfoManager())
		.catch(() => {
			loading.value = false;
		});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const savePermissionInfoManager = async () => {
	try {
		const payload: PermissionInfo = {
			...formState.value,
			parentId: formState.value.parentId ? String(formState.value.parentId) : '0',
		};
		const api = payload.id ? editPermissionInfo : addPermissionInfo;
		const { code, message: messageInfo } = await api(payload);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} catch (err: unknown) {
		message.error((err as Error)?.message || '网络异常，保存失败');
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	loading.value = true;
	formState.value = {};
	try {
		const { code: treeCode, data: treeData } = await getPermissionInfoList();
		if (treeCode === '200' && Array.isArray(treeData)) {
			permissionTree.value = treeData;
		}

		if (modelInfo.value?.id) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getPermissionInfoDetail(String(modelInfo.value.id));
			if (code === '200' && data) {
				formState.value = {
					...data,
					id: String(data.id),
					status: data.status !== undefined && data.status !== null ? String(data.status) : '1',
					parentId:
						data.parentId !== undefined && data.parentId !== null
							? String(data.parentId)
							: '0',
				};
			} else {
				message.error(messageInfo || '查询详情失败！');
			}
		} else {
			formState.value = {
				parentId: '0',
				status: '1',
			};
		}
	} finally {
		loading.value = false;
	}
};

watch(
	() => modelInfo.value.open,
	(isOpen) => {
		if (isOpen) {
			init();
		}
	},
	{ immediate: true },
);
</script>
