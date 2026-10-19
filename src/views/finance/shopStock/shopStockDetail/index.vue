<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商店商品库存档案' : '配置商店商品库存')"
		:width="560"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存库存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：商品库存电子档案卡 -->
		<div v-if="isReadonly" class="shop-stock-voucher">
			<div class="stock-hero">
				<div class="stock-top">
					<span class="code-pill">#{{ formState.shopCode || '--' }}</span>
					<span
						class="status-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '在售库存' : '已下架' }}
					</span>
				</div>
				<h3 class="stock-name">{{ formState.shopName || '未命名库存商品' }}</h3>
				<div class="stock-kpi-row">
					<div class="kpi-item">
						<span class="kpi-label">进货成本价</span>
						<strong class="kpi-val">
							¥{{ Number(formState.costAmount ?? 0).toFixed(2) }}
						</strong>
					</div>
					<div class="kpi-item">
						<span class="kpi-label">门店零售价</span>
						<strong class="kpi-val primary">
							¥{{ Number(formState.saleAmount ?? 0).toFixed(2) }}
						</strong>
					</div>
					<div class="kpi-item">
						<span class="kpi-label">当前库存量</span>
						<strong class="kpi-val">{{ formState.saleNum ?? 0 }} 件</strong>
					</div>
				</div>
			</div>

			<div class="stock-meta-grid">
				<div class="meta-item">
					<span class="meta-label">商品类别</span>
					<strong class="meta-value">{{ categoryLabel }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">进货地点</span>
					<strong class="meta-value">{{ purchasePlaceLabel }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">进货日期</span>
					<strong class="meta-value">{{ saleDateText }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">单件预计毛利</span>
					<strong class="meta-value profit">¥{{ unitProfitText }}</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="ShopStockForm"
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
							id="shop-stock-name"
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
							id="shop-stock-code"
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
						:name="labelMap.costAmount.name"
						:label="labelMap.costAmount.label"
					>
						<a-input-number
							id="shop-stock-cost"
							v-model:value="formState.costAmount"
							name="costAmount"
							:min="0"
							:precision="2"
							style="width: 100%"
							placeholder="请输入成本价"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleAmount.name"
						:label="labelMap.saleAmount.label"
					>
						<a-input-number
							id="shop-stock-sale-amount"
							v-model:value="formState.saleAmount"
							name="saleAmount"
							:min="0"
							:precision="2"
							style="width: 100%"
							placeholder="请输入零售价"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.category.name"
						:label="labelMap.category.label"
					>
						<a-select
							id="shop-stock-category"
							v-model:value="formState.category"
							placeholder="请选择商品类别"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="categoryList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.purchasePlace.name"
						:label="labelMap.purchasePlace.label"
					>
						<a-select
							id="shop-stock-purchase-place"
							v-model:value="formState.purchasePlace"
							placeholder="请选择进货地点"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="purchasePlaceList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleNum.name"
						:label="labelMap.saleNum.label"
					>
						<a-input-number
							id="shop-stock-num"
							v-model:value="formState.saleNum"
							name="saleNum"
							:min="0"
							style="width: 100%"
							placeholder="请输入库存数量"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.isValid.name"
						:label="labelMap.isValid.label"
					>
						<a-select
							id="shop-stock-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleDate.name"
						:label="labelMap.saleDate.label"
					>
						<a-date-picker
							id="shop-stock-sale-date"
							v-model:value="formState.saleDate"
							name="saleDate"
							style="width: 100%"
							:format="defaultDateFormat"
							placeholder="请选择进货日期"
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
	DEFAULT_VALID_OPTIONS,
	type ShopStockDetail,
} from '@/views/finance/shopStock/config';
import {
	getShopStockDetail,
	addShopStock,
	editShopStock,
} from '@/views/finance/shopStock/api';
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
	'shop_category',
	'stock_place',
);

const isValidList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
});

