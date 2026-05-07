import { describe, expect, it } from 'vitest';
import {
	getCloudflareAccessUser,
	normalizeEmail,
} from '../../../app/lib/auth/access.server';
import { getDevUser } from '../../../app/lib/auth/dev-user.server';

describe('auth', () => {
	describe('access.server', () => {
		it('extracts user from valid Cloudflare Access header', () => {
			const request = new Request('http://localhost', {
				headers: {
					'Cf-Access-Authenticated-User-Email': 'user@example.com',
				},
			});
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('authenticated');
			if (result.status === 'authenticated') {
				expect(result.user.email).toBe('user@example.com');
				expect(result.user.provider).toBe('cloudflare-access');
			}
		});

		it('normalizes email to lowercase', () => {
			const request = new Request('http://localhost', {
				headers: {
					'Cf-Access-Authenticated-User-Email': 'User@Example.COM',
				},
			});
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('authenticated');
			if (result.status === 'authenticated') {
				expect(result.user.email).toBe('user@example.com');
			}
		});

		it('rejects missing email header', () => {
			const request = new Request('http://localhost');
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('unauthenticated');
		});

		it('rejects empty email', () => {
			const request = new Request('http://localhost', {
				headers: {
					'Cf-Access-Authenticated-User-Email': '',
				},
			});
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('unauthenticated');
		});

		it('rejects invalid email format', () => {
			const request = new Request('http://localhost', {
				headers: {
					'Cf-Access-Authenticated-User-Email': 'not-an-email',
				},
			});
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('unauthenticated');
		});

		it('does not use query params for identity', () => {
			const request = new Request('http://localhost?email=attacker@evil.com');
			const result = getCloudflareAccessUser(request);
			expect(result.status).toBe('unauthenticated');
		});
	});

	describe('dev-user.server', () => {
		it('works in local environment', () => {
			const user = getDevUser({
				APP_ENV: 'local',
				LLM_ENABLED: false,
				LLM_MAX_RETRIES: '1',
				LLM_MODEL: 'test',
				LLM_TEMPERATURE: '0.3',
				LLM_TIMEOUT_MS: '30000',
				PROMPT_DAILY_LIMIT: '20',
				PUBLIC_BASE_URL: 'http://localhost',
				USE_MOCK_LLM: true,
			});
			expect(user.email).toBe('dev@haci.local');
			expect(user.provider).toBe('dev');
		});

		it('works in test environment', () => {
			const user = getDevUser({
				APP_ENV: 'test',
				LLM_ENABLED: false,
				LLM_MAX_RETRIES: '1',
				LLM_MODEL: 'test',
				LLM_TEMPERATURE: '0.3',
				LLM_TIMEOUT_MS: '30000',
				PROMPT_DAILY_LIMIT: '20',
				PUBLIC_BASE_URL: 'http://localhost',
				USE_MOCK_LLM: true,
			});
			expect(user.provider).toBe('dev');
		});

		it('fails in production', () => {
			expect(() =>
				getDevUser({
					APP_ENV: 'production',
					LLM_ENABLED: false,
					LLM_MAX_RETRIES: '1',
					LLM_MODEL: 'test',
					LLM_TEMPERATURE: '0.3',
					LLM_TIMEOUT_MS: '30000',
					PROMPT_DAILY_LIMIT: '20',
					PUBLIC_BASE_URL: 'http://localhost',
					USE_MOCK_LLM: true,
				}),
			).toThrow('local/test');
		});

		it('uses DEV_AUTH_EMAIL when provided', () => {
			const user = getDevUser({
				APP_ENV: 'local',
				DEV_AUTH_EMAIL: 'custom@example.com',
				LLM_ENABLED: false,
				LLM_MAX_RETRIES: '1',
				LLM_MODEL: 'test',
				LLM_TEMPERATURE: '0.3',
				LLM_TIMEOUT_MS: '30000',
				PROMPT_DAILY_LIMIT: '20',
				PUBLIC_BASE_URL: 'http://localhost',
				USE_MOCK_LLM: true,
			});
			expect(user.email).toBe('custom@example.com');
		});
	});

	describe('normalizeEmail', () => {
		it('trims and lowercases', () => {
			expect(normalizeEmail('  User@EXAMPLE.COM  ')).toBe('user@example.com');
		});
	});
});
