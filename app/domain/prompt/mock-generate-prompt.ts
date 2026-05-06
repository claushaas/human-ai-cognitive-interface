/**
 * Mock prompt generator.
 *
 * Deterministic, no LLM, returns valid PromptGenerationResult.
 */

import type {
	PromptGenerationRequest,
	PromptGenerationResult,
} from '~/domain/contracts';
import {
	CONTRACT_VERSION,
	PromptGenerationRequestSchema,
	PromptGenerationResultSchema,
} from '~/domain/contracts';

export function generateMockPromptResult(
	input: PromptGenerationRequest,
): PromptGenerationResult {
	const validation = PromptGenerationRequestSchema.safeParse(input);
	if (!validation.success) {
		throw new Error(
			`Invalid prompt generation request: ${validation.error.message}`,
		);
	}

	const contract = input.contract;
	const answers = input.answers ?? [];
	const levelId = contract.levelMatch.selected?.id ?? 'N3';
	const roleLabel = getRoleLabel(contract.initialRole);

	// Build prompt sections
	const sections: string[] = [];

	sections.push(`# Contexto`);
	sections.push(
		`Você está atuando como assistente de ${roleLabel.toLowerCase()}.`,
	);
	sections.push(`O usuário deseja: ${contract.rawIntent.text}`);

	if (contract.rawIntent.desiredOutcome) {
		sections.push(`Resultado esperado: ${contract.rawIntent.desiredOutcome}`);
	}

	sections.push(`\n# Diretrizes`);
	sections.push(`- Nível de profundidade: ${getLevelDescription(levelId)}`);
	sections.push(
		`- Idioma: ${contract.locale === 'pt-BR' ? 'Português (Brasil)' : 'Inglês'}`,
	);

	// Add collected criteria
	if (answers.length > 0) {
		sections.push(`\n# Critérios e restrições`);
		for (const answer of answers) {
			const question = input.collectionProtocol?.questions.find(
				(q) => q.id === answer.questionId,
			);
			if (question) {
				const value = formatAnswerValue(answer.value);
				if (value) {
					sections.push(`- ${question.label}: ${value}`);
				}
			}
		}
	}

	// Add constraints if present
	if (contract.constraints && contract.constraints.length > 0) {
		sections.push(`\n# Restrições adicionais`);
		for (const constraint of contract.constraints) {
			sections.push(`- ${constraint}`);
		}
	}

	// Add risks if present
	if (contract.risks && contract.risks.length > 0) {
		sections.push(`\n# Riscos a considerar`);
		for (const risk of contract.risks) {
			sections.push(`- ${risk}`);
		}
	}

	sections.push(`\n# Instrução final`);
	sections.push(
		`Gere uma resposta que atenda ao resultado desejado, respeitando as diretrizes e critérios acima.`,
	);

	const promptText = sections.join('\n');

	const result: PromptGenerationResult = {
		contractId: contract.id,
		generatedAt: new Date().toISOString(),
		model: 'mock-haci-v1',
		prompt: promptText,
		usage: {
			inputTokens: Math.round(promptText.length / 4),
			outputTokens: 0,
			totalTokens: Math.round(promptText.length / 4),
		},
		version: CONTRACT_VERSION,
		warnings:
			contract.levelMatch.status === 'ambiguous'
				? ['Match ambíguo: múltiplos níveis candidatos.']
				: undefined,
	};

	const parsed = PromptGenerationResultSchema.safeParse(result);
	if (!parsed.success) {
		throw new Error(
			`Mock prompt result validation failed: ${parsed.error.message}`,
		);
	}

	return result;
}

function getRoleLabel(role: string): string {
	const labels: Record<string, string> = {
		'role.analyze': 'Análise',
		'role.decideSupport': 'Apoio à Decisão',
		'role.document': 'Documentação',
		'role.explore': 'Exploração',
		'role.synthesize': 'Síntese',
		'role.transform': 'Transformação',
	};
	return labels[role] ?? 'Assistente';
}

function getLevelDescription(levelId: string): string {
	const descriptions: Record<string, string> = {
		N1: 'Execução estritamente delimitada — seguir instruções exatas',
		N2: 'Análise controlada — diagnóstico estruturado',
		N3: 'Síntese estruturada — organização cognitiva',
		N4: 'Exploração de alternativas — trade-offs e opções',
		N5: 'Apoio à decisão — recomendação com justificativa',
		N6: 'Governança — controle e segurança cognitiva',
		N7: 'Meta-cognição — arquitetura de pensamento',
		N8: 'Documentação — contratos e sistemas de uso',
	};
	return descriptions[levelId] ?? 'Nível padrão';
}

function formatAnswerValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
	if (Array.isArray(value)) return value.join(', ');
	return String(value);
}
