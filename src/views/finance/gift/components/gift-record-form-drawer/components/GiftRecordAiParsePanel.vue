<template>
	<!-- AI 自然语言智能快速记账 -->
	<div class="ai-parse-panel">
		<div class="ai-parse-title">
			<span class="ai-sparkle">✨</span>
			<span class="ai-title-text">AI 快速记账</span>
			<span class="ai-sub-text">粘贴聊天记录或输入一句话自动填单</span>
		</div>
		<div class="ai-parse-input-wrap">
			<a-input
				v-model:value="aiText"
				placeholder="例：随了大学同学王五结婚礼金800元 / 收到李叔叔乔迁红包1000块"
				:disabled="aiLoading"
				allow-clear
				data-testid="gift-record-ai-input"
				@pressEnter="handleAiParse"
			>
				<template #suffix>
					<a-button
						type="primary"
						size="small"
						:loading="aiLoading"
						data-testid="gift-record-ai-btn"
						@click="handleAiParse"
					>
						智能解析
					</a-button>
				</template>
			</a-input>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { aiParseGiftRecord } from '@/views/finance/gift/api';
import type {
	GiftRecordAiParseVo,
	GiftDirection,
} from '@/views/finance/gift/config';

const props = defineProps<{
	defaultDirection?: GiftDirection;
}>();

const emit = defineEmits<{
	(e: 'parsed', data: GiftRecordAiParseVo): void;
}>();

const aiText = ref('');
const aiLoading = ref<boolean>(false);

const handleAiParse = async () => {
	const raw = aiText.value?.trim();
	if (!raw) {
		message.warning('请输入记账描述，例如：随了发小李四结婚礼金800元');
		return;
	}
	aiLoading.value = true;
	try {
		const {
			code,
			data,
			message: errorMsg,
		} = await aiParseGiftRecord({
			content: raw,
			defaultDirection: props.defaultDirection,
		});
		if (code === '200' && data) {
			emit('parsed', data);
			message.success('已自动识别记账要素并回填，请核对保存');
		} else {
			message.warning(errorMsg || '未能识别记账要素，请尝试补充说明');
		}
	} catch (e) {
		console.error(e);
		message.error('智能解析服务异常，请稍后再试');
	} finally {
		aiLoading.value = false;
	}
};

const resetText = () => {
	aiText.value = '';
};

defineExpose({
	resetText,
});
</script>

<style lang="scss" scoped>
.ai-parse-panel {
	margin-bottom: 20px;
	padding: 12px 14px;
	background: linear-gradient(135deg, #f0f5ff 0%, #f6ffed 100%);
	border: 1px solid #d6e4ff;
	border-radius: 8px;

	.ai-parse-title {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;

		.ai-sparkle {
			font-size: 15px;
		}

		.ai-title-text {
			font-weight: 600;
			font-size: 13px;
			color: #1d39c4;
		}

		.ai-sub-text {
			font-size: 12px;
			color: #8c8c8c;
			margin-left: 4px;
		}
	}

	.ai-parse-input-wrap {
		display: flex;
		align-items: center;
	}
}
</style>
