import { describe, expect, it } from 'vitest';
import { deriveMockCollectionProtocol } from '~/domain/collection/mock-protocol';
import type { CognitiveContract } from '~/domain/contracts';
import { CONTRACT_VERSION } from '~/domain/contracts';

function makeContract(
	partial: Partial<CognitiveContract> = {},
): CognitiveContract {
	return {
		createdAt: '2026-01-01T00:00:00Z',
		id: 'test-contract',
		initialRole: 'role.analyze',
		levelMatch: {
			candidates: [],
			hardBlocks: [],
			selected: { id: 'N2', score: 1.0 },
			status: 'matched',
		},
		locale: 'pt-BR',
		rawIntent: {
			locale: 'pt-BR',
			text: 'Test intent',
			version: CONTRACT_VERSION,
		},
		rulers: { decision: 1, inference: 2, meta: 1, scope: 2, source: 1 },
		version: CONTRACT_VERSION,
		...partial,
	};
}

describe('deriveMockCollectionProtocol', () => {
	it('returns a valid protocol', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		expect(protocol.contractId).toBe(contract.id);
		expect(protocol.version).toBe(CONTRACT_VERSION);
		expect(protocol.status).toBe('ready');
		expect(protocol.questions.length).toBeGreaterThan(0);
		expect(protocol.questions.length).toBeLessThanOrEqual(5);
	});

	it('has stable question IDs', () => {
		const contract = makeContract();
		const protocol1 = deriveMockCollectionProtocol(contract);
		const protocol2 = deriveMockCollectionProtocol(contract);
		expect(protocol1.questions.map((q) => q.id)).toEqual(
			protocol2.questions.map((q) => q.id),
		);
	});

	it('does not use file answer type', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		const hasFile = protocol.questions.some((q) => q.answerType === 'file');
		expect(hasFile).toBe(false);
	});

	it('has at most 5 questions', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		expect(protocol.questions.length).toBeLessThanOrEqual(5);
	});

	it('identifies required questions', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		const requiredQuestions = protocol.questions.filter((q) => q.required);
		expect(requiredQuestions.length).toBeGreaterThan(0);
	});

	it('includes base questions', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		const hasFormat = protocol.questions.some((q) => q.id === 'format');
		expect(hasFormat).toBe(true);
	});

	it('varies questions by role', () => {
		const analyzeContract = makeContract({ initialRole: 'role.analyze' });
		const exploreContract = makeContract({ initialRole: 'role.explore' });

		const analyzeProtocol = deriveMockCollectionProtocol(analyzeContract);
		const exploreProtocol = deriveMockCollectionProtocol(exploreContract);

		const analyzeIds = analyzeProtocol.questions.map((q) => q.id);
		const exploreIds = exploreProtocol.questions.map((q) => q.id);

		expect(analyzeIds).not.toEqual(exploreIds);
	});

	it('validates against Zod schema', () => {
		const contract = makeContract();
		const protocol = deriveMockCollectionProtocol(contract);
		expect(protocol.contractId).toBeDefined();
		expect(protocol.questions.length).toBeGreaterThan(0);
		expect(protocol.questions[0].id).toBeDefined();
		expect(protocol.questions[0].label).toBeDefined();
		expect(protocol.questions[0].answerType).toBeDefined();
		expect(protocol.questions[0].required).toBeDefined();
	});
});
