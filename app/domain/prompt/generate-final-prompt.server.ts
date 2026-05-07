/**
 * Generate Final Prompt via LLM.
 *
 * Server-side only.
 */

import type {
	PromptGenerationRequest,
	PromptGenerationResult,
} from '~/domain/contracts';
import {
	PromptGenerationRequestSchema,
	PromptGenerationResultSchema,
} from '~/domain/contracts';
import { generateMockPromptResult } from '~/domain/prompt/mock-generate-prompt';
import { buildGenerateFinalPrompt } from '~/domain/prompt/prompts/v1/generate-final-prompt.prompt';
import { LlmValidationError, toSafeLlmError } from '~/lib/llm/errors';
import { extractJsonObject } from '~/lib/llm/json-repair.server';
import { runWithLlmRetry } from '~/lib/llm/retry.server';
import type { LlmClient, LlmRuntimeConfig } from '~/lib/llm/types';

export type GenerateFinalPromptInput = {
	request: PromptGenerationRequest;
	llmClient: LlmClient;
	llmConfig: LlmRuntimeConfig;
	useMockFallback?: boolean;
};

export async function generateFinalPrompt(
	input: GenerateFinalPromptInput,
): Promise<PromptGenerationResult> {
	const { request, llmClient, llmConfig, useMockFallback = false } = input;

	// Validate request
	const requestValidation = PromptGenerationRequestSchema.safeParse(request);
	if (!requestValidation.success) {
		throw new LlmValidationError('Requisição de geração inválida.', {
			issues: requestValidation.error.issues.map((i) => i.message),
		});
	}

	if (useMockFallback) {
		return generateMockPromptResult(request);
	}

	try {
		const prompt = buildGenerateFinalPrompt(request);
		const result = await runWithLlmRetry(
			async () => {
				const llmResult = await llmClient.generate({
					messages: [
						{
							content:
								'You are a precise JSON-generating assistant. Always respond with valid JSON only.',
							role: 'system',
						},
						{ content: prompt, role: 'user' },
					],
					responseFormat: 'json',
					temperature: llmConfig.temperature,
					timeoutMs: llmConfig.timeoutMs,
				});

				const parsed = extractJsonObject(llmResult.content);
				const validation = PromptGenerationResultSchema.safeParse(parsed);

				if (!validation.success) {
					throw new LlmValidationError(
						'Resultado gerado não passou na validação.',
						{ issues: validation.error.issues.map((i) => i.message) },
					);
				}

				const data = validation.data;

				// Enrich with metadata from the actual LLM call
				return {
					...data,
					generatedAt: new Date().toISOString(),
					model: llmResult.model,
					usage: llmResult.usage,
				};
			},
			{ maxRetries: llmConfig.maxRetries },
		);

		return result;
	} catch (err) {
		const safe = toSafeLlmError(err);
		throw new Error(safe.message);
	}
}
