<template>
	<BaseRbacDrawer
		v-model:open="drawerOpen"
		:title="modelInfo?.title || (isReadonly ? '商城商品档案与价格监测' : '配置商城商品')"
		:width="680"
		:confirm-loading="loading"
		:show-footer="!isReadonly"
		ok-text="保存商品"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：商城商品核心档案 + 价格监测看板 + 近三十日走势图 -->
		<div v-if="isReadonly" class="product-readonly-container">
			<div class="product-hero-card" data-testid="product-hero-card">
				<div class="hero-media">
					<a-image
						v-if="formState.image"
						:width="96"
						:height="96"
						:src="formState.image"
						class="product-thumb"
					/>
					<div v-else class="product-thumb-placeholder">🛍️</div>
				</div>
				<div class="hero-main">
					<div class="hero-badges">
						<span v-if="sourceLabel" class="source-pill">{{ sourceLabel }}</span>
						<span v-if="formState.shop" class="shop-pill">
							🏪 {{ formState.shop }}
						</span>
						<span v-if="formState.skuId" class="sku-pill">
							SKU: {{ formState.skuId }}
						</span>
					</div>
					<h3 class="product-title">{{ formState.name || '未命名商城商品' }}</h3>
					<div v-if="iconTagList.length" class="icon-tags">
						<span v-for="(tag, idx) in iconTagList" :key="idx" class="promo-tag">
							{{ tag }}
						</span>
					</div>
					<div v-if="formState.productUrl" class="hero-link">
						<a
							:href="formState.productUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="mall-link-btn"
						>
							🔗 前往原商城查看商品详情 ↗
						</a>
					</div>
				</div>
			</div>

			<div class="price-kpi-grid" data-testid="product-price-kpi-grid">
				<div
					class="price-kpi-item"
					:class="{
						'is-discount':
							formState.comparePrice &&
							formState.price &&
							formState.price < formState.comparePrice,
					}"
				>
					<span class="kpi-label">当前售价</span>
					<strong class="kpi-value primary">
						{{ formatPriceText(formState.price) }}
					</strong>
				</div>
				<div class="price-kpi-item">
					<span class="kpi-label">对比参考价</span>
					<strong class="kpi-value">
						{{ formatPriceText(formState.comparePrice) }}
					</strong>
				</div>
				<div class="price-kpi-item">
					<span class="kpi-label">历史最低价</span>
					<strong class="kpi-value lowest">
						{{ formatPriceText(formState.lowestPrice) }}
					</strong>
				</div>
				<div class="price-kpi-item">
					<span class="kpi-label">历史最高价</span>
					<strong class="kpi-value highest">
						{{ formatPriceText(formState.highestPrice) }}
					</strong>
				</div>
			</div>

			<div class="chart-section-card">
				<div class="chart-header">
					<span class="chart-title">📈 近三十日价格波动走势</span>
					<span class="chart-sub">基于 SKU 历史采集快照自动繪制</span>
				</div>
				<div v-if="dayData.length > 0" class="chart-canvas-wrap">
					<line-chart
						height="100%"
						width="100%"
						title="近三十日价格变化"
						:data="dayData"
						:config="dayConfig"
					/>
				</div>
				<div v-else class="chart-empty">
					暂无该商品 SKU 的近三十日价格采集记录
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：双列现代表单 -->
		<div v-else class="product-form-container">
			<a-form
				ref="formRef"
				name="PmsShopProductForm"
				layout="vertical"
				:model="formState"
				:rules="rulesRef"
			>
				<a-row :gutter="16">
					<a-col :span="24">
						<a-form-item label="商品名称" name="name">
							<a-input
								id="shop-product-name"
								v-model:value="formState.name"
								name="name"
								placeholder="请输入商城商品完整标题"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="所属商铺" name="shop">
							<a-input
								id="shop-product-shop"
								v-model:value="formState.shop"
								name="shop"
								placeholder="如：Apple 产品京东自营旗舰店"
								allow-clear
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="来源平台" name="source">
							<a-select
								id="shop-product-source"
								v-model:value="formState.source"
								placeholder="请选择商品来源平台"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="sourceOptions"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="当前售价 (元)" name="price">
							<a-input-number
								id="shop-product-price"
								v-model:value="formState.price"
								name="price"
								:min="0"
								:precision="2"
								style="width: 100%"
								placeholder="请输入当前售价"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="对比参考价 (元)" name="comparePrice">
							<a-input-number
								id="shop-product-compare-price"
								v-model:value="formState.comparePrice"
								name="comparePrice"
								:min="0"
								:precision="2"
								style="width: 100%"
								placeholder="请输入原价或对比参考价"
							/>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="平台 SKU 编号" name="skuId">
							<a-input
								id="shop-product-sku-id"
								v-model:value="formState.skuId"
								name="skuId"
								placeholder="用于关联历史价格趋势的 SKU ID"
								allow-clear
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="促销标签" name="icons">
							<a-input
								id="shop-product-icons"
								v-model:value="formState.icons"
								name="icons"
								placeholder="多个标签可用逗号或空格分隔，如：自营,秒杀"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="16">
					<a-col :span="24">
						<a-form-item label="商品主图 URL" name="image">
							<a-input
								id="shop-product-image"
								v-model:value="formState.image"
								name="image"
								placeholder="请输入商品主图 https:// 链接"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="16">
					<a-col :span="24">
						<a-form-item label="商城商品直达链接" name="productUrl">
							<a-input
								id="shop-product-url"
								v-model:value="formState.productUrl"
								name="productUrl"
								placeholder="请输入商城详情页 URL"
								allow-clear
							/>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>

			<div v-if="dayData.length > 0" class="chart-section-card mt-16">
				<div class="chart-header">
					<span class="chart-title">📈 近三十日价格波动走势</span>
					<span class="chart-sub">SKU: {{ formState.skuId }}</span>
				</div>
				<div class="chart-canvas-wrap">
					<line-chart
						height="100%"
						width="100%"
						title="近三十日价格变化"
						:data="dayData"
						:config="dayConfig"
					/>
				</div>
			</div>
		</div>
	</BaseRbacDrawer>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import {
	getPmsShopProductDetail,
	addPmsShopProduct,
	editPmsShopProduct,
	getProductHisInfo,
} from '@/views/product/pmsShopProduct/api';
import {
	DEFAULT_SHOP_SOURCE_OPTIONS,
	type PmsShopProductData,
} from '@/views/product/pmsShopProduct/config';
import { getDictList } from '@/views/dict/api';
import type { DictInfo } from '@/views/dict/config';
import type { barItem } from '@/views/selfFinance/financeAnalysis/chart/bar';
import type { ModelInfo } from '@/types/modal';

