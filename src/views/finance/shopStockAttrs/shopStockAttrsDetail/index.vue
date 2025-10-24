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
				name="ShopStockAttrsForm"
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
							:name="labelMap['stockId'].name"
							:label="labelMap['stockId'].label"
						>
							<a-input
								v-model:value="formState.stockId"
								:placeholder="'请填写' + labelMap['stockId'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['attrCode'].name"
							:label="labelMap['attrCode'].label"
						>
							<a-input
								v-model:value="formState.attrCode"
								:placeholder="'请填写' + labelMap['attrCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['attrName'].name"
							:label="labelMap['attrName'].label"
						>
							<a-input
								v-model:value="formState.attrName"
								:placeholder="'请填写' + labelMap['attrName'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['attrValue'].name"
							:label="labelMap['attrValue'].label"
						>
							<a-input
								v-model:value="formState.attrValue"
								:placeholder="'请填写' + labelMap['attrValue'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['isValid'].name"
							:label="labelMap['isValid'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.isValid"
								:placeholder="'请输入' + labelMap['isValid'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="isValidList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['description'].name"
							:label="labelMap['description'].label"
						>
							<a-input
								v-model:value="formState.description"
								:placeholder="'请填写' + labelMap['description'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopStockAttrsDetail } from './shopStockAttrsDetailTs';
import {
	getShopStockAttrsDetail,
	addOrEditShopStockAttrs,
} from '@/views/finance/shopStockAttrs/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<Record<string, { name: string; label: string }>>({
	stockId: { name: 'stockId', label: '库存id' },
	attrCode: { name: 'attrCode', label: '商品属性编码' },
	attrName: { name: 'attrName', label: '商品属性名称' },
	attrValue: { name: 'attrValue', label: '商品属性值' },
	isValid: { name: 'isValid', label: '状态' },
	description: { name: 'description', label: '描述' },
});

const rulesRef = reactive({
	stockId: [
		{
			required: true,
			message: '库存id不能为空！',
		},
	],
	attrCode: [
		{
			required: true,
			message: '商品属性编码不能为空！',
		},
	],
	attrName: [
		{
			required: true,
			message: '商品属性名称不能为空！',
		},
	],
	attrValue: [
		{
			required: true,
			message: '商品属性值不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	description: [
		{
			required: true,
			message: '描述不能为空！',
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

let formState = ref<ShopStockAttrsDetail>({});

// 字典数据已通过 useDictInfo 自动加载
const isValidList = computed(() => getDictByType('is_valid'));

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopStockAttrsManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	emit('handleCancel', false);
};

//保存商店库存属性表信息
const saveShopStockAttrsManager = (): void => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditShopStockAttrs(method, formState.value)
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
};

const onFinish = (values: any): void => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any): void => {
	console.log('Failed:', errorInfo);
};

const init = async () => {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			const {
				code,
				data,
				message: messageInfo,
			} = await getShopStockAttrsDetail(props.modelInfo.id);
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
