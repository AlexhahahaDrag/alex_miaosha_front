/**
 * AI 流式与结构化输出解析工具
 * 专门解决大模型返回纯 JSON 字符串（包含 summary / keyPoints）时的自动识别与格式化
 */

export interface StructuredInsight {
	type: 'structured-insight';
	summary: string;
	keyPoints: string[];
}

export interface StreamingInsight {
	type: 'streaming-insight';
	summary: string;
}

export interface PlainTextInsight {
	type: 'text';
	text: string;
}

export type ParsedAiContent =
	| StructuredInsight
	| StreamingInsight
	| PlainTextInsight;

/**
 * 解析大模型输出的文本内容
 * 自动识别完整 JSON、代码块包围的 JSON 以及流式过程中的半截 JSON
 */
export function parseAiContent(text: string): ParsedAiContent {
	if (!text) {
		return { type: 'text', text: '' };
	}

	const trimmed = text.trim();

	// 1. 尝试去除 Markdown 代码块 ```json ... ```
	let jsonCandidate = trimmed;
	const codeBlockMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
	if (codeBlockMatch) {
		jsonCandidate = codeBlockMatch[1].trim();
	}

	// 2. 尝试作为完整 JSON 解析
	if (
		(jsonCandidate.startsWith('{') && jsonCandidate.endsWith('}')) ||
		(jsonCandidate.startsWith('[') && jsonCandidate.endsWith(']'))
	) {
		try {
			const parsed = JSON.parse(jsonCandidate);
			if (
				parsed &&
				typeof parsed === 'object' &&
				!Array.isArray(parsed) &&
				('summary' in parsed || 'keyPoints' in parsed)
			) {
				const summary =
					typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
				const keyPoints = Array.isArray(parsed.keyPoints)
					? parsed.keyPoints
							.map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
							.filter(Boolean)
					: [];

				if (summary || keyPoints.length > 0) {
					return {
						type: 'structured-insight',
						summary,
						keyPoints,
					};
				}
			}
		} catch {
			// 不是合法或已闭合的完整 JSON，进入后续降级处理
		}
	}

	// 3. 流式阶段平滑捕获：文本以 "{" 开头且包含 "summary" 键，但整体尚未完全闭合
	if (jsonCandidate.startsWith('{') && jsonCandidate.includes('"summary"')) {
		// 尝试正则匹配 summary 字符串内容
		const match = jsonCandidate.match(
			/"summary"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/,
		);
		if (match) {
			try {
				const decodedSummary = JSON.parse(`"${match[1]}"`);
				return {
					type: 'streaming-insight',
					summary: decodedSummary,
				};
			} catch {
				return {
					type: 'streaming-insight',
					summary: match[1],
				};
			}
		}
	}

	// 4. 常规纯文本或 Markdown
	return {
		type: 'text',
		text,
	};
}
