<template>
	<div class="ai-chat-page">
		<div class="ai-chat-shell">
			<!-- 左侧：会话列表（仿 ChatGPT） -->
			<div class="ai-chat-sidebar">
				<div class="sidebar-header">
					<a-button type="primary" block @click="onNewConversation">
						新建对话
					</a-button>
					<a-input
						v-model:value="keyword"
						allow-clear
						placeholder="搜索对话"
						style="margin-top: 12px"
					/>
				</div>

				<div class="sidebar-body">
					<a-empty
						v-if="filteredConversations.length === 0"
						description="暂无对话"
					/>

					<a-list v-else :data-source="filteredConversations" size="small">
						<template #renderItem="{ item }">
							<a-list-item
								class="conv-item"
								:class="{ active: item.id === activeConversationId }"
								@click="onSelectConversation(item.id)"
							>
								<div class="conv-item-title">
									<a-typography-text ellipsis>
										{{ item.title || '新对话' }}
									</a-typography-text>
								</div>
								<a-button
									type="text"
									danger
									size="small"
									@click.stop="onDeleteConversation(item.id)"
								>
									删除
								</a-button>
							</a-list-item>
						</template>
					</a-list>
				</div>
			</div>

			<!-- 右侧：聊天区 -->
			<div class="ai-chat-main">
				<div class="chat-header">
					<div class="header-left">
						<a-typography-title :level="5" style="margin: 0">
							AI 对话
						</a-typography-title>
						<a-tag
							v-if="activeEngineLabel"
							color="blue"
							style="margin-left: 8px"
						>
							{{ activeEngineLabel }}
						</a-tag>
					</div>

					<div class="header-right">
						<a-space :size="12" wrap>
							<a-radio-group
								v-model:value="responseMode"
								option-type="button"
								button-style="solid"
								size="small"
								:options="responseModeOptions"
							/>
							<a-select
								v-model:value="engine"
								style="width: 130px"
								:options="engineOptions"
								placeholder="引擎"
							/>
							<a-input
								v-model:value="model"
								style="width: 160px"
								placeholder="模型（可选）"
								allow-clear
							/>
							<a-input-number
								v-model:value="temperature"
								:min="0"
								:max="2"
								:step="0.1"
								style="width: 130px"
								placeholder="温度"
							/>
						</a-space>
					</div>
				</div>

				<div ref="messagesWrapRef" class="chat-body">
					<div v-if="activeMessages.length === 0" class="chat-empty">
						<a-empty description="开始你的第一次提问吧" />
					</div>

					<div v-else class="chat-messages">
						<div
							v-for="m in activeMessages"
							:key="m.id"
							class="msg-row"
							:class="m.role"
						>
							<div class="msg-bubble">
								<div class="msg-content">{{ m.content }}</div>
								<div class="msg-meta">
									<span>{{ m.role === 'user' ? '你' : 'AI' }}</span>
									<span v-if="m.status === 'loading'">· 思考中…</span>
									<span v-else-if="m.status === 'error'">· 失败</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="chat-footer">
					<div class="input-box">
						<a-textarea
							v-model:value="input"
							:auto-size="{ minRows: 1, maxRows: 6 }"
							placeholder="输入消息，Enter 发送，Shift+Enter 换行"
							@keydown="onInputKeydown"
						/>
					</div>
					<div class="action-box">
						<a-space>
							<a-button @click="onClearInput">清空</a-button>
							<a-button
								type="primary"
								:loading="sending"
								:disabled="!canSend"
								@click="onSend"
							>
								发送
							</a-button>
						</a-space>
					</div>
					<div class="footer-tip">
						<a-typography-text type="secondary">
							AI Agent：对话记录仅保存在本地浏览器（localStorage）。
						</a-typography-text>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { chatAi, chatAiStream } from './api';
import type { AiAnalyzeReq, AiAnalyzeResp, AiResponseMode } from './api';

type EngineKey = 'deepseek' | 'rule-based' | 'sensenova';
type MessageRole = 'user' | 'assistant';
type MessageStatus = 'done' | 'loading' | 'error';

