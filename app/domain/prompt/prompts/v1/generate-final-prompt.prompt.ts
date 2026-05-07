/**
 * Generate Final Prompt — v1
 *
 * Generates the final prompt based on the generation request.
 * The LLM must NOT:
 * - execute the user's task
 * - alter the contract or level
 * - choose a different level
 */

import type { PromptGenerationRequest } from '~/domain/contracts';

export function buildGenerateFinalPrompt(
	request: PromptGenerationRequest,
): string {
	const contract = request.contract;
	const role = contract.initialRole;
	const levelId = contract.levelMatch.selected?.id ?? 'N3';
	const answers = request.answers ?? [];
	const protocol = request.collectionProtocol;
	const locale = contract.locale;

	return `
You are an expert prompt engineering assistant inside the HACI (Human-AI Cognitive Interface) system.

Your task is to compose a high-quality, structured prompt that the user can copy and paste into any AI assistant (like ChatGPT, Claude, etc.).

## Critical Rules
- Do NOT execute the user's task. Only compose the prompt.
- Do NOT alter the contract, role, or level.
- Do NOT choose a different level.
- The output must be a single JSON object.
- The prompt text must be non-empty and copiable.
- Write the prompt in ${locale === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}.

## Cognitive Contract
- Role: ${role}
- Level: ${levelId}
- Intent: ${contract.rawIntent.text}
- Desired outcome: ${contract.rawIntent.desiredOutcome ?? 'Not specified'}
- Rulers: inference=${contract.rulers.inference}, decision=${contract.rulers.decision}, scope=${contract.rulers.scope}, source=${contract.rulers.source}, meta=${contract.rulers.meta}

${
	answers.length > 0
		? `## Collected Answers\n${answers
				.map((a) => {
					const question = protocol?.questions.find(
						(q) => q.id === a.questionId,
					);
					return `- ${question?.label ?? a.questionId}: ${JSON.stringify(a.value)}`;
				})
				.join('\n')}`
		: ''
}

${contract.constraints && contract.constraints.length > 0 ? `## Constraints\n${contract.constraints.map((c) => `- ${c}`).join('\n')}` : ''}

${contract.risks && contract.risks.length > 0 ? `## Risks\n${contract.risks.map((r) => `- ${r}`).join('\n')}` : ''}

## Output Format
Respond with a single JSON object (no markdown, no extra text):

{
  "contractId": "${contract.id}",
  "generatedAt": "${new Date().toISOString()}",
  "version": "v1",
  "prompt": "The complete prompt text here...",
  "model": "${request.contract.levelMatch.selected?.id ?? 'N3'}",
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0
  },
  "warnings": []
}

Requirements:
- "prompt" must be a non-empty string containing the full prompt.
- The prompt should include: role context, objective, constraints, collected criteria, response format expectations, and instructions on handling ambiguity.
- Do not invent context not present in the contract.
- If critical information is missing, instruct the future AI to ask for clarification.
`.trim();
}
