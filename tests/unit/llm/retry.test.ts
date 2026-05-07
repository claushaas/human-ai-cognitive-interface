/**
 * Retry logic tests.
 */

import { describe, expect, it } from 'vitest';
import { LlmInvalidJsonError, LlmTimeoutError } from '~/lib/llm/errors';
import { runWithLlmRetry } from '~/lib/llm/retry.server';

describe('runWithLlmRetry', () => {
	it('returns result on first success', async () => {
		const result = await runWithLlmRetry(async () => 'success', {
			maxRetries: 1,
		});
		expect(result).toBe('success');
	});

	it('retries on timeout and succeeds', async () => {
		let attempts = 0;
		const result = await runWithLlmRetry(
			async () => {
				attempts++;
				if (attempts === 1) {
					throw new LlmTimeoutError();
				}
				return 'success';
			},
			{ delayMs: 10, maxRetries: 1 },
		);
		expect(result).toBe('success');
		expect(attempts).toBe(2);
	});

	it('retries on invalid JSON and succeeds', async () => {
		let attempts = 0;
		const result = await runWithLlmRetry(
			async () => {
				attempts++;
				if (attempts === 1) {
					throw new LlmInvalidJsonError();
				}
				return 'success';
			},
			{ delayMs: 10, maxRetries: 1 },
		);
		expect(result).toBe('success');
		expect(attempts).toBe(2);
	});

	it('does not exceed max retries', async () => {
		let attempts = 0;
		await expect(
			runWithLlmRetry(
				async () => {
					attempts++;
					throw new LlmTimeoutError();
				},
				{ delayMs: 10, maxRetries: 1 },
			),
		).rejects.toThrow(LlmTimeoutError);
		expect(attempts).toBe(2); // initial + 1 retry
	});

	it('uses injected sleep', async () => {
		let slept = 0;
		const sleep = async (ms: number) => {
			slept += ms;
		};
		let attempts = 0;
		await runWithLlmRetry(
			async () => {
				attempts++;
				if (attempts === 1) {
					throw new LlmTimeoutError();
				}
				return 'success';
			},
			{ delayMs: 100, maxRetries: 1, sleep },
		);
		expect(slept).toBe(100);
	});
});
