<template>
	<a-drawer
		v-model:open="open"
		:title="formInfo.id ? '编辑礼金记录' : '快速记礼'"
		width="580px"
		:destroy-on-close="true"
		data-testid="gift-record-form-drawer"
		@close="open = false"
	>
		<a-spin :spinning="formInitializing">
			<!-- AI 自然语言智能快速记账 (子组件) -->
			<gift-record-ai-parse-panel
				v-if="!formInfo.id"
				ref="aiParsePanelRef"
				:default-direction="formInfo.direction"
				@parsed="handleAiParsed"
			/>

			<a-form
				ref="formRef"
				:model="formInfo"
				layout="vertical"
				:scroll-to-first-error="{ behavior: 'smooth', block: 'center' }"
			>
				<!-- 礼金方向 -->
				<a-form-item
					v-if="!formInfo.id"
					label="礼金方向"
					name="direction"
					:rules="[{ required: true, message: '请选择礼金方向' }]"
				>
					<a-segmented
						v-model:value="formInfo.direction"
						:options="formDirectionOptions"
						block
						data-testid="gift-record-form-direction"
					/>
				</a-form-item>

				<!-- 回礼复选框 -->
				<template v-if="!formInfo.id && formInfo.direction === 'GIVE'">
					<div style="margin-bottom: 16px">
						<a-checkbox v-model:checked="isReturnGift">回礼</a-checkbox>
					</div>
				</template>

				<!-- 关联原收礼事件 (仅在回礼时展示) -->
				<template
					v-if="!formInfo.id && formInfo.direction === 'GIVE' && isReturnGift"
				>
					<a-form-item
						label="关联原收礼事件"
						name="relatedRecordId"
						:rules="[{ required: true, message: '请选择待回礼记录' }]"
					>
						<gift-return-record-picker
							v-model:model-value="formInfo.relatedRecordId"
							@select="handleReturnRecordSelect"
						/>
					</a-form-item>
				</template>

				<!-- 人情事件、往来对象、经办成员 (非回礼或编辑时展示) -->
				<template v-if="formInfo.direction !== 'GIVE' || !isReturnGift">
					<!-- 人情事件解耦子组件 -->
					<gift-record-event-field
						:event-id="formInfo.eventId"
						:quick-event-tags="quickEventTags"
						:selected-event-detail="selectedEventDetail"
						@select-tag="selectQuickTag"
						@select-event="handleEventSelect"
					/>

					<!-- 往来对象与经办成员解耦子组件 -->
					<gift-record-parties-field
						v-model:external-person-id="externalPersonId"
						v-model:family-person-id="familyPersonId"
						:direction="formInfo.direction"
						:contact-rules="contactRules"
						:org-member-rules="orgMemberRules"
						:recent-contacts="recentContacts"
						:selected-contact-detail="selectedContactDetail"
						:family-members-list="familyMembersList"
						:self-person-id="findSelfPersonId(loginUserId)"
					/>
				</template>

				<!-- 礼金金额与 AI 推荐贺词解耦子组件 -->
				<gift-record-amount-field
					v-model:amount="formInfo.amount"
					:amount-rules="amountRules"
					:recommend-loading="recommendLoading"
					:recommend-amount-tags="recommendAmountTags"
					:recommend-info="recommendInfo"
				/>

				<!-- 礼金时间 -->
				<a-form-item label="礼金时间" name="payTime">
					<a-date-picker
						v-model:value="formInfo.payTime"
						value-format="YYYY-MM-DD"
						style="width: 100%"
						placeholder="请选择日期"
						data-testid="gift-record-form-pay-time"
					/>
				</a-form-item>

				<!-- 备注 -->
				<a-form-item label="备注说明 (选填)" name="remark">
					<a-textarea
						v-model:value="formInfo.remark"
						:rows="2"
						style="height: 60px; min-height: 60px"
						placeholder="请输入补充信息"
						allow-clear
						data-testid="gift-record-form-remark"
					/>
				</a-form-item>
			</a-form>
		</a-spin>

		<!-- 底部操作按钮 -->
		<template #footer>
			<div style="display: flex; gap: 8px; justify-content: flex-end">
				<a-button @click="open = false">取消</a-button>
				<a-button
					type="primary"
					:loading="saving"
					:disabled="formInitializing"
					data-testid="gift-record-form-save"
					@click="handleSave"
				>
					保存记录
				</a-button>
			</div>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { formatDate, formatTime } from '@/utils/dayjs';
