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
			placement="right"
			:width="480"
			class="global-ai-drawer"
			data-testid="drawer-global-ai"
			:body-style="{ padding: 0 }"
			:header-style="{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }"
			@close="visible = false"
		>
			<template #title>
				<div class="flex items-center gap-2.5">
					<div
						class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20"
					>
						<RobotOutlined class="text-base" />
					</div>
					<div>
						<div class="font-semibold text-sm text-slate-900 leading-tight">
							智能业务 Copilot
						</div>
						<div class="text-[11px] text-slate-400 font-normal leading-normal">
							流式对话与全域智能助理
						</div>
					</div>
				</div>
			</template>

			<template #extra>
				<div class="flex items-center gap-2">
					<div
						class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-xs"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20" />
						<span>{{ activeEngineName }}</span>
					</div>
					<a-tooltip title="清空对话记录">
						<button
							type="button"
							class="w-8 h-8 rounded-lg border-0 bg-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer transition-colors"
							data-testid="btn-clear-ai-chat"
							@click="clearMessages"
						>
							<ClearOutlined class="text-sm" />
						</button>
					</a-tooltip>
				</div>
			</template>

			<div class="drawer-container flex flex-col h-full bg-slate-50/50">
				<!-- 快捷指令微胶囊推荐 -->
				<div
					class="quick-prompts-bar px-3.5 py-2.5 bg-white border-b border-slate-100 flex gap-2 flex-wrap"
				>
					<button
						v-for="p in quickPrompts"
						:key="p.text"
						type="button"
						class="quick-prompt-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5"
						:class="getPromptClass(p.color)"
						@click="handleSendPrompt(`${p.emoji} ${p.text}`)"
					>
						<span>{{ p.emoji }}</span>
						<span>{{ p.text }}</span>
					</button>
				</div>

				<!-- 对话消息列表 -->
				<div
					ref="messagesContainerRef"
					class="messages-scroll flex-1 p-4 overflow-y-auto space-y-4"
				>
					<div
						v-for="(msg, idx) in messages"
						:key="idx"
						class="message-row flex gap-2.5 items-start"
						:class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
					>
						<!-- AI 侧专属发光头像 -->
						<div
							v-if="msg.role === 'assistant'"
							class="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 mt-0.5"
						>
							<RobotOutlined class="text-sm" />
						</div>

						<!-- 消息主体气泡 -->
						<div
							class="message-bubble transition-all duration-200"
							:class="msg.role === 'user' ? 'message-bubble-user' : 'message-bubble-ai'"
						>
							<!-- 用户消息纯文本 -->
							<template v-if="msg.role === 'user'">
								<div class="text-xs leading-relaxed whitespace-pre-wrap font-medium">
									{{ msg.content }}
								</div>
							</template>

							<!-- AI 消息（自动结构化识别或流式打字） -->
							<template v-else>
								<!-- 1. 结构化洞察展示：识别出 JSON summary + keyPoints -->
								<template v-if="getParsedAiContent(msg.content).type === 'structured-insight'">
									<!-- 核心摘要卡片 -->
									<div
										v-if="(getParsedAiContent(msg.content) as any).summary"
										class="insight-summary-card p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-indigo-50/30 border border-indigo-100/90 mb-2.5 text-slate-800"
									>
										<div class="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
											<BulbOutlined class="text-amber-500" />
											<span>智能洞察摘要</span>
										</div>
										<div class="text-xs leading-relaxed text-slate-700 font-normal">
											{{ (getParsedAiContent(msg.content) as any).summary }}
										</div>
									</div>

									<!-- 关键要点解析列表 -->
									<div
										v-if="(getParsedAiContent(msg.content) as any).keyPoints?.length"
										class="insight-keypoints space-y-1.5"
									>
										<div class="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1 px-0.5">
											<CheckCircleOutlined class="text-emerald-500 text-xs" />
											<span>关键要点清单</span>
										</div>
										<div
											v-for="(point, pIdx) in (getParsedAiContent(msg.content) as any).keyPoints"
											:key="pIdx"
											class="keypoint-item flex items-start gap-2 p-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 transition-colors text-xs text-slate-700 leading-relaxed border border-slate-100/80"
										>
											<span
												class="keypoint-num shrink-0 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-mono font-bold text-[10px] mt-0.5"
											>
												{{ String(Number(pIdx) + 1).padStart(2, '0') }}
											</span>
											<span class="flex-1">{{ point }}</span>
										</div>
									</div>
								</template>

								<!-- 2. 流式摘要打字阶段（防止半截 JSON 暴露） -->
								<template v-else-if="getParsedAiContent(msg.content).type === 'streaming-insight'">
									<div
										class="insight-summary-card p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-indigo-50/30 border border-indigo-100/90 text-slate-800"
									>
										<div class="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
											<BulbOutlined class="text-amber-500 animate-pulse" />
											<span>智能洞察整理中...</span>
										</div>
										<div class="text-xs leading-relaxed text-slate-700 font-normal">
											{{ (getParsedAiContent(msg.content) as any).summary }}
											<span class="streaming-cursor" />
										</div>
									</div>
								</template>

								<!-- 3. 普通文本或 Markdown 回复 -->
								<template v-else>
									<div class="message-content whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
										{{ (getParsedAiContent(msg.content) as any).text }}
										<span v-if="msg.streaming" class="streaming-cursor" />
									</div>
								</template>

								<!-- 智能结构化入账卡片 (若识别为记账指令) -->
								<div
									v-if="msg.structuredRecord"
									class="structured-record-card mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70"
									data-testid="ai-structured-record-card"
								>
									<div class="flex justify-between items-center mb-2">
										<span class="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
											🧾 识别到记账意图
										</span>
										<span
											class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
											:class="msg.structuredRecord.incomeAndExpenses === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
										>
											{{ msg.structuredRecord.incomeAndExpenses === 'income' ? '收入' : '支出' }}
										</span>
									</div>
									<div class="text-xs text-slate-700 space-y-1.5 bg-white/80 rounded-lg p-2.5 border border-emerald-150/60 shadow-xs">
										<div class="flex justify-between items-center">
											<span class="text-slate-400">账目名称</span>
											<strong class="font-medium text-slate-900">{{ msg.structuredRecord.name }}</strong>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-slate-400">记账金额</span>
											<span class="text-rose-600 font-bold font-mono text-sm">
												¥{{ Number(msg.structuredRecord.amount || 0).toFixed(2) }}
											</span>
										</div>
										<div v-if="msg.structuredRecord.typeCode" class="flex justify-between items-center">
											<span class="text-slate-400">分类</span>
											<span class="text-slate-600 font-medium">{{ msg.structuredRecord.typeCode }}</span>
										</div>
									</div>
									<div class="mt-2.5 flex justify-end">
										<button
											type="button"
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-0 transition-all shadow-xs"
											:class="msg.recordSaved ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-emerald-600/25'"
											:disabled="msg.recordSaving || msg.recordSaved"
											data-testid="btn-confirm-ai-record"
											@click="handleSaveRecord(msg)"
										>
											{{ msg.recordSaved ? '已入账 ✓' : '一键确认入账' }}
										</button>
									</div>
								</div>

								<!-- 底部元信息微芯片 -->
								<div
									v-if="msg.meta && (msg.meta.engine || msg.meta.costMs)"
									class="message-footer mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400"
								>
									<span class="inline-flex items-center gap-1 text-slate-500 font-medium">
										<ThunderboltOutlined class="text-amber-500 text-[10px]" />
										<span>{{ msg.meta.engine || 'default' }}</span>
									</span>
									<span v-if="msg.meta.costMs" class="font-mono text-slate-400 tabular-nums">
										⚡ {{ msg.meta.costMs }}ms
									</span>
								</div>
							</template>
						</div>

						<!-- 用户侧头像 -->
						<div
							v-if="msg.role === 'user'"
							class="shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs shadow-xs mt-0.5 border border-indigo-200/50"
						>
							<UserOutlined />
						</div>
					</div>

					<div
						v-if="messages.length === 0"
						class="empty-state text-center py-16 text-slate-400"
					>
						<div
							class="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3 shadow-inner"
						>
							<RobotOutlined class="text-2xl" />
						</div>
						<div class="font-semibold text-sm text-slate-700">
							全域业务智能助理
						</div>
						<div class="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
							支持财务收支洞察、礼金核算、预算评估与全局业务问答
						</div>
					</div>
				</div>

				<!-- 底部输入栏 -->
				<div class="input-action-bar p-3.5 border-t border-slate-100 bg-white">
					<div
						class="input-wrapper rounded-2xl border border-slate-200/80 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200 p-2"
					>
						<a-textarea
							v-model:value="inputContent"
							placeholder="输入您的问题或指令，按 Enter 发送，Shift + Enter 换行..."
							:bordered="false"
							:auto-size="{ minRows: 2, maxRows: 4 }"
							:disabled="loading"
							data-testid="input-global-ai-content"
							class="!bg-transparent text-xs text-slate-800 resize-none"
							@keydown="handleKeydown"
						/>
						<div class="flex justify-between items-center pt-1.5 px-1">
							<span class="text-[11px] text-slate-400 flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full" :class="loading ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'" />
								{{
									loading ? 'AI 正在深度思考并流式下发...' : '按 Enter 快速发送'
								}}
							</span>
							<button
								type="button"
								class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-0 transition-all duration-200 shadow-sm"
								:class="
									!inputContent.trim() || loading
										? 'bg-slate-100 text-slate-400 cursor-not-allowed'
										: 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-500/25 hover:shadow-md hover:-translate-y-0.5'
								"
								:disabled="!inputContent.trim() || loading"
								data-testid="btn-send-global-ai"
								@click="sendMessage"
							>
								<SendOutlined class="text-xs" />
								<span>发送</span>
							</button>
						</div>
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
	BulbOutlined,
	CheckCircleOutlined,
	UserOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { chatAiStream } from '@/api/ai';
