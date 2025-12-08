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
				name="ShopOrderDetailForm"
				class="ant-advanced-search-form"
				:model="formState"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orderId'].name"
							:label="labelMap['orderId'].label"
						>
							<a-input
								v-model:value="formState.orderId"
								:placeholder="'请填写' + labelMap['orderId'].label"
							></a-input>
						</a-form-item>
					</a-col>
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
				</a-row>
				<a-row :gutter="24">
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
							<a-input
								v-model:value="formState.isValid"
								:placeholder="'请填写' + labelMap['isValid'].label"
							></a-input>
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
							:name="labelMap['payWay'].name"
							:label="labelMap['payWay'].label"
						>
							<a-input
								v-model:value="formState.payWay"
								:placeholder="'请填写' + labelMap['payWay'].label"
							></a-input>
						</a-form-item>
					</a-col>
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
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['shopStockId'].name"
							:label="labelMap['shopStockId'].label"
						>
							<a-input
								v-model:value="formState.shopStockId"
								:placeholder="'请填写' + labelMap['shopStockId'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopOrderDetailData } from '../config';
import {
	getShopOrderDetailDetail,
	addOrEditShopOrderDetail,
} from '@/views/finance/shopOrderDetail/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<Record<string, { name: string; label: string }>>({
	orderId: { name: 'orderId', label: '订单id' },
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	saleAmount: { name: 'saleAmount', label: '售价' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleNum: { name: 'saleNum', label: '个数' },
	shopStockId: { name: 'shopStockId', label: '商品库存id' },
});

const rulesRef = reactive({
	orderId: [
		{
			required: true,
			message: '订单id不能为空！',
		},
	],
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
	saleAmount: [
		{
			required: true,
			message: '售价不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '是否有效不能为空！',
		},
	],
	saleDate: [
		{
			required: true,
			message: '销售日期不能为空！',
		},
	],
	payWay: [
		{
			required: true,
			message: '支付方式不能为空！',
		},
	],
	saleNum: [
		{
			required: true,
			message: '个数不能为空！',
		},
	],
	shopStockId: [
		{
			required: true,
			message: '商品库存id不能为空！',
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

let formState = ref<ShopOrderDetailData>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopOrderDetailManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	emit('handleCancel', false);
};

//保存商店订单明细表信息
const saveShopOrderDetailManager = async (): Promise<void> => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	const { code, message: messageInfo } = await addOrEditShopOrderDetail(
		method,
		formState.value,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		emit('handleOk', false);
	} else {
		message.error(messageInfo || '保存失败！');
		formState.value = {};
	}
};

// 初始化数据
const init = async () => {
	if (props.modelInfo?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopOrderDetailDetail(props.modelInfo.id);
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
