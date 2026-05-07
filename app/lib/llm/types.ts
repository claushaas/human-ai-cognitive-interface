/**
 * LLM types — pure, no React, no Drizzle, no browser APIs.
 * Compatible with Cloudflare Workers.
 */

export type LlmProvider = 'deepseek' | 'mock';

export type LlmMessageRole = 'system' | 'user' | 'assistant';

export type LlmMessage = {
	role: LlmMessageRole;
	content: string;
};

export type LlmResponseFormat = 'json' | 'text';

export type LlmGenerateInput = {
	messages: LlmMessage[];
	responseFormat: LlmResponseFormat;
	schemaName?: string;
	temperature?: number;
	maxTokens?: number;
	timeoutMs?: number;
	metadata?: Record<string, string | number | boolean>;
};

export type LlmUsage = {
	inputTokens?: number;
	outputTokens?: number;
	totalTokens?: number;
};

export type LlmGenerateResult = {
	provider: LlmProvider;
	model: string;
	content: string;
	usage?: LlmUsage;
	latencyMs?: number;
	finishReason?: string;
};

export interface LlmClient {
	generate(input: LlmGenerateInput): Promise<LlmGenerateResult>;
}

export type LlmRuntimeConfig = {
	provider: LlmProvider;
	model: string;
	temperature: number;
	timeoutMs: number;
	maxRetries: number;
	enabled: boolean;
	useMock: boolean;
	apiKey?: string;
	baseUrl?: string;
};
