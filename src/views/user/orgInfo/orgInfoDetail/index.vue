<template>
	<div>
		<a-modal
			:open="props.open"
			:width="
				props.modelInfo && props.modelInfo.width ?
					props.modelInfo.width
				:	'1000px'
			"
			:title="
				props.modelInfo && props.modelInfo.title ?
					props.modelInfo.title
				:	'Basic Modal'
			"
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
					>保存</a-button
				>
			</template>
			<a-form
				ref="formRef"
				name="OrgInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
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
								:placeholder="'请输入' + labelMap['status'].label"
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
import type { OrgInfoDetail } from './orgInfoDetailTs';
import { getOrgInfoDetail, addOrEditOrgInfo } from '@/views/user/orgInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<Record<string, { name: string; label: string }>>({
	orgCode: { name: 'orgCode', label: '机构编码' },
	orgName: { name: 'orgName', label: '机构名称' },
	orgShortName: { name: 'orgShortName', label: '机构简称' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '简介最多150字' },
	status: { name: 'status', label: '状态' },
});

const rulesRef = reactive({
	orgCode: [
		{
			required: true,
			message: '机构编码不能为空！',
		},
	],
	orgName: [
		{
			required: true,
			message: '机构名称不能为空！',
		},
	],
	orgShortName: [
		{
			required: true,
			message: '机构简称不能为空！',
		},
	],
	parentId: [
		{
			required: true,
			message: '父级机构id不能为空！',
		},
	],
	summary: [
		{
			required: true,
			message: '简介最多150字不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
});

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<OrgInfoDetail>({});

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
function saveOrgInfoManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditOrgInfo(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: any) => {
			let data = error?.response?.data;
			if (data) {
				message.error(data?.message || '保存失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

const onFinish = (values: any) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};

const init = async () => {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
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