type ProductHistoryItem = {
	price?: number;
	createDate?: string;
};

const props = withDefaults(
	defineProps<{
		isReadonly?: boolean;
	}>(),
	{
		isReadonly: false,
	},
);

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
const dayData = ref<number[]>([]);
const sourceDictList = ref<DictInfo[]>([]);
const formState = ref<PmsShopProductData>({});

const sourceOptions = computed(() =>
	sourceDictList.value.length > 0 ?
		sourceDictList.value
	:	DEFAULT_SHOP_SOURCE_OPTIONS,
);

const sourceLabel = computed(() => {
	const code = formState.value.source;
	if (!code) return '';
	const matched = sourceOptions.value.find(
		(item) => String(item.typeCode) === String(code),
	);
	return matched?.typeName || code;
});

const iconTagList = computed(() => {
	const raw = formState.value.icons?.trim();
	if (!raw) return [];
	return raw
		.split(/[,，\s]+/)
		.map((s) => s.trim())
		.filter(Boolean);
});

const rulesRef: Record<string, Rule[]> = {
	name: [{ required: true, message: '请输入商品名称！', trigger: 'blur' }],
	price: [{ required: true, message: '请输入当前售价！', trigger: 'change' }],
};

const dayConfig = ref<barItem>({
	xAxis: [],
	series: [],
	xTile: '日期',
	yTitle: '价格(元)',
	yNameGap: 36,
	tooltip: {},
	legend: [],
	color: '#2563eb',
});

const formatPriceText = (val?: number) => {
	if (val === undefined || val === null || Number.isNaN(Number(val))) {
		return '--';
	}
	return `¥${Number(val).toFixed(2)}`;
};

