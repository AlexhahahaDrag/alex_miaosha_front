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
				name="ShopOrderForm"
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
							:name="labelMap['saleOrderCode'].name"
							:label="labelMap['saleOrderCode'].label"
						>
							<a-input
								v-model:value="formState.saleOrderCode"
								:placeholder="'请填写' + labelMap['saleOrderCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['saleOrderName'].name"
							:label="labelMap['saleOrderName'].label"
						>
							<a-input
								v-model:value="formState.saleOrderName"
								:placeholder="'请填写' + labelMap['saleOrderName'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
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
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['saleDate'].name"
							:label="labelMap['saleDate'].label"
						>
							<a-input
								v-model:value="formState.saleDate"
								:placeholder="'请填写' + labelMap['saleDate'].label"
							></a-input>
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
							:name="labelMap['saleCount'].name"
							:label="labelMap['saleCount'].label"
						>
							<a-input
								v-model:value="formState.saleCount"
								:placeholder="'请填写' + labelMap['saleCount'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopOrderDetail } from './shopOrderDetailTs';
import {
	getShopOrderDetail,
	addOrEditShopOrder,
} from '@/api/finance/shopOrder/shopOrderTs';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { dictInfo } from '@/views/finance/dict/dict';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { ModelInfo } from '../shopOrderListTs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
	saleOrderCode: { name: 'saleOrderCode', label: '订单编码' },
	saleOrderName: { name: 'saleOrderName', label: '订单名称' },
	saleAmount: { name: 'saleAmount', label: '总销售金额' },
	isValid: { name: 'isValid', label: '状态' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	description: { name: 'description', label: '描述' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleCount: { name: 'saleCount', label: '销售数量' },
});

const rulesRef = reactive({
	saleOrderCode: [
		{
			required: true,
			message: '订单编码不能为空！',
		},
	],
	saleOrderName: [
		{
			required: true,
			message: '订单名称不能为空！',
		},
	],
	saleAmount: [
		{
			required: true,
			message: '总销售金额不能为空！',
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
			message: '销售日期不能为空！',
		},
	],
	description: [
		{
			required: true,
			message: '描述不能为空！',
		},
	],
	payWay: [
		{
			required: true,
			message: '支付方式不能为空！',
		},
	],
	saleCount: [
		{
			required: true,
			message: '销售数量不能为空！',
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

let formState = ref<ShopOrderDetail>({});

let isValidList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
	getDictList('is_valid').then((res) => {
		if (res.code == '200') {
			isValidList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopOrderManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	emit('handleCancel', false);
};

//保存商店订单表信息
const saveShopOrderManager = (): void => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditShopOrder(method, formState.value)
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

const init = (): void => {
	getDictInfoList();
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getShopOrderDetail(props.modelInfo.id)
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

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
