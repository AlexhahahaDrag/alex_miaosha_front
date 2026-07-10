<template>
	<a-drawer
		v-model:open="open"
		:title="formInfo.id ? '编辑礼金记录' : '快速记礼'"
		width="520"
		:destroy-on-close="true"
		data-testid="gift-record-form-drawer"
	>
		<a-spin :spinning="formInitializing">
			<a-form ref="formRef" :model="formInfo" layout="vertical">
				<a-form-item
					label="方向"
					name="direction"
					:rules="[{ required: true, message: '请选择礼金方向' }]"
				>
					<a-segmented
						v-model:value="formInfo.direction"
						:options="giftDirectionOptions"
						block
						data-testid="gift-record-form-direction"
					/>
				</a-form-item>

				<template v-if="formInfo.direction === 'RETURN'">
					<a-form-item
						label="关联收礼记录"
						name="relatedRecordId"
						:rules="[{ required: true, message: '请选择待回礼记录' }]"
					>
						<gift-return-record-picker
							v-model:model-value="formInfo.relatedRecordId"
							@select="handleReturnRecordSelect"
						/>
					</a-form-item>
				</template>

				<template v-else>
					<a-form-item
						label="事由"
						name="eventId"
						:rules="[{ required: true, message: '请选择事由' }]"
					>
						<gift-event-picker v-model:model-value="formInfo.eventId" />
					</a-form-item>
					<a-form-item label="送礼人" name="giverPersonId" :rules="giverRules">
						<gift-org-member-picker
							v-if="formInfo.direction === 'GIVE'"
							v-model:model-value="formInfo.giverPersonId"
							test-id="gift-record-form-giver"
						/>
						<gift-contact-picker
							v-else
							v-model:model-value="formInfo.giverPersonId"
							test-id="gift-record-form-giver"
						/>
					</a-form-item>
					<a-form-item
						label="收礼人"
						name="receiverPersonId"
						:rules="receiverRules"
					>
						<gift-contact-picker
							v-if="formInfo.direction === 'GIVE'"
							v-model:model-value="formInfo.receiverPersonId"
							test-id="gift-record-form-receiver"
						/>
						<gift-org-member-picker
							v-else
							v-model:model-value="formInfo.receiverPersonId"
							test-id="gift-record-form-receiver"
						/>
					</a-form-item>
				</template>

				<a-form-item label="金额" name="amount" :rules="amountRules">
					<div class="quick-amounts">
						<a-tag
							v-for="amount in quickGiftAmounts"
							:key="amount"
							class="quick-amount-tag"
							:color="formInfo.amount === amount ? 'blue' : 'default'"
							@click="formInfo.amount = amount"
						>
							{{ amount }}
						</a-tag>
					</div>
					<a-input-number
						v-model:value="formInfo.amount"
						:min="0"
						:precision="2"
						style="width: 100%"
						data-testid="gift-record-form-amount"
					/>
				</a-form-item>

				<a-form-item label="礼金时间" name="payTime">
					<a-date-picker
						v-model:value="formInfo.payTime"
						show-time
						value-format="YYYY-MM-DDTHH:mm:ss"
						style="width: 100%"
						data-testid="gift-record-form-pay-time"
					/>
				</a-form-item>

				<a-form-item label="备注" name="remark">
					<a-textarea
						v-model:value="formInfo.remark"
						:rows="3"
						allow-clear
						data-testid="gift-record-form-remark"
					/>
				</a-form-item>
			</a-form>
		</a-spin>

		<template #footer>
			<a-space>
				<a-button @click="open = false">取消</a-button>
				<a-button
					type="primary"
					:loading="saving"
					:disabled="formInitializing"
					data-testid="gift-record-form-save"
					@click="handleSave"
				>
					保存
				</a-button>
			</a-space>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user/user';
import { addGiftRecord, updateGiftRecord } from '@/views/finance/gift/api';
import { useGiftRecordOptionsCache } from '@/views/finance/gift/composables/useGiftRecordOptionsCache';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import {
	giftDirectionOptions,
	quickGiftAmounts,
} from '@/views/finance/gift/config';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	record?: GiftRecordInfo;
}>();

const emit = defineEmits<{
	success: [];
}>();

const userStore = useUserStore();
const { warmup, findSelfPersonId } = useGiftRecordOptionsCache();
const formRef = ref<FormInstance>();
const saving = ref(false);
const formInitializing = ref(false);
const formInfo = ref<GiftRecordInfo>({});

