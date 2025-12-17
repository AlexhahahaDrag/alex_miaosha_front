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
					<a-col :span="12">
						<a-form-item
							:name="labelMap['couponId'].name"
							:label="labelMap['couponId'].label"
						>
							<a-input
								v-model:value="formState.couponId"
								:placeholder="'请填写' + labelMap['couponId'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-input
								v-model:value="formState.status"
								:placeholder="'请填写' + labelMap['status'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['receiveTime'].name"
							:label="labelMap['receiveTime'].label"
						>
							<a-date-picker
								v-model:value="formState.receiveTime"
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
							:name="labelMap['expireTime'].name"
							:label="labelMap['expireTime'].label"
						>
							<a-date-picker
								v-model:value="formState.expireTime"
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
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import { message, type FormInstance } from 'ant-design-vue';
import {
	getCpnUserCouponInfoDetail,
	addCpnUserCouponInfo,
	editCpnUserCouponInfo,
} from '@/views/finance/cpn-user-coupon-info/api/index';
import type { ModelInfo } from '@/views/common/config';
import type { CpnUserCouponInfoData } from '../config';
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

let formState = ref<CpnUserCouponInfoData>({});

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveCpnUserCouponInfo())
			.catch(() => (loading.value = false));
	}
};
const handleCancel = () => {
	emit('handleCancel', false);
};

//保存用户消费券库存表 (按数量核销)信息
const saveCpnUserCouponInfo = async () => {
	let api = addCpnUserCouponInfo;
	if (formState.value.id) {
		api = editCpnUserCouponInfo;
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
		} = await getCpnUserCouponInfoDetail(modalData.id);
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
