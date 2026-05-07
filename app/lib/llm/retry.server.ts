/**
 * Retry logic for LLM operations.
 *
 * - Retry on timeout (1 retry)
 * - Retry on invalid JSON only if repair is possible (1 retry)
 * - Max retries configurable
 * - Small delays, injectable for tests
 */

import { LlmInvalidJsonError, LlmTimeoutError } from './errors';

export type RetryOptions = {
	maxRetries: number;
	delayMs?: number;
	sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runWithLlmRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions,
): Promise<T> {
	const { maxRetries, delayMs = 500, sleep = defaultSleep } = options;
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (err) {
			lastError = err;

			const isRetryable =
				err instanceof LlmTimeoutError || err instanceof LlmInvalidJsonError;

			if (!isRetryable || attempt >= maxRetries) {
				throw err;
			}

			await sleep(delayMs * (attempt + 1));
		}
	}

	throw lastError;
}
