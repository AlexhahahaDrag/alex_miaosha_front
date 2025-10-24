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
				name="ShopStockForm"
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
							:name="labelMap['shopName'].name"
							:label="labelMap['shopName'].label"
						>
							<a-input
								v-model:value="formState.shopName"
								:placeholder="'请填写' + labelMap['shopName'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['shopCode'].name"
							:label="labelMap['shopCode'].label"
						>
							<a-input
								v-model:value="formState.shopCode"
								:placeholder="'请填写' + labelMap['shopCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['costAmount'].name"
							:label="labelMap['costAmount'].label"
						>
							<a-input
								v-model:value="formState.costAmount"
								:placeholder="'请填写' + labelMap['costAmount'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['saleAmount'].name"
							:label="labelMap['saleAmount'].label"
						>
							<a-input
								v-model:value="formState.saleAmount"
								:placeholder="'请填写' + labelMap['saleAmount'].label"
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
							:name="labelMap['saleDate'].name"
							:label="labelMap['saleDate'].label"
						>
							<a-date-picker
								v-model:value="formState.saleDate"
								:placeholder="'请填写' + labelMap['saleDate'].label"
							></a-date-picker>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['category'].name"
							:label="labelMap['category'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.category"
								:placeholder="'请输入' + labelMap['category'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="categoryList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['purchasePlace'].name"
							:label="labelMap['purchasePlace'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.purchasePlace"
								:placeholder="'请输入' + labelMap['purchasePlace'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="purchasePlaceList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['saleNum'].name"
							:label="labelMap['saleNum'].label"
						>
							<a-input
								v-model:value="formState.saleNum"
								:placeholder="'请填写' + labelMap['saleNum'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopStockDetail } from './shopStockDetailTs';
import {
	getShopStockDetail,
	addOrEditShopStock,
} from '@/views/finance/shopStock/api';
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
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	costAmount: { name: 'costAmount', label: '成本价' },
	saleAmount: { name: 'saleAmount', label: '零售价' },
	isValid: { name: 'isValid', label: '状态' },
	saleDate: { name: 'saleDate', label: '进货日期' },
	category: { name: 'category', label: '类别' },
	purchasePlace: { name: 'purchasePlace', label: '进货地点' },
	saleNum: { name: 'saleNum', label: '数量' },
});

const rulesRef = reactive({
	shopName: [
		{
			required: true,
			message: '商品名称不能为空！',
		},
	],
	shopCode: [
		{
			required: true,
			message: '商品编码不能为空！',
		},
	],
	costAmount: [
		{
			required: true,
			message: '成本价不能为空！',
		},
	],
	saleAmount: [
		{
			required: true,
			message: '零售价不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	saleDate: [
		{
			required: true,
			message: '进货日期不能为空！',
		},
	],
	category: [
		{
			required: true,
			message: '类别不能为空！',
		},
	],
	purchasePlace: [
		{
			required: true,
			message: '进货地点不能为空！',
		},
	],
	saleNum: [
		{
			required: true,
			message: '数量不能为空！',
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

let formState = ref<ShopStockDetail>({});

// 字典数据已通过 useDictInfo 自动加载
const isValidList = computed(() => getDictByType('is_valid'));
// 字典数据已通过 useDictInfo 自动加载
const categoryList = computed(() => getDictByType('shop_category'));
// 字典数据已通过 useDictInfo 自动加载
const purchasePlaceList = computed(() => getDictByType('stock_place'));

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopStockManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存商店库存表信息
function saveShopStockManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditShopStock(method, formState.value)
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

// 初始化数据
const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopStockDetail(props.modelInfo.id);
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
