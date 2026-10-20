<template>
	<div class="global-ai-assistant-root">
		<!-- 全局悬浮触发胶囊 -->
		<div
			v-if="!visible"
			class="ai-floating-pill"
			data-testid="btn-open-global-ai-drawer"
			@click="visible = true"
		>
			<div class="pill-glow" />
			<RobotOutlined class="pill-icon" />
			<span class="pill-text">AI 助手</span>
		</div>

		<!-- 侧边 AI 智能对话抽屉 -->
		<a-drawer
			:visible="visible"
			title="智能业务 Copilot (流式对话)"
			placement="right"
			:width="460"
			class="global-ai-drawer"
			data-testid="drawer-global-ai"
			@close="visible = false"
		>
			<template #extra>
				<a-space size="small">
					<a-tag color="blue" class="text-xs">
						<template #icon><ThunderboltOutlined /></template>
						{{ activeEngineName }}
					</a-tag>
					<a-button
						type="text"
						size="small"
						data-testid="btn-clear-ai-chat"
						@click="clearMessages"
					>
						<template #icon><ClearOutlined /></template>
					</a-button>
				</a-space>
			</template>

			<div class="drawer-container flex flex-col h-full">
				<!-- 快捷指令胶囊推荐 -->
				<div
					class="quick-prompts-bar p-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 flex-wrap"
				>
					<a-tag
						v-for="p in quickPrompts"
						:key="p"
						color="processing"
						class="cursor-pointer hover:opacity-80 transition-opacity"
						@click="handleSendPrompt(p)"
					>
						{{ p }}
					</a-tag>
				</div>

				<!-- 对话消息列表 -->
				<div
					ref="messagesContainerRef"
					class="messages-scroll flex-1 p-3 overflow-y-auto space-y-3"
				>
					<div
						v-for="(msg, idx) in messages"
						:key="idx"
						class="message-item"
						:class="msg.role === 'user' ? 'message-user' : 'message-ai'"
					>
						<div class="message-bubble">
							<div class="message-sender font-semibold text-xs mb-1">
								{{ msg.role === 'user' ? '我' : 'AI Copilot' }}
							</div>
							<div
								class="message-content whitespace-pre-wrap text-sm leading-relaxed"
							>
								{{ msg.content }}
								<span v-if="msg.streaming" class="streaming-cursor" />
							</div>
							<div
								v-if="msg.meta"
								class="message-footer mt-1.5 text-xs text-gray-400 flex gap-2"
							>
								<span>引擎: {{ msg.meta.engine || 'default' }}</span>
								<span v-if="msg.meta.costMs">⚡ {{ msg.meta.costMs }}ms</span>
							</div>
						</div>
					</div>

					<div
						v-if="messages.length === 0"
						class="empty-state text-center py-12 text-gray-400"
					>
						<RobotOutlined class="text-4xl text-blue-400 mb-2" />
						<div class="font-medium text-sm text-gray-600">
							全域业务智能助理
						</div>
						<div class="text-xs mt-1">
							支持资产分析、财务建议、礼金梳理与自然语言问答
						</div>
					</div>
				</div>

				<!-- 底部输入栏 -->
				<div class="input-action-bar p-3 border-t border-slate-100 bg-white">
					<a-textarea
						v-model:value="inputContent"
						placeholder="输入您的问题或指令，按 Enter 发送，Shift + Enter 换行..."
						:auto-size="{ minRows: 2, maxRows: 4 }"
						:disabled="loading"
						data-testid="input-global-ai-content"
						@keydown="handleKeydown"
					/>
					<div class="flex justify-between items-center mt-2">
						<span class="text-xs text-gray-400">
							{{
								loading ? 'AI 正在思考并逐字流式回复...' : '支持全局业务场景'
							}}
						</span>
						<a-button
							type="primary"
							:loading="loading"
							:disabled="!inputContent.trim()"
							data-testid="btn-send-global-ai"
							@click="sendMessage"
						>
							<template #icon><SendOutlined /></template>
							发送
						</a-button>
					</div>
				</div>
			</div>
		</a-drawer>
	</div>
</template>

<script setup lang="ts">
import {
	ThunderboltOutlined,
	ClearOutlined,
	RobotOutlined,
	SendOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { chatAiStream } from '@/api/ai';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	streaming?: boolean;
	meta?: {
		engine?: string;
		costMs?: number;
	};
}

