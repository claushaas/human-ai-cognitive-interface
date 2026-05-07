import { describe, expect, it } from 'vitest';
import {
	deserializeContract,
	deserializeLevelMatch,
	deserializePromptResult,
	deserializeRawIntent,
	deserializeRulers,
} from '../../../app/lib/db/sessions.server';

describe('sessions.server deserialization', () => {
	it('deserializes raw intent', () => {
		const rawIntentJson = JSON.stringify({
			desiredOutcome: 'Test outcome',
			locale: 'pt-BR',
			text: 'Test input',
			version: 'v1',
		});
		const result = deserializeRawIntent({ rawIntentJson });
		expect(result).not.toBeNull();
		expect(result?.text).toBe('Test input');
		expect(result?.locale).toBe('pt-BR');
	});

	it('returns null for invalid raw intent', () => {
		const result = deserializeRawIntent({ rawIntentJson: 'invalid' });
		expect(result).toBeNull();
	});

	it('deserializes rulers', () => {
		const rulersJson = JSON.stringify({
			decision: 2,
			inference: 3,
			meta: 4,
			scope: 2,
			source: 1,
		});
		const result = deserializeRulers({ rulersJson });
		expect(result).not.toBeNull();
		expect(result?.scope).toBe(2);
	});

	it('deserializes level match', () => {
		const levelMatchJson = JSON.stringify({
			candidates: [
				{
					confidence: 'high',
					distance: 0.1,
					id: 'N2',
					reasons: [],
					score: 0.9,
				},
			],
			hardBlocks: [],
			selected: { confidence: 'high', id: 'N2', score: 0.9 },
			status: 'matched',
		});
		const result = deserializeLevelMatch({ levelMatchJson });
		expect(result).not.toBeNull();
		expect(result?.status).toBe('matched');
	});

	it('deserializes contract', () => {
		const contractJson = JSON.stringify({
			collectedCriteria: { q1: 'answer' },
			createdAt: '2026-05-01T00:00:00.000Z',
			id: 'contract-001',
			initialRole: 'role.explore',
			levelMatch: {
				candidates: [
					{
						confidence: 'high',
						distance: 0.1,
						id: 'N2',
						reasons: [],
						score: 0.9,
					},
				],
				hardBlocks: [],
				selected: { confidence: 'high', id: 'N2', score: 0.9 },
				status: 'matched',
			},
			locale: 'pt-BR',
			rawIntent: {
				desiredOutcome: 'Test outcome',
				locale: 'pt-BR',
				text: 'Test',
				version: 'v1',
			},
			rulers: {
				decision: 2,
				inference: 3,
				meta: 4,
				scope: 2,
				source: 1,
			},
			version: 'v1',
		});
		const result = deserializeContract({ contractJson });
		expect(result).not.toBeNull();
		expect(result?.initialRole).toBe('role.explore');
	});

	it('deserializes prompt result', () => {
		const promptResultJson = JSON.stringify({
			contractId: 'contract-001',
			generatedAt: '2026-05-01T00:00:00.000Z',
			prompt: 'Generated prompt',
			version: 'v1',
		});
		const result = deserializePromptResult({ promptResultJson });
		expect(result).not.toBeNull();
		expect(result?.prompt).toBe('Generated prompt');
	});
});
