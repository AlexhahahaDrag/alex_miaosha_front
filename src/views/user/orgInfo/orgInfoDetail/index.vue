<template>
	<div>
		<base-rbac-drawer
			:open="!!modelInfo.open"
			:width="modelInfo?.width || 640"
			:title="modelInfo?.title || '机构信息'"
			:loading="loading || modelConfig.confirmLoading"
			:destroy-on-close="modelConfig.destroyOnClose"
			@update:open="(open) => (modelInfo.open = open)"
			@save="handleOk"
			@cancel="handleCancel"
		>
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
							<a-tree-select
								v-model:value="formState.parentId"
								:tree-data="treeData"
								:placeholder="'请选择' + labelMap['parentId'].label"
								:field-names="{
									children: 'children',
									label: 'orgName',
									value: 'id',
								}"
								tree-default-expand-all
								allow-clear
								show-search
								tree-node-filter-prop="orgName"
							>
							</a-tree-select>
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
								:maxlength="150"
								show-count
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-radio-group v-model:value="formState.status">
								<a-radio
									v-for="item in statusList"
									:key="item.typeCode"
									:value="item.typeCode"
								>
									{{ item.typeName }}
								</a-radio>
							</a-radio-group>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</base-rbac-drawer>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import {
	labelMap,
	labelCol,
	wrapperCol,
	rulesRef,
} from '@/views/user/orgInfo/config';
import {
	getOrgInfoDetail,
	addOrgInfo,
	editOrgInfo,
} from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { TreeDataItem } from 'ant-design-vue/es/tree';

defineProps<{
	treeData?: TreeDataItem[];
}>();

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = reactive({
	confirmLoading: true,
	destroyOnClose: true,
});

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});

const formState = ref<OrgInfoData>({});

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
	modelInfo.value.open = false;
};

//保存机构表信息
const saveOrgInfoManager = async () => {
	try {
		const api = formState.value.id ? editOrgInfo : addOrgInfo;
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			formState.value = {};
			modelInfo.value.open = false;
			emit('success');
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
		} = await getOrgInfoDetail(modelInfo.value.id);
		if (code === '200') {
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
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	},
);

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped></style>
