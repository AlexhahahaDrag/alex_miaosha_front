import { postData, baseService } from '@/utils/request';
import { useUserStore } from '@/store/modules/user/user';
import type { ResponseBody } from '@/types/api';
import { consumeSseBuffer, parseSseJson } from './sseParse';

/**
 * AI Agent：前端 AI 请求结构（与后端 com.alex.api.ai.vo.AiAnalyzeReq 对齐）
 */
export interface AiAnalyzeReq {
	bizType?: string;
	content: string;
	context?: Record<string, unknown>;
	depth?: number;

	// 可选覆盖：请求级别指定引擎/模型参数
	// deepseek | rule-based | sensenova | …
	engine?: 'deepseek' | 'rule-based' | 'sensenova' | string;
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

/**
 * AI Agent：前端 AI 响应结构（与后端 com.alex.api.ai.vo.AiAnalyzeResp 对齐）
 */
export interface AiAnalyzeResp {
	requestId?: string;
	summary?: string;
	keyPoints?: string[];
	engine?: string;
	costMs?: number;
}

export type AiResponseMode = 'batch' | 'stream';

export interface AiStreamHandlers {
	onMeta?: (meta: { requestId?: string; engine?: string }) => void;
	onDelta?: (text: string) => void;
	onDone?: (resp: AiAnalyzeResp) => void;
	onError?: (err: { code?: string; message?: string }) => void;
}

const baseAi = '/ai';
const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;

/** 与 `@/utils/request` 的 formatUrl 对齐，供 fetch 流式使用 */
function formatAiUrl(path: string): string {
	return path
		.replace(/^\/(api\/am-[^/]+)\/(.*)/, `/$1/${apiPrefix}/$2`)
		.replace(/\/+/g, '/');
}

export function chatAi(req: AiAnalyzeReq): Promise<ResponseBody<AiAnalyzeResp>> {
	// AI Agent：通过网关转发到 AI 服务
	return postData(baseService.ai + baseAi + '/chat', req);
}

/**
 * AI Agent：流式对话（SSE：meta | delta | done | error）
 * 使用 fetch + Authorization（与 request 拦截器同 token 来源），不用 EventSource。
 */
export async function chatAiStream(
	req: AiAnalyzeReq,
	handlers: AiStreamHandlers,
	signal?: AbortSignal,
): Promise<void> {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (!token) {
		handlers.onError?.({ code: '401', message: '请先登录' });
		return;
	}

	const url = formatAiUrl(baseService.ai + baseAi + '/chat/stream');
	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
				Authorization: token,
			},
			body: JSON.stringify(req),
			signal,
		});
	} catch (e: unknown) {
		if (signal?.aborted) {
			return;
		}
		const msg = e instanceof Error ? e.message : '网络异常';
		handlers.onError?.({ code: 'NETWORK', message: msg });
		return;
	}

	if (!response.ok) {
		handlers.onError?.({
			code: String(response.status),
			message: `流式请求失败（HTTP ${response.status}）`,
		});
		return;
	}

	const body = response.body;
	if (!body) {
		handlers.onError?.({ code: 'EMPTY', message: '响应体为空' });
		return;
	}

	const reader = body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';
	let settled = false;

	const settleError = (err: { code?: string; message?: string }) => {
		if (settled) return;
		settled = true;
		handlers.onError?.(err);
	};

	const settleDone = (resp: AiAnalyzeResp) => {
		if (settled) return;
		settled = true;
		handlers.onDone?.(resp);
	};

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			const { events, rest } = consumeSseBuffer(
				buffer,
				decoder.decode(value, { stream: true }),
			);
			buffer = rest;

			for (const ev of events) {
				if (settled) {
					return;
				}
				if (ev.event === 'meta') {
					const meta = parseSseJson<{ requestId?: string; engine?: string }>(
						ev.data,
					);
					if (meta) {
						handlers.onMeta?.(meta);
					}
				} else if (ev.event === 'delta') {
					const payload = parseSseJson<{ text?: string }>(ev.data);
					const text = payload?.text ?? '';
					if (text) {
						handlers.onDelta?.(text);
					}
				} else if (ev.event === 'done') {
					const resp = parseSseJson<AiAnalyzeResp>(ev.data) || {};
					settleDone(resp);
					return;
				} else if (ev.event === 'error') {
					const err = parseSseJson<{ code?: string; message?: string }>(
						ev.data,
					) || { message: ev.data || '流式对话失败' };
					settleError(err);
					return;
				}
			}
		}

		if (!settled) {
			settleError({ code: 'INCOMPLETE', message: '流式连接已结束但未收到 done' });
		}
	} catch (e: unknown) {
		if (signal?.aborted) {
			return;
		}
		const msg = e instanceof Error ? e.message : '流式读取失败';
		settleError({ code: 'READ', message: msg });
	} finally {
		try {
			reader.releaseLock();
		} catch {
			// ignore
		}
	}
}
