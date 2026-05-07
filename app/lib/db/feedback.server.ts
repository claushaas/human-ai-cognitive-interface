/**
 * Feedback repository — server-side only.
 */

import { and, eq, isNull } from 'drizzle-orm';
import { FeedbackSchema } from '~/domain/contracts';
import type { DbClient } from './client.server';
import { feedback, sessions } from './schema';

export async function upsertFeedback(
	db: DbClient,
	input: {
		userId: string;
		sessionId: string;
		value: string;
	},
) {
	// Validate input
	const now = new Date().toISOString();
	const parsed = FeedbackSchema.safeParse({
		createdAt: now,
		id: `fb-${now}-${Math.random().toString(36).slice(2, 9)}`,
		sessionId: input.sessionId,
		updatedAt: now,
		userId: input.userId,
		value: input.value,
	});

	if (!parsed.success) {
		throw new Error(`Invalid feedback: ${parsed.error.message}`);
	}

	// Verify session exists, is not deleted, and belongs to user
	const session = await db
		.select()
		.from(sessions)
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		)
		.limit(1);

	if (session.length === 0) {
		throw new Error('Session not found or not owned by user');
	}

	// Check for existing feedback
	const existing = await db
		.select()
		.from(feedback)
		.where(
			and(
				eq(feedback.sessionId, input.sessionId),
				eq(feedback.userId, input.userId),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		// Update existing
		await db
			.update(feedback)
			.set({
				updatedAt: now,
				value: input.value,
			})
			.where(
				and(
					eq(feedback.sessionId, input.sessionId),
					eq(feedback.userId, input.userId),
				),
			);
		return { created: false, updated: true };
	}

	// Insert new
	await db.insert(feedback).values({
		createdAt: now,
		id: `fb-${now}-${Math.random().toString(36).slice(2, 9)}`,
		sessionId: input.sessionId,
		updatedAt: now,
		userId: input.userId,
		value: input.value,
	});

	return { created: true, updated: false };
}

export async function getFeedbackForSession(
	db: DbClient,
	sessionId: string,
	userId: string,
) {
	const result = await db
		.select()
		.from(feedback)
		.where(and(eq(feedback.sessionId, sessionId), eq(feedback.userId, userId)))
		.limit(1);

	return result[0] ?? null;
}

export async function deleteFeedbackForSession(
	db: DbClient,
	sessionId: string,
	userId: string,
) {
	await db
		.delete(feedback)
		.where(and(eq(feedback.sessionId, sessionId), eq(feedback.userId, userId)));
}
