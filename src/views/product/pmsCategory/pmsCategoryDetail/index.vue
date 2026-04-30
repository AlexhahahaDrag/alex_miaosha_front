<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '1000px'"
			:title="modelInfo?.title || 'Basic Modal'"
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
				name="PmsCategoryForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="name" label="分类名称">
							<a-input
								v-model:value="formState.name"
								placeholder="请填写分类名称"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="parentCid" label="父分类id">
							<a-input
								v-model:value="formState.parentCid"
								placeholder="请填写父分类id"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="catLevel" label="层级">
							<a-input
								v-model:value="formState.catLevel"
								placeholder="请填写层级"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="showStatus" label="是否显示[0-不显示，1显示]">
							<a-input
								v-model:value="formState.showStatus"
								placeholder="请填写是否显示[0-不显示，1显示]"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="sort" label="排序">
							<a-input
								v-model:value="formState.sort"
								placeholder="请填写排序"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="icon" label="图标地址">
							<a-input
								v-model:value="formState.icon"
								placeholder="请填写图标地址"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="productUnit" label="计量单位">
							<a-input
								v-model:value="formState.productUnit"
								placeholder="请填写计量单位"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="productCount" label="商品数量">
							<a-input
								v-model:value="formState.productCount"
								placeholder="请填写商品数量"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { PmsCategoryDetail } from './pmsCategoryDetailTs';
import {
	getPmsCategoryDetail,
	addPmsCategory,
	editPmsCategory,
} from '@/views/product/pmsCategory/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '分类名称不能为空！',
		},
	],
	parentCid: [
		{
			required: true,
			message: '父分类id不能为空！',
		},
	],
	catLevel: [
		{
			required: true,
			message: '层级不能为空！',
		},
	],
	showStatus: [
		{
			required: true,
			message: '是否显示[0-不显示，1显示]不能为空！',
		},
	],
	sort: [
		{
			required: true,
			message: '排序不能为空！',
		},
	],
	icon: [
		{
			required: true,
			message: '图标地址不能为空！',
		},
	],
	productUnit: [
		{
			required: true,
			message: '计量单位不能为空！',
		},
	],
	productCount: [
		{
			required: true,
			message: '商品数量不能为空！',
		},
	],
});

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

let formState = ref<PmsCategoryDetail>({});

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePmsCategoryManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

//保存商品三级分类信息
const savePmsCategoryManager = async () => {
	let api = addPmsCategory;
	if (formState.value.catId) {
		api = editPmsCategory;
	}
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPmsCategoryDetail(modelInfo.value.id);
		if (code === '200') {
			formState.value = data || {};
			modelConfig.confirmLoading = false;
		} else {
			formState.value = {};
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
		deep: true,
	},
);

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped></style>
