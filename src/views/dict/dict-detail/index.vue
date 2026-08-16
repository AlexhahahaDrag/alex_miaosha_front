<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '1000px'"
			:title="modelInfo?.title || 'Basic Modal'"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<a-form
				ref="formRef"
				name="dictForm"
				class="ant-advanced-search-form"
				:model="formState"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							name="typeCode"
							label="类别编码"
							:rules="[{ required: true, message: '类别编码必填！' }]"
						>
							<a-input
								v-model:value="formState.typeCode"
								placeholder="请填写类别编码"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							name="typeName"
							label="类别"
							:rules="[{ required: true, message: '类别必填' }]"
						>
							<a-input
								v-model:value="formState.typeName"
								placeholder="请填写类别"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							name="belongTo"
							label="分类编码"
							:rules="[{ required: true, message: '分类编码必填！' }]"
						>
							<a-input
								v-model:value="formState.belongTo"
								placeholder="请填写分类编码"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							name="belongToName"
							label="分类"
							:rules="[{ required: true, message: '分类必填' }]"
						>
							<a-input
								v-model:value="formState.belongToName"
								placeholder="请填写分类"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							name="isValid"
							label="状态"
							:rules="[{ required: true, message: 'input something' }]"
						>
							<a-select
								ref="select"
								v-model:value="formState.isValid"
								placeholder="请选择有效状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="validList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							name="orderBy"
							label="排序"
							:rules="[{ required: true, message: '排序必填' }]"
						>
							<a-input
								v-model:value="formState.orderBy"
								placeholder="请填写排序"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { DictInfo } from '@/views/dict/config';
import {
	getDictManagerDetail,
	addDictManager,
	editDictManager,
} from '@/views/dict/api';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import type { FormInstance } from 'ant-design-vue';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ResponseBody } from '@/types/api';

const { getDictByType } = useDictInfo('is_valid');

const validList = computed(() => getDictByType('is_valid'));

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

let formState = ref<DictInfo>({});

const handleOk = () => {
	formRef.value
		?.validate()
		.then(() => {
			saveDict();
		})
		.catch((error: ResponseBody) => {
			console.log('error', error);
		});
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

//保存字典信息
const saveDict = async () => {
	let api = addDictManager;
	if (formState.value.id) {
		api = editDictManager;
	}
	modelConfig.confirmLoading = true;
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error) => {
			return error;
		})
		.finally(() => {
			modelConfig.confirmLoading = false;
		});
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

// 初始化数据
const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getDictManagerDetail(String(modelInfo.value.id));
		if (code === '200') {
			formState.value = data || {};
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {
			isValid: 1,
		};
	}
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
