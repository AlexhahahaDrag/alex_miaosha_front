<template>
	<a-modal
		v-model:open="open"
		:title="formInfo.id ? '编辑礼金记录' : '快速记礼'"
		width="600px"
		:destroy-on-close="true"
		data-testid="gift-record-form-drawer"
		@cancel="open = false"
	>
		<a-spin :spinning="formInitializing">
			<a-form ref="formRef" :model="formInfo" layout="vertical">
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
					<div style="margin-bottom: 16px;">
						<a-checkbox v-model:checked="isReturnGift">回礼</a-checkbox>
					</div>
				</template>

				<!-- 关联原收礼事件 (仅在回礼时展示) -->
				<template v-if="!formInfo.id && formInfo.direction === 'GIVE' && isReturnGift">
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
					<!-- 人情事件 -->
					<a-form-item
						label="人情事件"
						name="eventId"
						:rules="[{ required: true, message: '请选择或关联人情事件' }]"
					>
						<div class="event-selection-row">
							<div class="quick-event-tags">
								<a-tag
									v-for="item in quickEventTags"
									:key="item.id"
									class="quick-event-tag"
									:color="isSelectedQuickTag(item) ? 'blue' : 'default'"
									@click="selectQuickTag(item)"
								>
									<span>{{ item.icon }} {{ item.name }}</span>
								</a-tag>
							</div>
							<a-button type="link" size="small" style="padding: 0;" @click="eventSelectorOpen = true">
								请选择人情事件 &gt;
							</a-button>
						</div>

						<!-- 选中的事件详细展示卡片 -->
						<div v-if="selectedEventDetail" class="selected-event-card">
							<div class="card-header">
								<span class="card-icon">💍</span>
								<strong class="card-title">{{ selectedEventDetail.eventName }}</strong>
								<a-button type="link" size="small" class="modify-btn" @click="eventSelectorOpen = true">修改 &gt;</a-button>
							</div>
							<div class="card-body">
								<span class="meta-item">举行时间: {{ formatTimeOnly(selectedEventDetail.eventTime) }}</span>
								<span class="meta-item" v-if="selectedEventDetail.remark">地点/备注: {{ selectedEventDetail.remark }}</span>
							</div>
						</div>
					</a-form-item>

					<!-- 往来对象 (送给谁/来自谁) -->
					<a-form-item
						:label="formInfo.direction === 'GIVE' ? '送给谁' : '来自谁'"
						:name="formInfo.direction === 'GIVE' ? 'receiverPersonId' : 'giverPersonId'"
						:rules="contactRules"
					>
						<gift-contact-picker
							v-model:model-value="externalPersonId"
							test-id="gift-record-form-receiver"
						/>
						
						<!-- 最近往来联系人快捷 Tag -->
						<div v-if="recentContacts.length > 0" class="recent-contacts-tags">
							<span class="label-text">最近往来:</span>
							<a-tag
								v-for="c in recentContacts"
								:key="c.id"
								class="contact-quick-tag"
								:color="String(externalPersonId) === String(c.id) ? 'blue' : 'default'"
								@click="externalPersonId = c.id"
							>
								{{ c.name }}
							</a-tag>
						</div>

						<!-- 选中联系人背景详情 -->
						<div v-if="selectedContactDetail" class="contact-detail-tip">
							💡 关系: <strong style="color: #1890ff">{{ relationLabel(selectedContactDetail.relationType) }}</strong> · 
							历史往来: <strong>{{ selectedContactDetail.recordCount || 0 }}次</strong> · 
							累计收到: <strong style="color: #389e0d">¥{{ selectedContactDetail.totalReceiveAmount || 0 }}</strong> | 
							累计送出: <strong style="color: #cf1322">¥{{ selectedContactDetail.totalGiveAmount || 0 }}</strong>
						</div>
					</a-form-item>

					<!-- 经办成员 -->
					<a-form-item
						label="经办成员"
						:name="formInfo.direction === 'GIVE' ? 'giverPersonId' : 'receiverPersonId'"
						:rules="orgMemberRules"
					>
						<gift-org-member-picker
							v-model:model-value="familyPersonId"
							test-id="gift-record-form-giver"
						/>
						
						<!-- 经办人快速选择标签 -->
						<div class="family-members-tags" v-if="familyMembersList.length > 0">
							<span class="label-text">经办人:</span>
							<a-tag
								v-for="m in familyMembersList"
								:key="m.id"
								class="member-quick-tag"
								:color="String(familyPersonId) === String(m.id) ? 'blue' : 'default'"
								@click="familyPersonId = m.id"
							>
								{{ getMemberLabel(m) }}
							</a-tag>
						</div>
					</a-form-item>
				</template>

				<!-- 礼金金额 -->
				<a-form-item label="礼金金额" name="amount" :rules="amountRules">
					<a-input-number
						v-model:value="formInfo.amount"
						:min="0.01"
						:precision="2"
						style="width: 100%; font-size: 16px; font-weight: bold;"
						placeholder="请输入金额"
						data-testid="gift-record-form-amount"
					>
						<template #prefix>¥</template>
					</a-input-number>

					<!-- 快捷推荐金额 -->
					<div class="quick-amounts" style="margin-top: 8px;">
						<a-spin :spinning="recommendLoading" size="small">
							<a-tag
								v-for="amount in (recommendAmountTags.length ? recommendAmountTags : quickGiftAmounts)"
								:key="amount"
								class="quick-amount-tag"
								:color="formInfo.amount === amount ? 'blue' : 'default'"
								@click="formInfo.amount = amount"
							>
								{{ amount }}
							</a-tag>
						</a-spin>
					</div>

					<!-- 历史平均推荐提示 -->
					<div v-if="recommendInfo.averageAmount && recommendInfo.averageAmount > 0" class="recommend-amount-tip">
						💡 历史参考：上次: <strong style="color: #cf1322;">¥{{ recommendInfo.latestAmount || 0 }}</strong> | 平均: <strong style="color: #1890ff;">¥{{ recommendInfo.averageAmount }}</strong> 
					</div>
					<div v-else-if="recommendInfo.defaultAmount && recommendInfo.defaultAmount > 0" class="recommend-amount-tip">
						💡 默认推荐：<strong style="color: #1890ff;">¥{{ recommendInfo.defaultAmount }}</strong>
					</div>
				</a-form-item>

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
						style="height: 60px; min-height: 60px;"
						placeholder="请输入补充信息"
						allow-clear
						data-testid="gift-record-form-remark"
					/>
				</a-form-item>
			</a-form>
		</a-spin>

		<!-- 底部操作按钮 -->
		<template #footer>
			<div style="display: flex; gap: 8px; justify-content: flex-end;">
				<a-button @click="open = false">取消</a-button>
				<a-button
					v-if="!formInfo.id"
					:loading="saving"
					:disabled="formInitializing"
					@click="handleSaveAndContinue"
				>
					保存并继续
				</a-button>
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
	</a-modal>

	<!-- 人情事件选择器弹窗 -->
	<gift-event-selector-modal
		v-model:open="eventSelectorOpen"
		:selected-id="formInfo.eventId"
		@select="handleEventSelect"
	/>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
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
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import type { GiftRecordInfo, GiftRecordRecommendAmount, GiftEventInfo } from '@/views/finance/gift/config';
import { quickGiftAmounts } from '@/views/finance/gift/config';
import GiftEventSelectorModal from '../gift-event-selector-modal/index.vue';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	record?: GiftRecordInfo;
}>();