const loginUserId = computed(() => {
	const user = userStore.getUserInfo;
	const rawId = user?.id ?? user?.userId;
	return rawId == null ? undefined : String(rawId);
});

const personDistinctRule: Rule = {
	validator: async () => {
		const { giverPersonId, receiverPersonId } = formInfo.value;
		if (
			giverPersonId &&
			receiverPersonId &&
			giverPersonId === receiverPersonId
		) {
			throw new Error('送礼人与收礼人不能为同一人');
		}
	},
};

const giverRules: Rule[] = [
	{ required: true, message: '请选择送礼人' },
	personDistinctRule,
];

const receiverRules: Rule[] = [
	{ required: true, message: '请选择收礼人' },
	personDistinctRule,
];

const amountRules: Rule[] = [
	{ required: true, message: '请输入金额' },
	{
		validator: async (_rule, value?: number) => {
			if (value == null || value <= 0) {
				throw new Error('金额必须大于 0');
			}
		},
	},
];

const resetForm = (record?: GiftRecordInfo) => {
	formInfo.value =
		record ?
			{ ...record }
		:	{
				direction: 'GIVE',
				giverPersonId: undefined,
				receiverPersonId: undefined,
				eventId: undefined,
			};
};

const applyDefaultOrgMember = () => {
	if (formInfo.value.id) {
		return;
	}
	const direction = formInfo.value.direction;
	if (direction !== 'GIVE' && direction !== 'RECEIVE') {
		return;
	}
	const selfPersonId = findSelfPersonId(loginUserId.value);
	if (!selfPersonId) {
		return;
	}
	if (direction === 'GIVE') {
		formInfo.value.giverPersonId = selfPersonId;
		formInfo.value.receiverPersonId = undefined;
	} else {
		formInfo.value.receiverPersonId = selfPersonId;
		formInfo.value.giverPersonId = undefined;
	}
};

const initializeForm = async (record?: GiftRecordInfo) => {
	formInitializing.value = true;
	try {
		resetForm(record);
		if (formInfo.value.direction === 'RETURN') {
			return;
		}
		await warmup();
		await nextTick();
		applyDefaultOrgMember();
	} finally {
		formInitializing.value = false;
	}
};

const handleReturnRecordSelect = (record?: GiftRecordInfo) => {
	if (!record) {
		return;
	}
	formInfo.value.eventId = record.eventId;
	formInfo.value.giverPersonId = record.giverPersonId;
	formInfo.value.receiverPersonId = record.receiverPersonId;
	if (!formInfo.value.amount && record.amount) {
		formInfo.value.amount = record.amount;
	}
};

const handleSave = async () => {
	if (!formRef.value) {
		return;
	}
	saving.value = true;
	try {
		await formRef.value.validateFields();
		const api = formInfo.value.id ? updateGiftRecord : addGiftRecord;
		const { code, message: msg } = await api(formInfo.value);
		if (code === '200') {
			message.success('保存成功');
			open.value = false;
			emit('success');
		} else {
			message.error(msg || '保存失败');
		}
	} catch {
		// 校验未通过
	} finally {
		saving.value = false;
	}
};

watch(
	() => open.value,
	(isOpen) => {
		if (isOpen) {
			void initializeForm(props.record);
		}
	},
);

watch(
	() => props.record,
	(record) => {
		if (open.value) {
			void initializeForm(record);
		}
	},
);

watch(
	() => formInfo.value.direction,
	async (direction, previous) => {
		if (direction === previous || formInitializing.value) {
			return;
		}
		if (direction === 'RETURN') {
			formInfo.value.eventId = undefined;
			formInfo.value.giverPersonId = undefined;
			formInfo.value.receiverPersonId = undefined;
			return;
		}
		formInfo.value.relatedRecordId = undefined;
		if (formInfo.value.id) {
			return;
		}
		formInitializing.value = true;
		try {
			formInfo.value.giverPersonId = undefined;
			formInfo.value.receiverPersonId = undefined;
			await warmup();
			await nextTick();
			applyDefaultOrgMember();
		} finally {
			formInitializing.value = false;
		}
	},
);
</script>

<style scoped lang="less">
.quick-amounts {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 10px;
}

.quick-amount-tag {
	cursor: pointer;
}
</style>
