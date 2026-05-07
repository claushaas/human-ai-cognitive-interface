/**
 * Mock LLM client — deterministic, no network, no randomness.
 *
 * Used in CI, test, and local when USE_MOCK_LLM=true.
 */

import type {
	LlmClient,
	LlmGenerateInput,
	LlmGenerateResult,
	LlmProvider,
} from './types';

export type MockMode =
	| 'success'
	| 'invalid_json'
	| 'timeout'
	| 'provider_error'
	| 'empty'
	| 'too_long';

export type MockLlmClientOptions = {
	mode?: MockMode;
	model?: string;
	fixture?: unknown;
};

const DEFAULT_MOCK_MODEL = 'mock-haci-v1';

export function createMockLlmClient(
	options: MockLlmClientOptions = {},
): LlmClient {
	const mode = options.mode ?? 'success';
	const model = options.model ?? DEFAULT_MOCK_MODEL;

	return {
		async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
			const start = performance.now();

			switch (mode) {
				case 'timeout': {
					await sleep(input.timeoutMs ?? 1);
					throw new Error('Mock timeout');
				}
				case 'provider_error': {
					throw new Error('Mock provider error');
				}
				case 'empty': {
					return buildResult({
						content: '',
						input,
						model,
						start,
					});
				}
				case 'too_long': {
					return buildResult({
						content: 'x'.repeat(200_000),
						input,
						model,
						start,
					});
				}
				case 'invalid_json': {
					return buildResult({
						content: 'this is not json {',
						input,
						model,
						start,
					});
				}
				default: {
					const content =
						options.fixture !== undefined
							? JSON.stringify(options.fixture)
							: buildDefaultSuccessContent(input);
					return buildResult({
						content,
						input,
						model,
						start,
					});
				}
			}
		},
	};
}

function buildResult({
	content,
	input,
	model,
	start,
}: {
	content: string;
	input: LlmGenerateInput;
	model: string;
	start: number;
}): LlmGenerateResult {
	const latencyMs = Math.round(performance.now() - start);
	return {
		content,
		finishReason: 'stop',
		latencyMs,
		model,
		provider: 'mock' as LlmProvider,
		usage: {
			inputTokens: estimateTokens(input.messages),
			outputTokens: estimateTokens([{ content, role: 'assistant' }]),
			totalTokens:
				estimateTokens(input.messages) +
				estimateTokens([{ content, role: 'assistant' }]),
		},
	};
}

function buildDefaultSuccessContent(input: LlmGenerateInput): string {
	const lastUser = [...input.messages].reverse().find((m) => m.role === 'user');
	const prompt =
		lastUser?.content ??
		input.messages[input.messages.length - 1]?.content ??
		'';

	return JSON.stringify({
		generatedAt: new Date().toISOString(),
		prompt: `Mock prompt generated for: ${prompt.slice(0, 100)}`,
		version: 'v1',
	});
}

function estimateTokens(
	messages: Array<{ content?: string; role?: string }>,
): number {
	const totalChars = messages.reduce(
		(sum, m) => sum + (m.content?.length ?? 0),
		0,
	);
	return Math.ceil(totalChars / 4);
}

function sleep(ms: number): Promise<void> {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Mock timeout')), ms);
	});
}
