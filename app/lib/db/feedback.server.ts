/**
 * Feedback repository — server-side only.
 */

import { and, desc, eq } from 'drizzle-orm';
import type { DbClient } from './client.server';
import { feedback } from './schema';

export async function createFeedback(
	db: DbClient,
	input: {
		userId: string;
		sessionId: string;
		value: string;
	},
) {
	const now = new Date().toISOString();
	const id = `fb-${now}-${Math.random().toString(36).slice(2, 9)}`;

	await db.insert(feedback).values({
		createdAt: now,
		id,
		sessionId: input.sessionId,
		updatedAt: now,
		userId: input.userId,
		value: input.value,
	});

	return id;
}

export async function listFeedbackForUser(db: DbClient, userId: string) {
	return db
		.select()
		.from(feedback)
		.where(eq(feedback.userId, userId))
		.orderBy(desc(feedback.createdAt));
}

export async function getFeedbackById(
	db: DbClient,
	feedbackId: string,
	userId: string,
) {
	const result = await db
		.select()
		.from(feedback)
		.where(and(eq(feedback.id, feedbackId), eq(feedback.userId, userId)))
		.limit(1);

	return result[0] ?? null;
}
