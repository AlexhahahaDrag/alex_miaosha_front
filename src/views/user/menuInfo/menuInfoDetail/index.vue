<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '1000px'"
			:title="modelInfo?.title || 'Basic Modal'"
			ok-text="保存"
			:confirm-loading="modelConfig.confirmLoading"
			:destroy-on-close="modelConfig.destroyOnClose"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<template #footer>
				<a-button key="back" @click="handleCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					@click="handleOk"
					>保存
				</a-button>
			</template>
			<a-form
				ref="formRef"
				name="MenuInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['name'].name"
							:label="labelMap['name'].label"
						>
							<a-input
								v-model:value="formState.name"
								:placeholder="'请填写' + labelMap['name'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['path'].name"
							:label="labelMap['path'].label"
						>
							<a-input
								v-model:value="formState.path"
								:placeholder="'请填写' + labelMap['path'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['title'].name"
							:label="labelMap['title'].label"
						>
							<a-input
								v-model:value="formState.title"
								:placeholder="'请填写' + labelMap['title'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['component'].name"
							:label="labelMap['component'].label"
						>
							<a-input
								v-model:value="formState.component"
								:placeholder="'请填写' + labelMap['component'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['redirect'].name"
							:label="labelMap['redirect'].label"
						>
							<a-input
								v-model:value="formState.redirect"
								:placeholder="'请填写' + labelMap['redirect'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['icon'].name"
							:label="labelMap['icon'].label"
						>
							<a-input
								v-model:value="formState.icon"
								:placeholder="'请填写' + labelMap['icon'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['permissionCode'].name"
							:label="labelMap['permissionCode'].label"
						>
							<a-input
								v-model:value="formState.permissionCode"
								:placeholder="'请填写' + labelMap['permissionCode'].label + '，如 user:list'"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['hideInMenu'].name"
							:label="labelMap['hideInMenu'].label"
						>
							<a-select
								v-model:value="formState.hideInMenu"
								:placeholder="'请选择' + labelMap['hideInMenu'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="hideInMenuList"
								allow-clear
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['showInHome'].name"
							:label="labelMap['showInHome'].label"
						>
							<a-select
								v-model:value="formState.showInHome"
								:placeholder="'请选择' + labelMap['showInHome'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="hideInMenuList"
								allow-clear
							>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['parentId'].name"
							:label="labelMap['parentId'].label"
						>
							<a-input
								v-model:value="formState.parentId"
								:placeholder="'请填写' + labelMap['parentId'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['summary'].name"
							:label="labelMap['summary'].label"
						>
							<a-input
								v-model:value="formState.summary"
								:placeholder="'请填写' + labelMap['summary'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-select
								v-model:value="formState.status"
								:placeholder="'请选择' + labelMap['status'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								allow-clear
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orderBy'].name"
							:label="labelMap['orderBy'].label"
						>
							<a-input
								v-model:value="formState.orderBy"
								:placeholder="'请填写' + labelMap['orderBy'].label"
								allow-clear
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
// 1. Imports
import { ref, reactive, computed, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	getMenuInfoDetail,
	addMenuInfo,
	editMenuInfo,
} from '@/views/user/menuInfo/api';
import { labelMap, labelCol, wrapperCol } from '@/views/user/menuInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ModelInfo } from '@/views/common/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 3. Hooks
const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const { getDictByType } = useDictInfo('true_or_false,is_valid');

// 4. State
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const formState = ref<MenuInfoData>({});
const rulesRef = reactive({});
const modelConfig = reactive({
	confirmLoading: true,
	destroyOnClose: true,
});

const hideInMenuList = computed(() => getDictByType('true_or_false'));
const statusList = computed(() => getDictByType('is_valid'));

// 5. Actions
const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveMenuInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveMenuInfoManager = async () => {
	try {
		const api = formState.value.id ? editMenuInfo : addMenuInfo;
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getMenuInfoDetail(modelInfo.value.id);
		if (code === '200') {
			formState.value = data || {};
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {
			parentId: String(modelInfo.value.parentId ?? '0'),
			status: '1',
			hideInMenu: '0',
			showInHome: '0',
		};
	}
};

// 7. Watchers
watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	}
);

// 8. Emits
const emit = defineEmits(['success']);
</script>

<style lang="scss" scoped></style>
