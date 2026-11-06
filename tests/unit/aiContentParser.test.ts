import { describe, it, expect } from 'vitest';
import { parseAiContent } from '@/components/ai/aiContentParser';

describe('aiContentParser 解析契约测试', () => {
	it('空内容安全返回空文本', () => {
		expect(parseAiContent('')).toEqual({ type: 'text', text: '' });
		expect(parseAiContent('   ')).toEqual({ type: 'text', text: '   ' });
	});

	it('普通对话文本原样返回', () => {
		const raw = '您好！我是您的智能财务助手，请问有什么可以帮您？';
		const res = parseAiContent(raw);
		expect(res.type).toBe('text');
		if (res.type === 'text') {
			expect(res.text).toBe(raw);
		}
	});

	it('完整 JSON 字符串解析为结构化洞察对象', () => {
		const raw = JSON.stringify({
			summary: '本月消费稳定，主要为生活刚需。',
			keyPoints: [
				'餐饮支出占比 45%',
				'交通支出占比 18%',
				'购物支出占比 25%',
			],
		});

		const res = parseAiContent(raw);
		expect(res.type).toBe('structured-insight');
		if (res.type === 'structured-insight') {
			expect(res.summary).toBe('本月消费稳定，主要为生活刚需。');
			expect(res.keyPoints).toHaveLength(3);
			expect(res.keyPoints[0]).toBe('餐饮支出占比 45%');
		}
	});

	it('Markdown 代码块包裹的 JSON 正确提取与解析', () => {
		const raw = `\`\`\`json
{
  "summary": "根据近期账单，结余健康。",
  "keyPoints": ["节约了 ¥500", "建议适当控制外卖"]
}
\`\`\``;

		const res = parseAiContent(raw);
		expect(res.type).toBe('structured-insight');
		if (res.type === 'structured-insight') {
			expect(res.summary).toBe('根据近期账单，结余健康。');
			expect(res.keyPoints).toEqual(['节约了 ¥500', '建议适当控制外卖']);
		}
	});

	it('流式阶段半截 JSON 优雅降级并提前捕获 summary 文本', () => {
		const streamingChunk = '{"summary":"根据您最近的消费记录，整体消费习惯';
		const res = parseAiContent(streamingChunk);
		expect(res.type).toBe('streaming-insight');
		if (res.type === 'streaming-insight') {
			expect(res.summary).toBe('根据您最近的消费记录，整体消费习惯');
		}
	});
});
