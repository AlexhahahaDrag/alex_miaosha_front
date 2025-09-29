<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props?.modelInfo?.width || '1000px'"
			:title="
				props.modelInfo && props.modelInfo.title ?
					props.modelInfo.title
				:	'Basic Modal'
			"
			@ok="handleOk"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
			@cancel="handleCancel"
		>
			<a-form
				ref="formRef"
				name="dictForm"
				class="ant-advanced-search-form"
				:model="formState"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
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
import type { DictDetail } from './detail';
import {
	getDictManagerDetail,
	addOrEditDictManager,
} from '@/api/finance/dict/dictManager';
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

let formState = ref<DictDetail>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	formRef.value
		?.validate()
		.then(() => {
			saveFinanceManager();
		})
		.catch((error: ValidateErrorEntity<DictDetail>) => {
			console.log('error', error);
		});
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存财务信息
function saveFinanceManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditDictManager(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: unknown) => {
			message.error(
				(error as { message?: string })?.message || '系统问题，请联系管理员！',
			);
		});
}

const onFinish = (values: unknown) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: unknown) => {
	console.log('Failed:', errorInfo);
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

function init() {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getDictManagerDetail(props.modelInfo.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						modelConfig.confirmLoading = false;
					} else {
						message.error((res && res.message) || '查询失败！');
					}
				})
				.catch(() => {
					message.error('系统问题，请联系管理员！');
				});
		} else {
			modelConfig.confirmLoading = false;
			formState.value = {
				isValid: 1,
			};
		}
	}
}

defineExpose({ handleOk, handleCancel });
</script>
