<template>
	<a-modal
		:open="props.open"
		:width="props?.modelInfo?.width || '1000px'"
		:title="props?.modelInfo?.title || 'Basic Modal'"
		okText="保存"
		:confirmLoading="modelConfig.confirmLoading"
		:destroyOnClose="modelConfig.destroyOnClose"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<template #footer>
			<a-button key="back" @click="handleCancel">取消</a-button>
			<a-button key="submit" type="primary" :loading="loading" @click="handleOk"
				>保存
			</a-button>
		</template>
		<a-form
			ref="formRef"
			name="financeForm"
			:rules="rulesRef"
			:model="formState"
			@finishFailed="onFinishFailed"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
		>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="username" label="用户名">
						<a-input
							v-model:value="formState.username"
							placeholder="请填写用户名"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="gender" label="性别">
						<a-select
							ref="select"
							v-model:value="formState.gender"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="genderList"
							:allowClear="true"
						>
						</a-select>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="nickName" label="昵称">
						<a-input
							v-model:value="formState.nickName"
							placeholder="请填写昵称"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="weChat" label="微信号">
						<a-input
							v-model:value="formState.weChat"
							placeholder="请填写微信号"
						></a-input>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="qqNumber" label="QQ号">
						<a-input
							v-model:value="formState.qqNumber"
							placeholder="请填写QQ号"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="occupation" label="职业">
						<a-input
							v-model:value="formState.occupation"
							placeholder="请填写职业"
						></a-input>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="email" label="邮箱">
						<a-input
							v-model:value="formState.email"
							placeholder="请填写邮箱！"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="birthday" label="生日">
						<a-date-picker
							v-model:value="formState.birthday"
							:format="defaultDateFormat"
							:getPopupContainer="
								(triggerNode: any) => {
									return triggerNode.parentNode;
								}
							"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="mobile" label="电话号">
						<a-input
							v-model:value="formState.mobile"
							placeholder="请填写电话号"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="status" label="状态">
						<a-select
							ref="select"
							v-model:value="formState.status"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="validList"
							:allowClear="true"
						>
						</a-select>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="avatar" label="头像">
						<MyUpload
							:fromSystem="fromSystem"
							:fileInfo="fileInfo"
							@customImageRequest="customImageRequest"
						></MyUpload>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="24">
					<a-form-item
						:label-col="{ span: 3 }"
						:wrapperCol="{ span: 24 }"
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
	</a-modal>
</template>
<script lang="ts" setup>
import { rulesRef } from './config';
import type { UserManagerInfo } from '../config';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	getUserManagerDetail,
	addOrEditUserManager,
} from '@/views/user/userManager/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { FileInfo } from '@/compoments/my-upload/config';
import type { ModelInfo } from '@/views/common/config';
import { defaultDateFormat } from '@/utils/dayjs';

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}

const { getDictByType } = useDictInfo('is_valid');

const labelCol = ref({ span: 6 });
const wrapperCol = ref({ span: 18 });
let loading = ref<boolean>(false);
const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};
const props = defineProps<Props>();
let formState = ref<UserManagerInfo>({});
const formRef = ref<FormInstance>();
// 字典数据已通过 useDictInfo 自动加载
const genderList = computed(() => getDictByType('is_valid'));
const validList = computed(() => getDictByType('is_valid'));

let fileInfo = ref<FileInfo>({});
let fromSystem = ref<string>('user');

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveUserManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const customImageRequest = (file: FileInfo) => {
	formState.value.avatar = file.id;
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存财务信息
const saveUserManager = async () => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	const { code, message: messageInfo } = await addOrEditUserManager(
		method,
		formState.value,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		emit('handleOk', false);
		initForm();
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};

function initForm() {
	formState.value = {
		status: '1',
		gender: 0,
	};
}

const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getUserManagerDetail(props.modelInfo.id);
		if (code == '200') {
			formState.value = data || {};
			formState.value.birthday = dayjs(formState.value.birthday);
			modelConfig.confirmLoading = false;
			if (formState.value.avatar) {
				fileInfo.value.id = formState.value.avatar;
				fileInfo.value.url = formState.value.avatarUrl;
			} else {
				fileInfo.value = {};
			}
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		fileInfo.value = {};
		initForm();
	}
};

watch(
	() => props.open,
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

const emit = defineEmits(['handleOk', 'handleCancel']);
</script>
<style lang="scss" scoped></style>
