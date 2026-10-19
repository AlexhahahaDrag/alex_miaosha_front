<template>
	<BaseRbacDrawer
		v-model:open="rechargeDialogOpen"
		:title="drawerTitle"
		:subtitle="drawerSubtitle"
		width="480px"
		:confirm-loading="submitting"
		:ok-text="isConsumeMode ? '确认扣款' : '确认充值'"
		@ok="confirmRecharge"
		@cancel="cancelRecharge"
	>
		<a-form
			ref="formRef"
			name="PrepaidRechargeForm"
			layout="vertical"
			class="modern-form"
			:model="rechargeForm"
			:rules="rulesRef"
		>
			<a-form-item name="cardName" label="储值卡名称">
				<a-input
					id="form_cardName"
					name="cardName"
					v-model:value="rechargeForm.cardName"
					placeholder="请输入储值卡名称（如：大润发购物卡、理发店会员卡）"
					:disabled="isConsumeMode"
					allow-clear
				/>
			</a-form-item>

			<a-form-item
				name="consumeAmount"
				:label="isConsumeMode ? '本次消费金额 (元)' : '本次充值金额 (元)'"
			>
				<a-input-number
					id="form_consumeAmount"
					name="consumeAmount"
					v-model:value="rechargeForm.consumeAmount"
					:min="0.01"
					:precision="2"
					class="w-full"
					placeholder="请输入金额"
				/>
			</a-form-item>

			<a-form-item name="description" label="交易备注 / 商户说明">
				<a-textarea
					id="form_description"
					name="description"
					v-model:value="rechargeForm.description"
					:rows="3"
					placeholder="选填：记录本次充值优惠信息或刷卡消费商品明细"
					allow-clear
				/>
			</a-form-item>
		</a-form>
	</BaseRbacDrawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import { consumeAndRecharge } from '@/views/selfFinance/prepaidCardInfoT/api';
import type { IRechargeForm } from '@/views/selfFinance/prepaidCardInfoT/config';
import { useUserStore } from '@/store/modules/user/user';

const userStore = useUserStore();

const props = defineProps<{
	open: boolean;
	data: IRechargeForm | null;
}>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
	(e: 'ok'): void;
	(e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref<boolean>(false);

const rechargeDialogOpen = computed({
	get: () => props.open,
	set: (val: boolean) => emit('update:open', val),
});

const rechargeForm = reactive<IRechargeForm>({
	cardName: '',
	consumeAmount: 100,
	type: 'recharge',
	description: '',
});

const isConsumeMode = computed(() => rechargeForm.type === 'consume');

const drawerTitle = computed(() =>
	isConsumeMode.value ? '储值卡刷卡消费' : '储值卡余额充值',
);

const drawerSubtitle = computed(() =>
	isConsumeMode.value ?
		'从选定储值卡可用余额中扣减本次消费金额并生成交易流水'
	:	'为已有储值卡充值或创建新储值卡并写入初始充值流水',
);

const rulesRef: Record<string, Rule[]> = {
	cardName: [{ required: true, message: '储值卡名称不能为空！' }],
	consumeAmount: [{ required: true, message: '请填写有效金额！' }],
};

const confirmRecharge = async () => {
	if (!formRef.value) return;
	try {
		await formRef.value.validateFields();
		submitting.value = true;
		const params = {
			id: props.data?.id ? String(props.data.id) : null,
			cardId: rechargeForm.cardName,
			cardName: rechargeForm.cardName,
			consumeAmount: rechargeForm.consumeAmount,
			type: rechargeForm.type,
			userId:
				userStore.getUserInfo?.id !== undefined ?
					String(userStore.getUserInfo.id)
				:	undefined,
			description: rechargeForm.description,
		};
		const { code, message: messageInfo } = await consumeAndRecharge(params);
		if (code === '200') {
			message.success(
				isConsumeMode.value ? '消费扣款成功！' : '储值卡充值成功！',
			);
			emit('ok');
		} else {
			message.error(messageInfo || '操作失败！');
		}
	} catch {
		// 表单校验未通过
	} finally {
		submitting.value = false;
	}
};

const cancelRecharge = () => {
	emit('cancel');
};

watch(
	() => props.open,
	(newVal: boolean) => {
		if (newVal) {
			rechargeForm.cardName = props.data?.cardName || '';
			rechargeForm.type = props.data?.type || 'recharge';
			rechargeForm.consumeAmount = 100;
			rechargeForm.description = '';
		}
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped>
.modern-form {
	:deep(.ant-form-item-label > label) {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	:deep(.ant-input),
	:deep(.ant-input-number),
	:deep(.ant-select-selector) {
		border-radius: 8px;
	}
}
</style>