interface ChatMessage {
	id: string;
	role: MessageRole;
	content: string;
	status: MessageStatus;
	createdAt: number;
}

interface Conversation {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
	messages: ChatMessage[];
}

const STORAGE_KEY = 'AI_AGENT_CHAT_STATE_V1';

const engineOptions = [
	{ label: 'DeepSeek', value: 'deepseek' },
	{ label: '规则引擎', value: 'rule-based' },
];

const responseModeOptions = [
	{ label: '整包', value: 'batch' },
	{ label: '流式', value: 'stream' },
];

const keyword = ref<string>('');
const conversations = ref<Conversation[]>([]);
const activeConversationId = ref<string>('');

const engine = ref<EngineKey>('deepseek');
const model = ref<string>('');
const temperature = ref<number>(0.2);
const responseMode = ref<AiResponseMode>('batch');

const input = ref<string>('');
const sending = ref<boolean>(false);
const messagesWrapRef = ref<HTMLDivElement | null>(null);
let streamAbort: AbortController | null = null;

const activeEngineLabel = computed(() => {
	const hit = engineOptions.find((i) => i.value === engine.value);
	return hit?.label || '';
});

const activeConversation = computed<Conversation | null>(() => {
	return (
		conversations.value.find((c) => c.id === activeConversationId.value) || null
	);
});

const activeMessages = computed<ChatMessage[]>(() => {
	return activeConversation.value?.messages || [];
});

const filteredConversations = computed<Conversation[]>(() => {
	const k = keyword.value.trim().toLowerCase();
	if (!k) {
		return conversations.value;
	}
	return conversations.value.filter((c) =>
		(c.title || '').toLowerCase().includes(k),
	);
});

const canSend = computed(() => {
	return !sending.value && input.value.trim().length > 0;
});

const onPersist = () => {
	try {
		const payload = {
			conversations: conversations.value,
			activeConversationId: activeConversationId.value,
			engine: engine.value,
			model: model.value,
			temperature: temperature.value,
			responseMode: responseMode.value,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// AI Agent：localStorage 失败不影响主流程
	}
};

const onRestore = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return;
		}
		const parsed = JSON.parse(raw) as Partial<{
			conversations: Conversation[];
			activeConversationId: string;
			engine: EngineKey;
			model: string;
			temperature: number;
			responseMode: AiResponseMode;
		}>;
		conversations.value = parsed.conversations || [];
		activeConversationId.value =
			parsed.activeConversationId || conversations.value?.[0]?.id || '';
		engine.value = parsed.engine || 'deepseek';
		model.value = parsed.model || '';
		temperature.value =
			typeof parsed.temperature === 'number' ? parsed.temperature : 0.2;
		responseMode.value =
			parsed.responseMode === 'stream' ? 'stream' : 'batch';
	} catch {
		// ignore
	}
};

const onScrollToBottom = async () => {
	await nextTick();
	const el = messagesWrapRef.value;
	if (!el) return;
	el.scrollTop = el.scrollHeight;
};

