<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '1000px'"
			:title="modelInfo?.title || 'Basic Modal'"
			okText="保存"
			:confirmLoading="loading"
			:maskClosable="false"
			:destroyOnClose="true"
			@ok="handleOk"
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
								show-time
								:format="dateFormatter"
								:getPopupContainer="
									(triggerNode: HTMLElement) => {
										return triggerNode.parentNode as HTMLElement;
									}
								"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="belongTo" label="属于">
							<a-select
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
import {
	rulesRef,
	labelCol,
	wrapperCol,
} from '@/views/finance/financeManager/config';
import { useUserInfo } from '@/composables/useUserInfo';
import { useDictInfo } from '@/composables/useDictInfo';
import { formatDayjs } from '@/utils/dayjs';
import type { ResponseBody } from '@/types/api';

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

const { getDictByType } = useDictInfo('pay_way,income_expense_type,is_valid');

const fromSourceList = computed(() => getDictByType('pay_way'));

const incomeAndExpensesList = computed(() =>
	getDictByType('income_expense_type'),
);

const validList = computed(() => getDictByType('is_valid'));

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();

const dateFormatter = 'YYYY-MM-DD HH:mm';

const loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

interface Props {
	modelInfo?: ModelInfo;
}

const props = defineProps<Props>();

const currentUser = useUserStore()?.getUserInfo;
const formState = ref<FinanceManagerData>({});

const createDefaultFormState = (): FinanceManagerData => ({
	isValid: '1',
	incomeAndExpenses: 'expense',
	infoDate: dayjs(),
	belongTo: String(currentUser?.id ?? 2),
});

const handleOk = () => {
	if (formRef.value) {
		loading.value = true;
		formRef.value
			.validateFields()
			.then(() => saveFinanceManager())
			.catch(() => (loading.value = false));
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

//保存财务信息
const saveFinanceManager = async () => {
	let api = addFinanceManger;
	if (formState.value.id) {
		api = editFinanceManger;
	}
	loading.value = true;
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error: ResponseBody) => {
			return error;
		})
		.finally(() => {
			loading.value = false;
		});
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const initDetail = async (modalData: ModelInfo | undefined) => {
	if (!modalData?.id) {
		formState.value = createDefaultFormState();
		return;
	}

	const {
		code,
		data,
		message: messageInfo,
	} = await getFinanceMangerDetail(String(modalData.id));

	if (code !== '200') {
		message.error(messageInfo || '查询失败！');
		return;
	}

	const detailData = data || {};
	formState.value = {
		...detailData,
		infoDate: detailData.infoDate ? formatDayjs(detailData.infoDate) : dayjs(),
	};
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			initDetail(modelInfo.value);
		}
	},
);

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped></style>
