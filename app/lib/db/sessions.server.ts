/**
 * Sessions repository — server-side only.
 */

import { and, desc, eq, isNull } from 'drizzle-orm';
import type {
	CognitiveContract,
	CollectionProtocol,
	InitialRole,
	LevelMatch,
	PromptGenerationResult,
	RawIntent,
	RulersVector,
	SessionStatus,
} from '~/domain/contracts';
import {
	CognitiveContractSchema,
	CollectionProtocolSchema,
	LevelMatchSchema,
	PromptGenerationResultSchema,
	RawIntentSchema,
	RulersVectorSchema,
} from '~/domain/contracts';
import type { DbClient } from './client.server';
import { sessions } from './schema';

function safeJsonStringify(value: unknown): string {
	return JSON.stringify(value);
}

function safeJsonParse<T>(
	json: string | null | undefined,
	schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
): T | null {
	if (!json) return null;
	try {
		const parsed = JSON.parse(json);
		const result = schema.safeParse(parsed);
		if (result.success) return (result as { data: T }).data;
		return null;
	} catch {
		return null;
	}
}

export async function createSession(
	db: DbClient,
	input: {
		userId: string;
		locale: string;
		rawIntent: RawIntent;
		status?: SessionStatus;
		title?: string;
	},
) {
	const now = new Date().toISOString();
	const id = `sess-${now}-${Math.random().toString(36).slice(2, 9)}`;

	await db.insert(sessions).values({
		createdAt: now,
		desiredOutcome: input.rawIntent.desiredOutcome ?? null,
		id,
		inputText: input.rawIntent.text,
		locale: input.locale,
		rawIntentJson: safeJsonStringify(input.rawIntent),
		status: input.status ?? 'draft',
		title: input.title ?? null,
		updatedAt: now,
		userId: input.userId,
	});

	return id;
}

export async function getSessionForUser(
	db: DbClient,
	sessionId: string,
	userId: string,
) {
	const result = await db
		.select()
		.from(sessions)
		.where(
			and(
				eq(sessions.id, sessionId),
				eq(sessions.userId, userId),
				isNull(sessions.deletedAt),
			),
		)
		.limit(1);

	return result[0] ?? null;
}

export async function listSessionsForUser(
	db: DbClient,
	userId: string,
	options?: { limit?: number; offset?: number },
) {
	const query = db
		.select()
		.from(sessions)
		.where(and(eq(sessions.userId, userId), isNull(sessions.deletedAt)))
		.orderBy(desc(sessions.updatedAt));

	if (options?.limit) {
		// Drizzle SQLite doesn't have limit/offset in the same way,
		// but we can handle pagination at the application level for now
	}

	return query;
}

export async function updateSessionIntent(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		rawIntent: RawIntent;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			desiredOutcome: input.rawIntent.desiredOutcome ?? null,
			inputText: input.rawIntent.text,
			rawIntentJson: safeJsonStringify(input.rawIntent),
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function updateSessionRoleAndRulers(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		initialRole: InitialRole;
		rulers: RulersVector;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			initialRole: input.initialRole,
			rulersJson: safeJsonStringify(input.rulers),
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function updateSessionMatch(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		levelMatch: LevelMatch;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			levelMatchJson: safeJsonStringify(input.levelMatch),
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function updateSessionCollectionProtocol(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		protocol: CollectionProtocol;
		status?: SessionStatus;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			collectionProtocolJson: safeJsonStringify(input.protocol),
			status: input.status ?? 'collecting',
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function updateSessionContract(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		contract: CognitiveContract;
		status?: SessionStatus;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			contractJson: safeJsonStringify(input.contract),
			status: input.status ?? 'ready',
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function updateSessionPromptResult(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		promptResult: PromptGenerationResult;
		model?: string;
		usageJson?: string;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			completedAt: now,
			model: input.model ?? null,
			prompt: input.promptResult.prompt,
			promptResultJson: safeJsonStringify(input.promptResult),
			status: 'completed',
			updatedAt: now,
			usageJson: input.usageJson ?? null,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function markSessionFailed(
	db: DbClient,
	input: {
		sessionId: string;
		userId: string;
		error: string;
	},
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			error: input.error,
			status: 'failed',
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, input.sessionId),
				eq(sessions.userId, input.userId),
				isNull(sessions.deletedAt),
			),
		);
}

export async function softDeleteSession(
	db: DbClient,
	sessionId: string,
	userId: string,
) {
	const now = new Date().toISOString();
	await db
		.update(sessions)
		.set({
			deletedAt: now,
			status: 'deleted',
			updatedAt: now,
		})
		.where(
			and(
				eq(sessions.id, sessionId),
				eq(sessions.userId, userId),
				isNull(sessions.deletedAt),
			),
		);
}

// Deserialization helpers

export function deserializeRawIntent(session: {
	rawIntentJson: string | null;
}): RawIntent | null {
	return safeJsonParse(session.rawIntentJson, RawIntentSchema);
}

export function deserializeRulers(session: {
	rulersJson: string | null;
}): RulersVector | null {
	return safeJsonParse(session.rulersJson, RulersVectorSchema);
}

export function deserializeLevelMatch(session: {
	levelMatchJson: string | null;
}): LevelMatch | null {
	return safeJsonParse(session.levelMatchJson, LevelMatchSchema);
}

export function deserializeCollectionProtocol(session: {
	collectionProtocolJson: string | null;
}): CollectionProtocol | null {
	return safeJsonParse(
		session.collectionProtocolJson,
		CollectionProtocolSchema,
	);
}

export function deserializeContract(session: {
	contractJson: string | null;
}): CognitiveContract | null {
	return safeJsonParse(session.contractJson, CognitiveContractSchema);
}

export function deserializePromptResult(session: {
	promptResultJson: string | null;
}): PromptGenerationResult | null {
	return safeJsonParse(session.promptResultJson, PromptGenerationResultSchema);
}