const buildId = () => {
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const onNewConversation = () => {
	const id = buildId();
	const now = Date.now();
	const conv: Conversation = {
		id,
		title: '新对话',
		createdAt: now,
		updatedAt: now,
		messages: [],
	};
	conversations.value = [conv, ...conversations.value];
	activeConversationId.value = id;
	onPersist();
};

const onSelectConversation = (id: string) => {
	activeConversationId.value = id;
	onPersist();
	onScrollToBottom();
};

const onDeleteConversation = (id: string) => {
	const idx = conversations.value.findIndex((c) => c.id === id);
	if (idx < 0) return;
	conversations.value.splice(idx, 1);
	if (activeConversationId.value === id) {
		activeConversationId.value = conversations.value?.[0]?.id || '';
	}
	onPersist();
};

const onClearInput = () => {
	input.value = '';
};

const abortActiveStream = () => {
	if (streamAbort) {
		streamAbort.abort();
		streamAbort = null;
	}
};

const buildAssistantText = (resp: AiAnalyzeResp | undefined): string => {
	if (!resp) return 'AI 返回为空。';
	const summary = (resp.summary || '').trim();
	const points = resp.keyPoints || [];
	if (summary && points.length) {
		return `${summary}\n\n要点：\n- ${points.join('\n- ')}`;
	}
	return (
		summary ||
		(points.length ? `要点：\n- ${points.join('\n- ')}` : 'AI 返回为空。')
	);
};

const finishAssistantFromStream = (
	assistantMsg: ChatMessage,
	streamed: string,
	resp?: AiAnalyzeResp,
) => {
	// 中途 LLM 失败后 Router 回退：wire 上可能已有 LLM delta，done.engine 含 fallback 时整段替换，避免拼接污染
	const engine = (resp?.engine || '').toLowerCase();
	if (engine.includes('fallback')) {
		assistantMsg.content = buildAssistantText(resp);
		assistantMsg.status = 'done';
		return;
	}
	const points = resp?.keyPoints || [];
	const summary = (resp?.summary || '').trim();
	const body = streamed.trim() || summary;
	if (body && points.length) {
		assistantMsg.content = `${body}\n\n要点：\n- ${points.join('\n- ')}`;
	} else if (body) {
		assistantMsg.content = body;
	} else if (points.length) {
		assistantMsg.content = `要点：\n- ${points.join('\n- ')}`;
	} else {
		assistantMsg.content = buildAssistantText(resp);
	}
	assistantMsg.status = 'done';
};

const onSend = async () => {
	if (!canSend.value) return;

	// AI Agent：如果没有选中会话，自动新建一个
	if (!activeConversation.value) {
		onNewConversation();
	}
	const conv = activeConversation.value;
	if (!conv) return;

	abortActiveStream();

	const content = input.value.trim();
	input.value = '';
	sending.value = true;

	const userMsg: ChatMessage = {
		id: buildId(),
		role: 'user',
		content,
		status: 'done',
		createdAt: Date.now(),
	};

	const isStream = responseMode.value === 'stream';
	const assistantMsg: ChatMessage = {
		id: buildId(),
		role: 'assistant',
		content: isStream ? '' : '思考中…',
		status: 'loading',
		createdAt: Date.now(),
	};

	conv.messages.push(userMsg, assistantMsg);
	// 取数组内响应式代理，保证流式 delta 能触发视图更新
	const assistant =
		conv.messages[conv.messages.length - 1] || assistantMsg;
	conv.updatedAt = Date.now();

	// AI Agent：首条消息更新标题（更像 ChatGPT）
	if (conv.messages.filter((m) => m.role === 'user').length === 1) {
		conv.title = content.length > 20 ? `${content.slice(0, 20)}…` : content;
	}

	onPersist();
	onScrollToBottom();

	const req: AiAnalyzeReq = {
		bizType: 'chat',
		content,
		depth: 2,
		engine: engine.value,
		model: model.value || undefined,
		temperature: temperature.value,
		// AI Agent：把最近对话作为上下文（后端会拼到 prompt 里）
		context: {
			history: conv.messages
				.filter((m) => m.role !== 'assistant' || m.status !== 'loading')
				.slice(-10)
				.map((m) => ({ role: m.role, content: m.content })),
		},
	};

	try {
		if (isStream) {
			const controller = new AbortController();
			streamAbort = controller;
			let streamed = '';

			await chatAiStream(
				req,
				{
					onDelta: (text) => {
						streamed += text;
						assistant.content = streamed;
						onScrollToBottom();
					},
					onDone: (data) => {
						finishAssistantFromStream(assistant, streamed, data);
					},
					onError: (err) => {
						assistant.content =
							err.message || streamed || 'AI 流式对话失败';
						assistant.status = 'error';
						message.error(err.message || 'AI 流式对话失败');
					},
				},
				controller.signal,
			);

			if (controller.signal.aborted && assistant.status === 'loading') {
				assistant.content = streamed || '已取消';
				assistant.status = 'error';
			}
		} else {
			const { code, data, message: msg } = await chatAi(req);
			if (code === '200') {
				assistant.content = buildAssistantText(data);
				assistant.status = 'done';
			} else {
				assistant.content = msg || 'AI 对话失败';
				assistant.status = 'error';
				message.error(msg || 'AI 对话失败');
			}
		}
	} catch (e: any) {
		assistant.content = '网络异常或服务不可用，请稍后重试。';
		assistant.status = 'error';
		message.error('请求失败，请检查网关/AI 服务是否已启动');
	} finally {
		if (streamAbort) {
			streamAbort = null;
		}
		sending.value = false;
		conv.updatedAt = Date.now();
		onPersist();
		onScrollToBottom();
	}
};

const onInputKeydown = (e: KeyboardEvent) => {
	// AI Agent：Enter 发送，Shift+Enter 换行（仿 ChatGPT）
	if (e.key !== 'Enter') return;
	if (e.shiftKey) return;
	e.preventDefault();
	onSend();
};

onMounted(() => {
	onRestore();
	// AI Agent：首次进入若没有会话，创建一个空会话
	if (!conversations.value.length) {
		onNewConversation();
	} else if (!activeConversationId.value) {
		activeConversationId.value = conversations.value[0]?.id || '';
	}
	onScrollToBottom();
});

onUnmounted(() => {
	abortActiveStream();
});

watch(
	() => [
		conversations.value,
		activeConversationId.value,
		engine.value,
		model.value,
		temperature.value,
		responseMode.value,
	],
	() => {
		onPersist();
	},
	{ deep: true },
);
</script>

<style scoped lang="less">
.ai-chat-page {
	height: 100%;
	padding: 0;
}

.ai-chat-shell {
	display: flex;
	height: 100%;
	min-height: 620px;
}

.ai-chat-sidebar {
	width: 280px;
	border-right: 1px solid #f0f0f0;
	display: flex;
	flex-direction: column;
	background: #fafafa;
}

.sidebar-header {
	padding: 16px;
	border-bottom: 1px solid #f0f0f0;
}

.sidebar-body {
	padding: 8px 8px 16px;
	overflow-y: auto;
	flex: 1;
}

.conv-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 10px;
	border-radius: 8px;
	cursor: pointer;
}

