import { describe, expect, it } from 'vitest';
import {
	getPromptDailyLimit,
	getUtcDayWindowKey,
	RateLimitExceededError,
} from '../../../app/lib/rate-limit/rate-limit.server';

describe('rate-limit', () => {
	describe('getUtcDayWindowKey', () => {
		it('uses UTC', () => {
			const date = new Date('2026-05-01T12:00:00Z');
			expect(getUtcDayWindowKey(date)).toBe('2026-05-01');
		});

		it('defaults to today', () => {
			const key = getUtcDayWindowKey();
			expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('getPromptDailyLimit', () => {
		it('returns 20 by default', () => {
			const limit = getPromptDailyLimit({
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
			expect(limit).toBe(20);
		});

		it('allows custom limit', () => {
			const limit = getPromptDailyLimit({
				APP_ENV: 'local',
				LLM_ENABLED: false,
				LLM_MAX_RETRIES: '1',
				LLM_MODEL: 'test',
				LLM_TEMPERATURE: '0.3',
				LLM_TIMEOUT_MS: '30000',
				PROMPT_DAILY_LIMIT: '50',
				PUBLIC_BASE_URL: 'http://localhost',
				USE_MOCK_LLM: true,
			});
			expect(limit).toBe(50);
		});

		it('falls back to 20 for invalid values', () => {
			const limit = getPromptDailyLimit({
				APP_ENV: 'local',
				LLM_ENABLED: false,
				LLM_MAX_RETRIES: '1',
				LLM_MODEL: 'test',
				LLM_TEMPERATURE: '0.3',
				LLM_TIMEOUT_MS: '30000',
				PROMPT_DAILY_LIMIT: 'invalid',
				PUBLIC_BASE_URL: 'http://localhost',
				USE_MOCK_LLM: true,
			});
			expect(limit).toBe(20);
		});
	});

	describe('RateLimitExceededError', () => {
		it('has correct code', () => {
			const err = new RateLimitExceededError();
			expect(err.code).toBe('rate_limit.exceeded');
			expect(err.message).toContain('limite diário');
		});
	});
});
