/**
 * Rate limits repository — server-side only.
 */

import { and, eq } from 'drizzle-orm';
import type { DbClient } from './client.server';
import { rateLimits } from './schema';

export async function getRateLimitRecord(
	db: DbClient,
	input: {
		userId: string;
		windowKey: string;
		action: string;
	},
) {
	const result = await db
		.select()
		.from(rateLimits)
		.where(
			and(
				eq(rateLimits.userId, input.userId),
				eq(rateLimits.windowKey, input.windowKey),
				eq(rateLimits.action, input.action),
			),
		)
		.limit(1);

	return result[0] ?? null;
}

export async function upsertRateLimit(
	db: DbClient,
	input: {
		userId: string;
		windowKey: string;
		action: string;
		count: number;
		limit: number;
	},
) {
	const now = new Date().toISOString();
	const existing = await getRateLimitRecord(db, input);

	if (existing) {
		await db
			.update(rateLimits)
			.set({
				count: String(input.count),
				updatedAt: now,
			})
			.where(eq(rateLimits.id, existing.id));
		return existing.id;
	}

	const id = `rl-${now}-${Math.random().toString(36).slice(2, 9)}`;
	await db.insert(rateLimits).values({
		action: input.action,
		count: String(input.count),
		createdAt: now,
		id,
		limit: String(input.limit),
		updatedAt: now,
		userId: input.userId,
		windowKey: input.windowKey,
	});

	return id;
}

export async function incrementRateLimit(
	db: DbClient,
	input: {
		userId: string;
		windowKey: string;
		action: string;
		limit: number;
	},
): Promise<{ count: number; limit: number; allowed: boolean }> {
	const now = new Date().toISOString();
	const existing = await getRateLimitRecord(db, input);

	if (existing) {
		const newCount = Number(existing.count) + 1;
		const allowed = newCount <= input.limit;

		await db
			.update(rateLimits)
			.set({
				count: String(newCount),
				updatedAt: now,
			})
			.where(eq(rateLimits.id, existing.id));

		return { allowed, count: newCount, limit: input.limit };
	}

	// Create new record with count=1
	const id = `rl-${now}-${Math.random().toString(36).slice(2, 9)}`;
	await db.insert(rateLimits).values({
		action: input.action,
		count: '1',
		createdAt: now,
		id,
		limit: String(input.limit),
		updatedAt: now,
		userId: input.userId,
		windowKey: input.windowKey,
	});

	return { allowed: 1 <= input.limit, count: 1, limit: input.limit };
}
