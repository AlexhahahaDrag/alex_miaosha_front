<template>
	<div>
		<a-modal
			:open="props.open"
			:width="
				props.modelInfo && props.modelInfo.width ?
					props.modelInfo.width
				:	'1000px'
			"
			:title="
				props.modelInfo && props.modelInfo.title ?
					props.modelInfo.title
				:	'Basic Modal'
			"
			:maskClosable="false"
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
					>保存</a-button
				>
			</template>
			<a-form
				ref="formRef"
				name="AccountRecordInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
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
								:format="dateFormatter"
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
								placeholder="请填写账号"
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
	</div>
</template>
<script lang="ts" setup>
import type { AccountRecordInfoDetail } from './accountRecordInfoDetailTs';
import {
	getAccountRecordInfoDetail,
	addOrEditAccountRecordInfo,
} from '@/views/finance/accountRecordInfo/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import dayjs from 'dayjs';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('account_type');

// 字典数据已通过 useDictInfo 自动加载
const accountTypeList = computed(() => getDictByType('account_type'));

const dateFormatter = 'YYYY-MM-DD HH:mm:ss';
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '名称不能为空！',
		},
	],
	avliDate: [
		{
			required: true,
			message: '有效期不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	account: [
		{
			required: true,
			message: '账号不能为空！',
		},
	],
});

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<AccountRecordInfoDetail>({});

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
function saveAccountRecordInfoManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditAccountRecordInfo(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch(() => {
			message.error('系统问题，请联系管理员！');
		})
		.finally(() => {
			loading.value = false;
		});
}

const onFinish = (values: unknown) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: unknown) => {
	console.log('Failed:', errorInfo);
};

function init() {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getAccountRecordInfoDetail(props.modelInfo.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						formState.value.avliDate = dayjs(formState.value.avliDate);
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
				name: '猫超',
			};
		}
	}
}

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

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
