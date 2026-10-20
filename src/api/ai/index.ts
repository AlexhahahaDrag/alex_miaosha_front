import { postData, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';
import type { AiChatReq, AiChatResp, AiChatStreamCallbacks } from './types';

const baseAiPath = '/api/v1/ai';

function resolveToken(): string {
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			const direct = window.localStorage.getItem('token');
			if (direct) return direct;
			const appUserState = window.localStorage.getItem('app-user');
			if (appUserState) {
				const parsed = JSON.parse(appUserState);
				if (parsed?.token) return parsed.token;
			}
		}
	} catch {
		// ignore
	}
	return '';
}

/**
 * 同步 AI 对话接口
 */
export function chatAi(params: AiChatReq): Promise<ResponseBody<AiChatResp>> {
	return postData(baseService.ai + baseAiPath + '/chat', params);
}

/**
 * 通用 AI 对话流式接口 (通过 SSE 实时下发 meta / delta / done / error)
 */
export async function chatAiStream(
	params: AiChatReq,
	callbacks: AiChatStreamCallbacks,
): Promise<void> {
	const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;
	const rawUrl =
		baseService.ai +
		(apiPrefix ? `/${apiPrefix}` : '/api/v1') +
		'/ai/chat/stream';
	const url = rawUrl.replace(/\/+/g, '/');
	const token = resolveToken();

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
				...(token ? { Authorization: token } : {}),
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		if (!response.body) {
			throw new Error('ReadableStream not supported');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = '';
		let currentEventName = 'message';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.startsWith('event:')) {
					currentEventName = trimmed.substring(6).trim();
				} else if (trimmed.startsWith('data:')) {
					const dataStr = trimmed.substring(5).trim();
					if (dataStr) {
						try {
							const payload = JSON.parse(dataStr);
							if (currentEventName === 'meta') {
								callbacks.onMeta?.(payload);
							} else if (currentEventName === 'delta') {
								const text =
									typeof payload === 'string' ? payload : (payload.text ?? '');
								callbacks.onDelta?.(text);
							} else if (currentEventName === 'done') {
								callbacks.onDone?.(payload as AiChatResp);
							} else if (currentEventName === 'error') {
								callbacks.onError?.(payload);
							}
						} catch {
							// 纯文本数据兜底
							if (currentEventName === 'delta') {
								callbacks.onDelta?.(dataStr);
							}
						}
					}
				}
			}
		}
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		callbacks.onError?.({ code: 'STREAM_ERROR', message });
	}
}

export * from './types';
