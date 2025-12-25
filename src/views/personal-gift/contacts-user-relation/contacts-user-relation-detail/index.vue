<template>
	<a-modal
		:open="open"
		:title="modelInfo?.title || '关系分类'"
		:confirm-loading="loading"
		@ok="onSubmit"
		@cancel="onCancel"
		:destroyOnClose="true"
		width="600px"
	>
		<a-form
			ref="formRef"
			:model="formData"
			:label-col="{ span: 4 }"
			:wrapper-col="{ span: 18 }"
		>
			<!-- 关系分类标签 -->
			<a-form-item
				label="关系分类"
				name="relationshipTag"
				:rules="[{ required: true, message: '请输入关系分类' }]"
			>
				<a-input
					v-model:value="formData.relationshipTag"
					placeholder="请输入关系分类，如：重要客户"
					allow-clear
				/>
			</a-form-item>

			<!-- 重要程度 -->
			<a-form-item
				label="重要程度"
				name="importance"
				:rules="[{ required: true, message: '请选择重要程度' }]"
			>
				<a-select
					v-model:value="formData.importance"
					placeholder="请选择重要程度"
				>
					<a-select-option :value="1">普通</a-select-option>
					<a-select-option :value="2">重要</a-select-option>
					<a-select-option :value="3">非常重要</a-select-option>
				</a-select>
			</a-form-item>

			<!-- 描述 -->
			<a-form-item label="描述" name="description">
				<a-textarea
					v-model:value="formData.description"
					placeholder="请输入描述信息"
					:rows="3"
					allow-clear
				/>
			</a-form-item>

			<!-- 是否启用 -->
			<a-form-item
				label="是否启用"
				name="isEnabled"
				:rules="[{ required: true, message: '请选择是否启用' }]"
			>
				<a-select
					v-model:value="formData.isEnabled"
					placeholder="请选择是否启用"
				>
					<a-select-option :value="1">启用</a-select-option>
					<a-select-option :value="0">禁用</a-select-option>
				</a-select>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { ContactsUserRelationInfo } from '../config/index';
import {
	addContactsUserRelation,
	editContactsUserRelation,
	getContactsUserRelationDetail,
} from '../api/index';
import type { ResponseBody } from '@/types/api';
import { useUserStore } from '@/store/modules/user/user';

const userId = useUserStore()?.getUserInfo?.id;

interface Props {
	open?: boolean;
	modelInfo?: {
		open: boolean;
		title?: string;
		record?: ContactsUserRelationInfo;
		id?: number;
	};
}

const props = withDefaults(defineProps<Props>(), {
	open: false,
});

const emit = defineEmits<{
	handleOk: [boolean];
	handleCancel: [boolean];
}>();

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formData = ref<ContactsUserRelationInfo>({
	relationshipTag: '',
	importance: 1,
	description: '',
	remarks: '',
	isEnabled: 1,
});

// 加载详情
const loadDetail = async (id: number): Promise<void> => {
	const { code, data } = await getContactsUserRelationDetail(id);
	if (code == '200' && data) {
		formData.value = { ...data };
	} else {
		message.error('加载详情失败！');
	}
};

// 重置表单
const resetForm = (): void => {
	formData.value = {
		relationshipTag: '',
		importance: 1,
		description: '',
		remarks: '',
		isEnabled: 1,
	};
	formRef.value?.clearValidate();
};

// 提交表单
const onSubmit = async (): Promise<void> => {
	try {
		await formRef.value?.validateFields();
		loading.value = true;
		let response: ResponseBody<ContactsUserRelationInfo>;
		const params = { ...formData.value, userId, id: props.modelInfo?.id };
		if (props.modelInfo?.id) {
			// 编辑
			response = await editContactsUserRelation(params);
		} else {
			// 新增
			response = await addContactsUserRelation(params);
		}

		const { code, message: messageInfo } = response;
		if (code == '200') {
			message.success(
				messageInfo || (props.modelInfo?.id ? '编辑成功！' : '添加成功！'),
				3,
			);
			emit('handleOk', false);
		} else {
			message.error(messageInfo || '操作失败！', 3);
		}
	} catch (error: unknown) {
		console.error('错误信息：', error);
		message.error('表单提交错误！' + (error as Error).message || '未知错误');
	} finally {
		loading.value = false;
	}
};

// 取消
const onCancel = (): void => {
	emit('handleCancel', false);
};

// 监听 open 状态变化
watch(
	() => props.open,
	async (newVal) => {
		if (newVal && props.modelInfo?.id) {
			// 编辑模式 - 获取详情
			await loadDetail(props.modelInfo.id);
		} else if (newVal) {
			// 新增模式 - 重置表单
			resetForm();
		}
	},
);
</script>

<style scoped>
:deep(.ant-modal-content) {
	padding: 24px;
}
</style>
