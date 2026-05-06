import { describe, expect, it } from 'vitest';
import { getRuntimeEnv } from '~/lib/env/runtime.server';

describe('getRuntimeEnv', () => {
	it('retorna defaults seguros quando env é undefined', () => {
		const env = getRuntimeEnv();
		expect(env.APP_ENV).toBe('local');
		expect(env.LLM_ENABLED).toBe(false);
		expect(env.LLM_MODEL).toBe('deepseek-v4-flash');
		expect(env.LLM_TEMPERATURE).toBe('0.3');
		expect(env.LLM_TIMEOUT_MS).toBe('30000');
		expect(env.LLM_MAX_RETRIES).toBe('1');
		expect(env.PROMPT_DAILY_LIMIT).toBe('20');
		expect(env.USE_MOCK_LLM).toBe(true);
		expect(env.PUBLIC_BASE_URL).toBe('http://localhost:5173');
	});

	it('parseia valores booleanos corretamente', () => {
		const env = getRuntimeEnv({
			APP_ENV: 'test',
			LLM_ENABLED: 'true',
			USE_MOCK_LLM: 'false',
		});
		expect(env.APP_ENV).toBe('test');
		expect(env.LLM_ENABLED).toBe(true);
		expect(env.USE_MOCK_LLM).toBe(false);
	});

	it('ignora valores booleanos inválidos e mantém defaults', () => {
		const env = getRuntimeEnv({
			LLM_ENABLED: 'yes',
			USE_MOCK_LLM: 'no',
		});
		expect(env.LLM_ENABLED).toBe(false);
		expect(env.USE_MOCK_LLM).toBe(false);
	});
});