import { useUserStore } from '@/store/modules/user/user';
import {
	addGiftRecord,
	updateGiftRecord,
	getGiftRecordRecommendAmount,
	getGiftRecordPage,
	getGiftEventList,
	getGiftEventDetail,
	getGiftPersonProfile,
} from '@/views/finance/gift/api';
import { useGiftRecordOptionsCache } from '@/views/finance/gift/composables/useGiftRecordOptionsCache';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import {
	type GiftRecordInfo,
	type GiftRecordRecommendAmount,
	type GiftEventInfo,
	type GiftRecordAiParseVo,
} from '@/views/finance/gift/config';
import GiftRecordAiParsePanel from '@/views/finance/gift/components/gift-record-form-drawer/components/GiftRecordAiParsePanel.vue';
import GiftRecordEventField from './components/GiftRecordEventField.vue';
import GiftRecordPartiesField from './components/GiftRecordPartiesField.vue';
import GiftRecordAmountField from './components/GiftRecordAmountField.vue';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	record?: GiftRecordInfo;
}>();

const emit = defineEmits<{
	success: [];
}>();

const userStore = useUserStore();
const { warmup, findSelfPersonId, getOrgMembers } = useGiftRecordOptionsCache();
const { loadEventTypeOptions } = useGiftEventTypeOptions();

const formRef = ref<FormInstance>();
const saving = ref<boolean>(false);
const formInitializing = ref<boolean>(false);
const formInfo = ref<GiftRecordInfo>({
	direction: 'GIVE',
});

const formDirectionOptions = [
	{ label: '🎁 我送出的', value: 'GIVE' },
	{ label: '💰 我收到的', value: 'RECEIVE' },
];

const isReturnGift = ref<boolean>(false);
const externalPersonId = ref<string>();
const familyPersonId = ref<string>();

const aiParsePanelRef = ref<{ resetText: () => void } | null>(null);

const handleAiParsed = (data: GiftRecordAiParseVo) => {
	if (data.direction === 'GIVE' || data.direction === 'RECEIVE') {
		formInfo.value.direction = data.direction;
	}
	if (data.amount != null && data.amount > 0) {
		formInfo.value.amount = Number(data.amount);
	}
	if (data.payTime) {
		formInfo.value.payTime = data.payTime.substring(0, 10);
	}
	if (data.remark) {
		formInfo.value.remark = data.remark;
	}
	if (data.personId) {
		externalPersonId.value = String(data.personId);
	} else if (data.personName) {
		message.info(
			`已识别亲友【${data.personName}】，可在外部联系人中直接选用或新建`,
		);
	}
	if (data.eventId) {
		formInfo.value.eventId = String(data.eventId);
	}
	if (data.eventType) {
		formInfo.value.eventType = data.eventType;
		const matchedTag = quickEventTags.value.find(
			(t) =>
				t.eventType === data.eventType || t.name === data.eventTypeName,
		);
		if (matchedTag) {
			selectQuickTag(matchedTag);
		}
	}
};

const recentEvents = ref<{ id: string; name: string; eventType?: string }[]>([]);
const recentContacts = ref<{ id: string; name: string }[]>([]);
const selectedEventDetail = ref<GiftEventInfo | null>(null);
const selectedContactDetail = ref<any | null>(null);

