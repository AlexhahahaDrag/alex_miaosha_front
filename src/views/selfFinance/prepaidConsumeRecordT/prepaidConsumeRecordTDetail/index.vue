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
				name="PrepaidConsumeRecordTForm"
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
						<a-form-item
							:name="labelMap['cardId'].name"
							:label="labelMap['cardId'].label"
						>
							<a-input
								v-model:value="formState.cardId"
								:placeholder="'请填写' + labelMap['cardId'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orderNo'].name"
							:label="labelMap['orderNo'].label"
						>
							<a-input
								v-model:value="formState.orderNo"
								:placeholder="'请填写' + labelMap['orderNo'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
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
					<a-col :span="12">
						<a-form-item
							:name="labelMap['balanceAfter'].name"
							:label="labelMap['balanceAfter'].label"
						>
							<a-input
								v-model:value="formState.balanceAfter"
								:placeholder="'请填写' + labelMap['balanceAfter'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['merchantName'].name"
							:label="labelMap['merchantName'].label"
						>
							<a-input
								v-model:value="formState.merchantName"
								:placeholder="'请填写' + labelMap['merchantName'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['consumeTime'].name"
							:label="labelMap['consumeTime'].label"
						>
							<a-date-picker
								v-model:value="formState.consumeTime"
								:format="'YYYY-MM-DD'"
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
							:name="labelMap['description'].name"
							:label="labelMap['description'].label"
						>
							<a-input
								v-model:value="formState.description"
								:placeholder="'请填写' + labelMap['description'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { PrepaidConsumeRecordTDetail } from './prepaidConsumeRecordTDetailTs';
import {
	getPrepaidConsumeRecordTDetail,
	addOrEditPrepaidConsumeRecordT,
} from '../api/index';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '../prepaidConsumeRecordTListTs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
	cardId: {
		name: 'cardId',
		label: '卡号（关联prepaid_card_info_t.card_id）',
	},
	orderNo: { name: 'orderNo', label: '交易流水号（业务唯一）' },
	amount: { name: 'amount', label: '交易金额（正消费，负充值）' },
	balanceAfter: { name: 'balanceAfter', label: '交易后余额' },
	merchantName: { name: 'merchantName', label: '商户名称' },
	consumeTime: { name: 'consumeTime', label: '交易时间' },
	description: { name: 'description', label: '交易描述' },
});

const rulesRef = reactive({
	cardId: [
		{
			required: true,
			message: '卡号（关联prepaid_card_info_t.card_id）不能为空！',
		},
	],
	orderNo: [
		{
			required: true,
			message: '交易流水号（业务唯一）不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '交易金额（正消费，负充值）不能为空！',
		},
	],
	balanceAfter: [
		{
			required: true,
			message: '交易后余额不能为空！',
		},
	],
	merchantName: [
		{
			required: true,
			message: '商户名称不能为空！',
		},
	],
	consumeTime: [
		{
			required: true,
			message: '交易时间不能为空！',
		},
	],
	description: [
		{
			required: true,
			message: '交易描述不能为空！',
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

let formState = ref<PrepaidConsumeRecordTDetail>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePrepaidConsumeRecordTManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	emit('handleCancel', false);
};

//保存消费卡交易记录表信息
const savePrepaidConsumeRecordTManager = (): void => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditPrepaidConsumeRecordT(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: any) => {
			let data = error?.response?.data;
			if (data) {
				message.error(data?.message || '保存失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const onFinish = (values: any): void => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any): void => {
	console.log('Failed:', errorInfo);
};

const init = (): void => {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getPrepaidConsumeRecordTDetail(props.modelInfo.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						modelConfig.confirmLoading = false;
					} else {
						message.error((res && res.message) || '查询失败！');
					}
				})
				.catch((error: any) => {
					let data = error?.response?.data;
					if (data) {
						message.error(data?.message || '查询失败！');
					}
				});
		} else {
			modelConfig.confirmLoading = false;
			formState.value = {};
		}
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

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
