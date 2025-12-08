<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props.modelInfo?.width || '1000px'"
			:title="props.modelInfo?.title || 'Basic Modal'"
			@ok="handleOk"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
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
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['hideInMenu'].name"
							:label="labelMap['hideInMenu'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.hideInMenu"
								:placeholder="'请选择' + labelMap['hideInMenu'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="hideInMenuList"
								:allowClear="true"
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
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.status"
								:placeholder="'请选择' + labelMap['status'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								:allowClear="true"
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
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import type { MenuInfoData } from '../config';
import { labelMap, labelCol, wrapperCol, rulesRef } from './menuInfoDetailTs';
import {
	getMenuInfoDetail,
	addMenuInfo,
	editMenuInfo,
} from '@/views/user/menuInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('true_or_false,is_valid');

// 字典数据已通过 useDictInfo 自动加载
const hideInMenuList = computed(() => getDictByType('true_or_false'));
const statusList = computed(() => getDictByType('is_valid'));

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

let formState = ref<MenuInfoData>({});

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
	emit('handleCancel', false);
};

//保存菜单管理表信息
const saveMenuInfoManager = async () => {
	let api = addMenuInfo;
	if (formState.value.id) {
		api = editMenuInfo;
	}
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error) => {
			return error;
		})
		.finally(() => {
			loading.value = false;
		});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		emit('handleOk', false);
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

// 初始化数据
const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getMenuInfoDetail(props.modelInfo.id);
		if (code == '200') {
			formState.value = data || {};
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {};
	}
};

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

const emit = defineEmits(['handleOk', 'handleCancel']);
</script>
<style lang="scss" scoped></style>
