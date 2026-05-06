import { describe, expect, it } from 'vitest';
import { getPublicEnv } from '~/lib/env/public';

describe('getPublicEnv', () => {
	it('retorna defaults seguros quando não há env no window', () => {
		const env = getPublicEnv();
		expect(env.APP_ENV).toBe('local');
		expect(env.PUBLIC_APP_NAME).toBe('HACI');
		expect(env.PUBLIC_BASE_URL).toBe('http://localhost:5173');
		expect(env.PUBLIC_DEFAULT_LOCALE).toBe('pt-BR');
		expect(env.PUBLIC_SUPPORTED_LOCALES).toBe('pt-BR,en');
	});

	it('merge env do window quando disponível', () => {
		(
			globalThis as unknown as {
				window: { __publicEnv?: Record<string, string> };
			}
		).window = {
			__publicEnv: {
				APP_ENV: 'staging',
				PUBLIC_APP_NAME: 'Test',
			},
		};
		const env = getPublicEnv();
		expect(env.APP_ENV).toBe('staging');
		expect(env.PUBLIC_APP_NAME).toBe('Test');
		expect(env.PUBLIC_BASE_URL).toBe('http://localhost:5173');
		delete (
			globalThis as unknown as {
				window?: { __publicEnv?: Record<string, string> };
			}
		).window;
	});
});
