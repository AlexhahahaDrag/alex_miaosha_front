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
			:maskClosable="false"
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
				name="financeForm"
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
						<a-form-item name="name" label="名称">
							<a-input
								v-model:value="formState.name"
								placeholder="请填写名称"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="typeCode" label="类别">
							<a-input
								v-model:value="formState.typeCode"
								placeholder="请填写类别"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="amount" label="金额">
							<a-input
								v-model:value="formState.amount"
								type="number"
								placeholder="请填写金额"
								prefix="￥"
								suffix="RMB"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="fromSource" label="支付方式">
							<a-select
								ref="select"
								v-model:value="formState.fromSource"
								placeholder="请选择来源"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="fromSourceList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="incomeAndExpenses" label="收支类型">
							<a-select
								ref="select"
								v-model:value="formState.incomeAndExpenses"
								placeholder="请选择收支类型"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="incomeAndExpensesList"
								:allowClear="true"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="isValid" label="状态">
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
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="infoDate" label="业务时间">
							<a-date-picker
								v-model:value="formState.infoDate"
								:format="dateFormatter"
								:getPopupContainer="
									(triggerNode: any) => {
										return triggerNode.parentNode;
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="belongTo" label="属于">
							<a-select
								ref="select"
								v-model:value="formState.belongTo"
								:field-names="{ label: 'nickName', value: 'id' }"
								:options="userList"
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { DictInfo } from '@/views/finance/dict/dict';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/modules/user/user';
import type { ModelInfo } from '@/views/common/config';
import type { FinanceManagerData } from '../../config';
import { getDictList } from '@/api/finance/dict/dictManager';
import {
	getFinanceMangerDetail,
	addOrEditFinanceManger,
} from '@/api/finance/financeManager';
import { rulesRef } from './config';
import { useUserInfo } from '@/composables/useUserInfo';

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();

const labelCol = ref<{ span: number }>({ span: 5 });
const wrapperCol = ref<{ span: number }>({ span: 19 });

const dateFormatter = 'YYYY-MM-DD';
let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}

const props = defineProps<Props>();

let formState = ref<FinanceManagerData>({});

let currentUser = useUserStore()?.getUserInfo;

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value.validateFields().then(() => saveFinanceManager());
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存财务信息
const saveFinanceManager = async () => {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	const { code, message: messageInfo } = await addOrEditFinanceManger(
		method,
		formState.value,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const onFinish = (values: any) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};

let fromSourceList = ref<DictInfo[]>([]);

let incomeAndExpensesList = ref<DictInfo[]>([]);

let validList = ref<DictInfo[]>([]);

const getDictInfoList = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getDictList('pay_way,income_expense_type,is_valid');
	if (code == '200') {
		fromSourceList.value = data.filter(
			(item: { belongTo: string }) => item.belongTo == 'pay_way',
		);
		incomeAndExpensesList.value = data.filter(
			(item: { belongTo: string }) => item.belongTo == 'income_expense_type',
		);
		validList.value = data.filter(
			(item: { belongTo: string }) => item.belongTo == 'is_valid',
		);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const initDetail = async (modalData: ModelInfo | undefined) => {
	if (modalData?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getFinanceMangerDetail(modalData.id);
		if (code == '200') {
			formState.value = data;
			formState.value.infoDate = dayjs(formState.value.infoDate);
			modelConfig.confirmLoading = false;
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		modelConfig.confirmLoading = false;
		formState.value = {
			isValid: '1',
			incomeAndExpenses: 'expense',
			infoDate: dayjs(),
			belongTo: currentUser ? currentUser.id + '' : '2',
		};
	}
};

const init = async () => {
	//获取字典信息
	getDictInfoList();
	//初始化数据
	initDetail(props.modelInfo);
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
