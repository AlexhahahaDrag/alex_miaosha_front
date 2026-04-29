<template>
	<a-modal
		v-model:open="open"
		:width="props.modelInfo?.width || '800px'"
		:title="props.modelInfo?.title || '联系人详情'"
		okText="保存"
		:confirm-loading="confirmLoading"
		:destroyOnClose="modelConfig.destroyOnClose"
		@ok="handleOk"
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
			label-align="right"
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
							:options="relationshipOptions"
							:field-names="{ label: 'relationshipTag', value: 'id' }"
						>
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
					<a-form-item
						name="address"
						label="地址"
						:label-col="{ span: 3 }"
						:wrapperCol="{ span: 20 }"
					>
						<a-input
							v-model:value="formState.address"
							placeholder="请输入联系地址"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="24">
					<a-form-item
						name="remarks"
						label="备注"
						:label-col="{ span: 3 }"
						:wrapperCol="{ span: 20 }"
					>
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
import { rulesRef } from './config';
import { labelCol, wrapperCol } from '../config';
import type { ContactsUserInfo } from '../config';
import type { ModelInfo } from '@/views/common/config';
import {
	getContactsUserDetail,
	addContactsUser,
	editContactsUser,
} from '@/views/personal-gift/contacts-user/api';
import {
	getUserEnabledRelations,
	getPublicEnabledRelations,
} from '@/views/personal-gift/contacts-user-relation/api';
import type { ContactsUserRelationInfo } from '@/views/personal-gift/contacts-user-relation/config';
import { useUserStore } from '@/store/modules/user/user';

const formRef = ref<FormInstance>();

// 确认加载
const confirmLoading = ref<boolean>(false);
const modelConfig = {
	destroyOnClose: true,
};

interface Props {
	modelInfo?: ModelInfo;
}

const props = defineProps<Props>();
const open = defineModel<boolean>('open', { default: false });

const loading = ref<boolean>(false);

// 关系分类选项
const relationshipOptions = ref<ContactsUserRelationInfo[]>([]);

// 表单数据
const formState = ref<ContactsUserInfo>({});

// 保存联系人信息
const handleOk = (): void => {
	confirmLoading.value = true;
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveContactsUserManager())
			.catch(() => {
				confirmLoading.value = false;
				loading.value = false;
			});
	}
};

// 取消
const handleCancel = (): void => {
	open.value = false;
};

// 保存联系人信息
const saveContactsUserManager = async (): Promise<void> => {
	let api = addContactsUser;
	if (formState.value.id) {
		api = editContactsUser;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			confirmLoading.value = false;
			loading.value = false;
		},
	);
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		open.value = false;
		emit('success');
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

// 获取关系分类选项
const loadRelationshipOptions = async (): Promise<void> => {
	try {
		const userStore = useUserStore();
		const userInfo = userStore.getUserInfo;
		const userId = userInfo?.id;

		if (userId) {
			// 获取用户的所有启用的关系分类（公共+私有）
			const { code, data } = await getUserEnabledRelations(userId);
			if (code === '200' && data) {
				relationshipOptions.value = data;
			}
		} else {
			// 如果没有用户ID，获取公共的关系分类
			const { code, data } = await getPublicEnabledRelations();
			if (code === '200' && data) {
				relationshipOptions.value = data;
			}
		}
	} catch (error: unknown) {
		console.error('错误信息：', error);
		message.error(
			'获取关系分类失败！' + (error as Error).message || '未知错误',
		);
		console.error('获取关系分类失败:', error);
	}
};

// 初始化数据
const init = async () => {
	// 加载关系分类选项
	await loadRelationshipOptions();

	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getContactsUserDetail(props.modelInfo.id);
		if (code === '200') {
			formState.value = data || {};
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		formState.value = {};
	}
};

watch(
	() => open.value,
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

<style lang="scss" scoped></style>
