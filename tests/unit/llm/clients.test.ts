/**
 * LLM client tests.
 */

import { describe, expect, it } from 'vitest';
import { getLlmClient } from '~/lib/llm/client.server';
import {
	LlmConfigurationError,
	LlmDisabledError,
	LlmInvalidJsonError,
	LlmProviderError,
	LlmTimeoutError,
} from '~/lib/llm/errors';
import { createMockLlmClient } from '~/lib/llm/mock.server';

describe('mock LLM client', () => {
	it('returns deterministic success result', async () => {
		const client = createMockLlmClient();
		const result = await client.generate({
			messages: [{ content: 'Hello', role: 'user' }],
			responseFormat: 'json',
		});

		expect(result.provider).toBe('mock');
		expect(result.model).toBe('mock-haci-v1');
		expect(typeof result.content).toBe('string');
		expect(result.content.length).toBeGreaterThan(0);
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
		expect(result.usage).toBeDefined();
	});

	it('returns fixture when provided', async () => {
		const fixture = { test: true, value: 42 };
		const client = createMockLlmClient({ fixture });
		const result = await client.generate({
			messages: [{ content: 'Test', role: 'user' }],
			responseFormat: 'json',
		});

		expect(JSON.parse(result.content)).toEqual(fixture);
	});

	it('throws on timeout mode', async () => {
		const client = createMockLlmClient({ mode: 'timeout' });
		await expect(
			client.generate({
				messages: [{ content: 'Test', role: 'user' }],
				responseFormat: 'json',
				timeoutMs: 1,
			}),
		).rejects.toThrow('Mock timeout');
	});

	it('throws on provider error mode', async () => {
		const client = createMockLlmClient({ mode: 'provider_error' });
		await expect(
			client.generate({
				messages: [{ content: 'Test', role: 'user' }],
				responseFormat: 'json',
			}),
		).rejects.toThrow('Mock provider error');
	});

	it('returns empty content on empty mode', async () => {
		const client = createMockLlmClient({ mode: 'empty' });
		const result = await client.generate({
			messages: [{ content: 'Test', role: 'user' }],
			responseFormat: 'json',
		});

		expect(result.content).toBe('');
	});

	it('returns invalid json on invalid_json mode', async () => {
		const client = createMockLlmClient({ mode: 'invalid_json' });
		const result = await client.generate({
			messages: [{ content: 'Test', role: 'user' }],
			responseFormat: 'json',
		});

		expect(() => JSON.parse(result.content)).toThrow();
	});
});

describe('getLlmClient', () => {
	it('returns mock when APP_ENV=test', () => {
		const env = {
			APP_ENV: 'test',
			LLM_ENABLED: false,
			LLM_MAX_RETRIES: '1',
			LLM_MODEL: 'deepseek-v4-flash',
			LLM_PROVIDER: 'deepseek',
			LLM_TEMPERATURE: '0.2',
			LLM_TIMEOUT_MS: '30000',
			PROMPT_DAILY_LIMIT: '20',
			PUBLIC_BASE_URL: 'http://localhost:5173',
			USE_MOCK_LLM: false,
		} as const;

		const client = getLlmClient(
			env as unknown as import('~/lib/env/runtime.server').RuntimeEnv,
		);
		expect(client).toBeDefined();
	});

	it('returns mock when USE_MOCK_LLM=true', () => {
		const env = {
			APP_ENV: 'local',
			LLM_ENABLED: false,
			LLM_MAX_RETRIES: '1',
			LLM_MODEL: 'deepseek-v4-flash',
			LLM_PROVIDER: 'deepseek',
			LLM_TEMPERATURE: '0.2',
			LLM_TIMEOUT_MS: '30000',
			PROMPT_DAILY_LIMIT: '20',
			PUBLIC_BASE_URL: 'http://localhost:5173',
			USE_MOCK_LLM: true,
		} as const;

		const client = getLlmClient(
			env as unknown as import('~/lib/env/runtime.server').RuntimeEnv,
		);
		expect(client).toBeDefined();
	});

	it('throws LlmDisabledError when LLM_ENABLED=false and not mock', () => {
		const env = {
			APP_ENV: 'staging',
			LLM_ENABLED: false,
			LLM_MAX_RETRIES: '1',
			LLM_MODEL: 'deepseek-v4-flash',
			LLM_PROVIDER: 'deepseek',
			LLM_TEMPERATURE: '0.2',
			LLM_TIMEOUT_MS: '30000',
			PROMPT_DAILY_LIMIT: '20',
			PUBLIC_BASE_URL: 'http://localhost:5173',
			USE_MOCK_LLM: false,
		} as const;

		expect(() =>
			getLlmClient(
				env as unknown as import('~/lib/env/runtime.server').RuntimeEnv,
			),
		).toThrow(LlmDisabledError);
	});

	it('throws LlmConfigurationError when real provider enabled but no API key', () => {
		const env = {
			APP_ENV: 'staging',
			LLM_ENABLED: true,
			LLM_MAX_RETRIES: '1',
			LLM_MODEL: 'deepseek-v4-flash',
			LLM_PROVIDER: 'deepseek',
			LLM_TEMPERATURE: '0.2',
			LLM_TIMEOUT_MS: '30000',
			PROMPT_DAILY_LIMIT: '20',
			PUBLIC_BASE_URL: 'http://localhost:5173',
			USE_MOCK_LLM: false,
		} as const;

		expect(() =>
			getLlmClient(
				env as unknown as import('~/lib/env/runtime.server').RuntimeEnv,
			),
		).toThrow(LlmConfigurationError);
	});
});

describe('errors', () => {
	it('LlmDisabledError has correct code', () => {
		const err = new LlmDisabledError();
		expect(err.code).toBe('llm.disabled');
		expect(err.message).toContain('desativada');
	});

	it('LlmProviderError has statusCode', () => {
		const err = new LlmProviderError('test', { statusCode: 500 });
		expect(err.code).toBe('llm.provider_error');
		expect(err.statusCode).toBe(500);
	});

	it('LlmTimeoutError has correct code', () => {
		const err = new LlmTimeoutError();
		expect(err.code).toBe('llm.timeout');
	});

	it('LlmInvalidJsonError has rawContent', () => {
		const err = new LlmInvalidJsonError('test', { rawContent: 'bad json' });
		expect(err.code).toBe('llm.invalid_json');
		expect(err.rawContent).toBe('bad json');
	});
});
