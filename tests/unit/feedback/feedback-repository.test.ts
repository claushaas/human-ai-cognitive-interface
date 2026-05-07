import { describe, expect, it, vi } from 'vitest';
import {
	deleteFeedbackForSession,
	getFeedbackForSession,
	upsertFeedback,
} from '../../../app/lib/db/feedback.server';
import { feedback } from '../../../app/lib/db/schema';

describe('feedback.server repository', () => {
	function createMockDb(
		overrides: { sessionExists?: boolean; existingFeedback?: boolean } = {},
	) {
		const { sessionExists = true, existingFeedback = false } = overrides;

		const sessionRows = sessionExists
			? [
					{
						createdAt: '2026-05-01T10:00:00.000Z',
						id: 'sess-001',
						status: 'completed',
						updatedAt: '2026-05-01T10:00:00.000Z',
						userId: 'user-001',
					},
				]
			: [];

		const feedbackRows = existingFeedback
			? [
					{
						createdAt: '2026-05-01T10:00:00.000Z',
						id: 'fb-existing',
						sessionId: 'sess-001',
						updatedAt: null,
						userId: 'user-001',
						value: 'positive',
					},
				]
			: [];

		const mockFrom = vi.fn().mockImplementation((table: unknown) => {
			const isFeedback = table === feedback;
			const rows = isFeedback ? feedbackRows : sessionRows;
			return {
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue(rows),
				}),
			};
		});

		return {
			delete: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockResolvedValue(undefined),
			}),
			select: vi.fn().mockReturnValue({
				from: mockFrom,
			}),
			update: vi.fn().mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
			}),
		};
	}

	describe('upsertFeedback', () => {
		it('creates feedback when none exists', async () => {
			const db = createMockDb({ existingFeedback: false });
			const result = await upsertFeedback(db as never, {
				sessionId: 'sess-001',
				userId: 'user-001',
				value: 'positive',
			});
			expect(result.created).toBe(true);
			expect(result.updated).toBe(false);
		});

		it('updates feedback when it exists', async () => {
			const db = createMockDb({ existingFeedback: true });
			const result = await upsertFeedback(db as never, {
				sessionId: 'sess-001',
				userId: 'user-001',
				value: 'negative',
			});
			expect(result.created).toBe(false);
			expect(result.updated).toBe(true);
		});

		it('throws for invalid feedback value', async () => {
			const db = createMockDb();
			await expect(
				upsertFeedback(db as never, {
					sessionId: 'sess-001',
					userId: 'user-001',
					value: 'maybe',
				}),
			).rejects.toThrow();
		});

		it('throws when session does not exist', async () => {
			const db = createMockDb({ sessionExists: false });
			await expect(
				upsertFeedback(db as never, {
					sessionId: 'sess-001',
					userId: 'user-001',
					value: 'positive',
				}),
			).rejects.toThrow('Session not found');
		});
	});

	describe('getFeedbackForSession', () => {
		it('returns null when no feedback exists', async () => {
			const db = createMockDb({ existingFeedback: false });
			const result = await getFeedbackForSession(
				db as never,
				'sess-001',
				'user-001',
			);
			expect(result).toBeNull();
		});
	});

	describe('deleteFeedbackForSession', () => {
		it('deletes feedback without throwing', async () => {
			const db = createMockDb({ existingFeedback: true });
			await expect(
				deleteFeedbackForSession(db as never, 'sess-001', 'user-001'),
			).resolves.toBeUndefined();
		});
	});
});
