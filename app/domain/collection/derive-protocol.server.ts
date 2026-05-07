/**
 * Derive Collection Protocol via LLM.
 *
 * Server-side only.
 */

import { deriveMockCollectionProtocol } from '~/domain/collection/mock-protocol';
import type { CognitiveContract, CollectionProtocol } from '~/domain/contracts';
import {
	CognitiveContractSchema,
	CollectionProtocolSchema,
} from '~/domain/contracts';
import { buildDeriveCriteriaPrompt } from '~/domain/prompt/prompts/v1/derive-criteria.prompt';
import { LlmValidationError, toSafeLlmError } from '~/lib/llm/errors';
import { extractJsonObject } from '~/lib/llm/json-repair.server';
import type { LlmClient } from '~/lib/llm/types';

export type DeriveProtocolInput = {
	contract: CognitiveContract;
	llmClient: LlmClient;
	useMockFallback?: boolean;
};

export async function deriveCollectionProtocol(
	input: DeriveProtocolInput,
): Promise<CollectionProtocol> {
	const { contract, llmClient, useMockFallback = false } = input;

	// Validate contract
	const contractValidation = CognitiveContractSchema.safeParse(contract);
	if (!contractValidation.success) {
		throw new LlmValidationError('Contrato cognitivo inválido.', {
			issues: contractValidation.error.issues.map((i) => i.message),
		});
	}

	if (useMockFallback) {
		return deriveMockCollectionProtocol(contract);
	}

	try {
		const prompt = buildDeriveCriteriaPrompt(contract);
		const result = await llmClient.generate({
			messages: [
				{
					content:
						'You are a precise JSON-generating assistant. Always respond with valid JSON only.',
					role: 'system',
				},
				{ content: prompt, role: 'user' },
			],
			responseFormat: 'json',
			temperature: 0.2,
		});

		const parsed = extractJsonObject(result.content);
		const validation = CollectionProtocolSchema.safeParse(parsed);

		if (!validation.success) {
			throw new LlmValidationError(
				'Protocolo de coleta gerado não passou na validação.',
				{ issues: validation.error.issues.map((i) => i.message) },
			);
		}

		return validation.data;
	} catch (err) {
		const safe = toSafeLlmError(err);
		throw new Error(safe.message);
	}
}
