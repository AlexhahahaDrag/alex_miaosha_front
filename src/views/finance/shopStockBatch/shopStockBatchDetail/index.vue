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
				name="ShopStockBatchForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['batchCode'].name"
							:label="labelMap['batchCode'].label"
						>
							<a-input
								v-model:value="formState.batchCode"
								:placeholder="'请填写' + labelMap['batchCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['batchName'].name"
							:label="labelMap['batchName'].label"
						>
							<a-input
								v-model:value="formState.batchName"
								:placeholder="'请填写' + labelMap['batchName'].label"
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
								:placeholder="'请选择' + labelMap['isValid'].label"
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
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['cost'].name"
							:label="labelMap['cost'].label"
						>
							<a-input-number
								v-model:value="formState.cost"
								:placeholder="'请填写' + labelMap['cost'].label"
								:min="0"
								:precision="2"
								style="width: 100%"
							></a-input-number>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['travelExpense'].name"
							:label="labelMap['travelExpense'].label"
						>
							<a-input-number
								v-model:value="formState.travelExpense"
								:placeholder="'请填写' + labelMap['travelExpense'].label"
								:min="0"
								:precision="2"
								style="width: 100%"
							></a-input-number>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['purchaseDate'].name"
							:label="labelMap['purchaseDate'].label"
						>
							<a-date-picker
								v-model:value="formState.purchaseDate"
								:placeholder="'请选择' + labelMap['purchaseDate'].label"
								style="width: 100%"
								format="YYYY-MM-DD"
							></a-date-picker>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopStockBatchData } from '@/views/finance/shopStockBatch/config';
import { labelMap, rulesRef } from '@/views/finance/shopStockBatch/config';
import {
	getShopStockBatchDetail,
	addOrEditShopStockBatch,
} from '@/views/finance/shopStockBatch/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ResponseBody } from '@/types/api';

const { getDictByType } = useDictInfo('is_valid');

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();
const open = defineModel<boolean>('open', { default: false });

let formState = ref<ShopStockBatchData>({});

// 字典数据已通过 useDictInfo 自动加载
const isValidList = computed(() => getDictByType('is_valid'));

const emit = defineEmits(['success']);

const handleOk = async (): Promise<void> => {
	loading.value = true;
	if (formRef.value) {
		try {
			await formRef.value.validateFields();
			await saveShopStockBatchManager();
		} catch {
			loading.value = false;
		}
	}
};

const handleCancel = (): void => {
	open.value = false;
};

//保存商店库存批次表信息
const saveShopStockBatchManager = async (): Promise<void> => {
	const method = formState.value.id ? 'put' : 'post';
	try {
		const { code, message: msg } = await addOrEditShopStockBatch(
			method,
			formState.value,
		);
		if (code == '200') {
			message.success(msg || '保存成功！');
			open.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(msg || '保存失败！');
		}
	} catch (error: unknown) {
		const errorMsg = (error as ResponseBody)?.message || '保存失败！';
		message.error(errorMsg);
	} finally {
		loading.value = false;
	}
};

// 初始化数据
const init = async (): Promise<void> => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopStockBatchDetail(props.modelInfo.id);
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
</script>
<style lang="scss" scoped></style>
