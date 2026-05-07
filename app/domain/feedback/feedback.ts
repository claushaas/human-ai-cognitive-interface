/**
 * Feedback domain — pure helpers.
 *
 * No React, no Drizzle, no Cloudflare, no browser APIs.
 */

export const FEEDBACK_VALUES = ['positive', 'negative'] as const;

export type FeedbackValue = (typeof FEEDBACK_VALUES)[number];

export function isFeedbackValue(value: unknown): value is FeedbackValue {
	return (
		typeof value === 'string' &&
		FEEDBACK_VALUES.includes(value as FeedbackValue)
	);
}

export function getFeedbackLabel(
	value: FeedbackValue,
	locale: 'pt-BR' | 'en' = 'pt-BR',
): string {
	if (locale === 'en') {
		return value === 'positive' ? 'Yes' : 'No';
	}
	return value === 'positive' ? 'Sim' : 'Não';
}

export function normalizeFeedbackValue(value: unknown): FeedbackValue {
	if (isFeedbackValue(value)) return value;
	throw new Error(`Invalid feedback value: ${String(value)}`);
}