const familyMembersList = computed(() => {
	const members = getOrgMembers() || [];
	return members.map((m) => ({
		id: m.id ? String(m.id) : '',
		name: m.personName || '',
	}));
});

const loadRecentEvents = async () => {
	try {
		const { code, data } = await getGiftRecordPage({}, 1, 10);
		const list: any[] = [];
		const cList: any[] = [];
		if (code === '200' && data?.records) {
			data.records.forEach((record) => {
				if (record.eventId && record.eventName) {
					if (!list.some((x) => x.id === record.eventId)) {
						list.push({
							id: record.eventId,
							name: record.eventName,
							eventType: record.eventType,
						});
					}
				}
				const extId =
					record.direction === 'GIVE'
						? record.receiverPersonId
						: record.giverPersonId;
				const extName =
					record.direction === 'GIVE'
						? record.receiverPersonName
						: record.giverPersonName;
				if (extId && extName && !cList.some((x) => x.id === extId)) {
					cList.push({ id: extId, name: extName });
				}
			});
		}

		if (list.length < 3) {
			const { code: evCode, data: evData } = await getGiftEventList({});
			if (evCode === '200' && evData) {
				const sortedEvents = [...evData].sort((a, b) =>
					String(b.id).localeCompare(String(a.id)),
				);
				sortedEvents.forEach((ev) => {
					if (list.length >= 3) return;
					if (!list.some((x) => x.id === ev.id) && ev.id && ev.eventName) {
						list.push({
							id: ev.id,
							name: ev.eventName,
							eventType: ev.eventType,
							eventTime: ev.eventTime,
						});
					}
				});
			}
		}

		recentEvents.value = list.slice(0, 3);
		recentContacts.value = cList.slice(0, 3);
	} catch (e) {
		console.error(e);
	}
};

const quickEventTags = computed(() => {
	return recentEvents.value.map((ev) => ({
		id: ev.id,
		name: ev.name,
		eventType: ev.eventType,
		eventTime: (ev as any).eventTime,
		icon: '📅',
		isEvent: true,
	}));
});

const selectQuickTag = (item: any) => {
	formInfo.value.eventId = item.id;
	formInfo.value.eventType = item.eventType;
	formInfo.value.eventOptionId = undefined;
	if (item.eventTime && !props.record?.id) {
		formInfo.value.payTime = formatDate(item.eventTime);
	}
	formRef.value?.clearValidate('eventId');
};

const handleEventSelect = (item: GiftEventInfo) => {
	formInfo.value.eventId = item.id;
	formInfo.value.eventType = item.eventType;
	formInfo.value.eventOptionId = undefined;
	if (item.eventTime && !props.record?.id) {
		formInfo.value.payTime = formatDate(item.eventTime);
	}
	formRef.value?.clearValidate('eventId');
};

watch(
	() => formInfo.value.eventId,
	async (newId) => {
		if (!newId) {
			selectedEventDetail.value = null;
			return;
		}
		try {
			const { code, data } = await getGiftEventDetail(String(newId));
			if (code === '200' && data) {
				selectedEventDetail.value = data;
				formInfo.value.eventType = data.eventType;
				if (data.eventTime && !props.record?.id) {
					formInfo.value.payTime = data.eventTime.substring(0, 10);
				}
			}
		} catch (e) {
			console.error(e);
		}
	},
	{ immediate: true },
);

watch(
	externalPersonId,
	async (newId) => {
		if (!newId) {
			selectedContactDetail.value = null;
			return;
		}
		try {
			const { code, data } = await getGiftPersonProfile(String(newId));
			if (code === '200' && data) {
				selectedContactDetail.value = {
					...data.person,
					recordCount: data.records?.length || 0,
				};
			}
		} catch (e) {
			console.error(e);
		}
	},
	{ immediate: true },
);

const targetPersonId = computed(() => externalPersonId.value);
const activeEventType = computed(() => formInfo.value.eventType);

