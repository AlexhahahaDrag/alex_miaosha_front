<template>
	<BaseRbacDrawer
		:open="Boolean(modelInfo.open)"
		:width="modelInfo?.width || 720"
		:title="modelInfo?.title || '用户明细'"
		subtitle="用户基础信息、组织与角色绑定"
		:summary-items="summaryItems"
		:loading="drawerLoading"
		:error-text="errorText"
		destroy-on-close
		@save="handleOk"
		@cancel="handleCancel"
		@update:open="handleOpenChange"
	>
		<template v-if="isReadonly" #footer>
			<div class="flex justify-end gap-2">
				<a-button type="primary" class="px-5" @click="handleCancel">
					关闭
				</a-button>
			</div>
		</template>

		<a-form
			ref="formRef"
			name="userForm"
			class="user-detail-form"
			:rules="isReadonly ? {} : rulesRef"
			:model="formState"
			:disabled="isReadonly"
			layout="vertical"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="username" label="用户名">
						<a-input
							v-model:value="formState.username"
							placeholder="请填写用户名"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="gender" label="性别">
						<a-radio-group
							v-model:value="formState.gender"
							button-style="solid"
							class="w-full"
						>
							<a-radio-button
								v-for="item in genderList"
								:key="item.typeCode"
								:value="item.typeCode"
							>
								{{ item.typeName }}
							</a-radio-button>
						</a-radio-group>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="nickName" label="昵称">
						<a-input
							v-model:value="formState.nickName"
							placeholder="请填写昵称"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="weChat" label="微信号">
						<a-input
							v-model:value="formState.weChat"
							placeholder="请填写微信号"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="qqNumber" label="QQ号">
						<a-input
							v-model:value="formState.qqNumber"
							placeholder="请填写QQ号"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="occupation" label="职业">
						<a-input
							v-model:value="formState.occupation"
							placeholder="请填写职业"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="email" label="邮箱">
						<a-input v-model:value="formState.email" placeholder="请填写邮箱" />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="birthday" label="生日">
						<a-date-picker
							v-model:value="formState.birthday"
							:format="defaultDateFormat"
							:get-popup-container="
								(triggerNode: HTMLElement) =>
									triggerNode.parentNode as HTMLElement
							"
							style="width: 100%"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="mobile" label="电话号码">
						<a-input
							v-model:value="formState.mobile"
							placeholder="请填写电话号码"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="status" label="状态">
						<a-select
							v-model:value="formState.status"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="validList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						name="orgId"
						label="所属主机构"
						extra="主归属机构，决定默认数据权限与层级"
					>
						<a-tree-select
							v-model:value="formState.orgId"
							:tree-data="mainOrgTreeData"
							:field-names="{
								children: 'children',
								label: 'orgName',
								value: 'id',
							}"
							placeholder="请选择主所属机构"
							tree-default-expand-all
							allow-clear
							show-search
							tree-node-filter-prop="orgName"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						name="auxiliaryOrgIds"
						label="兼任机构"
						extra="选填，跨机构借调或兼任，可多选"
					>
						<a-tree-select
							v-model:value="formState.auxiliaryOrgIds"
							:tree-data="auxiliaryOrgTreeData"
							:field-names="{
								children: 'children',
								label: 'orgName',
								value: 'id',
							}"
							placeholder="请选择兼任机构（可多选）"
							tree-default-expand-all
							multiple
							:max-tag-count="3"
							allow-clear
							show-search
							tree-node-filter-prop="orgName"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item name="roleIds" label="角色分配">
						<a-select
							v-model:value="formState.roleIds"
							:options="roleOptions"
							:field-names="{ label: 'roleName', value: 'id' }"
							mode="multiple"
							placeholder="请选择角色"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="avatar" label="头像">
						<my-upload
							:fromSystem="fromSystem"
							:fileInfo="fileInfo"
							:disabled="isReadonly"
							@customImageRequest="customImageRequest"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item name="summary" label="个人简介">
						<a-textarea
							v-model:value="formState.summary"
							placeholder="请添加个人简介"
							:auto-size="{ minRows: 2, maxRows: 5 }"
							:maxlength="500"
							show-count
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</BaseRbacDrawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import type { RbacSummaryItem } from '@/components/rbac/types';
import { useDictInfo } from '@/composables/useDictInfo';
import { defaultDateFormat, formatDayjs } from '@/utils/dayjs';
import type { FileInfo } from '@/components/my-upload/config';
import type { ModelInfo } from '@/types/modal';
import { getOrgInfoTree } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getRoleInfoPage } from '@/views/user/roleInfo/api';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import {
	addUserManager,
	editUserManager,
	getUserManagerDetail,
} from '@/views/user/userManager/api';
import { rulesRef } from '@/views/user/userManager/config';
import type { UserManagerInfo } from '@/views/user/userManager/config';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const { getDictByType } = useDictInfo('gender,is_valid');

