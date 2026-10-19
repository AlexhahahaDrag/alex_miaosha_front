<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商店财务账单凭证' : '配置商店财务账单')"
		:width="560"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存账单"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：商店账单电子凭证卡 -->
		<div v-if="isReadonly" class="shop-finance-voucher">
			<div
				class="voucher-hero"
				:class="formState.incomeAndExpenses === 'income' ? 'is-income' : 'is-expense'"
			>
				<div class="voucher-top">
					<span class="type-pill">
						{{ formState.incomeAndExpenses === 'income' ? '营业收入' : '经营支出' }}
					</span>
					<span
						class="valid-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '有效入账' : '已失效' }}
					</span>
				</div>
				<div class="voucher-amount">
					<span class="currency">¥</span>
					<strong>{{ Number(formState.saleAmount ?? 0).toFixed(2) }}</strong>
				</div>
				<div class="voucher-title">
					{{ formState.shopName || '未命名商品' }}
					<span v-if="formState.shopCode" class="code-tag">
						#{{ formState.shopCode }}
					</span>
				</div>
			</div>

			<div class="voucher-meta-grid">
				<div class="meta-item">
					<span class="meta-label">销售件数</span>
					<strong class="meta-value">{{ formState.saleNum ?? 0 }} 件</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">支付方式</span>
					<strong class="meta-value">{{ payWayLabel }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">销售日期</span>
					<strong class="meta-value">{{ saleDateText }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">商品编码</span>
					<strong class="meta-value mono">{{ formState.shopCode || '--' }}</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="ShopFinanceForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.shopName.name"
						:label="labelMap.shopName.label"
					>
						<a-input
							id="shop-finance-shop-name"
							v-model:value="formState.shopName"
							name="shopName"
							placeholder="请输入商品名称"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.shopCode.name"
						:label="labelMap.shopCode.label"
					>
						<a-input
							id="shop-finance-shop-code"
							v-model:value="formState.shopCode"
							name="shopCode"
							placeholder="请输入商品编码"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleAmount.name"
						:label="labelMap.saleAmount.label"
					>
						<a-input-number
							id="shop-finance-sale-amount"
							v-model:value="formState.saleAmount"
							name="saleAmount"
							:min="0"
							:precision="2"
							style="width: 100%"
							placeholder="请输入销售金额"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleNum.name"
						:label="labelMap.saleNum.label"
					>
						<a-input-number
							id="shop-finance-sale-num"
							v-model:value="formState.saleNum"
							name="saleNum"
							:min="1"
							style="width: 100%"
							placeholder="请输入销售件数"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.incomeAndExpenses.name"
						:label="labelMap.incomeAndExpenses.label"
					>
						<a-select
							id="shop-finance-income-expense"
							v-model:value="formState.incomeAndExpenses"
							placeholder="请选择收支类型"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="incomeAndExpenseList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.payWay.name"
						:label="labelMap.payWay.label"
					>
						<a-select
							id="shop-finance-pay-way"
							v-model:value="formState.payWay"
							placeholder="请选择支付方式"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="payWayList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.isValid.name"
						:label="labelMap.isValid.label"
					>
						<a-select
							id="shop-finance-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="validList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleDate.name"
						:label="labelMap.saleDate.label"
					>
						<a-date-picker
							id="shop-finance-sale-date"
							v-model:value="formState.saleDate"
							name="saleDate"
							style="width: 100%"
							:format="defaultDateFormat"
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	DEFAULT_INCOME_EXPENSE_OPTIONS,
	DEFAULT_PAY_WAY_OPTIONS,
	DEFAULT_VALID_OPTIONS,
	type ShopFinanceData,
} from '@/views/finance/shopFinance/config';
import {
	getShopFinanceDetail,
	addShopFinance,
	editShopFinance,
} from '@/views/finance/shopFinance/api';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	defaultDateFormat,
	formatDate,
	formatDayjs,
	nowDayjs,
} from '@/utils/dayjs';

const props = withDefaults(
	defineProps<{
		isReadonly?: boolean;
	}>(),
	{
		isReadonly: false,
	},
);

const { getDictByType } = useDictInfo(
	'is_valid',
	'pay_way',
	'income_expense_type',
);

const validList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
});

const payWayList = computed(() => {
	const list = getDictByType('pay_way');
	return list?.length ? list : DEFAULT_PAY_WAY_OPTIONS;
});

const incomeAndExpenseList = computed(() => {
	const list = getDictByType('income_expense_type');
	return list?.length ? list : DEFAULT_INCOME_EXPENSE_OPTIONS;
});

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const openModel = defineModel<boolean>('open', { default: false });