const emit = defineEmits<{
	success: [];
}>();

const userStore = useUserStore();
const { warmup, findSelfPersonId, getOrgMembers } = useGiftRecordOptionsCache();
const { relationLabel } = useGiftRelationOptions();
const { presetOptions, customOptions, loadEventTypeOptions } = useGiftEventTypeOptions();

const formRef = ref<FormInstance>();
const saving = ref(false);
const formInitializing = ref(false);
const formInfo = ref<GiftRecordInfo>({});

const formDirectionOptions = [
	{ label: '🎁 我送出的', value: 'GIVE' },
	{ label: '💰 我收到的', value: 'RECEIVE' },
];

const isReturnGift = ref(false);
const externalPersonId = ref<string>();
const familyPersonId = ref<string>();

const eventSelectorOpen = ref(false);
const recentEvents = ref<{ id: string; name: string; eventType?: string }[]>([]);
const recentContacts = ref<{ id: string; name: string }[]>([]);
const selectedEventDetail = ref<GiftEventInfo | null>(null);
const selectedContactDetail = ref<any | null>(null);

const familyMembersList = computed(() => {
	const members = getOrgMembers() || [];
	return members.map(m => ({
		id: m.id ? String(m.id) : '',
		name: m.personName || '',
	}));
});

const getMemberLabel = (member: any) => {
	const selfPersonId = findSelfPersonId(loginUserId.value);
	if (String(member.id) === String(selfPersonId)) {
		return `👤 ${member.name} (本人)`;
	}
	return member.name;
};

