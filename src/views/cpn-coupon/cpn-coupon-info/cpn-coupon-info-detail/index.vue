<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props.modelInfo?.width || 'min(800px, 60%)'"
			okText="保存"
			:confirmLoading="loading"
			:destroyOnClose="true"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<!-- AI Agent: 参照 cpn-coupon-redeem-quantity-detail 升级标题样式（局部生效，不影响全局 Modal） -->
			<template #title>
				<div class="ai-agent-modal-title-wrap">
					<span class="ai-agent-modal-title">
						{{ props.modelInfo?.title || 'Basic Modal' }}
					</span>
					<!-- AI Agent: 标题下方横线（顶到两端） -->
					<div class="ai-agent-modal-title-divider"></div>
				</div>
			</template>
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
				:disabled="loading"
				style="margin-top: 20px"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['couponName'].name"
							:label="labelMap['couponName'].label"
						>
							<a-input
								v-model:value="formState.couponName"
								:placeholder="'请填写' + labelMap['couponName'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['totalQuantity'].name"
							:label="labelMap['totalQuantity'].label"
						>
							<a-input
								v-model:value="formState.totalQuantity"
								:placeholder="'请填写' + labelMap['totalQuantity'].label"
							>
							</a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['endDate'].name"
							:label="labelMap['endDate'].label"
						>
							<a-date-picker
								v-model:value="formState.endDate"
								:show-time="{ format: 'HH:mm' }"
								format="YYYY-MM-DD HH:mm"
								:getPopupContainer="
									(triggerNode: HTMLElement) => {
										return triggerNode.parentNode as HTMLElement;
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['unitValue'].name"
							:label="labelMap['unitValue'].label"
						>
							<a-input
								v-model:value="formState.unitValue"
								:placeholder="'请填写' + labelMap['unitValue'].label"
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
	getCpnCouponInfoDetail,
	addCpnCouponInfo,
	editCpnCouponInfo,
} from '@/views/cpn-coupon/cpn-coupon-info/api';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from '../config';
import { labelMap } from '../config';
import { rulesRef, labelCol, wrapperCol } from './config';
import dayjs from 'dayjs';
import { formatDayjs } from '@/utils/dayjs';

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

let formState = ref<CpnCouponInfoData>({});

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveCpnCouponInfo())
			.catch(() => (loading.value = false));
	}
};
const handleCancel = () => {
	emits('handleCancel', false);
};

//保存消费券信息表信息
const saveCpnCouponInfo = async () => {
	let api = addCpnCouponInfo;
	if (formState.value.id) {
		api = editCpnCouponInfo;
	}
	loading.value = true;
	// 将 dayjs 对象转换为字符串格式，以便后端正确接收
	const submitData = {
		...formState.value,
		startDate:
			formState.value.startDate ? dayjs(formState.value.startDate) : undefined,
		endDate:
			formState.value.endDate ? dayjs(formState.value.endDate) : undefined,
	};
	const { code, message: messageInfo } = await api(submitData)
		.catch((error: unknown) => {
			return error as { code: string; message: string };
		})
		.finally(() => {
			loading.value = false;
		});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		emits('handleOk', false);
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
		} = await getCpnCouponInfoDetail(modalData.id);
		if (code == '200') {
			// AI Agent：将后端返回的字符串日期转换为 dayjs 对象，以便日期选择器正确显示
			const formattedData = { ...(data || {}) };
			if (data?.startDate) {
				const startDate = formatDayjs(data.startDate);
				if (startDate) {
					formattedData.startDate = startDate;
				}
			}
			if (data?.endDate) {
				const endDate = formatDayjs(data.endDate);
				if (endDate) {
					formattedData.endDate = endDate;
				}
			}
			formState.value = formattedData;
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = { startDate: dayjs() };
	}
};

const init = async () => {
	//初始化数据
	initDetail(props.modelInfo);
};

const emits = defineEmits(['handleOk', 'handleCancel']);

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
<style lang="scss" scoped>
/* AI Agent: 弹窗标题字号调大“两号”（默认约 16px -> 18px），并添加分割线 */
.ai-agent-modal-title-wrap {
	width: 100%;
}
.ai-agent-modal-title {
	font-size: 18px;
	line-height: 24px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.88);
}

/* AI Agent: 标题下横线（不改全局 ant 样式，局部实现） */
.ai-agent-modal-title-divider {
	/* AI Agent: antd Modal header 默认左右 padding 为 24px，这里用负 margin 抵消，让线“顶到两端” */
	width: calc(100% + 48px);
	margin-left: -24px;
	height: 1px;
	margin-top: 12px;
	/* AI Agent: 分割线颜色加深（对标 Ant 边框色更清晰） */
	background: #d9d9d9;
}
</style>
