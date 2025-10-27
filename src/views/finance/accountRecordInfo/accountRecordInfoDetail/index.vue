<template>
	<a-modal
		:open="props.open"
		:width="props.modelInfo?.width || '1000px'"
		:title="props.modelInfo?.title || 'Basic Modal'"
		:maskClosable="false"
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
			name="AccountRecordInfoForm"
			class="ant-advanced-search-form"
			:model="formState"
			:rules="rulesRef"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
		>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item name="name" label="名称">
						<a-input
							v-model:value="formState.name"
							placeholder="请填写名称"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="avliDate" label="有效期">
						<a-date-picker
							v-model:value="formState.avliDate"
							:format="defaultTimeFormat"
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
					<a-form-item name="amount" label="金额">
						<a-input
							v-model:value="formState.amount"
							placeholder="请填写金额"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="" label="账号">
						<a-select
							ref="select"
							v-model:value="formState.account"
							placeholder="请选择账号"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="accountTypeList"
							:allowClear="true"
						>
						</a-select>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { labelCol, wrapperCol, rulesRef } from './config';
import type { ModelInfo } from '@/views/common/config';
import type { AccountRecordInfo } from '../config';
import dayjs from 'dayjs';
import { defaultTimeFormat } from '@/utils/dayjs';
import {
	getAccountRecordInfoDetail,
	addAccountRecordInfo,
	editAccountRecordInfo,
} from '@/views/finance/accountRecordInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('account_type');

// 字典数据已通过 useDictInfo 自动加载
const accountTypeList = computed(() => getDictByType('account_type'));

let loading = ref<boolean>(false);

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

let formState = ref<AccountRecordInfo>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveAccountRecordInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存信息
const saveAccountRecordInfoManager = async () => {
	let api = addAccountRecordInfo;
	if (formState.value.id) {
		api = editAccountRecordInfo;
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
		} = await getAccountRecordInfoDetail(props.modelInfo.id);
		if (code == '200') {
			formState.value = data || {};
			formState.value.avliDate = dayjs(formState.value.avliDate);
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {
			name: '猫超',
		};
	}
};

watch(
	() => props.open,
	() => {
		if (props.open) {
			init();
		}
	},
	{
		immediate: true,
		deep: true,
	},
);
</script>
<style lang="scss" scoped></style>