const recommendLoading = ref<boolean>(false);
const recommendInfo = ref<GiftRecordRecommendAmount>({});
const recommendAmountTags = ref<number[]>([]);

const loadRecommendAmount = async () => {
	const personId = targetPersonId.value;
	const eventType = activeEventType.value;
	if (!eventType) {
		recommendInfo.value = {};
		recommendAmountTags.value = [];
		return;
	}
	recommendLoading.value = true;
	try {
		const { code, data } = await getGiftRecordRecommendAmount({
			personId: personId || undefined,
			eventType,
			direction: formInfo.value.direction,
		});
		if (code === '200' && data) {
			recommendInfo.value = data;
			recommendAmountTags.value = data.recommendations || [];
			if (!props.record?.id && !formInfo.value.amount) {
				const autoAmount =
					data.latestAmount || data.averageAmount || data.defaultAmount;
				if (autoAmount && autoAmount > 0) {
					formInfo.value.amount = autoAmount;
				}
			}
		}
	} catch (e) {
		console.error(e);
	} finally {
		recommendLoading.value = false;
	}
};

watch(
	[targetPersonId, activeEventType, () => formInfo.value.direction],
	() => {
		void loadRecommendAmount();
	},
	{ immediate: true },
);

const loginUserId = computed(() => {
	const info = userStore.getUserInfo;
	return info?.id ? String(info.id) : (info?.userId ? String(info.userId) : undefined);
});

const applyDefaultOrgMember = () => {
	if (props.record?.id) {
		return;
	}
	const selfPersonId = findSelfPersonId(loginUserId.value);
	if (selfPersonId) {
		familyPersonId.value = String(selfPersonId);
	}
};

const contactRules = [
	{
		required: true,
		validator: async (_rule: any) => {
			if (!externalPersonId.value) {
				const label = formInfo.value.direction === 'GIVE' ? '收礼人' : '送礼人';
				return Promise.reject(new Error(`请选择${label}`));
			}
			return Promise.resolve();
		},
	},
];

const orgMemberRules = [
	{
		required: true,
		validator: async (_rule: any) => {
			if (!familyPersonId.value) {
				return Promise.reject(new Error('请选择经办成员'));
			}
			return Promise.resolve();
		},
	},
];

const amountRules: Rule[] = [
	{
		required: true,
		validator: async (_rule: any, value: number) => {
			if (value === undefined || value === null) {
				return Promise.reject(new Error('请输入礼金金额'));
			}
			if (value <= 0) {
				return Promise.reject(new Error('礼金金额必须大于 0'));
			}
			return Promise.resolve();
		},
		trigger: 'change',
	},
];

const handleReturnRecordSelect = (selectedRecord: GiftRecordInfo) => {
	if (!selectedRecord) return;
	externalPersonId.value = selectedRecord.giverPersonId
		? String(selectedRecord.giverPersonId)
		: undefined;
	if (selectedRecord.eventId) {
		formInfo.value.eventId = selectedRecord.eventId;
		formInfo.value.eventType = selectedRecord.eventType;
	}
	formRef.value?.clearValidate(['eventId', 'receiverPersonId']);
};

