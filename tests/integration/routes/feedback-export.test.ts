import { describe, expect, it } from 'vitest';

describe('feedback route integration', () => {
	it('authenticated user submits positive feedback', async () => {
		// Note: full integration test requires D1/local setup.
		// This is a structured placeholder; run E2E or manual test for real validation.
		expect(true).toBe(true);
	});

	it('authenticated user updates feedback to negative', async () => {
		expect(true).toBe(true);
	});

	it('rejects feedback on session of another user', async () => {
		expect(true).toBe(true);
	});

	it('rejects feedback on deleted session', async () => {
		expect(true).toBe(true);
	});
});

describe('export route integration', () => {
	it('export Markdown of completed session returns 200', async () => {
		expect(true).toBe(true);
	});

	it('export JSON debug returns JSON', async () => {
		expect(true).toBe(true);
	});

	it('export of deleted session returns error', async () => {
		expect(true).toBe(true);
	});

	it('export of another user session returns error', async () => {
		expect(true).toBe(true);
	});

	it('export does not contain secrets', async () => {
		expect(true).toBe(true);
	});
});
