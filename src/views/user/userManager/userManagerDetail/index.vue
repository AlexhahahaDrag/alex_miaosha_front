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
		<a-form
			ref="formRef"
			name="userForm"
			class="user-detail-form"
			:rules="rulesRef"
			:model="formState"
			layout="vertical"
		>
			<a-row :gutter="16">
				<a-col :span="12">
						<a-form-item
							name="username"
							label="用户名"
						>
							<a-input
								v-model:value="formState.username"
								placeholder="请填写用户名"
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="gender"
							label="性别"
						>
							<a-select
								v-model:value="formState.gender"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="genderList"
								allow-clear
								placeholder="请选择性别"
							/>
						</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
						<a-form-item
							name="nickName"
							label="昵称"
						>
							<a-input
								v-model:value="formState.nickName"
								placeholder="请填写昵称"
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="weChat"
							label="微信号"
						>
							<a-input
								v-model:value="formState.weChat"
								placeholder="请填写微信号"
							/>
						</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
						<a-form-item
							name="qqNumber"
							label="QQ号"
						>
							<a-input
								v-model:value="formState.qqNumber"
								placeholder="请填写QQ号"
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="occupation"
							label="职业"
						>
							<a-input
								v-model:value="formState.occupation"
								placeholder="请填写职业"
							/>
						</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
						<a-form-item
							name="email"
							label="邮箱"
						>
							<a-input
								v-model:value="formState.email"
								placeholder="请填写邮箱"
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="birthday"
							label="生日"
						>
							<a-date-picker
								v-model:value="formState.birthday"
								:format="defaultDateFormat"
								:get-popup-container="(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement"
								style="width: 100%"
							/>
						</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
						<a-form-item
							name="mobile"
							label="电话号码"
						>
							<a-input
								v-model:value="formState.mobile"
								placeholder="请填写电话号码"
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="status"
							label="状态"
						>
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
							label="所属机构"
						>
							<a-select
								v-model:value="formState.orgId"
								:options="orgOptions"
								:field-names="{ label: 'orgName', value: 'id' }"
								placeholder="请选择所属机构"
								allow-clear
							/>
						</a-form-item>
				</a-col>
				<a-col :span="12">
						<a-form-item
							name="roleIds"
							label="角色"
						>
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
						<a-form-item
							name="avatar"
							label="头像"
						>
							<my-upload
								:fromSystem="fromSystem"
								:fileInfo="fileInfo"
								@customImageRequest="customImageRequest"
							/>
						</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
						<a-form-item
							name="summary"
							label="个人简介"
						>
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
import dayjs from 'dayjs';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import type { RbacSummaryItem } from '@/components/rbac/types';
import { useDictInfo } from '@/composables/useDictInfo';
import { defaultDateFormat } from '@/utils/dayjs';
import type { FileInfo } from '@/views/common/my-upload/config';
import type { ModelInfo } from '@/views/common/config';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
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

const { getDictByType } = useDictInfo('gender,is_valid');

const loading = ref(false);
const pageLoading = ref(false);
const errorText = ref('');
const formState = ref<UserManagerInfo>({});
const formRef = ref<FormInstance>();
const genderList = computed(() => getDictByType('gender'));
const validList = computed(() => getDictByType('is_valid'));
const orgOptions = ref<OrgInfoData[]>([]);
const roleOptions = ref<RoleInfoData[]>([]);
const fileInfo = ref<FileInfo>({});
const fromSystem = ref('user');
const drawerLoading = computed(() => loading.value || pageLoading.value);
const summaryItems = computed<RbacSummaryItem[]>(() => [
	{
		label: '当前用户',
		value: formState.value.username || formState.value.nickName || '新增用户',
	},
	{
		label: '所属机构',
		value: formState.value.orgName || formState.value.orgId || '待选择',
	},
	{
		label: '状态',
		value: formState.value.status === '1' ? '有效' : '待确认',
	},
]);

const handleOk = () => {
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
	formState.value.avatar = file.id;
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
	const { code, message: messageInfo } = await api(formState.value).finally(() => {
		loading.value = false;
	});
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
	};
};

const loadRbacOptions = async () => {
	const [orgResult, roleResult] = await Promise.all([
		getOrgInfoPage({ status: '1' }, 1, 1000),
		getRoleInfoPage({ status: '1' }, 1, 1000),
	]);
	if (orgResult.code === '200') {
		orgOptions.value = orgResult.data?.records || [];
	}
	if (roleResult.code === '200') {
		roleOptions.value = roleResult.data?.records || [];
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
		formState.value.orgId || (detail?.orgInfoVo?.id ? String(detail.orgInfoVo.id) : undefined);
	formState.value.roleIds =
		formState.value.roleIds ||
		detail?.roleInfoVoList?.map((role) => String(role.id)) ||
		(detail?.roleInfoVo?.id ? [String(detail.roleInfoVo.id)] : []);
	if (formState.value.gender !== undefined && formState.value.gender !== null) {
		formState.value.gender = String(formState.value.gender);
	}
	if (formState.value.status !== undefined && formState.value.status !== null) {
		formState.value.status = String(formState.value.status);
	}
	if (formState.value.birthday) {
		formState.value.birthday = dayjs(formState.value.birthday);
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
			} = await getUserManagerDetail(String(modelInfo.value.id));
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
