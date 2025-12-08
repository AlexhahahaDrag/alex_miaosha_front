<template>
	<div>
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
					<!-- <a-col :span="12">
            <a-form-item
              name="belongTo"
              label="分类"
              :rules="[{ required: true, message: '分类必填' }]"
            >
              <a-select
                ref="select"
                v-model:value="formState.belongTo"
                placeholder="请选择分类"
                :field-names="{ label: 'belongToName', value: 'belongTo' }"
                :options="fromSourceList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col> -->
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
import type { DictInfo } from '../config';
import {
	getDictManagerDetail,
	addDictManager,
	editDictManager,
} from '@/views/finance/dict/api';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import type { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
import type { FormInstance } from 'ant-design-vue';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const validList = computed(() => getDictByType('is_valid'));

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

let formState = ref<DictInfo>({});

const handleOk = () => {
	formRef.value
		?.validate()
		.then(() => {
			saveFinanceManager();
		})
		.catch((error: ValidateErrorEntity<DictInfo>) => {
			console.log('error', error);
		});
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存财务信息
const saveFinanceManager = async () => {
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
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		emit('handleOk', false);
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
		} = await getDictManagerDetail(props.modelInfo.id);
		if (code == '200') {
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
