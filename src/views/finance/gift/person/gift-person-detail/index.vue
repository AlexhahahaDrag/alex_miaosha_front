<template>
	<a-modal
		v-model:open="modelInfo.open"
		:width="modalWidth"
		:title="modelInfo.title || '联系人'"
		:destroy-on-close="true"
		@cancel="handleCancel"
	>
		<a-spin :spinning="pageLoading">
			<template v-if="isProfileMode">
				<div class="profile-head">
					<span class="profile-avatar">
						<img
							v-if="profileAvatarUrl"
							class="profile-avatar__img"
							:src="profileAvatarUrl"
							alt=""
						/>
						<template v-else>{{
							firstName(profile.person?.personName)
						}}</template>
					</span>
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
					<a-descriptions-item label="关系等级">
						<a-tag :color="getGradeColor(profile.person?.relationGrade)">
							{{ getGradeLabel(profile.person?.relationGrade) }}
						</a-tag>
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
			<a-form
				v-else
				ref="formRef"
				class="person-form"
				:model="formState"
				layout="vertical"
				data-testid="gift-person-form"
			>
				<section class="form-avatar-card">
					<a-upload
						:show-upload-list="false"
						accept="image/*"
						:custom-request="onAvatarUpload"
						:disabled="uploadingAvatar"
					>
						<div
							class="form-avatar-trigger"
							data-testid="gift-person-avatar-upload"
							role="button"
							aria-label="上传头像"
						>
							<img
								v-if="avatarPreviewUrl"
								class="form-avatar-img"
								:src="avatarPreviewUrl"
								alt=""
							/>
							<span v-else class="form-avatar-fallback">
								{{ firstName(formState.personName) }}
							</span>
							<span class="form-avatar-camera">
								<camera-outlined />
							</span>
							<span v-if="uploadingAvatar" class="form-avatar-loading">
								上传中…
							</span>
						</div>
					</a-upload>
					<p class="form-avatar-hint">更换头像</p>
					<a-button
						v-if="formState.avatar || avatarPreviewUrl"
						type="link"
						size="small"
						class="form-avatar-clear"
						data-testid="gift-person-avatar-clear"
						@click="clearAvatar"
					>
						清除头像
					</a-button>
				</section>
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
				<a-form-item label="关系等级" name="relationGrade">
					<a-select
						v-model:value="formState.relationGrade"
						placeholder="请选择关系等级"
					>
						<a-select-option value="CORE">⭐ 核心关系</a-select-option>
						<a-select-option value="IMPORTANT">🟢 重要关系</a-select-option>
						<a-select-option value="NORMAL">🔵 普通关系</a-select-option>
						<a-select-option value="WEAK">⚪ 弱关系</a-select-option>
					</a-select>
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
				<div style="display: flex; gap: 8px; justify-content: flex-end;">
					<a-button
						v-if="hasPermission('gift:edit')"
						type="primary"
						@click="openEditFromProfile"
					>
						编辑资料
					</a-button>
					<a-button @click="handleCancel">返回列表</a-button>
				</div>
			</template>
			<div v-else style="display: flex; gap: 8px; justify-content: flex-end;">
				<a-button @click="handleCancel">取消</a-button>
				<a-button
					type="primary"
					:loading="loading"
					data-testid="gift-person-save"
					@click="handleOk"
				>
					保存
				</a-button>
			</div>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance, UploadProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { CameraOutlined } from '@ant-design/icons-vue';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { usePermission } from '@/composables/usePermission';
import { addFileManager, getFileDetail } from '@/views/common/api/file';
import type { FileInfo } from '@/views/common/my-upload/config';
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
	personAvatarSrc,
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
const uploadingAvatar = ref(false);
const avatarPreviewUrl = ref('');
const formState = ref<GiftPersonFormState>({});
const profile = ref<GiftPersonProfile>({});

const presetRelationLabels = computed(() =>
	presetOptions.value.map((item) => item.name),
);

const isProfileMode = computed(() => modelInfo.value.mode === 'profile');
const modalWidth = computed(() => modelInfo.value.width || '520px');

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const profileAvatarUrl = computed(() => personAvatarSrc(profile.value.person));

const syncAvatarPreviewFromPerson = async (person?: GiftPersonInfo | null) => {
	avatarPreviewUrl.value = personAvatarSrc(person);
	if (person?.avatar != null && person.avatar !== '') {
		formState.value.avatar = String(person.avatar);
	}
	if (
		!avatarPreviewUrl.value &&
		person?.avatar != null &&
		person.avatar !== ''
	) {
		const { code, data } = await getFileDetail(String(person.avatar));
		if (code === '200' && data) {
			const file = data as FileInfo;
			avatarPreviewUrl.value = String(
				file.preThumbnailUrl || file.preUrl || file.url || '',
			);
			formState.value.fileInfoVo = {
				id: String(person.avatar),
				preUrl: file.preUrl,
				preThumbnailUrl: file.preThumbnailUrl,
				url: file.url,
				fileName: file.fileName,
			};
		}
	}
};

