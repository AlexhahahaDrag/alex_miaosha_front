<template>
	<section class="gift-ai-insight" data-testid="gift-ai-insight-panel">
		<div class="gift-ai-insight__actions">
			<a-button
				type="primary"
				data-testid="gift-ai-insight-run"
				:loading="loading"
				:disabled="disabled || loading"
				@click="runInsight"
			>
				AI 解读
			</a-button>
			<a-button
				v-if="loading"
				data-testid="gift-ai-insight-abort"
				@click="abort"
			>
				停止
			</a-button>
		</div>
		<p v-if="error" class="gift-ai-insight__error" data-testid="gift-ai-insight-error">
			{{ error }}
		</p>
		<div
			v-if="displaySummary"
			class="gift-ai-insight__summary"
			data-testid="gift-ai-insight-summary"
		>
			{{ displaySummary }}
		</div>
		<ul
			v-if="keyPoints.length"
			class="gift-ai-insight__keypoints"
			data-testid="gift-ai-insight-keypoints"
		>
			<li v-for="(p, i) in keyPoints" :key="i">{{ p }}</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { chatGiftAiStream } from './api';
import {
	buildGiftAnalysisAiRequest,
	type GiftAnalysisInsightInput,
} from './buildAnalysisContext';

defineOptions({
	name: 'GiftAiInsightPanel',
});

const props = withDefaults(
	defineProps<{
		overview: GiftAnalysisInsightInput['overview'];
		trend?: GiftAnalysisInsightInput['trend'];
		relationDistribution?: GiftAnalysisInsightInput['relationDistribution'];
		eventRanking?: GiftAnalysisInsightInput['eventRanking'];
		personRanking?: GiftAnalysisInsightInput['personRanking'];
		disabled?: boolean;
	}>(),
	{
		disabled: false,
	},
);

const loading = ref(false);
const error = ref('');
const summary = ref('');
const streamText = ref('');
const keyPoints = ref<string[]>([]);

let abortController: AbortController | null = null;

const displaySummary = computed(() => summary.value || streamText.value);

const abort = () => {
	abortController?.abort();
	abortController = null;
	loading.value = false;
};

const runInsight = async () => {
	if (props.disabled || loading.value) return;

	abort();
	loading.value = true;
	error.value = '';
	summary.value = '';
	streamText.value = '';
	keyPoints.value = [];

	const controller = new AbortController();
	abortController = controller;

	const req = buildGiftAnalysisAiRequest({
		overview: props.overview,
		trend: props.trend,
		relationDistribution: props.relationDistribution,
		eventRanking: props.eventRanking,
		personRanking: props.personRanking,
	});

	try {
		await chatGiftAiStream(
			req,
			{
				onDelta: (text) => {
					streamText.value += text;
				},
				onDone: (resp) => {
					summary.value = resp.summary || streamText.value;
					keyPoints.value = Array.isArray(resp.keyPoints)
						? resp.keyPoints.filter(Boolean)
						: [];
					streamText.value = '';
					loading.value = false;
					abortController = null;
				},
				onError: (err) => {
					const msg = err.message || 'AI 解读失败';
					error.value = msg;
					message.error(msg);
					loading.value = false;
					abortController = null;
				},
			},
			controller.signal,
		);

		if (controller.signal.aborted) {
			loading.value = false;
			abortController = null;
			return;
		}

		// 流正常结束但未触发 onDone/onError 时收尾
		if (loading.value) {
			if (!summary.value && streamText.value) {
				summary.value = streamText.value;
				streamText.value = '';
			}
			loading.value = false;
			abortController = null;
		}
	} catch (e: unknown) {
		if (controller.signal.aborted) {
			loading.value = false;
			abortController = null;
			return;
		}
		const msg = e instanceof Error ? e.message : 'AI 解读失败';
		error.value = msg;
		message.error(msg);
		loading.value = false;
		abortController = null;
	}
};

onUnmounted(() => {
	abort();
});
</script>

<style scoped lang="less">
.gift-ai-insight {
	padding: 18px 20px;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;
}

.gift-ai-insight__actions {
	display: flex;
	align-items: center;
	gap: 12px;

	:deep(.ant-btn-primary) {
		border-radius: 8px;
		background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
		border: none;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
		font-weight: 600;
		transition: all 0.2s ease;

		&:hover {
			opacity: 0.92;
			transform: translateY(-1px);
			box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
		}
	}
}

.gift-ai-insight__error {
	margin: 12px 0 0;
	color: #e11d48;
	font-size: 13px;
	line-height: 1.5;
	background: #fff1f2;
	border: 1px solid #fecdd3;
	border-radius: 8px;
	padding: 8px 12px;
}

.gift-ai-insight__summary {
	margin-top: 14px;
	color: #1e293b;
	font-size: 14px;
	line-height: 1.7;
	white-space: pre-wrap;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 14px 16px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.gift-ai-insight__keypoints {
	margin: 12px 0 0;
	padding-left: 20px;
	color: #334155;
	font-size: 13px;
	line-height: 1.8;

	li {
		margin-bottom: 4px;

		&::marker {
			color: #4f46e5;
		}
	}
}
</style>
