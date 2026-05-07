/**
 * LLM client selector — chooses mock or real provider based on env.
 *
 * Rules:
 * - APP_ENV=test → mock mandatory
 * - USE_MOCK_LLM=true → mock
 * - LLM_ENABLED=false → LlmDisabledError
 * - otherwise → DeepSeek real (requires API key)
 */

import type { RuntimeEnv } from '~/lib/env/runtime.server';
import { createDeepSeekClient } from './deepseek.server';
import { LlmConfigurationError, LlmDisabledError } from './errors';
import { createMockLlmClient } from './mock.server';
import type { LlmClient, LlmRuntimeConfig } from './types';

export function getLlmRuntimeConfig(env: RuntimeEnv): LlmRuntimeConfig {
	const provider = env.LLM_PROVIDER ?? 'deepseek';
	const validProvider: import('./types').LlmProvider =
		provider === 'mock' ? 'mock' : 'deepseek';

	return {
		apiKey: env.DEEPSEEK_API_KEY,
		baseUrl: env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
		enabled: env.LLM_ENABLED === true,
		maxRetries: Number.parseInt(env.LLM_MAX_RETRIES ?? '1', 10),
		model: env.LLM_MODEL ?? 'deepseek-v4-flash',
		provider: validProvider,
		temperature: Number.parseFloat(env.LLM_TEMPERATURE ?? '0.2'),
		timeoutMs: Number.parseInt(env.LLM_TIMEOUT_MS ?? '30000', 10),
		useMock: env.USE_MOCK_LLM === true || env.APP_ENV === 'test',
	};
}

export function getLlmClient(env: RuntimeEnv): LlmClient {
	const config = getLlmRuntimeConfig(env);

	if (env.APP_ENV === 'test') {
		return createMockLlmClient();
	}

	if (config.useMock) {
		return createMockLlmClient();
	}

	if (!config.enabled) {
		throw new LlmDisabledError();
	}

	if (config.provider !== 'deepseek') {
		throw new LlmConfigurationError(
			`Provedor LLM não suportado: ${config.provider}`,
		);
	}

	if (!config.apiKey) {
		throw new LlmConfigurationError(
			'Chave de API DeepSeek (DEEPSEEK_API_KEY) não configurada.',
		);
	}

	return createDeepSeekClient({
		apiKey: config.apiKey,
		baseUrl: config.baseUrl ?? 'https://api.deepseek.com',
		model: config.model,
		temperature: config.temperature,
		timeoutMs: config.timeoutMs,
	});
}
