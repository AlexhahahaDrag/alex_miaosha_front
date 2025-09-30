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
				name="ShopCartForm"
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
							:name="labelMap['shopId'].name"
							:label="labelMap['shopId'].label"
						>
							<a-input
								v-model:value="formState.shopId"
								:placeholder="'请填写' + labelMap['shopId'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['userId'].name"
							:label="labelMap['userId'].label"
						>
							<a-input
								v-model:value="formState.userId"
								:placeholder="'请填写' + labelMap['userId'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['customerId'].name"
							:label="labelMap['customerId'].label"
						>
							<a-input
								v-model:value="formState.customerId"
								:placeholder="'请填写' + labelMap['customerId'].label"
							></a-input>
						</a-form-item>
					</a-col>
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
import type { ShopCartDetail } from './shopCartDetailTs';
import {
	getShopCartDetail,
	addOrEditShopCart,
} from '@/views/finance/shopCart/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
	shopId: { name: 'shopId', label: '商品id' },
	userId: { name: 'userId', label: '人员id' },
	customerId: { name: 'customerId', label: '客户id' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleNum: { name: 'saleNum', label: '数量' },
});

const rulesRef = reactive({
	shopId: [
		{
			required: true,
			message: '商品id不能为空！',
		},
	],
	userId: [
		{
			required: true,
			message: '人员id不能为空！',
		},
	],
	customerId: [
		{
			required: true,
			message: '客户id不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '是否有效不能为空！',
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

let formState = ref<ShopCartDetail>({});

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopCartManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = (): void => {
	emit('handleCancel', false);
};

//保存购物车表信息
const saveShopCartManager = (): void => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditShopCart(method, formState.value)
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
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getShopCartDetail(props.modelInfo.id)
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
