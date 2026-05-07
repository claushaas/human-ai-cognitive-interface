/**
 * Drizzle schema for HACI persistence layer.
 *
 * Cloudflare D1 (SQLite) compatible.
 */

import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
	'users',
	{
		createdAt: text('created_at').notNull(),
		email: text('email').notNull().unique(),
		id: text('id').primaryKey(),
		name: text('name'),
		provider: text('provider').notNull(),
		providerSubject: text('provider_subject').notNull().unique(),
		updatedAt: text('updated_at').notNull(),
	},
	(table) => [index('users_email_idx').on(table.email)],
);

export const sessions = sqliteTable(
	'sessions',
	{
		collectionProtocolJson: text('collection_protocol_json'),
		completedAt: text('completed_at'),
		contractJson: text('contract_json'),
		createdAt: text('created_at').notNull(),
		deletedAt: text('deleted_at'),
		desiredOutcome: text('desired_outcome'),
		error: text('error'),
		id: text('id').primaryKey(),
		initialRole: text('initial_role'),
		inputText: text('input_text').notNull(),
		levelMatchJson: text('level_match_json'),
		locale: text('locale').notNull(),
		model: text('model'),
		prompt: text('prompt'),
		promptResultJson: text('prompt_result_json'),
		rawIntentJson: text('raw_intent_json'),
		rulersJson: text('rulers_json'),
		status: text('status').notNull(),
		title: text('title'),
		updatedAt: text('updated_at').notNull(),
		usageJson: text('usage_json'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
	},
	(table) => [
		index('sessions_user_id_idx').on(table.userId),
		index('sessions_deleted_at_idx').on(table.deletedAt),
		index('sessions_updated_at_idx').on(table.updatedAt),
	],
);

export const collectionAnswers = sqliteTable(
	'collection_answers',
	{
		answeredAt: text('answered_at').notNull(),
		answerJson: text('answer_json').notNull(),
		createdAt: text('created_at').notNull(),
		id: text('id').primaryKey(),
		questionId: text('question_id').notNull(),
		sessionId: text('session_id')
			.notNull()
			.references(() => sessions.id),
		updatedAt: text('updated_at').notNull(),
	},
	(table) => [
		index('collection_answers_session_id_idx').on(table.sessionId),
		index('collection_answers_question_id_idx').on(table.questionId),
	],
);

export const feedback = sqliteTable(
	'feedback',
	{
		createdAt: text('created_at').notNull(),
		id: text('id').primaryKey(),
		sessionId: text('session_id')
			.notNull()
			.references(() => sessions.id),
		updatedAt: text('updated_at'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		value: text('value').notNull(),
	},
	(table) => [
		index('feedback_session_id_idx').on(table.sessionId),
		index('feedback_user_id_idx').on(table.userId),
	],
);

export const rateLimits = sqliteTable(
	'rate_limits',
	{
		action: text('action').notNull(),
		count: text('count').notNull(),
		createdAt: text('created_at').notNull(),
		id: text('id').primaryKey(),
		limit: text('limit').notNull(),
		updatedAt: text('updated_at').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		windowKey: text('window_key').notNull(),
	},
	(table) => [
		index('rate_limits_user_id_idx').on(table.userId),
		index('rate_limits_window_key_idx').on(table.windowKey),
	],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type CollectionAnswerRow = typeof collectionAnswers.$inferSelect;
export type NewCollectionAnswerRow = typeof collectionAnswers.$inferInsert;
export type FeedbackRow = typeof feedback.$inferSelect;
export type NewFeedbackRow = typeof feedback.$inferInsert;
export type RateLimitRow = typeof rateLimits.$inferSelect;
export type NewRateLimitRow = typeof rateLimits.$inferInsert;
