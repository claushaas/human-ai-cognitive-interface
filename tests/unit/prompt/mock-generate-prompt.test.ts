import { describe, expect, it } from 'vitest';
import type {
	CognitiveContract,
	PromptGenerationRequest,
} from '~/domain/contracts';
import { CONTRACT_VERSION } from '~/domain/contracts';
import { generateMockPromptResult } from '~/domain/prompt/mock-generate-prompt';

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
			text: 'Test intent for prompt generation',
			version: CONTRACT_VERSION,
		},
		rulers: { decision: 1, inference: 2, meta: 1, scope: 2, source: 1 },
		version: CONTRACT_VERSION,
		...partial,
	};
}

describe('generateMockPromptResult', () => {
	it('returns a valid prompt result', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.contractId).toBe(request.contract.id);
		expect(result.version).toBe(CONTRACT_VERSION);
		expect(result.prompt).toBeTruthy();
		expect(result.prompt.length).toBeGreaterThan(0);
	});

	it('includes the user intent in the prompt', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.prompt).toContain(request.contract.rawIntent.text);
	});

	it('includes collected answers when provided', () => {
		const request: PromptGenerationRequest = {
			answers: [
				{
					answeredAt: '2026-01-01T00:00:00Z',
					questionId: 'format',
					value: 'Markdown',
				},
			],
			collectionProtocol: {
				contractId: 'test',
				questions: [
					{
						answerType: 'enum',
						id: 'format',
						label: 'Qual formato você espera na resposta?',
						options: ['Texto corrido', 'Markdown'],
						required: true,
					},
				],
				status: 'ready',
				version: CONTRACT_VERSION,
			},
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.prompt).toContain('Markdown');
	});

	it('throws on invalid input', () => {
		const invalidRequest = {
			contract: { id: 'invalid' },
			version: CONTRACT_VERSION,
		} as PromptGenerationRequest;
		expect(() => generateMockPromptResult(invalidRequest)).toThrow();
	});

	it('is deterministic for the same input', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result1 = generateMockPromptResult(request);
		const result2 = generateMockPromptResult(request);
		expect(result1.prompt).toBe(result2.prompt);
	});

	it('includes role-specific content', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract({ initialRole: 'role.document' }),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.prompt.toLowerCase()).toContain('document');
	});

	it('includes level description', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.prompt).toContain('Nível de profundidade');
	});

	it('includes warnings for ambiguous matches', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract({
				levelMatch: {
					candidates: [],
					hardBlocks: [],
					status: 'ambiguous',
				},
			}),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.warnings).toBeDefined();
		expect(result.warnings?.length).toBeGreaterThan(0);
	});

	it('generates usage stats', () => {
		const request: PromptGenerationRequest = {
			contract: makeContract(),
			version: CONTRACT_VERSION,
		};
		const result = generateMockPromptResult(request);
		expect(result.usage).toBeDefined();
		expect(result.usage?.inputTokens).toBeGreaterThan(0);
		expect(result.usage?.totalTokens).toBeGreaterThan(0);
	});
});