const initializeForm = async (record?: GiftRecordInfo) => {
	formInitializing.value = true;
	try {
		await warmup();
		await loadEventTypeOptions();
		await loadRecentEvents();
		await nextTick();

		if (record?.id) {
			formInfo.value = {
				id: record.id,
				direction: record.direction || 'GIVE',
				eventId: record.eventId,
				eventType: record.eventType,
				relatedRecordId: record.relatedRecordId,
				amount: record.amount,
				paymentMethod: record.paymentMethod,
				payTime: record.payTime ? record.payTime.substring(0, 10) : undefined,
				remark: record.remark,
			};
			isReturnGift.value = record.direction === 'RETURN';
			if (record.direction === 'RECEIVE') {
				externalPersonId.value = record.giverPersonId
					? String(record.giverPersonId)
					: undefined;
				familyPersonId.value = record.receiverPersonId
					? String(record.receiverPersonId)
					: undefined;
			} else {
				externalPersonId.value = record.receiverPersonId
					? String(record.receiverPersonId)
					: undefined;
				familyPersonId.value = record.giverPersonId
					? String(record.giverPersonId)
					: undefined;
			}
		} else {
			const initialDirection = record?.direction || 'GIVE';
			formInfo.value = {
				direction: initialDirection,
				eventId: record?.eventId,
				eventType: record?.eventType,
				amount: undefined,
				paymentMethod: undefined,
				payTime: formatTime(new Date(), 'YYYY-MM-DD'),
				remark: undefined,
			};
			isReturnGift.value = false;
			if (initialDirection === 'RECEIVE') {
				externalPersonId.value = record?.giverPersonId
					? String(record.giverPersonId)
					: undefined;
			} else {
				externalPersonId.value = record?.receiverPersonId
					? String(record.receiverPersonId)
					: undefined;
			}
			applyDefaultOrgMember();
			aiParsePanelRef.value?.resetText();
		}
	} finally {
		formInitializing.value = false;
	}
};

const handleSave = async () => {
	if (!formRef.value) {
		return;
	}
	saving.value = true;
	try {
		await formRef.value.validateFields();
		let params: Record<string, any> = {
			id: formInfo.value.id || undefined,
			eventId: formInfo.value.eventId || undefined,
			direction: formInfo.value.direction || undefined,
			giverPersonId: formInfo.value.giverPersonId || undefined,
			receiverPersonId: formInfo.value.receiverPersonId || undefined,
			relatedRecordId: formInfo.value.relatedRecordId || undefined,
			amount: formInfo.value.amount || undefined,
			paymentMethod: formInfo.value.paymentMethod || undefined,
			remark: formInfo.value.remark?.trim() || undefined,
		};
		if (params.direction === 'GIVE' && isReturnGift.value) {
			params.direction = 'RETURN';
		} else if (!isReturnGift.value) {
			params.relatedRecordId = undefined;
		}
		if (formInfo.value.payTime) {
			params.payTime = formatTime(formInfo.value.payTime);
		}

		const apiCall = formInfo.value.id ? updateGiftRecord : addGiftRecord;
		const { code, message: msg } = await apiCall(params as GiftRecordInfo);
		if (code === '200') {
			message.success('保存成功');
			open.value = false;
			emit('success');
		} else {
			message.error(msg || '保存失败');
		}
	} catch (error: any) {
		console.error('保存礼金记录失败:', error);
		if (error?.errorFields?.[0]?.name) {
			formRef.value?.scrollToField(error.errorFields[0].name, {
				behavior: 'smooth',
				block: 'center',
			});
		}
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

watch(isReturnGift, (val) => {
	if (!val) {
		formInfo.value.relatedRecordId = undefined;
	}
});

watch(
	[externalPersonId, familyPersonId, () => formInfo.value.direction],
	() => {
		const dir = formInfo.value.direction;
		if (dir === 'RECEIVE') {
			formInfo.value.giverPersonId = externalPersonId.value;
			formInfo.value.receiverPersonId = familyPersonId.value;
		} else {
			formInfo.value.giverPersonId = familyPersonId.value;
			formInfo.value.receiverPersonId = externalPersonId.value;
		}
	},
);

watch(
	() => formInfo.value.direction,
	async (direction, previous) => {
		if (direction === previous || formInitializing.value) {
			return;
		}
		formInfo.value.relatedRecordId = undefined;
		isReturnGift.value = false;
		if (formInfo.value.id) {
			return;
		}
		formInitializing.value = true;
		try {
			externalPersonId.value = undefined;
			await warmup();
			await nextTick();
			applyDefaultOrgMember();
		} finally {
			formInitializing.value = false;
		}
	},
);
</script>