import { addFinanceManger } from '@/views/selfFinance/financeManager/api';
import { extractRecordFromText, type StructuredRecord } from './extractRecord';
import { parseAiContent, type ParsedAiContent } from './aiContentParser';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	streaming?: boolean;
	structuredRecord?: StructuredRecord | null;
	recordSaving?: boolean;
	recordSaved?: boolean;
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
	{ text: '总结我最近的消费习惯', emoji: '📊', color: 'indigo' },
	{ text: '分析最近礼金往来盈亏', emoji: '🎁', color: 'rose' },
	{ text: '制定本月合理的支出预算', emoji: '💡', color: 'amber' },
	{ text: '列举日常记账的标准分类', emoji: '📝', color: 'emerald' },
];

const getPromptClass = (color: string) => {
	switch (color) {
		case 'indigo':
			return 'bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 border-indigo-200/60';
		case 'rose':
			return 'bg-rose-50/80 hover:bg-rose-100/90 text-rose-700 border-rose-200/60';
		case 'amber':
			return 'bg-amber-50/80 hover:bg-amber-100/90 text-amber-700 border-amber-200/60';
		case 'emerald':
			return 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-700 border-emerald-200/60';
		default:
			return 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200';
	}
};

const getParsedAiContent = (content: string): ParsedAiContent => {
	return parseAiContent(content);
};

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

	// 识别是否包含记账意图并解析结构化卡片
	const structured = extractRecordFromText(text);

	// 创建 AI 占位消息并开启流式
	const assistantMessage = reactive<ChatMessage>({
		role: 'assistant',
		content: '',
		streaming: true,
		structuredRecord: structured,
		recordSaving: false,
		recordSaved: false,
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

const handleSaveRecord = async (msg: ChatMessage) => {
	if (!msg.structuredRecord || msg.recordSaved) return;
	msg.recordSaving = true;
	try {
		const { code, message: errMsg } = (await addFinanceManger({
			name: msg.structuredRecord.name,
			amount: msg.structuredRecord.amount,
			incomeAndExpenses: msg.structuredRecord.incomeAndExpenses,
			typeCode: msg.structuredRecord.typeCode || '日常',
		})) || {};
		if (code === '200' || code === '00000') {
			msg.recordSaved = true;
			message.success('已成功入账！');
		} else {
			message.warning(errMsg || '入账失败');
		}
	} catch (e: unknown) {
		const text = e instanceof Error ? e.message : '网络异常，入账失败';
		message.error(text);
	} finally {
		msg.recordSaving = false;
	}
};

const clearMessages = () => {
	messages.value = [];
};

const handleOpenDrawerEvent = (e: Event) => {
	visible.value = true;
	const customEvent = e as CustomEvent<{ prompt?: string }>;
	if (customEvent.detail?.prompt) {
		inputContent.value = customEvent.detail.prompt;
	}
};

onMounted(() => {
	window.addEventListener('open-global-ai-drawer', handleOpenDrawerEvent);
});

onUnmounted(() => {
	window.removeEventListener('open-global-ai-drawer', handleOpenDrawerEvent);
});
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
	background-color: #4f46e5;
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

.message-bubble-user {
	background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
	color: #ffffff;
	border-radius: 16px 4px 16px 16px;
	max-width: 82%;
	padding: 10px 14px;
	box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
}

.message-bubble-ai {
	background-color: #ffffff;
	border: 1px solid #e2e8f0;
	color: #1e293b;
	border-radius: 4px 16px 16px 16px;
	max-width: 86%;
	padding: 12px 14px;
	box-shadow: 0 2px 8px rgba(148, 163, 184, 0.12);
}
</style>
