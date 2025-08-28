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
				name="MenuInfoForm"
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
								:placeholder="'请输入' + labelMap['hideInMenu'].label"
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
								:placeholder="'请输入' + labelMap['status'].label"
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
import type { MenuInfoDetail } from './menuInfoDetailTs';
import {
	getMenuInfoDetail,
	addOrEditMenuInfo,
} from '@/api/user/menuInfo/menuInfoTs';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { DictInfo } from '@/views/finance/dict/dict';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { ModelInfo } from '@/views/common/config/index';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
	name: { name: 'name', label: '菜单名称' },
	path: { name: 'path', label: '菜单路径' },
	title: { name: 'title', label: '菜单标题' },
	component: { name: 'component', label: '组件' },
	redirect: { name: 'redirect', label: '跳转' },
	icon: { name: 'icon', label: '菜单图标' },
	hideInMenu: { name: 'hideInMenu', label: '是否隐藏菜单' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '备注' },
	status: { name: 'status', label: '状态' },
	orderBy: { name: 'orderBy', label: '排序' },
});

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '菜单名称不能为空！',
		},
	],
	path: [
		{
			required: true,
			message: '菜单路径不能为空！',
		},
	],
	title: [
		{
			required: true,
			message: '菜单标题不能为空！',
		},
	],
	component: [
		{
			required: true,
			message: '组件不能为空！',
		},
	],
	redirect: [
		{
			required: true,
			message: '跳转不能为空！',
		},
	],
	icon: [
		{
			required: true,
			message: '菜单图标不能为空！',
		},
	],
	hideInMenu: [
		{
			required: true,
			message: '是否隐藏菜单不能为空！',
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
			message: '备注不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	orderBy: [
		{
			required: true,
			message: '排序不能为空！',
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

let formState = ref<MenuInfoDetail>({});

let hideInMenuList = ref<DictInfo[]>([]);
let statusList = ref<DictInfo[]>([]);

const getDictInfoList = () => {
	getDictList('true_or_false,is_valid').then((res) => {
		if (res.code == '200') {
			hideInMenuList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'true_or_false',
			);
			statusList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

const emit = defineEmits(['handleOk', 'handleCancel']);

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
function saveMenuInfoManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditMenuInfo(method, formState.value)
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

function init() {
	getDictInfoList();
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getMenuInfoDetail(props.modelInfo.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						modelConfig.confirmLoading = false;
					} else {
						message.error((res && res.message) || '查询失败！');
					}
				})
				.catch((error: any) => {
					let data = error?.response?.data;
					if (data) {
						message.error(data?.message || '查询失败！');
					}
				});
		} else {
			modelConfig.confirmLoading = false;
			formState.value = {};
		}
	}
}

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

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