const loading = ref<boolean>(false);
const pageLoading = ref<boolean>(false);
const errorText = ref('');
const formState = ref<UserManagerInfo>({});
const formRef = ref<FormInstance>();
const genderList = computed(() => getDictByType('gender'));
const validList = computed(() => getDictByType('is_valid'));
const orgTreeList = ref<OrgInfoData[]>([]);
const roleOptions = ref<RoleInfoData[]>([]);
const fileInfo = ref<FileInfo>({});
const fromSystem = ref('user');
const drawerLoading = computed(() => loading.value || pageLoading.value);

// 递归标准化机构树节点（同时注入 id/value 与 label/title/orgName，保证各种模式下的名称回显）
const normalizeTreeNodes = (nodes: OrgInfoData[]): OrgInfoData[] => {
	return nodes.map((node) => {
		const idStr = String(node.id);
		const copy: OrgInfoData & { value: string; label: string; title: string } = {
			...node,
			id: idStr,
			value: idStr,
			label: node.orgName || '',
			title: node.orgName || '',
		};
		if (node.children && node.children.length > 0) {
			copy.children = normalizeTreeNodes(node.children);
		}
		return copy;
	});
};

// 递归标注禁选节点（防止主机构与兼任机构重复绑定）
const markTreeDisabled = (
	nodes: OrgInfoData[],
	disabledIds: Set<string>,
): OrgInfoData[] => {
	return nodes.map((node) => {
		const idStr = String(node.id);
		const copy: OrgInfoData & { value: string; label: string; title: string } = {
			...node,
			id: idStr,
			value: idStr,
			label: node.orgName || '',
			title: node.orgName || '',
			disabled: disabledIds.has(idStr),
		};
		if (node.children && node.children.length > 0) {
			copy.children = markTreeDisabled(node.children, disabledIds);
		}
		return copy;
	});
};

// 主机构可选树：若已被选为兼任机构，则禁用
const mainOrgTreeData = computed(() => {
	const disabledIds = new Set(
		(formState.value.auxiliaryOrgIds || []).map((id) => String(id)),
	);
	return markTreeDisabled(orgTreeList.value, disabledIds);
});

// 兼任机构可选树：若已被选为主机构，则禁用
const auxiliaryOrgTreeData = computed(() => {
	const disabledIds = new Set<string>();
	if (formState.value.orgId) {
		disabledIds.add(String(formState.value.orgId));
	}
	return markTreeDisabled(orgTreeList.value, disabledIds);
});

// 当切换主机构时，若兼任机构列表中包含了新主机构，自动移除冲突项
watch(
	() => formState.value.orgId,
	(newOrgId) => {
		if (newOrgId && formState.value.auxiliaryOrgIds?.length) {
			formState.value.auxiliaryOrgIds = formState.value.auxiliaryOrgIds.filter(
				(id) => String(id) !== String(newOrgId),
			);
		}
	},
);

// 主机构展示名称：优先用服务端返回的 orgName，若缺失则从机构树反查
const currentOrgName = computed(() => {
	if (formState.value.orgName) return formState.value.orgName;
	if (!formState.value.orgId) return '待选择';
	const findName = (list: OrgInfoData[]): string | undefined => {
		for (const item of list) {
			if (String(item.id) === String(formState.value.orgId)) return item.orgName;
			if (item.children && item.children.length > 0) {
				const child = findName(item.children);
				if (child) return child;
			}
		}
	};
	return findName(orgTreeList.value) || String(formState.value.orgId);
});

const summaryItems = computed<RbacSummaryItem[]>(() => {
	const items: RbacSummaryItem[] = [
		{
			label: '当前用户',
			value: formState.value.username || formState.value.nickName || '新增用户',
		},
		{
			label: '所属主机构',
			value: currentOrgName.value,
		},
		{
			label: '兼任机构',
			value:
				formState.value.auxiliaryOrgNames ||
				(formState.value.auxiliaryOrgIds && formState.value.auxiliaryOrgIds.length > 0
					? `${formState.value.auxiliaryOrgIds.length} 个兼任机构`
					: '无'),
		},
		{
			label: '状态',
			value: formState.value.status === '1' ? '有效' : '待确认',
		},
	];
	return items;
});

const handleOk = () => {
	if (isReadonly.value) {
		modelInfo.value.open = false;
		return;
	}
	errorText.value = '';
	loading.value = true;
	if (!formRef.value) {
		loading.value = false;
		return;
	}
	formRef.value
		.validateFields()
		.then(() => saveUserManager())
		.catch(() => {
			loading.value = false;
		});
};

