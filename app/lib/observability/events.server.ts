/**
 * Internal events — server-side only.
 *
 * Minimal structured events for operational audit.
 * No external observability tools; no user content in logs.
 */

export const INTERNAL_EVENT_TYPES = [
	'session.created',
	'match.completed',
	'generation.started',
	'generation.completed',
	'generation.failed',
	'feedback.created',
	'feedback.updated',
	'session.exported',
	'rate_limit.exceeded',
] as const;

export type InternalEventType = (typeof INTERNAL_EVENT_TYPES)[number];

export type InternalEvent = {
	type: InternalEventType;
	userId?: string;
	sessionId?: string;
	timestamp: string;
	metadata?: Record<string, string | number | boolean | null>;
};

/**
 * Record an internal event.
 *
 * In production/staging: structured log line (no storage required in MVP).
 * In local/test: console.log with safe metadata only.
 *
 * Never throws; failures are swallowed to avoid breaking user flow.
 */
export function recordInternalEvent(event: InternalEvent): void {
	try {
		const safeEvent: InternalEvent = {
			...event,
			// Ensure no full user content leaks through metadata
			metadata: event.metadata
				? Object.fromEntries(
						Object.entries(event.metadata).filter(([, v]) => {
							if (typeof v === 'string' && v.length > 500) return false;
							return true;
						}),
					)
				: undefined,
		};

		// Log to console in all environments for MVP
		// In production, this would go to a structured logger
		// eslint-disable-next-line no-console
		console.log('[event]', JSON.stringify(safeEvent));
	} catch {
		// Swallow to avoid breaking flow
	}
}
