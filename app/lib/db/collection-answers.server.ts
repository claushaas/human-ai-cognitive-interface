/**
 * Collection answers repository — server-side only.
 */

import { and, asc, eq } from 'drizzle-orm';
import type { DbClient } from './client.server';
import { collectionAnswers } from './schema';

function _safeJsonStringify(value: unknown): string {
	return JSON.stringify(value);
}

export async function saveCollectionAnswer(
	db: DbClient,
	input: {
		sessionId: string;
		questionId: string;
		answerJson: string;
	},
) {
	const now = new Date().toISOString();

	const existing = await db
		.select()
		.from(collectionAnswers)
		.where(
			and(
				eq(collectionAnswers.sessionId, input.sessionId),
				eq(collectionAnswers.questionId, input.questionId),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(collectionAnswers)
			.set({
				answerJson: input.answerJson,
				updatedAt: now,
			})
			.where(eq(collectionAnswers.id, existing[0].id));
	} else {
		const id = `ca-${now}-${Math.random().toString(36).slice(2, 9)}`;
		await db.insert(collectionAnswers).values({
			answeredAt: now,
			answerJson: input.answerJson,
			createdAt: now,
			id,
			questionId: input.questionId,
			sessionId: input.sessionId,
			updatedAt: now,
		});
	}
}

export async function getAnswersForSession(db: DbClient, sessionId: string) {
	return db
		.select()
		.from(collectionAnswers)
		.where(eq(collectionAnswers.sessionId, sessionId))
		.orderBy(asc(collectionAnswers.questionId));
}

export async function deleteAnswersForSession(db: DbClient, sessionId: string) {
	await db
		.delete(collectionAnswers)
		.where(eq(collectionAnswers.sessionId, sessionId));
}
