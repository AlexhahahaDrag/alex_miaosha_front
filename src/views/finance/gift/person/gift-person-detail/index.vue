<template>
	<a-drawer
		v-model:open="modelInfo.open"
		:width="drawerWidth"
		:title="modelInfo.title || '联系人'"
		:destroy-on-close="true"
		@close="handleCancel"
	>
		<a-spin :spinning="pageLoading">
			<template v-if="isProfileMode">
				<div class="profile-head">
					<span class="profile-avatar">{{
						firstName(profile.person?.personName)
					}}</span>
					<h3>{{ profile.person?.personName || '-' }}</h3>
					<p>
						{{ relationLabel(profile.person?.relationType) }} ·
						{{ profile.person?.phone || '-' }}
					</p>
				</div>
				<div class="profile-metrics">
					<div>
						<span>累计送礼</span>
						<strong class="amount-out">{{
							money(profile.person?.totalGiveAmount)
						}}</strong>
					</div>
					<div>
						<span>累计收礼</span>
						<strong class="amount-in">{{
							money(profile.person?.totalReceiveAmount)
						}}</strong>
					</div>
				</div>
				<a-divider>基本信息</a-divider>
				<a-descriptions :column="1" size="small" bordered>
					<a-descriptions-item label="手机号">
						{{ profile.person?.phone || '-' }}
					</a-descriptions-item>
					<a-descriptions-item label="关系">
						{{ relationLabel(profile.person?.relationType) }}
					</a-descriptions-item>
					<a-descriptions-item label="备注">
						{{ profile.person?.remark || '-' }}
					</a-descriptions-item>
				</a-descriptions>
				<a-divider>往来历史</a-divider>
				<a-list :data-source="profile.records || []" size="small">
					<template #renderItem="{ item }">
						<a-list-item>
							<a-list-item-meta
								:title="`${directionLabel(item.direction)} ${money(item.amount)}`"
								:description="`${item.payTime || '-'} ${item.remark || ''}`"
							/>
						</a-list-item>
					</template>
				</a-list>
			</template>
			<a-form v-else ref="formRef" :model="formState" layout="vertical">
				<a-form-item
					label="姓名"
					name="personName"
					:rules="[{ required: true, message: '请输入姓名' }]"
				>
					<a-input
						v-model:value="formState.personName"
						placeholder="请输入姓名"
						allow-clear
					/>
				</a-form-item>
				<a-form-item label="手机号" name="phone" :rules="phoneRules">
					<a-input
						v-model:value="formState.phone"
						placeholder="请输入手机号"
						allow-clear
						:maxlength="11"
					/>
				</a-form-item>
				<a-form-item
					label="关系"
					name="relationMode"
					:rules="[
						{ required: true, message: '请选择关系', trigger: 'change' },
					]"
				>
					<a-select
						v-model:value="formState.relationMode"
						:options="relationSelectOptions"
						allow-clear
						placeholder="请选择关系"
					/>
				</a-form-item>
				<a-form-item
					v-if="formState.relationMode === RELATION_CUSTOM"
					label="自定义关系"
					name="customRelation"
					:rules="customRelationRules"
				>
					<a-input
						v-model:value="formState.customRelation"
						placeholder="请输入关系，如：发小、同学"
						allow-clear
						:maxlength="20"
					/>
				</a-form-item>
				<a-form-item label="备注" name="remark">
					<a-textarea
						v-model:value="formState.remark"
						:rows="3"
						placeholder="请输入备注"
						allow-clear
					/>
				</a-form-item>
			</a-form>
		</a-spin>
		<template #footer>
			<template v-if="isProfileMode">
				<div class="profile-actions">
					<a-button
						v-if="hasPermission('gift:edit')"
						type="primary"
						block
						@click="openEditFromProfile"
					>
						编辑资料
					</a-button>
					<a-button block @click="handleCancel">返回列表</a-button>
				</div>
			</template>
			<a-space v-else>
				<a-button @click="handleCancel">取消</a-button>
				<a-button type="primary" :loading="loading" @click="handleOk">
					保存
				</a-button>
			</a-space>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { usePermission } from '@/composables/usePermission';
import type { ModelInfo } from '@/views/common/config';
import {
	addGiftPerson,
	getGiftPersonDetail,
	getGiftPersonProfile,
	updateGiftPerson,
} from '@/views/finance/gift/api';
import type {
	GiftPersonFormState,
	GiftPersonInfo,
	GiftPersonProfile,
} from '@/views/finance/gift/config';
import {
	buildRelationTypeForSave,
	directionLabel,
	money,
	RELATION_CUSTOM,
} from '@/views/finance/gift/config';

interface GiftPersonDrawerInfo extends ModelInfo {
	mode?: 'form' | 'profile';
}

const {
	presetOptions,
	relationSelectOptions,
	loadRelationOptions,
	relationLabel,
	mapRelationToFormFields,
} = useGiftRelationOptions();

const CHINA_MOBILE = /^1[3-9]\d{9}$/;

