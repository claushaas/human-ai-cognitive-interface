import { describe, expect, it, vi } from 'vitest';
import {
	INTERNAL_EVENT_TYPES,
	recordInternalEvent,
} from '../../../app/lib/observability/events.server';

describe('events.server', () => {
	it('accepts valid event types', () => {
		for (const type of INTERNAL_EVENT_TYPES) {
			expect(() => {
				recordInternalEvent({
					metadata: { test: true },
					sessionId: 'sess-001',
					timestamp: new Date().toISOString(),
					type,
					userId: 'user-001',
				});
			}).not.toThrow();
		}
	});

	it('structures event without sensitive content', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		recordInternalEvent({
			metadata: { safeKey: 'safeValue' },
			sessionId: 'sess-001',
			timestamp: '2026-05-01T10:00:00.000Z',
			type: 'session.created',
			userId: 'user-001',
		});

		expect(consoleSpy).toHaveBeenCalled();
		const logged = consoleSpy.mock.calls[0]?.[1] as string;
		expect(logged).toContain('session.created');

		consoleSpy.mockRestore();
	});

	it('redacts long strings in metadata', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		recordInternalEvent({
			metadata: { longValue: 'a'.repeat(1000) },
			sessionId: 'sess-001',
			timestamp: '2026-05-01T10:00:00.000Z',
			type: 'session.created',
			userId: 'user-001',
		});

		expect(consoleSpy).toHaveBeenCalled();
		const logged = consoleSpy.mock.calls[0]?.[0] as string;
		expect(logged).not.toContain('a'.repeat(1000));

		consoleSpy.mockRestore();
	});

	it('does not break flow on logging failure', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
			throw new Error('Console failure');
		});

		expect(() => {
			recordInternalEvent({
				timestamp: '2026-05-01T10:00:00.000Z',
				type: 'session.created',
			});
		}).not.toThrow();

		consoleSpy.mockRestore();
	});

	it('includes canonical event types', () => {
		expect(INTERNAL_EVENT_TYPES).toContain('session.created');
		expect(INTERNAL_EVENT_TYPES).toContain('match.completed');
		expect(INTERNAL_EVENT_TYPES).toContain('generation.started');
		expect(INTERNAL_EVENT_TYPES).toContain('generation.completed');
		expect(INTERNAL_EVENT_TYPES).toContain('generation.failed');
		expect(INTERNAL_EVENT_TYPES).toContain('feedback.created');
		expect(INTERNAL_EVENT_TYPES).toContain('feedback.updated');
		expect(INTERNAL_EVENT_TYPES).toContain('session.exported');
		expect(INTERNAL_EVENT_TYPES).toContain('rate_limit.exceeded');
	});
});
