<template>
	<div>
		<a-modal
			v-model:open="open"
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
				name="PmsShopWantProductForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="name" label="商品名称">
							<a-input
								v-model:value="formState.name"
								placeholder="请填写商品名称"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="shop" label="商铺">
							<a-input
								v-model:value="formState.shop"
								placeholder="请填写商铺"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="icons" label="标签">
							<a-input
								v-model:value="formState.icons"
								placeholder="请填写标签"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="source" label="来源">
							<a-select
								ref="select"
								v-model:value="formState.source"
								placeholder="请选择来源类型"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="sourceList"
								:allowClear="true"
							></a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { PmsShopWantProductDetail } from './pmsShopWantProductDetailTs';

import {
	getPmsShopWantProductDetail,
	addPmsShopWantProduct,
	editPmsShopWantProduct,
} from '@/views/product/pmsShopWantProduct/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ResponseBody } from '@/types/api';

const { getDictByType } = useDictInfo('is_valid');

const sourceList = computed(() => getDictByType('is_valid'));

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '商品名称不能为空！',
		},
	],
	source: [
		{
			required: true,
			message: '来源不能为空！',
		},
	],
});

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();
const open = defineModel<boolean>('open', { default: false });

let formState = ref<PmsShopWantProductDetail>({});

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePmsShopWantProductManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	open.value = false;
};

//保存商品想买网上商品信息信息
function savePmsShopWantProductManager() {
	let api = addPmsShopWantProduct;
	if (formState.value.id) {
		api = editPmsShopWantProduct;
	}
	api(formState.value)
		.then((res) => {
			if (res.String(code) === '200') {
				message.success((res && res.message) || '保存成功！');
				open.value = false;
		emit('success');
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: ResponseBody) => {
			message.error(error?.message || '保存失败！');
		})
		.finally(() => {
			loading.value = false;
		});
}

const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPmsShopWantProductDetail(props.modelInfo.id);
		if (String(code) === '200') {
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
	() => open.value,
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
