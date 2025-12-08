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
				name="OrgInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgCode'].name"
							:label="labelMap['orgCode'].label"
						>
							<a-input
								v-model:value="formState.orgCode"
								:placeholder="'请填写' + labelMap['orgCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgName'].name"
							:label="labelMap['orgName'].label"
						>
							<a-input
								v-model:value="formState.orgName"
								:placeholder="'请填写' + labelMap['orgName'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgShortName'].name"
							:label="labelMap['orgShortName'].label"
						>
							<a-input
								v-model:value="formState.orgShortName"
								:placeholder="'请填写' + labelMap['orgShortName'].label"
							></a-input>
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
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { labelMap, labelCol, wrapperCol, rulesRef } from './orgInfoDetailTs';
import {
	getOrgInfoDetail,
	addOrgInfo,
	editOrgInfo,
} from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '../orgInfoListTs';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
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

let formState = ref<OrgInfoData>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveOrgInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存机构表信息
const saveOrgInfoManager = async () => {
	let api = addOrgInfo;
	if (formState.value.id) {
		api = editOrgInfo;
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
		formState.value = {};
		loading.value = false;
		emit('handleOk', false);
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getOrgInfoDetail(props.modelInfo.id);
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
</script>
<style lang="scss" scoped></style>