const drawerOpen = computed({
	get: () => Boolean(modelInfo.value?.open ?? openModel.value),
	set: (val: boolean) => {
		if (modelInfo.value) {
			modelInfo.value.open = val;
		}
		openModel.value = val;
	},
});

const emit = defineEmits(['success']);

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const formState = ref<ShopFinanceData>({});

const labelMap = {
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	saleAmount: { name: 'saleAmount', label: '销售金额 (元)' },
	isValid: { name: 'isValid', label: '有效状态' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	incomeAndExpenses: { name: 'incomeAndExpenses', label: '收支类型' },
	payWay: { name: 'payWay', label: '支付方式' },
	saleNum: { name: 'saleNum', label: '销售件数' },
} as const;

const rulesRef = reactive({
	saleAmount: [{ required: true, message: '销售金额不能为空！' }],
	isValid: [{ required: true, message: '有效状态不能为空！' }],
	saleDate: [{ required: true, message: '销售日期不能为空！' }],
	incomeAndExpenses: [{ required: true, message: '收支类型不能为空！' }],
	payWay: [{ required: true, message: '支付方式不能为空！' }],
	saleNum: [{ required: true, message: '销售件数不能为空！' }],
});

const payWayLabel = computed(() => {
	const code = formState.value.payWay;
	if (!code) return '--';
	const matched = payWayList.value.find(
		(item) => String(item.typeCode) === String(code),
	);
	return matched?.typeName || code;
});

const saleDateText = computed(() => {
	if (!formState.value.saleDate) return '--';
	return formatDate(formState.value.saleDate) || '--';
});

const handleOk = () => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopFinanceManager())
			.catch(() => {
				loading.value = false;
			});
	} else {
		loading.value = false;
	}
};

const handleCancel = () => {
	drawerOpen.value = false;
};

async function saveShopFinanceManager() {
	const api = formState.value?.id ? editShopFinance : addShopFinance;
	try {
		const { code, message: messageInfo } = await api(formState.value || {});
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			drawerOpen.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} catch (error: unknown) {
		const responseData = (
			error as { response?: { data?: { message?: string } } }
		)?.response?.data;
		message.error(responseData?.message || '保存失败！');
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
		} = await getShopFinanceDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
				saleDate: formatDayjs(data.saleDate),
			};
		} else {
			formState.value = {
				isValid: '1',
				incomeAndExpenses: 'income',
				saleDate: nowDayjs(),
			};
			message.error(messageInfo || '查询账单详情失败！');
		}
	} else {
		formState.value = {
			isValid: '1',
			incomeAndExpenses: 'income',
			saleDate: nowDayjs(),
		};
	}
};

watch(
	() => drawerOpen.value,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	},
);
</script>

<style lang="scss" scoped>
.shop-finance-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.voucher-hero {
	padding: 20px;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	display: flex;
	flex-direction: column;
	gap: 10px;

	&.is-income {
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
		border-color: #bbf7d0;

		.voucher-amount {
			color: #15803d;
		}

		.type-pill {
			background: #16a34a;
			color: #ffffff;
		}
	}

	&.is-expense {
		background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
		border-color: #fecaca;

		.voucher-amount {
			color: #dc2626;
		}

		.type-pill {
			background: #dc2626;
			color: #ffffff;
		}
	}

	.voucher-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.type-pill,
		.valid-pill {
			padding: 2px 10px;
			border-radius: 999px;
			font-size: 12px;
			font-weight: 600;
		}

		.valid-pill.is-valid {
			background: rgba(255, 255, 255, 0.85);
			color: #15803d;
		}

		.valid-pill.is-invalid {
			background: rgba(255, 255, 255, 0.85);
			color: #64748b;
		}
	}

	.voucher-amount {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-variant-numeric: tabular-nums;

		.currency {
			font-size: 18px;
			font-weight: 700;
		}

		strong {
			font-size: 28px;
			font-weight: 800;
		}
	}

	.voucher-title {
		font-size: 15px;
		font-weight: 700;
		color: #0f172a;
		display: flex;
		align-items: center;
		gap: 8px;

		.code-tag {
			font-size: 12px;
			font-family: 'JetBrains Mono', monospace;
			color: #475569;
			background: rgba(255, 255, 255, 0.75);
			padding: 1px 6px;
			border-radius: 4px;
		}
	}
}

.voucher-meta-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;

	.meta-item {
		padding: 12px 14px;
		border-radius: 10px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 4px;

		.meta-label {
			font-size: 12px;
			color: #64748b;
		}

		.meta-value {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;

			&.mono {
				font-family: 'JetBrains Mono', monospace;
			}
		}
	}
}
</style>
