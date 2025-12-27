<template>
	<div>
		<a-modal
			:open="props.open"
			:width="props.modelInfo?.width || '1000px'"
			:title="props.modelInfo?.title || 'Basic Modal'"
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
				>
					保存
				</a-button>
			</template>
			<a-form
				ref="formRef"
				name="financeForm"
				class="ant-advanced-search-form"
				:model="formState"
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
              {{ formState.infoDate }}
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
								placeholder="请选择归属人"
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
import dayjs from 'dayjs';
import { useUserStore } from '@/store/modules/user/user';
import type { ModelInfo } from '@/views/common/config';
import type { FinanceManagerData } from '../config';
import {
	getFinanceMangerDetail,
	addFinanceManger,
	editFinanceManger,
} from '@/views/finance/financeManager/api';
import { rulesRef } from './config';
import {labelCol, wrapperCol} from '../config';
import { useUserInfo } from '@/composables/useUserInfo';
import { useDictInfo } from '@/composables/useDictInfo';
import { formatTime, formatDayjs } from '@/utils/dayjs';

const { getDictByType } = useDictInfo('pay_way,income_expense_type,is_valid');

const fromSourceList = computed(() => getDictByType('pay_way'));

const incomeAndExpensesList = computed(() =>
	getDictByType('income_expense_type'),
);

const validList = computed(() => getDictByType('is_valid'));

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();

const dateFormatter = 'YYYY-MM-DD HH:mm';
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

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveFinanceManager())
			.catch(() => (loading.value = false));
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存财务信息
const saveFinanceManager = async () => {
	let api = addFinanceManger;
	if (formState.value.id) {
		api = editFinanceManger;
	}
	loading.value = true;
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error: any) => {
			return error;
		})
		.finally(() => {
			loading.value = false;
		});
	if (code == '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
    emit('handleOk', false);
	} else {
		message.error(messageInfo || '保存失败！');
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
			formState.value = data || {};
			formState.value.infoDate = formState.value.infoDate ? dayjs(formState.value.infoDate) : dayjs();
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

const emit = defineEmits(['handleOk', 'handleCancel']);
</script>
<style lang="scss" scoped></style>