const resetAvatarPreview = () => {
	formState.value.avatar = undefined;
	formState.value.fileInfoVo = undefined;
	avatarPreviewUrl.value = '';
};

const clearAvatar = () => {
	resetAvatarPreview();
};

const onAvatarUpload: UploadProps['customRequest'] = async (options) => {
	const rawFile = options.file as File;
	if (!rawFile) {
		options.onError?.(new Error('empty file'));
		return;
	}
	uploadingAvatar.value = true;
	try {
		const formData = new FormData();
		formData.append('file', rawFile);
		const {
			code,
			data,
			message: msg,
		} = await addFileManager(formData, { type: 'common' });
		if (code !== '200' || data?.id == null) {
			message.error(msg || '上传失败');
			options.onError?.(new Error(msg || 'upload failed'));
			return;
		}
		const file = data as FileInfo;
		const fileId = String(file.id);
		let previewUrl = String(
			file.preThumbnailUrl || file.preUrl || file.url || '',
		);
		if (!previewUrl) {
			const detailRes = await getFileDetail(fileId);
			if (detailRes.code === '200' && detailRes.data) {
				const detail = detailRes.data as FileInfo;
				previewUrl = String(
					detail.preThumbnailUrl || detail.preUrl || detail.url || '',
				);
				formState.value.fileInfoVo = {
					id: fileId,
					preUrl: detail.preUrl,
					preThumbnailUrl: detail.preThumbnailUrl,
					url: detail.url,
					fileName: detail.fileName,
				};
			}
		} else {
			formState.value.fileInfoVo = {
				id: fileId,
				preUrl: file.preUrl,
				preThumbnailUrl: file.preThumbnailUrl,
				url: file.url,
				fileName: file.fileName,
			};
		}
		formState.value.avatar = fileId;
		if (previewUrl) {
			avatarPreviewUrl.value = previewUrl;
		}
		message.success('头像已上传');
		options.onSuccess?.(data);
	} catch {
		message.error('上传失败');
		options.onError?.(new Error('upload failed'));
	} finally {
		uploadingAvatar.value = false;
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const toSavePayload = (): GiftPersonInfo => {
	const {
		relationMode: _relationMode,
		customRelation: _customRelation,
		relationOptionId: _relationOptionId,
		fileInfoVo: _fileInfoVo,
		...rest
	} = formState.value;
	return {
		...rest,
		avatar:
			formState.value.avatar != null && formState.value.avatar !== '' ?
				String(formState.value.avatar)
			:	null,
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
		avatarPreviewUrl.value = '';
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
				const person = data || {};
				formState.value = mapRelationToFormFields(person);
				await syncAvatarPreviewFromPerson(person);
			} else {
				message.error(msg || '联系人加载失败');
			}
		} finally {
			pageLoading.value = false;
		}
	} else {
		formState.value = {};
		resetAvatarPreview();
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

const getGradeLabel = (grade?: string) => {
	switch (grade) {
		case 'CORE': return '⭐ 核心关系';
		case 'IMPORTANT': return '🟢 重要关系';
		case 'NORMAL': return '🔵 普通关系';
		case 'WEAK': return '弱关系';
		default: return '普通关系';
	}
};

const getGradeColor = (grade?: string) => {
	switch (grade) {
		case 'CORE': return 'gold';
		case 'IMPORTANT': return 'green';
		case 'NORMAL': return 'blue';
		case 'WEAK': return 'default';
		default: return 'blue';
	}
};

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
	width: 88px;
	height: 88px;
	border-radius: 50%;
	overflow: hidden;
	background: #eff6ff;
	color: #2563eb;
	font-size: 32px;
	font-weight: 800;
}

.profile-avatar__img {
	width: 100%;
	height: 100%;
	object-fit: cover;
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

.form-avatar-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 20px;
	padding: 8px 0 4px;
}

.form-avatar-trigger {
	position: relative;
	width: 88px;
	height: 88px;
	border-radius: 50%;
	overflow: hidden;
	background: #eff6ff;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: transform 0.15s ease;

	&:hover {
		transform: scale(1.02);
	}

	&:active {
		transform: scale(0.98);
	}
}

.form-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.form-avatar-fallback {
	color: #2563eb;
	font-size: 32px;
	font-weight: 800;
	line-height: 1;
}

.form-avatar-camera {
	position: absolute;
	right: 4px;
	bottom: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 999px;
	background: rgba(15, 23, 42, 0.72);
	color: #fff;
	font-size: 14px;
}

.form-avatar-loading {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.72);
	color: #2563eb;
	font-size: 12px;
}

.form-avatar-hint {
	margin: 10px 0 0;
	color: #64748b;
	font-size: 13px;
}

.form-avatar-clear {
	height: auto;
	padding: 0 8px;
	margin-top: 4px;
	color: #94a3b8;
	font-size: 12px;

	&:hover {
		color: #64748b;
	}
}
</style>
