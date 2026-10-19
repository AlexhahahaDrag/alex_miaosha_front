<template>
	<BaseRbacDrawer
		v-model:open="open"
		:title="props.modelInfo?.title || '消费卡交易流水明细'"
		subtitle="维护储值卡交易流水记录、变动金额与交易后余额快照"
		width="560px"
		:confirm-loading="loading"
		:readonly="Boolean(props.modelInfo?.readonly)"
		ok-text="保存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<a-form
			ref="formRef"
			name="PrepaidConsumeRecordTForm"
			layout="vertical"
			class="modern-form"
			:model="formState"
			:rules="rulesRef"
		>
			<div class="form-grid-2">
				<a-form-item
					:name="labelMap['cardId'].name"
					:label="labelMap['cardId'].label"
				>
					<a-input
						id="form_cardId"
						name="cardId"
						v-model:value="formState.cardId"
						:placeholder="'请填写' + labelMap['cardId'].label"
						allow-clear
					/>
				</a-form-item>

				<a-form-item
					:name="labelMap['orderNo'].name"
					:label="labelMap['orderNo'].label"
				>
					<a-input
						id="form_orderNo"
						name="orderNo"
						v-model:value="formState.orderNo"
						:placeholder="'请填写' + labelMap['orderNo'].label"
						allow-clear
					/>
				</a-form-item>
			</div>

			<div class="form-grid-2">
				<a-form-item
					:name="labelMap['amount'].name"
					:label="labelMap['amount'].label"
				>
					<a-input
						id="form_amount"
						name="amount"
						v-model:value="formState.amount"
						type="number"
						prefix="￥"
						:placeholder="'请填写' + labelMap['amount'].label"
					/>
				</a-form-item>

				<a-form-item
					:name="labelMap['balanceAfter'].name"
					:label="labelMap['balanceAfter'].label"
				>
					<a-input
						id="form_balanceAfter"
						name="balanceAfter"
						v-model:value="formState.balanceAfter"
						type="number"
						prefix="￥"
						:placeholder="'请填写' + labelMap['balanceAfter'].label"
					/>
				</a-form-item>
			</div>

			<div class="form-grid-2">
				<a-form-item
					:name="labelMap['merchantName'].name"
					:label="labelMap['merchantName'].label"
				>
					<a-input
						id="form_merchantName"
						name="merchantName"
						v-model:value="formState.merchantName"
						:placeholder="'请填写' + labelMap['merchantName'].label"
						allow-clear
					/>
				</a-form-item>

				<a-form-item
					:name="labelMap['consumeTime'].name"
					:label="labelMap['consumeTime'].label"
				>
					<a-date-picker
						id="form_consumeTime"
						name="consumeTime"
						v-model:value="formState.consumeTime"
						class="w-full"
						:format="'YYYY-MM-DD'"
						:getPopupContainer="getContainer"
					/>
				</a-form-item>
			</div>

			<a-form-item
				:name="labelMap['description'].name"
				:label="labelMap['description'].label"
			>
				<a-textarea
					id="form_description"
					name="description"
					v-model:value="formState.description"
					:rows="3"
					:placeholder="'请填写' + labelMap['description'].label"
					allow-clear
				/>
			</a-form-item>
		</a-form>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import type { PrepaidConsumeRecordTDetail } from '@/views/selfFinance/prepaidConsumeRecordT/prepaidConsumeRecordTDetail/prepaidConsumeRecordTDetailTs';
import {
	getPrepaidConsumeRecordTDetail,
	addPrepaidConsumeRecordT,
	editPrepaidConsumeRecordT,
} from '@/views/selfFinance/prepaidConsumeRecordT/api';
import { formatDayjs } from '@/utils/dayjs';
import type { ModelInfo } from '@/types/modal';

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const labelMap = ref<Record<string, { name: string; label: string }>>({
	cardId: {
		name: 'cardId',
		label: '关联卡号',
	},
	orderNo: { name: 'orderNo', label: '交易流水号' },
	amount: { name: 'amount', label: '交易金额（正消费 / 负充值）' },
	balanceAfter: { name: 'balanceAfter', label: '交易后余额' },
	merchantName: { name: 'merchantName', label: '商户名称' },
	consumeTime: { name: 'consumeTime', label: '交易时间' },
	description: { name: 'description', label: '交易描述' },
});

const rulesRef = reactive({
	cardId: [{ required: true, message: '关联卡号不能为空！' }],
	orderNo: [{ required: true, message: '交易流水号不能为空！' }],
	amount: [{ required: true, message: '交易金额不能为空！' }],
	balanceAfter: [{ required: true, message: '交易后余额不能为空！' }],
	merchantName: [{ required: true, message: '商户名称不能为空！' }],
	consumeTime: [{ required: true, message: '交易时间不能为空！' }],
	description: [{ required: true, message: '交易描述不能为空！' }],
});

interface Props {
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();
const open = defineModel<boolean>('open', { default: false });

const formState = ref<PrepaidConsumeRecordTDetail>({});

const handleOk = (): void => {
	if (formRef.value) {
		loading.value = true;
		formRef.value
			.validateFields()
			.then(() => savePrepaidConsumeRecordTManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	open.value = false;
};

const savePrepaidConsumeRecordTManager = async (): Promise<void> => {
	const api =
		formState.value.id ? editPrepaidConsumeRecordT : addPrepaidConsumeRecordT;
	try {
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			open.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = async (): Promise<void> => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPrepaidConsumeRecordTDetail(String(props.modelInfo.id));
		if (code === '200') {
			formState.value = {
				...(data || {}),
				consumeTime: data?.consumeTime ? formatDayjs(data.consumeTime) : undefined,
			};
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		formState.value = {};
	}
};

watch(
	() => open.value,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	},
);

const getContainer = (triggerNode: HTMLElement): HTMLElement => {
	return (triggerNode.parentNode as HTMLElement) || document.body;
};

const emit = defineEmits(['success']);
</script>

<style lang="scss" scoped>
.modern-form {
	.form-grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 16px;
	}

	:deep(.ant-form-item-label > label) {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	:deep(.ant-input),
	:deep(.ant-input-affix-wrapper),
	:deep(.ant-picker) {
		border-radius: 8px;
	}
}
</style>
