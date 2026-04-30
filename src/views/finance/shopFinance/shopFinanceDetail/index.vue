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
				name="ShopFinanceForm"
				class="ant-advanced-search-form"
				:model="formState"
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
							:name="labelMap['incomeAndExpenses'].name"
							:label="labelMap['incomeAndExpenses'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.incomeAndExpenses"
								placeholder="请选择有效状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="incomeAndExpenseList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['payWay'].name"
							:label="labelMap['payWay'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.isValid"
								placeholder="请选择有效状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="payWayList"
								:allowClear="true"
							>
							</a-select>
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
								placeholder="请选择有效状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="validList"
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
								:format="dateFormatter"
								:getPopupContainer="
									(triggerNode: any) => {
										return triggerNode.parentNode;
									}
								"
							/>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { ShopFinanceData } from '@/views/finance/shopFinance/config';
import {
	getShopFinanceDetail,
	addShopFinance,
	editShopFinance,
} from '@/views/finance/shopFinance/api';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';
import { defaultDateFormat } from '@/utils/dayjs';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const validList = computed(() => getDictByType('is_valid'));
// 字典数据已通过 useDictInfo 自动加载
const payWayList = computed(() => getDictByType('pay_way'));
// 字典数据已通过 useDictInfo 自动加载
const incomeAndExpenseList = computed(() =>
	getDictByType('income_expense_type'),
);

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const dateFormatter = defaultDateFormat;

const labelMap = ref<Record<string, { name: string; label: string }>>({
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	saleAmount: { name: 'saleAmount', label: '售价' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	incomeAndExpenses: { name: 'incomeAndExpenses', label: '收支类型' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleNum: { name: 'saleNum', label: '销售件数' },
});

const rulesRef = reactive({
	saleAmount: [
		{
			required: true,
			message: '售价不能为空！',
		},
		{ pattern: /^\d+(\.\d+)?$/, message: '请输入正确的价格' },
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
	incomeAndExpenses: [
		{
			required: true,
			message: '收支类型不能为空！',
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
			message: '销售件数不能为空！',
		},
		{ pattern: /^\d+(\.\d+)?$/, message: '请输入正确的数量' },
	],
});

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

let formState = ref<ShopFinanceData>({});

const emit = defineEmits(['success']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopFinanceManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

//保存商店财务表信息
async function saveShopFinanceManager() {
	let api = addShopFinance;
	if (formState.value?.id) {
		api = editShopFinance;
	}
	try {
		const { code, message: messageInfo } = await api(formState.value || {});
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
		} else {
			message.error(messageInfo || '保存失败！');
		}
		formState.value = {};
	} catch (error: unknown) {
		const responseData = (
			error as { response?: { data?: { message?: string } } }
		)?.response?.data;
		if (responseData) {
			message.error(responseData.message || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
}

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopFinanceDetail(modelInfo.value.id);
		if (code === '200') {
			formState.value = data || {};
			formState.value.saleDate = dayjs(formState.value.saleDate);
			modelConfig.confirmLoading = false;
		} else {
			formState.value = { isValid: '1', saleDate: dayjs() };
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {
			isValid: '1',
			saleDate: dayjs(),
		};
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
</script>
<style lang="scss" scoped></style>
