<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商店购物车记录详情' : '配置商店购物车记录')"
		:width="520"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存记录"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：购物车电子档案卡 -->
		<div v-if="isReadonly" class="shop-cart-voucher">
			<div class="cart-hero">
				<div class="cart-top">
					<span class="shop-id-pill">🛒 商品 ID：{{ formState.shopId || '--' }}</span>
					<span
						class="status-pill"
						:class="formState.isValid === '1' ? 'is-valid' : 'is-invalid'"
					>
						{{ formState.isValid === '1' ? '有效加购' : '已失效' }}
					</span>
				</div>
				<div class="cart-qty-row">
					<span class="qty-label">当前加购数量</span>
					<strong class="qty-value">{{ formState.saleNum ?? 0 }} 件</strong>
				</div>
			</div>

			<div class="cart-meta-grid">
				<div class="meta-item">
					<span class="meta-label">销售人员 ID</span>
					<strong class="meta-value mono">{{ formState.userId || '--' }}</strong>
				</div>
				<div class="meta-item">
					<span class="meta-label">关联客户 ID</span>
					<strong class="meta-value mono">
						{{ formState.customerId || '--' }}
					</strong>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列 A11y 表单 -->
		<a-form
			v-else
			ref="formRef"
			name="ShopCartForm"
			layout="vertical"
			:model="formState"
			:rules="rulesRef"
		>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.shopId.name"
						:label="labelMap.shopId.label"
					>
						<a-input
							id="shop-cart-shop-id"
							v-model:value="formState.shopId"
							name="shopId"
							placeholder="请输入商品 ID"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.userId.name"
						:label="labelMap.userId.label"
					>
						<a-input
							id="shop-cart-user-id"
							v-model:value="formState.userId"
							name="userId"
							placeholder="请输入人员 ID"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						:name="labelMap.customerId.name"
						:label="labelMap.customerId.label"
					>
						<a-input
							id="shop-cart-customer-id"
							v-model:value="formState.customerId"
							name="customerId"
							placeholder="请输入客户 ID"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						:name="labelMap.saleNum.name"
						:label="labelMap.saleNum.label"
					>
						<a-input-number
							id="shop-cart-sale-num"
							v-model:value="formState.saleNum"
							name="saleNum"
							:min="1"
							style="width: 100%"
							placeholder="请输入加购数量"
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
							id="shop-cart-is-valid"
							v-model:value="formState.isValid"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="isValidList"
							allow-clear
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
	type ShopCartData,
} from '@/views/finance/shopCart/config';
import {
	getShopCartDetail,
	addShopCart,
	editShopCart,
} from '@/views/finance/shopCart/api';
import type { ModelInfo } from '@/types/modal';
import { useDictInfo } from '@/composables/useDictInfo';

const props = withDefaults(
	defineProps<{
		isReadonly?: boolean;
	}>(),
	{
		isReadonly: false,
	},
);

const { getDictByType } = useDictInfo('is_valid');

const isValidList = computed(() => {
	const list = getDictByType('is_valid');
	return list?.length ? list : DEFAULT_VALID_OPTIONS;
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
const formState = ref<ShopCartData>({});

const labelMap = {
	shopId: { name: 'shopId', label: '商品 ID' },
	userId: { name: 'userId', label: '销售人员 ID' },
	customerId: { name: 'customerId', label: '客户 ID' },
	isValid: { name: 'isValid', label: '有效状态' },
	saleNum: { name: 'saleNum', label: '加购数量' },
} as const;

const rulesRef = reactive({
	shopId: [{ required: true, message: '商品 ID 不能为空！' }],
	userId: [{ required: true, message: '销售人员 ID 不能为空！' }],
	customerId: [{ required: true, message: '客户 ID 不能为空！' }],
	isValid: [{ required: true, message: '有效状态不能为空！' }],
	saleNum: [{ required: true, message: '加购数量不能为空！' }],
});

const handleOk = (): void => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveShopCartManager())
			.catch(() => {
				loading.value = false;
			});
	} else {
		loading.value = false;
	}
};

const handleCancel = (): void => {
	drawerOpen.value = false;
};

const saveShopCartManager = async (): Promise<void> => {
	const api = formState.value.id ? editShopCart : addShopCart;
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
};

const init = async () => {
	if (modelInfo.value?.id) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getShopCartDetail(String(modelInfo.value.id));
		if (code === '200' && data) {
			formState.value = {
				...data,
				id: data.id !== undefined ? String(data.id) : undefined,
				shopId: data.shopId !== undefined ? String(data.shopId) : undefined,
				userId: data.userId !== undefined ? String(data.userId) : undefined,
				customerId:
					data.customerId !== undefined ? String(data.customerId) : undefined,
			};
		} else {
			message.error(messageInfo || '查询详情失败！');
		}
	} else {
		formState.value = {
			isValid: '1',
			saleNum: 1,
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
.shop-cart-voucher {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.cart-hero {
	padding: 20px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	border: 1px solid #bfdbfe;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.cart-top {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.shop-id-pill {
			font-family: 'JetBrains Mono', monospace;
			font-size: 12px;
			font-weight: 700;
			color: #1e40af;
			background: #ffffff;
			padding: 3px 10px;
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

	.cart-qty-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding-top: 8px;
		border-top: 1px dashed #93c5fd;

		.qty-label {
			font-size: 12px;
			color: #475569;
		}

		.qty-value {
			font-size: 22px;
			font-weight: 800;
			color: #2563eb;
		}
	}
}

.cart-meta-grid {
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
			font-size: 13px;
			font-weight: 700;
			color: #0f172a;

			&.mono {
				font-family: 'JetBrains Mono', monospace;
			}
		}
	}
}
</style>
