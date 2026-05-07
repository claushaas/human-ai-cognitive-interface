/**
 * Prompt generation tests.
 */

import { describe, expect, it } from 'vitest';
import { buildDeriveCriteriaPrompt } from '~/domain/prompt/prompts/v1/derive-criteria.prompt';
import { buildGenerateFinalPrompt } from '~/domain/prompt/prompts/v1/generate-final-prompt.prompt';
import { buildRepairJsonPrompt } from '~/domain/prompt/prompts/v1/repair-json.prompt';

describe('derive-criteria prompt', () => {
	it('contains contract role and level', () => {
		const contract = {
			collectedCriteria: {},
			createdAt: '2025-01-15T10:00:00.000Z',
			id: 'test-contract',
			initialRole: 'role.analyze' as const,
			levelMatch: {
				candidates: [],
				hardBlocks: [],
				selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
				status: 'matched' as const,
			},
			locale: 'pt-BR' as const,
			rawIntent: {
				desiredOutcome: 'Test outcome',
				locale: 'pt-BR' as const,
				text: 'Test intent',
				version: 'v1' as const,
			},
			rulers: {
				decision: 2 as const,
				inference: 3 as const,
				meta: 2 as const,
				scope: 3 as const,
				source: 2 as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildDeriveCriteriaPrompt(contract);
		expect(prompt).toContain('role.analyze');
		expect(prompt).toContain('N3');
		expect(prompt).toContain('Test intent');
		expect(prompt).toContain('Portuguese (Brazil)');
	});

	it('instructs not to alter contract', () => {
		const contract = {
			collectedCriteria: {},
			createdAt: '2025-01-15T10:00:00.000Z',
			id: 'test-contract',
			initialRole: 'role.analyze' as const,
			levelMatch: {
				candidates: [],
				hardBlocks: [],
				selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
				status: 'matched' as const,
			},
			locale: 'pt-BR' as const,
			rawIntent: {
				desiredOutcome: 'Test outcome',
				locale: 'pt-BR' as const,
				text: 'Test intent',
				version: 'v1' as const,
			},
			rulers: {
				decision: 2 as const,
				inference: 3 as const,
				meta: 2 as const,
				scope: 3 as const,
				source: 2 as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildDeriveCriteriaPrompt(contract);
		expect(prompt).toContain('Do NOT change the cognitive contract');
		expect(prompt).toContain('Do NOT change the matched level');
	});

	it('instructs not to execute task', () => {
		const contract = {
			collectedCriteria: {},
			createdAt: '2025-01-15T10:00:00.000Z',
			id: 'test-contract',
			initialRole: 'role.analyze' as const,
			levelMatch: {
				candidates: [],
				hardBlocks: [],
				selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
				status: 'matched' as const,
			},
			locale: 'pt-BR' as const,
			rawIntent: {
				desiredOutcome: 'Test outcome',
				locale: 'pt-BR' as const,
				text: 'Test intent',
				version: 'v1' as const,
			},
			rulers: {
				decision: 2 as const,
				inference: 3 as const,
				meta: 2 as const,
				scope: 3 as const,
				source: 2 as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildDeriveCriteriaPrompt(contract);
		expect(prompt).toContain('Do NOT execute');
	});
});

describe('generate-final-prompt prompt', () => {
	it('contains contract information', () => {
		const request = {
			contract: {
				collectedCriteria: {},
				createdAt: '2025-01-15T10:00:00.000Z',
				id: 'test-contract',
				initialRole: 'role.analyze' as const,
				levelMatch: {
					candidates: [],
					hardBlocks: [],
					selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
					status: 'matched' as const,
				},
				locale: 'pt-BR' as const,
				rawIntent: {
					desiredOutcome: 'Test outcome',
					locale: 'pt-BR' as const,
					text: 'Test intent',
					version: 'v1' as const,
				},
				rulers: {
					decision: 2 as const,
					inference: 3 as const,
					meta: 2 as const,
					scope: 3 as const,
					source: 2 as const,
				},
				version: 'v1' as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildGenerateFinalPrompt(request);
		expect(prompt).toContain('role.analyze');
		expect(prompt).toContain('Test intent');
		expect(prompt).toContain('N3');
	});

	it('instructs not to execute task', () => {
		const request = {
			contract: {
				collectedCriteria: {},
				createdAt: '2025-01-15T10:00:00.000Z',
				id: 'test-contract',
				initialRole: 'role.analyze' as const,
				levelMatch: {
					candidates: [],
					hardBlocks: [],
					selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
					status: 'matched' as const,
				},
				locale: 'pt-BR' as const,
				rawIntent: {
					desiredOutcome: 'Test outcome',
					locale: 'pt-BR' as const,
					text: 'Test intent',
					version: 'v1' as const,
				},
				rulers: {
					decision: 2 as const,
					inference: 3 as const,
					meta: 2 as const,
					scope: 3 as const,
					source: 2 as const,
				},
				version: 'v1' as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildGenerateFinalPrompt(request);
		expect(prompt).toContain('Do NOT execute');
	});

	it('includes collected answers when present', () => {
		const request = {
			answers: [
				{
					answeredAt: '2025-01-15T10:00:00.000Z',
					questionId: 'q1',
					value: 'answer1',
				},
			],
			collectionProtocol: {
				contractId: 'test-contract',
				questions: [
					{
						answerType: 'text' as const,
						id: 'q1',
						label: 'Question 1',
						required: true,
					},
				],
				status: 'ready' as const,
				version: 'v1' as const,
			},
			contract: {
				collectedCriteria: {},
				createdAt: '2025-01-15T10:00:00.000Z',
				id: 'test-contract',
				initialRole: 'role.analyze' as const,
				levelMatch: {
					candidates: [],
					hardBlocks: [],
					selected: { confidence: 'high' as const, id: 'N3', score: 0.85 },
					status: 'matched' as const,
				},
				locale: 'pt-BR' as const,
				rawIntent: {
					desiredOutcome: 'Test outcome',
					locale: 'pt-BR' as const,
					text: 'Test intent',
					version: 'v1' as const,
				},
				rulers: {
					decision: 2 as const,
					inference: 3 as const,
					meta: 2 as const,
					scope: 3 as const,
					source: 2 as const,
				},
				version: 'v1' as const,
			},
			version: 'v1' as const,
		};

		const prompt = buildGenerateFinalPrompt(request);
		expect(prompt).toContain('Question 1');
		expect(prompt).toContain('answer1');
	});
});

describe('repair-json prompt', () => {
	it('contains broken JSON', () => {
		const prompt = buildRepairJsonPrompt('bad json {', 'schema description');
		expect(prompt).toContain('bad json {');
		expect(prompt).toContain('schema description');
	});

	it('instructs to output only JSON', () => {
		const prompt = buildRepairJsonPrompt('bad', 'test');
		expect(prompt).toContain('ONLY the corrected JSON');
		expect(prompt).toContain('No markdown');
	});
});
