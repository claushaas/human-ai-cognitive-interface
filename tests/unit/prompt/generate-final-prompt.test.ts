/**
 * Final prompt generation tests.
 */

import { describe, expect, it } from 'vitest';
import { generateFinalPrompt } from '~/domain/prompt/generate-final-prompt.server';
import { createMockLlmClient } from '~/lib/llm/mock.server';
import generateFinalPromptSuccess from '../../fixtures/llm/generate-final-prompt-success.json';

describe('generateFinalPrompt', () => {
	it('uses mock fallback when requested', async () => {
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

		const llmClient = createMockLlmClient();
		const result = await generateFinalPrompt({
			llmClient,
			llmConfig: {
				enabled: false,
				maxRetries: 1,
				model: 'mock',
				provider: 'mock',
				temperature: 0.2,
				timeoutMs: 30000,
				useMock: true,
			},
			request,
			useMockFallback: true,
		});

		expect(result.contractId).toBe(request.contract.id);
		expect(result.prompt.length).toBeGreaterThan(0);
		expect(result.version).toBe('v1');
	});

	it('generates with LLM fixture', async () => {
		const request = {
			contract: {
				collectedCriteria: {},
				createdAt: '2025-01-15T10:00:00.000Z',
				id: 'test-contract-456',
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

		const llmClient = createMockLlmClient({
			fixture: generateFinalPromptSuccess,
		});
		const result = await generateFinalPrompt({
			llmClient,
			llmConfig: {
				enabled: false,
				maxRetries: 1,
				model: 'mock',
				provider: 'mock',
				temperature: 0.2,
				timeoutMs: 30000,
				useMock: true,
			},
			request,
			useMockFallback: false,
		});

		expect(result.contractId).toBe('test-contract-456');
		expect(result.prompt.length).toBeGreaterThan(0);
	});

	it('throws on invalid request', async () => {
		const request = {
			contract: {
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
			},
			version: 'v1' as const,
		};

		const llmClient = createMockLlmClient();
		await expect(
			generateFinalPrompt({
				llmClient,
				llmConfig: {
					enabled: false,
					maxRetries: 1,
					model: 'mock',
					provider: 'mock',
					temperature: 0.2,
					timeoutMs: 30000,
					useMock: true,
				},
				request,
				useMockFallback: false,
			}),
		).rejects.toThrow();
	});
});