const handleOk = () => {
	if (props.isReadonly) {
		drawerOpen.value = false;
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePmsShopProductManager())
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

const savePmsShopProductManager = async () => {
	try {
		const api = formState.value.id ? editPmsShopProduct : addPmsShopProduct;
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			drawerOpen.value = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const getProductHisDaysInfo = async (skuId: string, dateStr: string | null) => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getProductHisInfo(skuId, dateStr);
	if (String(code) !== '200') {
		message.error(messageInfo || '查询历史价格失败！');
		return;
	}
	const records = (data || []) as ProductHistoryItem[];
	const series = records.map((item) => item.price ?? 0);
	const xAxis = records.map((item) => item.createDate ?? '');
	dayConfig.value = {
		xAxis,
		series,
		xTile: '日期',
		yTitle: '价格(元)',
		yNameGap: 48,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			formatter(
				param: Array<{ axisValue: string; marker: string; value: number }>,
			) {
				let tip = `<p style="margin: 0">${param[0]?.axisValue || ''}</p>`;
				param.forEach((element) => {
					tip += `<p style="margin: 0">${element.marker}价格: ¥${
						element.value ?? 0
					}</p>`;
				});
				return tip;
			},
		},
		color: '#2563eb',
	};
	dayData.value = series;
};

const init = async () => {
	const id = modelInfo.value?.id;
	const dictPromise = getDictList('shop_type').catch(() => null);

	if (!id) {
		const dictRes = await dictPromise;
		if (dictRes && String(dictRes.code) === '200' && dictRes.data?.length) {
			sourceDictList.value = dictRes.data as DictInfo[];
		}
		formState.value = {};
		dayData.value = [];
		return;
	}

	const [dictRes, detailRes] = await Promise.all([
		dictPromise,
		getPmsShopProductDetail(String(id)),
	]);

	if (dictRes && String(dictRes.code) === '200' && dictRes.data?.length) {
		sourceDictList.value = dictRes.data as DictInfo[];
	}

	if (String(detailRes.code) !== '200' || !detailRes.data) {
		message.error(detailRes.message || '查询商品详情失败！');
		return;
	}

	formState.value = {
		...detailRes.data,
		id: detailRes.data.id !== undefined ? String(detailRes.data.id) : undefined,
		skuId:
			detailRes.data.skuId !== undefined ?
				String(detailRes.data.skuId)
			:	undefined,
	};

	if (formState.value.skuId) {
		await getProductHisDaysInfo(formState.value.skuId, '');
	} else {
		dayData.value = [];
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
.product-readonly-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.product-hero-card {
	display: flex;
	gap: 16px;
	padding: 18px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	border: 1px solid #dbeafe;

	.hero-media {
		flex-shrink: 0;

		:deep(.ant-image-img),
		.product-thumb {
			border-radius: 10px;
			object-fit: cover;
			border: 1px solid #e2e8f0;
			background: #ffffff;
		}

		.product-thumb-placeholder {
			width: 96px;
			height: 96px;
			border-radius: 10px;
			background: #ffffff;
			border: 1px dashed #cbd5e1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32px;
		}
	}

	.hero-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;

		.hero-badges {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;

			.source-pill,
			.shop-pill,
			.sku-pill {
				display: inline-flex;
				align-items: center;
				padding: 2px 8px;
				border-radius: 999px;
				font-size: 11px;
				font-weight: 600;
			}

			.source-pill {
				background: #dbeafe;
				color: #1d4ed8;
			}

			.shop-pill {
				background: #f1f5f9;
				color: #334155;
			}

			.sku-pill {
				background: #fef3c7;
				color: #b45309;
				font-family: 'JetBrains Mono', monospace;
			}
		}

		.product-title {
			margin: 0;
			font-size: 15px;
			font-weight: 700;
			color: #0f172a;
			line-height: 1.45;
		}

		.icon-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;

			.promo-tag {
				padding: 1px 8px;
				border-radius: 4px;
				font-size: 11px;
				font-weight: 600;
				background: #fee2e2;
				color: #dc2626;
			}
		}

		.hero-link {
			margin-top: 2px;

			.mall-link-btn {
				font-size: 12px;
				font-weight: 600;
				color: #2563eb;
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
}

.price-kpi-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;

	.price-kpi-item {
		padding: 12px 14px;
		border-radius: 12px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 4px;

		&.is-discount {
			background: #fef2f2;
			border-color: #fecaca;
		}

		.kpi-label {
			font-size: 12px;
			color: #64748b;
		}

		.kpi-value {
			font-size: 16px;
			font-weight: 700;
			color: #1e293b;
			font-variant-numeric: tabular-nums;

			&.primary {
				color: #dc2626;
			}

			&.lowest {
				color: #16a34a;
			}

			&.highest {
				color: #d97706;
			}
		}
	}
}

.chart-section-card {
	padding: 16px;
	border-radius: 12px;
	background: #ffffff;
	border: 1px solid #e2e8f0;

	&.mt-16 {
		margin-top: 16px;
	}

	.chart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.chart-title {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;
		}

		.chart-sub {
			font-size: 12px;
			color: #64748b;
		}
	}

	.chart-canvas-wrap {
		width: 100%;
		height: 300px;
	}

	.chart-empty {
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		color: #94a3b8;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px dashed #e2e8f0;
	}
}
</style>
