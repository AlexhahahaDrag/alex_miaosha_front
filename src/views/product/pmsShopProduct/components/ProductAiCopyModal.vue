<template>
	<a-modal
		v-model:open="open"
		title="✨ AI 秒杀营销文案与核心卖点生成"
		width="680px"
		:footer="null"
	>
		<a-form layout="vertical" :model="aiCopyReq">
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item label="商品名称" name="productName" required>
						<a-input
							id="ai-copy-product-name"
							v-model:value="aiCopyReq.productName"
							name="productName"
							data-testid="ai-copy-input-name"
							placeholder="如：降噪无线蓝牙耳机"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item label="商品品类" name="categoryName">
						<a-input
							id="ai-copy-category-name"
							v-model:value="aiCopyReq.categoryName"
							name="categoryName"
							placeholder="如：数码影音"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item label="商品原价(元)" name="originalPrice">
						<a-input-number
							id="ai-copy-original-price"
							v-model:value="aiCopyReq.originalPrice"
							name="originalPrice"
							:min="0"
							style="width: 100%"
							placeholder="如：399"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item label="秒杀促销价(元)" name="seckillPrice">
						<a-input-number
							id="ai-copy-seckill-price"
							v-model:value="aiCopyReq.seckillPrice"
							name="seckillPrice"
							:min="0"
							style="width: 100%"
							placeholder="如：199"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-form-item label="商品核心亮点/规格" name="features">
				<a-input
					id="ai-copy-features"
					v-model:value="aiCopyReq.features"
					name="features"
					placeholder="如：主动混合降噪40dB，长续航30小时"
					allow-clear
				/>
			</a-form-item>
			<a-form-item>
				<a-button
					type="primary"
					block
					:loading="aiCopyLoading"
					data-testid="btn-generate-ai-copy"
					@click="handleGenerateAiCopy"
				>
					🚀 一键生成爆款营销文案
				</a-button>
			</a-form-item>
		</a-form>

		<div v-if="aiCopyResult" class="ai-copy-result-card">
			<div class="result-item">
				<div class="result-header">
					<span class="result-label">🔥 爆款标题</span>
					<a-button
						type="link"
						size="small"
						@click="copyText(aiCopyResult.title)"
					>
						复制
					</a-button>
				</div>
				<div class="result-content title-text">{{ aiCopyResult.title }}</div>
			</div>
			<div class="result-item">
				<div class="result-header">
					<span class="result-label">💬 一句话口号</span>
					<a-button
						type="link"
						size="small"
						@click="copyText(aiCopyResult.slogan)"
					>
						复制
					</a-button>
				</div>
				<div class="result-content slogan-text">
					{{ aiCopyResult.slogan }}
				</div>
			</div>
			<div class="result-item">
				<div class="result-header">
					<span class="result-label">🎯 核心卖点清单</span>
				</div>
				<div class="result-tags">
					<a-tag
						v-for="(point, idx) in aiCopyResult.sellingPoints"
						:key="idx"
						color="blue"
					>
						{{ point }}
					</a-tag>
				</div>
			</div>
			<div class="result-item">
				<div class="result-header">
					<span class="result-label">📝 营销种草详情</span>
					<a-button
						type="link"
						size="small"
						@click="copyText(aiCopyResult.marketingDescription)"
					>
						复制
					</a-button>
				</div>
				<div class="result-content desc-text">
					{{ aiCopyResult.marketingDescription }}
				</div>
			</div>
			<div class="result-apply-bar" style="margin-top: 16px">
				<a-button
					type="primary"
					block
					data-testid="btn-apply-ai-copy"
					@click="handleApply"
				>
					⚡ 一键应用至选中商品 / 复制全套文案
				</a-button>
			</div>
		</div>
	</a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	generateProductAiCopy,
	type ProductAiCopyReq,
	type ProductAiCopyVo,
} from '@/views/product/pmsShopProduct/api';
import type { PmsShopProductData } from '@/views/product/pmsShopProduct/config';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	productData?: PmsShopProductData;
}>();

const emit = defineEmits<{
	(
		e: 'apply',
		payload: {
			title: string;
			fullText: string;
			result: ProductAiCopyVo;
		},
	): void;
}>();

const aiCopyLoading = ref<boolean>(false);
const aiCopyReq = ref<ProductAiCopyReq>({
	productName: '',
	categoryName: '',
	originalPrice: undefined,
	seckillPrice: undefined,
	targetAudience: '',
	features: '',
});
const aiCopyResult = ref<ProductAiCopyVo | null>(null);

watch(
	() => [open.value, props.productData],
	([isOpen]) => {
		if (isOpen && props.productData) {
			aiCopyReq.value.productName = props.productData.name || '';
			aiCopyReq.value.originalPrice =
				props.productData.comparePrice ?
					Number(props.productData.comparePrice)
				:	undefined;
			aiCopyReq.value.seckillPrice =
				props.productData.price ? Number(props.productData.price) : undefined;
		}
	},
	{ immediate: true },
);

const handleGenerateAiCopy = async () => {
	if (!aiCopyReq.value.productName?.trim()) {
		message.warning('请输入商品名称');
		return;
	}
	aiCopyLoading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await generateProductAiCopy(aiCopyReq.value);
		if (code === '200' && data) {
			aiCopyResult.value = data;
			message.success('营销文案生成成功');
		} else {
			message.error(msg || '文案生成失败');
		}
	} catch (e) {
		console.error(e);
		message.error('文案生成异常');
	} finally {
		aiCopyLoading.value = false;
	}
};

const copyText = (text?: string) => {
	if (!text) return;
	if (navigator.clipboard?.writeText) {
		navigator.clipboard.writeText(text);
	}
	message.success('已复制到剪贴板');
};

const handleApply = () => {
	if (!aiCopyResult.value) return;
	const fullText = `【${aiCopyResult.value.title || ''}】\n口号：${aiCopyResult.value.slogan || ''}\n核心卖点：${aiCopyResult.value.sellingPoints?.join(' | ') || ''}\n种草描述：${aiCopyResult.value.marketingDescription || ''}`;
	copyText(fullText);

	emit('apply', {
		title: aiCopyResult.value.title || '',
		fullText,
		result: aiCopyResult.value,
	});
};
</script>

<style lang="scss" scoped>
.ai-copy-result-card {
	margin-top: 16px;
	padding: 16px;
	border-radius: 12px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.result-item {
		.result-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;

			.result-label {
				font-size: 13px;
				font-weight: 600;
				color: #0f172a;
			}
		}

		.title-text {
			font-size: 14px;
			font-weight: 700;
			color: #1e293b;
		}

		.slogan-text {
			font-size: 13px;
			color: #dc2626;
			font-weight: 600;
		}

		.desc-text {
			font-size: 12px;
			line-height: 1.6;
			color: #475569;
			background: #ffffff;
			padding: 8px 10px;
			border-radius: 6px;
			border: 1px solid #f1f5f9;
		}

		.result-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
		}
	}
}
</style>
