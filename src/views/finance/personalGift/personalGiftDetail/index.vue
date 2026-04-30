<template>
	<a-modal
		v-model:open="modelInfo.open"
		:width="modelInfo?.width || '1000px'"
		:title="modelInfo?.title || 'Basic Modal'"
		@ok="handleOk"
		okText="保存"
		:confirmLoading="modelConfig.confirmLoading"
		:destroyOnClose="modelConfig.destroyOnClose"
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
			name="PersonalGiftForm"
			class="ant-advanced-search-form"
			:model="formState"
			:rules="rulesRef"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
		>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['eventName'].name"
						:label="labelMap['eventName'].label"
					>
						<a-input
							v-model:value="formState.eventName"
							:placeholder="'请填写' + labelMap['eventName'].label"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['amount'].name"
						:label="labelMap['amount'].label"
					>
						<a-input
							v-model:value="formState.amount"
							:placeholder="'请填写' + labelMap['amount'].label"
						></a-input>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['otherPerson'].name"
						:label="labelMap['otherPerson'].label"
					>
						<a-input
							v-model:value="formState.otherPerson"
							:placeholder="'请填写' + labelMap['otherPerson'].label"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['eventTime'].name"
						:label="labelMap['eventTime'].label"
					>
						<a-date-picker
							v-model:value="formState.eventTime"
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
					<a-form-item
						:name="labelMap['remarks'].name"
						:label="labelMap['remarks'].label"
					>
						<a-input
							v-model:value="formState.remarks"
							:placeholder="'请填写' + labelMap['remarks'].label"
						></a-input>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['action'].name"
						:label="labelMap['action'].label"
					>
						<a-select
							ref="select"
							v-model:value="formState.action"
							:placeholder="'请选择' + labelMap['action'].label"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="actionList"
							:allowClear="true"
						>
						</a-select>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="12">
					<a-form-item
						:name="labelMap['noticeNum'].name"
						:label="labelMap['noticeNum'].label"
					>
						<a-input
							v-model:value="formState.noticeNum"
							:placeholder="'请填写' + labelMap['noticeNum'].label"
						></a-input>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { rulesRef } from '@/views/finance/personalGift/config';
import {
	labelCol,
	wrapperCol,
	labelMap,
	type PersonalGiftInfo,
} from '@/views/finance/personalGift/config';
import type { ModelInfo } from '@/views/common/config';
import { defaultDateFormat } from '@/utils/dayjs';
import {
	getPersonalGiftDetail,
	addPersonalGift,
	editPersonalGift,
} from '@/views/finance/personalGift/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('gift_action');

const actionList = computed(() => getDictByType('gift_action'));

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	modelInfo?: ModelInfo;
}

const props = defineProps<Props>();
const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

let loading = ref<boolean>(false);

// 表单数据
let formState = ref<PersonalGiftInfo>({});

// 保存个人随礼信息表信息
const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePersonalGiftManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

// 取消
const handleCancel = (): void => {
	modelInfo.value.open = false;
};

//保存个人随礼信息表信息
const savePersonalGiftManager = async (): Promise<void> => {
	let api = addPersonalGift;
	if (formState.value.id) {
		api = editPersonalGift;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
		formState.value = {};
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
		} = await getPersonalGiftDetail(modelInfo.value.id);
		if (code === '200') {
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
<style lang="scss" scoped></style>
