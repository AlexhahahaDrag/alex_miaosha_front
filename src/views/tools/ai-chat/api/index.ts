import { postData, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';

/**
 * AI Agent：前端 AI 请求结构（与后端 com.alex.api.ai.vo.AiAnalyzeReq 对齐）
 */
export interface AiAnalyzeReq {
	bizType?: string;
	content: string;
	context?: Record<string, unknown>;
	depth?: number;

	// 可选覆盖：请求级别指定引擎/模型参数
	engine?: 'deepseek' | 'rule-based' | string;
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

const baseAi = '/api/v1/ai';

export function analyzeAi(req: AiAnalyzeReq): Promise<ResponseBody<AiAnalyzeResp>> {
	// AI Agent：通过网关转发到 AI 服务
	return postData(baseService.ai + baseAi + '/analyze', req);
}


