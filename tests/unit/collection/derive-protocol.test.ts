/**
 * Collection protocol derivation tests.
 */

import { describe, expect, it } from 'vitest';
import { deriveCollectionProtocol } from '~/domain/collection/derive-protocol.server';
import { createMockLlmClient } from '~/lib/llm/mock.server';
import deriveProtocolSuccess from '../../fixtures/llm/derive-protocol-success.json';

describe('deriveCollectionProtocol', () => {
	it('uses mock fallback when requested', async () => {
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

		const llmClient = createMockLlmClient();
		const result = await deriveCollectionProtocol({
			contract,
			llmClient,
			useMockFallback: true,
		});

		expect(result.contractId).toBe(contract.id);
		expect(result.questions.length).toBeGreaterThan(0);
		expect(result.questions.length).toBeLessThanOrEqual(5);
	});

	it('validates output with LLM fixture', async () => {
		const contract = {
			collectedCriteria: {},
			createdAt: '2025-01-15T10:00:00.000Z',
			id: 'test-contract-123',
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

		const llmClient = createMockLlmClient({ fixture: deriveProtocolSuccess });
		const result = await deriveCollectionProtocol({
			contract,
			llmClient,
			useMockFallback: false,
		});

		expect(result.contractId).toBe('test-contract-123');
		expect(result.questions.length).toBe(2);
		expect(result.questions[0].answerType).not.toBe('file');
	});

	it('throws on invalid contract', async () => {
		const contract = {
			collectedCriteria: {},
			createdAt: '',
			id: '',
			initialRole: 'invalid' as 'role.analyze',
			levelMatch: {
				candidates: [],
				hardBlocks: [],
				status: 'matched' as const,
			},
			locale: 'pt-BR' as const,
			rawIntent: {
				locale: 'pt-BR' as const,
				text: '',
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

		const llmClient = createMockLlmClient();
		await expect(
			deriveCollectionProtocol({
				contract,
				llmClient,
				useMockFallback: false,
			}),
		).rejects.toThrow();
	});
});
