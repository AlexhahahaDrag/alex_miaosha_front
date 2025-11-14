<template>
	<a-modal
		:open="props.open"
		:width="props.modelInfo?.width || '1000px'"
		:title="props.modelInfo?.title || '收礼随礼'"
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
			name="PersonalGiftForm"
			class="ant-advanced-search-form"
			:model="formState"
			:rules="rulesRef"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
			label-align="right"
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
						<a-input-number
							v-model:value="formState.amount"
							:placeholder="'请填写' + labelMap['amount'].label"
							style="width: 100%"
							:min="0"
							:precision="2"
						></a-input-number>
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
							style="width: 100%"
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
						:name="labelMap['action'].name"
						:label="labelMap['action'].label"
					>
						<a-select
							v-model:value="formState.action"
							:placeholder="'请选择' + labelMap['action'].label"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="actionList"
							:allowClear="true"
						>
						</a-select>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap['noticeNum'].name"
						:label="labelMap['noticeNum'].label"
					>
						<a-input-number
							v-model:value="formState.noticeNum"
							:placeholder="'请填写' + labelMap['noticeNum'].label"
							style="width: 100%"
							:min="0"
						></a-input-number>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col :span="24">
					<a-form-item
						:name="labelMap['remarks'].name"
						:label="labelMap['remarks'].label"
					>
						<a-textarea
							v-model:value="formState.remarks"
							:placeholder="'请填写' + labelMap['remarks'].label"
							:rows="3"
						></a-textarea>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { watch, computed, ref } from 'vue';
import { rulesRef } from './config/index';
import { labelCol, wrapperCol, labelMap } from './config/index';
import type { PersonalGiftInfo } from './config/index';
import type { ModelInfo } from '@/views/common/config';
import { defaultDateFormat } from '@/utils/dayjs';
import {
	getPersonalGiftDetail,
	addOrEditPersonalGift,
} from '@/views/finance/personalGift/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('gift_action');

const actionList = computed(() => getDictByType('gift_action'));

const formRef = ref<FormInstance>();
// 确认加载
const confirmLoading = ref<boolean>(false);
const modelConfig = {
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo & {
		contactsUserId?: number | string;
	};
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);

// 表单数据
const formState = ref<PersonalGiftInfo>({});

// 保存个人随礼信息表信息
const handleOk = (): void => {
	confirmLoading.value = true;
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePersonalGiftManager())
			.catch(() => {
				confirmLoading.value = false;
				loading.value = false;
			});
	}
};

// 取消
const handleCancel = (): void => {
	emit('handleCancel', false);
};

// 保存个人随礼信息表信息
const savePersonalGiftManager = async (): Promise<void> => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	const { code, message: messageInfo } = await addOrEditPersonalGift(
		method,
		formState.value,
	).finally(() => {
		confirmLoading.value = false;
		loading.value = false;
	});
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
		} = await getPersonalGiftDetail(props.modelInfo.id);
		if (code == '200') {
			formState.value = data || {};
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		// 新建时，如果有 contactsUserId，自动填充
		formState.value = {
			contactsUserId:
				props.modelInfo?.contactsUserId ?
					Number(props.modelInfo.contactsUserId)
				:	undefined,
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

<style lang="scss" scoped></style>