.conv-item:hover {
	background: #f5f5f5;
}

.conv-item.active {
	background: #e6f4ff;
}

.conv-item-title {
	flex: 1;
	min-width: 0;
	margin-right: 8px;
}

.ai-chat-main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.chat-header {
	padding: 12px 16px;
	border-bottom: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.header-left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.header-right {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.chat-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	background: #ffffff;
}

.chat-empty {
	padding-top: 80px;
}

.chat-messages {
	max-width: 880px;
	margin: 0 auto;
}

.msg-row {
	display: flex;
	margin-bottom: 12px;
}

.msg-row.user {
	justify-content: flex-end;
}

.msg-row.assistant {
	justify-content: flex-start;
}

.msg-bubble {
	max-width: 80%;
	padding: 12px 14px;
	border-radius: 12px;
	border: 1px solid #f0f0f0;
}

.msg-row.user .msg-bubble {
	background: #1677ff;
	color: #fff;
	border-color: #1677ff;
}

.msg-row.assistant .msg-bubble {
	background: #f7f7f8;
	color: #111;
}

.msg-content {
	white-space: pre-wrap;
	word-break: break-word;
	line-height: 1.6;
}

.msg-meta {
	margin-top: 6px;
	font-size: 12px;
	opacity: 0.8;
	display: flex;
	gap: 6px;
}

.chat-footer {
	border-top: 1px solid #f0f0f0;
	padding: 12px 16px;
	background: #fff;
}

.input-box {
	max-width: 880px;
	margin: 0 auto;
}

.action-box {
	max-width: 880px;
	margin: 10px auto 0;
	display: flex;
	justify-content: flex-end;
}

.footer-tip {
	max-width: 880px;
	margin: 8px auto 0;
}
</style>