const categoryList = computed(() => getDictByType('shop_category'));
const purchasePlaceList = computed(() => getDictByType('stock_place'));

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
const formState = ref<ShopStockDetail>({});

const labelMap = {
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	costAmount: { name: 'costAmount', label: '成本价 (元)' },
	saleAmount: { name: 'saleAmount', label: '零售价 (元)' },
	isValid: { name: 'isValid', label: '有效状态' },
	saleDate: { name: 'saleDate', label: '进货日期' },
	category: { name: 'category', label: '商品类别' },
	purchasePlace: { name: 'purchasePlace', label: '进货地点' },
	saleNum: { name: 'saleNum', label: '库存数量' },
} as const;

const rulesRef = reactive({
	shopName: [{ required: true, message: '商品名称不能为空！' }],
	shopCode: [{ required: true, message: '商品编码不能为空！' }],
	costAmount: [{ required: true, message: '成本价不能为空！' }],
	saleAmount: [{ required: true, message: '零售价不能为空！' }],
	isValid: [{ required: true, message: '状态不能为空！' }],
	saleDate: [{ required: true, message: '进货日期不能为空！' }],
	category: [{ required: true, message: '商品类别不能为空！' }],
	purchasePlace: [{ required: true, message: '进货地点不能为空！' }],
	saleNum: [{ required: true, message: '库存数量不能为空！' }],
});

const categoryLabel = computed(() => {
	const code = formState.value.category;
	if (!code) return '--';
	const matched = categoryList.value.find(
		(item) => String(item.typeCode) === String(code),
	);
	return matched?.typeName || code;
});

const purchasePlaceLabel = computed(() => {
	const code = formState.value.purchasePlace;
	if (!code) return '--';
	const matched = purchasePlaceList.value.find(
		(item) => String(item.typeCode) === String(code),
	);
	return matched?.typeName || code;
});

const saleDateText = computed(() => {
	if (!formState.value.saleDate) return '--';
	return formatDate(formState.value.saleDate) || '--';
});

const unitProfitText = computed(() => {
	const sale = Number(formState.value.saleAmount ?? 0);
	const cost = Number(formState.value.costAmount ?? 0);
	return (sale - cost).toFixed(2);
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
			.then(() => saveShopStockManager())
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

async function saveShopStockManager() {
	const api = formState.value.id ? editShopStock : addShopStock;
	try {
		const { code, message: messageInfo } = await api(formState.value);
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
		} = await getShopStockDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
				saleDate: formatDayjs(data.saleDate),
			};
		} else {
			message.error(messageInfo || '查询库存详情失败！');
		}
	} else {
		formState.value = {
			isValid: '1',
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
.shop-stock-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.stock-hero {
	padding: 20px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	border: 1px solid #bfdbfe;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.stock-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.code-pill {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			font-weight: 700;
			color: #1e40af;
			background: #ffffff;
			padding: 2px 8px;
			border-radius: 6px;
			border: 1px solid #dbeafe;
		}

		.status-pill {
			padding: 2px 10px;
			border-radius: 999px;
			font-size: 12px;
			font-weight: 600;

			&.is-valid {
				background: #dcfce7;
				color: #15803d;
			}

			&.is-invalid {
				background: #f1f5f9;
				color: #64748b;
			}
		}
	}

	.stock-name {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}

	.stock-kpi-row {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		padding-top: 10px;
		border-top: 1px dashed #93c5fd;

		.kpi-item {
			display: flex;
			flex-direction: column;
			gap: 2px;

			.kpi-label {
				font-size: 11px;
				color: #64748b;
			}

			.kpi-val {
				font-size: 16px;
				font-weight: 800;
				color: #0f172a;
				font-variant-numeric: tabular-nums;

				&.primary {
					color: #2563eb;
				}
			}
		}
	}
}

.stock-meta-grid {
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

			&.profit {
				color: #16a34a;
			}
		}
	}
}
</style>
