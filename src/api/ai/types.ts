export interface AiChatReq {
	bizType?: string;
	content: string;
	engine?: 'deepseek' | 'sensenova' | 'rule-based' | string;
	context?: Record<string, unknown>;
}

export interface AiChatResp {
	requestId?: string;
	summary?: string;
	engine?: string;
	costMs?: number;
	keyPoints?: string[];
}

export interface AiChatStreamCallbacks {
	onMeta?: (meta: { requestId: string; engine: string }) => void;
	onDelta?: (text: string) => void;
	onDone?: (resp: AiChatResp) => void;
	onError?: (err: { code?: string; message: string }) => void;
}
