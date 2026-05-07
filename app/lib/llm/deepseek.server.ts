/**
 * DeepSeek LLM client — server-side only.
 *
 * Compatible with Cloudflare Workers.
 * Uses standard OpenAI-compatible chat completions API.
 */

import {
	LlmConfigurationError,
	LlmProviderError,
	LlmTimeoutError,
} from './errors';
import type {
	LlmClient,
	LlmGenerateInput,
	LlmGenerateResult,
	LlmMessage,
} from './types';

export type DeepSeekConfig = {
	apiKey: string;
	baseUrl: string;
	model: string;
	temperature: number;
	timeoutMs: number;
};

export function createDeepSeekClient(config: DeepSeekConfig): LlmClient {
	return {
		async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
			if (!config.apiKey) {
				throw new LlmConfigurationError(
					'Chave de API DeepSeek não configurada.',
				);
			}

			const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
			const body = buildRequestBody(input, config);

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				input.timeoutMs ?? config.timeoutMs,
			);

			const start = performance.now();

			try {
				const response = await fetch(url, {
					body: JSON.stringify(body),
					headers: {
						Authorization: `Bearer ${config.apiKey}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const status = response.status;
					let message = `Erro do provedor (HTTP ${status})`;
					if (status === 401) {
						message = 'Autenticação falhou com o provedor de IA.';
					} else if (status === 429) {
						message =
							'Limite de requisições do provedor atingido. Tente novamente em alguns instantes.';
					} else if (status >= 500) {
						message =
							'Provedor de IA temporariamente indisponível. Tente novamente.';
					}
					throw new LlmProviderError(message, { statusCode: status });
				}

				const data = (await response.json()) as unknown;
				return parseResponse(data, config.model, start);
			} catch (err) {
				clearTimeout(timeoutId);
				if (err instanceof LlmProviderError) throw err;
				if (err instanceof LlmConfigurationError) throw err;
				if (err instanceof Error && err.name === 'AbortError') {
					throw new LlmTimeoutError();
				}
				throw new LlmProviderError('Erro ao comunicar com o provedor de IA.', {
					cause: err,
				});
			}
		},
	};
}

function buildRequestBody(
	input: LlmGenerateInput,
	config: DeepSeekConfig,
): Record<string, unknown> {
	return {
		max_tokens: input.maxTokens,
		messages: input.messages.map((m: LlmMessage) => ({
			content: m.content,
			role: m.role,
		})),
		model: config.model,
		response_format:
			input.responseFormat === 'json' ? { type: 'json_object' } : undefined,
		temperature: input.temperature ?? config.temperature,
	};
}

function parseResponse(
	data: unknown,
	model: string,
	start: number,
): LlmGenerateResult {
	if (!data || typeof data !== 'object') {
		throw new LlmProviderError('Resposta inválida do provedor.');
	}

	const d = data as Record<string, unknown>;

	const choices = d.choices;
	if (!Array.isArray(choices) || choices.length === 0) {
		throw new LlmProviderError('Resposta do provedor sem conteúdo.');
	}

	const first = choices[0] as Record<string, unknown>;
	const message = first.message as Record<string, unknown> | undefined;
	const content = typeof message?.content === 'string' ? message.content : '';
	const finishReason =
		typeof first.finish_reason === 'string' ? first.finish_reason : undefined;

	const usage = d.usage as Record<string, number> | undefined;

	return {
		content,
		finishReason,
		latencyMs: Math.round(performance.now() - start),
		model,
		provider: 'deepseek',
		usage: usage
			? {
					inputTokens: usage.prompt_tokens,
					outputTokens: usage.completion_tokens,
					totalTokens: usage.total_tokens,
				}
			: undefined,
	};
}
