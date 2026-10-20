import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/request', () => ({
	postData: vi.fn(),
	baseService: { ai: '/api/am-ai' },
}));

import { chatAiStream } from '@/api/ai';

describe('Global AI Assistant Stream Client Test', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('正确流式分帧解析 meta -> delta -> done 事件并回调', async () => {
		const ssePayload = [
			'event: meta\ndata: {"requestId":"ai-req-123","engine":"deepseek"}\n\n',
			'event: delta\ndata: {"text":"您好，"}\n\n',
			'event: delta\ndata: {"text":"我是智能业务助手。"}\n\n',
			'event: done\ndata: {"summary":"您好，我是智能业务助手。","costMs":320}\n\n',
		].join('');

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode(ssePayload));
				controller.close();
			},
		});

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				body: stream,
			}),
		);

		let metaResult: { requestId: string; engine: string } | null = null;
		const deltaList: string[] = [];
		let doneResult: unknown = null;

		await chatAiStream(
			{
				bizType: 'test-chat',
				content: '测试问答',
			},
			{
				onMeta: (meta) => {
					metaResult = meta;
				},
				onDelta: (text) => {
					deltaList.push(text);
				},
				onDone: (resp) => {
					doneResult = resp;
				},
			},
		);

		expect(metaResult).toEqual({
			requestId: 'ai-req-123',
			engine: 'deepseek',
		});
		expect(deltaList.join('')).toBe('您好，我是智能业务助手。');
		expect(doneResult).toMatchObject({
			summary: '您好，我是智能业务助手。',
			costMs: 320,
		});
	});

	it('HTTP 异常或网络断开时触发 onError 回调', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 502,
			}),
		);

		const errorCaptured: { code?: string; message: string } = {
			code: undefined,
			message: '',
		};

		await chatAiStream(
			{
				bizType: 'test-fail',
				content: '网关异常测试',
			},
			{
				onError: (err) => {
					errorCaptured.code = err.code;
					errorCaptured.message = err.message;
				},
			},
		);

		expect(errorCaptured.code).toBe('STREAM_ERROR');
		expect(errorCaptured.message).toContain('HTTP error 502');
	});
});
