/**
 * Rate limiting service — server-side only.
 *
 * Daily prompt generation limit per user.
 * Window: UTC day (YYYY-MM-DD).
 */

import type { DbClient } from '~/lib/db/client.server';
import {
	getRateLimitRecord,
	incrementRateLimit,
} from '~/lib/db/rate-limits.server';
import type { RuntimeEnv } from '~/lib/env/runtime.server';

export class RateLimitExceededError extends Error {
	readonly code = 'rate_limit.exceeded';
	constructor(
		message = 'Você atingiu o limite diário de prompts. Tente novamente amanhã.',
	) {
		super(message);
		this.name = 'RateLimitExceededError';
	}
}

export function getPromptDailyLimit(env: RuntimeEnv): number {
	const raw = env.PROMPT_DAILY_LIMIT;
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return 20;
	}
	return parsed;
}

export function getUtcDayWindowKey(date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

export async function getPromptGenerationUsage(
	db: DbClient,
	userId: string,
	date?: Date,
): Promise<{ count: number; limit: number; remaining: number }> {
	const windowKey = getUtcDayWindowKey(date);
	const record = await getRateLimitRecord(db, {
		action: 'prompt_generation',
		userId,
		windowKey,
	});

	const count = record ? Number(record.count) : 0;
	const limit = record ? Number(record.limit) : 20;
	const remaining = Math.max(0, limit - count);

	return { count, limit, remaining };
}

export async function assertPromptDailyLimit(
	db: DbClient,
	userId: string,
	env: RuntimeEnv,
	date?: Date,
): Promise<void> {
	const windowKey = getUtcDayWindowKey(date);
	const limit = getPromptDailyLimit(env);
	const record = await getRateLimitRecord(db, {
		action: 'prompt_generation',
		userId,
		windowKey,
	});

	const count = record ? Number(record.count) : 0;

	if (count >= limit) {
		throw new RateLimitExceededError();
	}
}

export async function consumePromptDailyLimit(
	db: DbClient,
	userId: string,
	env: RuntimeEnv,
	date?: Date,
): Promise<{ count: number; limit: number; remaining: number }> {
	const windowKey = getUtcDayWindowKey(date);
	const limit = getPromptDailyLimit(env);

	const result = await incrementRateLimit(db, {
		action: 'prompt_generation',
		limit,
		userId,
		windowKey,
	});

	if (!result.allowed) {
		throw new RateLimitExceededError();
	}

	return {
		count: result.count,
		limit: result.limit,
		remaining: Math.max(0, result.limit - result.count),
	};
}