const customImageRequest = (file: FileInfo) => {
	formState.value.avatar = file.id != null ? String(file.id) : undefined;
	formState.value.avatarUrl = file.preUrl;
	formState.value.avatarThumbnailUrl = file?.preThumbnailUrl ?? '';
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const handleOpenChange = (open: boolean) => {
	modelInfo.value.open = open;
	if (!open) {
		errorText.value = '';
	}
};

const saveUserManager = async () => {
	const api = formState.value.id ? editUserManager : addUserManager;
	const { code, message: messageInfo } = (await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	)) || {};
	if (code === '200') {
		message.success(messageInfo || '保存成功');
		modelInfo.value.open = false;
		emit('success');
		initForm();
	} else {
		errorText.value = messageInfo || '保存失败';
		message.error(errorText.value);
	}
};

const initForm = () => {
	formState.value = {
		status: '1',
		gender: '0',
		roleIds: [],
		auxiliaryOrgIds: [],
	};
};

const loadRbacOptions = async () => {
	const [orgResult, roleResult] = await Promise.all([
		getOrgInfoTree(),
		getRoleInfoPage({}, 1, 1000),
	]);
	const { code: orgCode, data: orgData } = orgResult || {};
	if (orgCode === '200') {
		orgTreeList.value = normalizeTreeNodes((orgData as OrgInfoData[]) || []);
	}
	const { code: roleCode, data: roleData } = roleResult || {};
	if (roleCode === '200') {
		roleOptions.value = (roleData?.records || []).map((r: RoleInfoData) => ({
			...r,
			id: String(r.id),
			value: String(r.id),
			label: r.roleName || '',
			roleName: r.roleName || '',
		}));
	}
};

const normalizeDetail = (data: UserManagerInfo | undefined) => {
	formState.value = data || {};
	const detail = data as
		| (UserManagerInfo & {
				orgInfoVo?: OrgInfoData;
				roleInfoVo?: RoleInfoData;
		  })
		| undefined;
	formState.value.orgId =
		formState.value.orgId != null
			? String(formState.value.orgId)
			: (detail?.orgInfoVo?.id ? String(detail.orgInfoVo.id) : undefined);
	formState.value.auxiliaryOrgIds = (formState.value.auxiliaryOrgIds || []).map(
		(id) => String(id),
	);
	formState.value.roleIds =
		formState.value.roleIds?.map((id) => String(id)) ||
		detail?.roleInfoVoList?.map((role) => String(role.id)) ||
		(detail?.roleInfoVo?.id ? [String(detail.roleInfoVo.id)] : []);
	if (formState.value.gender !== undefined && formState.value.gender !== null) {
		formState.value.gender = String(formState.value.gender);
	}
	if (formState.value.status !== undefined && formState.value.status !== null) {
		formState.value.status = String(formState.value.status);
	}
	if (formState.value.birthday) {
		formState.value.birthday = formatDayjs(formState.value.birthday);
	}
	if (formState.value.avatar) {
		fileInfo.value.id = formState.value.avatar;
		fileInfo.value.url = formState.value.avatarUrl;
		fileInfo.value.preUrl = formState.value.avatarUrl;
		fileInfo.value.preThumbnailUrl = formState.value.avatarThumbnailUrl;
	} else {
		fileInfo.value = {};
	}
};

const init = async () => {
	pageLoading.value = true;
	errorText.value = '';
	await loadRbacOptions();
	if (modelInfo.value?.id) {
		try {
			const {
				code,
				data,
				message: messageInfo,
			} = (await getUserManagerDetail(String(modelInfo.value.id))) || {};
			if (code === '200') {
				normalizeDetail(data as UserManagerInfo | undefined);
			} else {
				errorText.value = messageInfo || '查询失败';
				message.error(errorText.value);
			}
		} finally {
			pageLoading.value = false;
		}
		return;
	}
	fileInfo.value = {};
	initForm();
	pageLoading.value = false;
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
		deep: true,
	},
);

const emit = defineEmits(['success']);
</script>

<style lang="less" scoped>
.user-detail-form {
	padding-bottom: 8px;

	:deep(.ant-form-item) {
		margin-bottom: 16px;
	}

	:deep(.ant-form-item-label > label) {
		color: #6b7280;
	}

	:deep(.ant-input),
	:deep(.ant-select-selector),
	:deep(.ant-picker),
	:deep(.ant-input-affix-wrapper) {
		border-color: #e5e7eb;
		border-radius: 6px;
	}
}
</style>
