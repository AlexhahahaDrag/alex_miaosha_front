<template>
	<a-modal
		:open="props.open"
		:width="props.modelInfo?.width || '800px'"
		:title="props.modelInfo?.title || '联系人详情'"
		@ok="handleOk"
		okText="保存"
		:confirmLoading="modelConfig.confirmLoading"
		:destroyOnClose="modelConfig.destroyOnClose"
		@cancel="handleCancel"
	>
		<template #footer>
			<a-button key="back" @click="handleCancel">取消</a-button>
			<a-button
				key="submit"
				type="primary"
				:loading="loading"
				@click="handleOk"
			>
				保存
			</a-button>
		</template>
		<a-form
			ref="formRef"
			name="ContactsUserForm"
			class="ant-advanced-search-form"
			:model="formState"
			:rules="rulesRef"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
		>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="name" label="姓名">
						<a-input v-model:value="formState.name" placeholder="请输入姓名" />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="phone" label="电话">
						<a-input
							v-model:value="formState.phone"
							placeholder="请输入电话号码"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="relationship" label="关系">
						<a-select
							v-model:value="formState.relationship"
							placeholder="请选择关系类型"
							:allowClear="true"
						>
							<a-select-option value="friend">朋友</a-select-option>
							<a-select-option value="family">家人</a-select-option>
							<a-select-option value="colleague">同事</a-select-option>
							<a-select-option value="other">其他</a-select-option>
						</a-select>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="email" label="邮箱">
						<a-input
							v-model:value="formState.email"
							placeholder="请输入邮箱地址"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="24">
					<a-form-item name="address" label="地址">
						<a-input
							v-model:value="formState.address"
							placeholder="请输入联系地址"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="24">
					<a-form-item name="remarks" label="备注">
						<a-textarea
							v-model:value="formState.remarks"
							placeholder="请输入备注信息"
							:rows="3"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="isFavorite" label="常用联系人">
						<a-switch
							v-model:checked="formState.isFavorite"
							:checked-value="1"
							:un-checked-value="0"
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { rulesRef } from './config/index';
import { labelCol, wrapperCol } from '../config/index';
import type { ContactsUserInfo } from '../config/index';
import type { ModelInfo } from '@/views/common/config';
import {
	getContactsUserDetail,
	addContactsUser,
	editContactsUser,
} from '@/views/personal-gift/contacts-user/api/index';
import { ref, watch } from 'vue';

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);

// 表单数据
const formState = ref<ContactsUserInfo>({});

// 保存联系人信息
const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveContactsUserManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

// 取消
const handleCancel = (): void => {
	emit('handleCancel', false);
};

// 保存联系人信息
const saveContactsUserManager = async (): Promise<void> => {
	let api = addContactsUser;
	if (formState.value.id) {
		api = editContactsUser;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		emit('handleOk', false);
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

// 初始化数据
const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getContactsUserDetail(props.modelInfo.id);
		if (code == '200') {
			formState.value = data || {};
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {};
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
