<template>
	<!-- 充值对话框 -->
	<a-modal
		v-model:open="rechargeDialogOpen"
		title="充值"
		@ok="confirmRecharge"
		@cancel="cancelRecharge"
	>
		<a-form
			:model="rechargeForm"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 16 }"
		>
			<a-form-item label="卡名称">
				<a-input
					v-model:value="rechargeForm.cardName"
					style="width: 100%"
					:disabled="rechargeForm.type === 'consume'"
				/>
			</a-form-item>
			<a-form-item
				:label="rechargeForm.type === 'recharge' ? '充值金额' : '消费金额'"
			>
				<a-input-number
					v-model:value="rechargeForm.consumeAmount"
					:min="0.01"
					style="width: 100%"
				/>
			</a-form-item>
			<a-form-item label="描述">
				<a-textarea
					v-model:value="rechargeForm.description"
					style="width: 100%"
				/>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { consumeAndRecharge } from '@/views/selfFinance/prepaidCardInfoT/api/index';
import type { IRechargeForm } from '@/views/selfFinance/prepaidCardInfoT/config/index';
import { useUserStore } from '@/store/modules/user/user';

const { userInfo } = useUserStore();

const props = defineProps<{
	open: boolean;
	data: IRechargeForm | null;
}>();

const rechargeDialogOpen = ref<boolean>(false);
// 充值表单
const rechargeForm = reactive<IRechargeForm>({});

// 确认充值
const confirmRecharge = async () => {
	let params = {
		id: props.data?.id || null,
		cardId: rechargeForm.cardName,
		cardName: rechargeForm.cardName,
		consumeAmount: rechargeForm.consumeAmount,
		type: props.data?.type,
		userId: userInfo?.id,
		description: rechargeForm.description,
	};
	console.log(params, userInfo);
	const { code, message: messageInfo } = await consumeAndRecharge(params);
	if (code === '200') {
		message.success('充值成功');
		emit('ok');
	} else {
		message.error(messageInfo);
	}
};

const cancelRecharge = () => {
	emit('cancel');
};

const emit = defineEmits<{
	(e: 'ok'): void;
	(e: 'cancel'): void;
}>();

watch(
	() => props.open,
	(newVal: boolean) => {
		rechargeDialogOpen.value = newVal;
		if (newVal) {
			rechargeForm.cardName = props.data?.cardName || '';
			rechargeForm.type = props.data?.type || '';

			rechargeForm.consumeAmount = 1;
		}
	},
	{ immediate: true, deep: true },
);
</script>

<style scoped></style>