const customRelationRules: Rule[] = [
	{
		validator: async (_rule, value?: string) => {
			const text = value?.trim();
			if (!text) {
				throw new Error('请输入自定义关系');
			}
			if (text.length > 20) {
				throw new Error('关系最多20个字符');
			}
			if (presetRelationLabels.value.includes(text)) {
				throw new Error(`请从常用关系中选择「${text}」`);
			}
		},
		trigger: 'blur',
	},
];

const phoneRules: Rule[] = [
	{
		validator: async (_rule, value?: string) => {
			const phone = value?.trim();
			if (!phone) {
				return;
			}
			if (!CHINA_MOBILE.test(phone)) {
				throw new Error('请输入正确的11位手机号');
			}
		},
		trigger: 'blur',
	},
];

const modelInfo = defineModel<GiftPersonDrawerInfo>('modelInfo', {
	default: () => ({}),
});

const { hasPermission } = usePermission();

const formRef = ref<FormInstance>();
const loading = ref(false);
const pageLoading = ref(false);
const formState = ref<GiftPersonFormState>({});
const profile = ref<GiftPersonProfile>({});

const presetRelationLabels = computed(() =>
	presetOptions.value.map((item) => item.name),
);

const isProfileMode = computed(() => modelInfo.value.mode === 'profile');
const drawerWidth = computed(() =>
	isProfileMode.value ?
		modelInfo.value.width || '420px'
	:	modelInfo.value.width || '460px',
);

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const handleCancel = () => {
	modelInfo.value.open = false;
};

const toSavePayload = (): GiftPersonInfo => {
	const { relationMode, customRelation, relationOptionId, ...rest } =
		formState.value;
	return {
		...rest,
		...buildRelationTypeForSave(formState.value, presetOptions.value),
	};
};

const saveGiftPerson = async () => {
	const api = formState.value.id ? updateGiftPerson : addGiftPerson;
	const { code, message: msg } = await api(toSavePayload());
	if (code === '200') {
		message.success('保存成功');
		modelInfo.value.open = false;
		formState.value = {};
		emit('success');
	} else {
		message.error(msg || '保存失败');
	}
};

const handleOk = async () => {
	if (!formRef.value) return;
	loading.value = true;
	try {
		await formRef.value.validateFields();
		await saveGiftPerson();
	} catch {
		// 校验未通过
	} finally {
		loading.value = false;
	}
};

const loadForm = async () => {
	const personId = modelInfo.value?.id ? String(modelInfo.value.id) : undefined;
	await loadRelationOptions(personId);
	if (modelInfo.value?.id) {
		pageLoading.value = true;
		try {
			const {
				code,
				data,
				message: msg,
			} = await getGiftPersonDetail(modelInfo.value.id);
			if (code === '200') {
				formState.value = mapRelationToFormFields(data || {});
			} else {
				message.error(msg || '联系人加载失败');
			}
		} finally {
			pageLoading.value = false;
		}
	} else {
		formState.value = {};
	}
};

const loadProfile = async () => {
	if (!modelInfo.value?.id) return;
	await loadRelationOptions(String(modelInfo.value.id));
	pageLoading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonProfile(modelInfo.value.id);
		if (code === '200') {
			profile.value = data || {};
		} else {
			message.error(msg || '联系人详情加载失败');
		}
	} finally {
		pageLoading.value = false;
	}
};

const init = async () => {
	if (isProfileMode.value) {
		await loadProfile();
		return;
	}
	await loadForm();
};

const openEditFromProfile = () => {
	const personId = profile.value.person?.id || modelInfo.value.id;
	modelInfo.value = {
		open: true,
		mode: 'form',
		title: '编辑联系人',
		width: '460px',
		id: personId,
	};
};

watch(
	() => modelInfo.value.open,
	(open) => {
		if (open) {
			init();
		}
	},
);

watch(
	() => modelInfo.value.mode,
	() => {
		if (modelInfo.value.open) {
			init();
		}
	},
);

watch(
	() => formState.value.relationMode,
	(mode) => {
		if (mode !== RELATION_CUSTOM) {
			formState.value.customRelation = '';
		}
	},
);

const emit = defineEmits(['success']);
</script>

<style scoped lang="less">
.profile-head {
	text-align: center;

	h3 {
		margin: 12px 0 4px;
		font-size: 18px;
	}

	p {
		margin: 0;
		color: #667085;
	}
}

.profile-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 64px;
	height: 64px;
	border-radius: 10px;
	background: #65d944;
	color: #0b3b13;
	font-size: 24px;
	font-weight: 800;
}

.profile-metrics {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
	margin-top: 18px;

	div {
		padding: 14px;
		background: #f8fafc;
		border-radius: 7px;
	}

	span {
		display: block;
		margin-bottom: 8px;
		color: #667085;
		font-size: 12px;
	}
}

.amount-in {
	color: #389e0d;
	font-weight: 700;
}

.amount-out {
	color: #cf1322;
	font-weight: 700;
}

.profile-actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	width: 100%;
}
</style>
