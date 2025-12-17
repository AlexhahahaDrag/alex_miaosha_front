<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props.modelInfo?.width || '1000px'"
			:title="props.modelInfo?.title || 'Basic Modal'"
			@ok="handleOk"
			okText="保存"
			:confirmLoading="loading"
			:destroyOnClose="true"
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
				name="CouponInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['userCouponId'].name"
							:label="labelMap['userCouponId'].label"
						>
							<a-input
								v-model:value="formState.userCouponId"
								:placeholder="'请填写' + labelMap['userCouponId'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['userId'].name"
							:label="labelMap['userId'].label"
						>
							<a-input
								v-model:value="formState.userId"
								:placeholder="'请填写' + labelMap['userId'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orderId'].name"
							:label="labelMap['orderId'].label"
						>
							<a-input
								v-model:value="formState.orderId"
								:placeholder="'请填写' + labelMap['orderId'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['redemptionQuantity'].name"
							:label="labelMap['redemptionQuantity'].label"
						>
							<a-input
								v-model:value="formState.redemptionQuantity"
								:placeholder="'请填写' + labelMap['redemptionQuantity'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['redemptionValue'].name"
							:label="labelMap['redemptionValue'].label"
						>
							<a-input
								v-model:value="formState.redemptionValue"
								:placeholder="'请填写' + labelMap['redemptionValue'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['redemptionTime'].name"
							:label="labelMap['redemptionTime'].label"
						>
							<a-date-picker
								v-model:value="formState.redemptionTime"
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
							:name="labelMap['merchantId'].name"
							:label="labelMap['merchantId'].label"
						>
							<a-input
								v-model:value="formState.merchantId"
								:placeholder="'请填写' + labelMap['merchantId'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import { message, type FormInstance } from 'ant-design-vue';
import {
	getCpnRedemptionRecordInfoDetail,
	addCpnRedemptionRecordInfo,
	editCpnRedemptionRecordInfo,
} from '@/views/finance/cpn-redemption-record-info/api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnRedemptionRecordInfoData } from '../config';
import { labelMap } from '../config';
import { rulesRef, labelCol, wrapperCol } from './config';

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

let formState = ref<CpnRedemptionRecordInfoData>({});

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveCpnRedemptionRecordInfo())
			.catch(() => (loading.value = false));
	}
};
const handleCancel = () => {
	emit('handleCancel', false);
};

//保存消费券核销记录表 (按数量核销)信息
const saveCpnRedemptionRecordInfo = async () => {
	let api = addCpnRedemptionRecordInfo;
	if (formState.value.id) {
		api = editCpnRedemptionRecordInfo;
	}
	loading.value = true;
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error: any) => {
			return error;
		})
		.finally(() => {
			loading.value = false;
		});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const initDetail = async (modalData: ModelInfo | undefined) => {
	if (modalData?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getCpnRedemptionRecordInfoDetail(modalData.id);
		if (code == '200') {
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

const init = async () => {
	//初始化数据
	initDetail(props.modelInfo);
};

const emit = defineEmits(['handleOk', 'handleCancel']);

defineExpose({ handleOk, handleCancel });

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
</script>
<style lang="scss" scoped></style>