const visible = ref(false);
const inputContent = ref('');
const loading = ref(false);
const activeEngineName = ref('DeepSeek / 本地双路由');
const messagesContainerRef = ref<HTMLDivElement | null>(null);

const quickPrompts = [
	'📊 总结我最近的消费习惯',
	'🎁 分析最近礼金往来盈亏',
	'💡 制定本月合理的支出预算',
	'📝 列举日常记账的标准分类',
];

const messages = ref<ChatMessage[]>([
	{
		role: 'assistant',
		content:
			'您好！我是您的智能财务与生活助手。我可以帮您分析收支、核算礼金、评估预算，随时向我提问吧！',
	},
]);

const scrollToBottom = async () => {
	await nextTick();
	if (messagesContainerRef.value) {
		messagesContainerRef.value.scrollTop =
			messagesContainerRef.value.scrollHeight;
	}
};

const handleSendPrompt = (prompt: string) => {
	if (loading.value) return;
	inputContent.value = prompt;
	sendMessage();
};

const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
};

const sendMessage = async () => {
	const text = inputContent.value.trim();
	if (!text || loading.value) return;

	// 追加用户消息
	messages.value.push({ role: 'user', content: text });
	inputContent.value = '';
	loading.value = true;
	await scrollToBottom();

	// 创建 AI 占位消息并开启流式
	const assistantMessage = reactive<ChatMessage>({
		role: 'assistant',
		content: '',
		streaming: true,
		meta: {},
	});
	messages.value.push(assistantMessage);

	try {
		await chatAiStream(
			{
				bizType: 'global-copilot',
				content: text,
			},
			{
				onMeta: (meta) => {
					if (meta.engine) {
						activeEngineName.value =
							meta.engine === 'deepseek' ? 'DeepSeek AI' : '本地规则引擎';
						if (assistantMessage.meta) {
							assistantMessage.meta.engine = meta.engine;
						}
					}
				},
				onDelta: (deltaText) => {
					assistantMessage.content += deltaText;
					scrollToBottom();
				},
				onDone: (resp) => {
					assistantMessage.streaming = false;
					if (assistantMessage.meta) {
						assistantMessage.meta.costMs = resp.costMs;
						if (resp.engine) assistantMessage.meta.engine = resp.engine;
					}
					loading.value = false;
					scrollToBottom();
				},
				onError: (err) => {
					assistantMessage.streaming = false;
					if (!assistantMessage.content) {
						assistantMessage.content = `[提示：${err.message || '服务响应超时，请重试'}]`;
					}
					loading.value = false;
					message.error(err.message || 'AI 连接异常');
				},
			},
		);
	} catch (e: unknown) {
		assistantMessage.streaming = false;
		loading.value = false;
		const errText = e instanceof Error ? e.message : '网络异常';
		message.error(errText);
	}
};

const clearMessages = () => {
	messages.value = [];
};
</script>

<style scoped>
.global-ai-assistant-root {
	position: relative;
	z-index: 1000;
}

.ai-floating-pill {
	position: fixed;
	right: 24px;
	bottom: 32px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 18px;
	background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
	color: #fff;
	border-radius: 9999px;
	cursor: pointer;
	box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	user-select: none;
	overflow: hidden;
}

.ai-floating-pill:hover {
	transform: translateY(-2px) scale(1.03);
	box-shadow: 0 12px 28px rgba(37, 99, 235, 0.45);
}

.pill-icon {
	font-size: 18px;
}

.pill-text {
	font-weight: 600;
	font-size: 13px;
	letter-spacing: 0.5px;
}

.streaming-cursor {
	display: inline-block;
	width: 2px;
	height: 14px;
	background-color: #2563eb;
	vertical-align: middle;
	margin-left: 2px;
	animation: blink 0.8s infinite;
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}

.message-user {
	display: flex;
	justify-content: flex-end;
}

.message-user .message-bubble {
	background-color: #eff6ff;
	border: 1px solid #bfdbfe;
	color: #1e3a8a;
	border-radius: 12px 12px 2px 12px;
	max-width: 85%;
	padding: 10px 14px;
}

.message-ai {
	display: flex;
	justify-content: flex-start;
}

.message-ai .message-bubble {
	background-color: #f8fafc;
	border: 1px solid #e2e8f0;
	color: #1e293b;
	border-radius: 12px 12px 12px 2px;
	max-width: 88%;
	padding: 10px 14px;
}
</style>