const formatTimeOnly = (time?: string) => {
	if (!time) return '-';
	return time.split(' ')[0] || time;
};

const loadRecentEvents = async () => {
	try {
		const { code, data } = await getGiftRecordPage({}, 1, 10);
		const list: any[] = [];
		const cList: any[] = [];
		if (code === '200' && data?.records) {
			data.records.forEach((record) => {
				// 提取最近事件
				if (record.eventId && record.eventName) {
					if (!list.some((x) => x.id === record.eventId)) {
						list.push({
							id: record.eventId,
							name: record.eventName,
							eventType: record.eventType,
						});
					}
				}
				// 提取最近联系人 (方向 GIVE 时 receiver 是外部, RECEIVE 时 giver 是外部)
				const extId = record.direction === 'GIVE' ? record.receiverPersonId : record.giverPersonId;
				const extName = record.direction === 'GIVE' ? record.receiverPersonName : record.giverPersonName;
				if (extId && extName && !cList.some((x) => x.id === extId)) {
					cList.push({ id: extId, name: extName });
				}
			});
		}
		
		// 补足事件
		if (list.length < 3) {
			const { code: evCode, data: evData } = await getGiftEventList({});
			if (evCode === '200' && evData) {
				const sortedEvents = [...evData].sort((a, b) => String(b.id).localeCompare(String(a.id)));
				sortedEvents.forEach((ev) => {
					if (list.length >= 3) return;
					if (!list.some((x) => x.id === ev.id) && ev.id && ev.eventName) {
						list.push({
							id: ev.id,
							name: ev.eventName,
							eventType: ev.eventType,
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
	const list: any[] = recentEvents.value.map(ev => ({
		id: ev.id,
		name: ev.name,
		eventType: ev.eventType,
		icon: '📅',
		isEvent: true
	}));
	
	const fallbacks = ['婚礼', '生日', '满月', '乔迁', '春节', '白事'];
	for (const name of fallbacks) {
		if (list.length >= 3) break;
		const opt = presetOptions.value.find((p) => p.name === name);
		if (opt && !list.some((x) => !x.isEvent && x.id === opt.id)) {
			list.push({
				...opt,
				isEvent: false
			});
		}
	}
	return list;
});

const selectQuickTag = (item: any) => {
	if (item.isEvent) {
		formInfo.value.eventId = item.id;
		formInfo.value.eventType = item.eventType;
		formInfo.value.eventOptionId = undefined;
	} else {
		formInfo.value.eventId = undefined;
		formInfo.value.eventOptionId = item.id;
		formInfo.value.eventType = item.eventCode || item.name;
	}
};

const isSelectedQuickTag = (item: any) => {
	if (item.isEvent) {
		return String(formInfo.value.eventId) === String(item.id);
	} else {
		if (formInfo.value.eventId) return false;
		return String(formInfo.value.eventOptionId) === String(item.id);
	}
};

const handleEventSelect = (item: GiftEventInfo) => {
	formInfo.value.eventId = item.id;
	formInfo.value.eventType = item.eventType;
	formInfo.value.eventOptionId = undefined;
};

// 监听事件 ID 获取详情卡片
watch(() => formInfo.value.eventId, async (newId) => {
	if (!newId) {
		selectedEventDetail.value = null;
		return;
	}
	try {
		const { code, data } = await getGiftEventDetail(String(newId));
		if (code === '200' && data) {
			selectedEventDetail.value = data;
			formInfo.value.eventType = data.eventType;
		}
	} catch (e) {
		console.error(e);
	}
}, { immediate: true });

// 监听联系人 ID 获取关系及往来统计
watch(externalPersonId, async (newId) => {
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
}, { immediate: true });

const targetPersonId = computed(() => externalPersonId.value);
const activeEventType = computed(() => formInfo.value.eventType);

const recommendLoading = ref(false);
const recommendInfo = ref<GiftRecordRecommendAmount>({});
const recommendAmountTags = ref<number[]>([]);

const loadRecommendAmount = async () => {
	const personId = targetPersonId.value;
	const eventType = activeEventType.value;
	if (!personId || !eventType) {
		recommendInfo.value = {};
		recommendAmountTags.value = [];
		return;
	}
	recommendLoading.value = true;
	try {
		const { code, data } = await getGiftRecordRecommendAmount({
			personId,
			eventType,
			direction: formInfo.value.direction,
		});
		if (code === '200' && data) {
			recommendInfo.value = data;
			recommendAmountTags.value = data.recommendations || [];
		}
	} catch (e) {
		console.error(e);
	} finally {
		recommendLoading.value = false;
	}
};

watch([targetPersonId, activeEventType, () => formInfo.value.direction], () => {
	void loadRecommendAmount();
});

const loginUserId = computed(() => {
	const user = userStore.getUserInfo;
	const rawId = user?.id ?? user?.userId;
	return rawId == null ? undefined : String(rawId);
});

const personDistinctRule: Rule = {
	validator: async () => {
		const giver = familyPersonId.value;
		const receiver = externalPersonId.value;
		if (giver && receiver && giver === receiver) {
			throw new Error('我方成员与往来对象不能为同一人');
		}
	},
};

const contactRules: Rule[] = [
	{ required: true, message: '请选择往来对象' },
	personDistinctRule,
];

const orgMemberRules: Rule[] = [
	{ required: true, message: '请选择我方成员' },
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
	const now = new Date();
	const offset = now.getTimezoneOffset();
	const localTime = new Date(now.getTime() - offset * 60 * 1000);
	const payDateStr = localTime.toISOString().substring(0, 10); // YYYY-MM-DD

	formInfo.value =
		record ?
			{ ...record, payTime: record.payTime?.substring(0, 10) }
		:	{
				direction: 'GIVE',
				giverPersonId: undefined,
				receiverPersonId: undefined,
				eventId: undefined,
				eventType: undefined,
				eventOptionId: undefined,
				payTime: payDateStr,
			};
	
	if (record && !record.eventId && record.eventType) {
		const foundPreset = presetOptions.value.find(p => p.eventCode === record.eventType || p.name === record.eventType);
		const foundCustom = customOptions.value.find(c => c.name === record.eventType);
		const opt = foundPreset || foundCustom;
		if (opt) {
			formInfo.value.eventOptionId = opt.id;
			formInfo.value.eventType = opt.eventCode || opt.name;
		}
	}

	if (formInfo.value.direction === 'RETURN') {
		isReturnGift.value = true;
		formInfo.value.direction = 'GIVE';
		familyPersonId.value = formInfo.value.giverPersonId;
		externalPersonId.value = formInfo.value.receiverPersonId;
	} else {
		isReturnGift.value = false;
		if (formInfo.value.direction === 'RECEIVE') {
			familyPersonId.value = formInfo.value.receiverPersonId;
			externalPersonId.value = formInfo.value.giverPersonId;
		} else {
			familyPersonId.value = formInfo.value.giverPersonId;
			externalPersonId.value = formInfo.value.receiverPersonId;
		}
	}
};

const applyDefaultOrgMember = () => {
	if (formInfo.value.id) {
		return;
	}
	const selfPersonId = findSelfPersonId(loginUserId.value);
	if (!selfPersonId) {
		return;
	}
	familyPersonId.value = selfPersonId;
	externalPersonId.value = undefined;
};

const initializeForm = async (record?: GiftRecordInfo) => {
	formInitializing.value = true;
	try {
		await loadEventTypeOptions();
		await loadRecentEvents();
		resetForm(record);
		if (isReturnGift.value) {
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
	familyPersonId.value = record.giverPersonId;
	externalPersonId.value = record.receiverPersonId;
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
		
		const payload = { ...formInfo.value };
		if (payload.direction === 'GIVE' && isReturnGift.value) {
			payload.direction = 'RETURN';
		} else if (!isReturnGift.value) {
			payload.relatedRecordId = undefined;
		}
		if (payload.payTime && !payload.payTime.includes('T')) {
			payload.payTime = `${payload.payTime}T00:00:00`;
		}
		
		const { code, message: msg } = await api(payload);
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

const handleSaveAndContinue = async () => {
	if (!formRef.value) {
		return;
	}
	saving.value = true;
	try {
		await formRef.value.validateFields();
		const payload = { ...formInfo.value };
		if (payload.direction === 'GIVE' && isReturnGift.value) {
			payload.direction = 'RETURN';
		} else if (!isReturnGift.value) {
			payload.relatedRecordId = undefined;
		}
		if (payload.payTime && !payload.payTime.includes('T')) {
			payload.payTime = `${payload.payTime}T00:00:00`;
		}
		
		const { code, message: msg } = await addGiftRecord(payload);
		if (code === '200') {
			message.success('保存成功');
			emit('success');
			// 重置金额与备注，方便连续录入
			formInfo.value.amount = undefined;
			formInfo.value.remark = '';
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

watch(isReturnGift, (val) => {
	if (!val) {
		formInfo.value.relatedRecordId = undefined;
	}
});

watch([externalPersonId, familyPersonId, () => formInfo.value.direction], () => {
	const dir = formInfo.value.direction;
	if (dir === 'RECEIVE') {
		formInfo.value.giverPersonId = externalPersonId.value;
		formInfo.value.receiverPersonId = familyPersonId.value;
	} else {
		formInfo.value.giverPersonId = familyPersonId.value;
		formInfo.value.receiverPersonId = externalPersonId.value;
	}
});

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

<style scoped lang="less">
.event-selection-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.quick-event-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.quick-event-tag {
	cursor: pointer;
	user-select: none;
	padding: 4px 10px;
	border-radius: 4px;
	font-size: 13px;
	transition: all 0.2s;
	
	&:hover {
		opacity: 0.85;
	}
}

.selected-event-card {
	border: 1px solid #e8e8e8;
	border-radius: 6px;
	padding: 10px 12px;
	background: #fafafa;
	margin-top: 8px;
	
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		
		.card-icon {
			font-size: 16px;
			margin-right: 6px;
		}
		
		.card-title {
			font-size: 13.5px;
			color: #262626;
			flex: 1;
		}
		
		.modify-btn {
			padding: 0;
			font-size: 12px;
		}
	}
	
	.card-body {
		font-size: 12px;
		color: #8c8c8c;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
}

.recent-contacts-tags,
.family-members-tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	margin-top: 6px;
	
	.label-text {
		font-size: 12px;
		color: #8c8c8c;
	}
	
	.contact-quick-tag,
	.member-quick-tag {
		cursor: pointer;
		margin: 0;
	}
}

.contact-detail-tip {
	margin-top: 6px;
	font-size: 12px;
	color: #595959;
	background: #f6ffed;
	border: 1px solid #b7eb8f;
	padding: 6px 10px;
	border-radius: 4px;
}

.quick-amounts {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.quick-amount-tag {
	cursor: pointer;
}

.recommend-amount-tip {
	font-size: 12px;
	color: #666;
	margin-top: 6px;
}
</style>
