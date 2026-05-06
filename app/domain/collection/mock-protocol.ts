/**
 * Mock collection protocol generator.
 *
 * Deterministic, no LLM, returns valid CollectionProtocol.
 */

import type { CognitiveContract, CollectionProtocol } from '~/domain/contracts';
import { CONTRACT_VERSION, CollectionProtocolSchema } from '~/domain/contracts';

export function deriveMockCollectionProtocol(
	contract: CognitiveContract,
): CollectionProtocol {
	const role = contract.initialRole;
	const levelId = contract.levelMatch.selected?.id ?? 'N3';

	const baseQuestions = [
		{
			answerType: 'enum' as const,
			id: 'format',
			label: 'Qual formato você espera na resposta?',
			options: [
				'Texto corrido',
				'Lista com marcadores',
				'Tabela',
				'Markdown estruturado',
				'JSON',
			],
			rationale: 'O formato afeta como a IA organiza a saída.',
			required: true,
		},
		{
			answerType: 'text' as const,
			id: 'context',
			label: 'Existe algum contexto obrigatório que a IA precisa considerar?',
			rationale: 'Contexto adicional melhora a precisão do prompt.',
			required: false,
		},
		{
			answerType: 'text' as const,
			id: 'restrictions',
			label: 'Há restrições que a resposta deve respeitar?',
			rationale: 'Restrições evitam respostas fora do escopo desejado.',
			required: false,
		},
		{
			answerType: 'enum' as const,
			id: 'detail',
			label: 'Qual nível de detalhe é adequado?',
			options: [
				'Breve (resumo)',
				'Moderado (pontos principais)',
				'Detalhado (exaustivo)',
			],
			rationale: 'Define a profundidade esperada na resposta.',
			required: true,
		},
		{
			answerType: 'text' as const,
			id: 'avoid',
			label: 'Existe algo que a IA deve evitar?',
			rationale: 'Evita conteúdo indesejado ou fora de escopo.',
			required: false,
		},
	];

	// Add role-specific questions (prepended so they appear)
	const roleQuestions = getRoleSpecificQuestions(role, levelId);

	const allQuestions = [...roleQuestions, ...baseQuestions].slice(0, 5);

	const protocol: CollectionProtocol = {
		contractId: contract.id,
		questions: allQuestions,
		status: 'ready',
		version: CONTRACT_VERSION,
	};

	const parsed = CollectionProtocolSchema.safeParse(protocol);
	if (!parsed.success) {
		throw new Error(`Mock protocol validation failed: ${parsed.error.message}`);
	}

	return protocol;
}

function getRoleSpecificQuestions(
	role: string,
	_levelId: string,
): Array<{
	id: string;
	label: string;
	answerType: 'text' | 'number' | 'boolean' | 'enum' | 'multi-select' | 'url';
	required: boolean;
	options?: string[];
	rationale?: string;
}> {
	switch (role) {
		case 'role.analyze':
			return [
				{
					answerType: 'enum',
					id: 'analysis_focus',
					label: 'O foco da análise deve ser em qual aspecto?',
					options: [
						'Estrutura',
						'Lógica',
						'Qualidade',
						'Riscos',
						'Completeness',
					],
					required: false,
				},
			];
		case 'role.synthesize':
			return [
				{
					answerType: 'enum',
					id: 'synthesis_style',
					label: 'Qual estilo de síntese você prefere?',
					options: ['Resumo executivo', 'Narrativa', 'Tópicos', 'Comparativo'],
					required: false,
				},
			];
		case 'role.explore':
			return [
				{
					answerType: 'enum',
					id: 'exploration_depth',
					label: 'Quantas alternativas você quer explorar?',
					options: ['2-3 opções', '4-5 opções', 'O máximo possível'],
					required: false,
				},
			];
		case 'role.decideSupport':
			return [
				{
					answerType: 'multi-select',
					id: 'decision_criteria',
					label: 'Quais critérios são mais importantes para a decisão?',
					options: ['Custo', 'Tempo', 'Qualidade', 'Risco', 'Escalabilidade'],
					required: false,
				},
			];
		case 'role.document':
			return [
				{
					answerType: 'text',
					id: 'audience',
					label: 'Quem é o público-alvo desta documentação?',
					required: false,
				},
			];
		case 'role.transform':
			return [
				{
					answerType: 'text',
					id: 'target_format',
					label: 'Para qual formato você quer transformar?',
					required: false,
				},
			];
		default:
			return [];
	}
}
