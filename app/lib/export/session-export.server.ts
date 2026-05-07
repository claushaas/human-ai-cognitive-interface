/**
 * Session export helpers — server-side only.
 *
 * Supports Markdown (default) and JSON debug (opt-in) formats.
 */

import type {
	CognitiveContract,
	CollectionAnswer,
	Feedback,
	LevelMatch,
	PromptGenerationResult,
	RawIntent,
	RulersVector,
} from '~/domain/contracts';
import { CONTRACT_VERSION } from '~/domain/contracts';
import { redactSensitiveKeys } from './redaction.server';

export type SessionExportInput = {
	answers?: CollectionAnswer[];
	contract?: CognitiveContract | null;
	createdAt: string;
	feedback?: Feedback | null;
	id: string;
	initialRole?: string | null;
	levelMatch?: LevelMatch | null;
	locale: string;
	model?: string | null;
	prompt?: string | null;
	promptResult?: PromptGenerationResult | null;
	rawIntent?: RawIntent | null;
	rulers?: RulersVector | null;
	status: string;
	title?: string | null;
	updatedAt: string;
};

function _escapeMarkdown(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/\*/g, '\\*')
		.replace(/_/g, '\\_')
		.replace(/\[/g, '\\[')
		.replace(/\]/g, '\\]')
		.replace(/</g, '\\<')
		.replace(/>/g, '\\>');
}

function getRolePublicName(role: string | null | undefined): string {
	if (!role) return 'Não especificado';
	const map: Record<string, string> = {
		'role.analyze': 'Analisar',
		'role.decideSupport': 'Apoiar decisão',
		'role.document': 'Documentar / Formalizar',
		'role.explore': 'Explorar alternativas',
		'role.synthesize': 'Organizar / Sintetizar',
		'role.transform': 'Transformar conteúdo',
	};
	return map[role] || role;
}

function getRulerPublicName(key: string): string {
	const map: Record<string, string> = {
		decision: 'Decisão',
		inference: 'Inferência',
		meta: 'Função meta',
		scope: 'Escopo',
		source: 'Fonte',
	};
	return map[key] || key;
}

export function exportSessionAsMarkdown(input: SessionExportInput): string {
	const sections: string[] = [];

	sections.push('# HACI — Sessão de Prompt');
	sections.push('');

	// Resumo
	sections.push('## Resumo');
	sections.push('');
	sections.push(`- **ID:** ${input.id}`);
	sections.push(`- **Criada:** ${input.createdAt}`);
	if (input.promptResult?.generatedAt) {
		sections.push(`- **Gerada:** ${input.promptResult.generatedAt}`);
	}
	sections.push(`- **Status:** ${input.status}`);
	sections.push(`- **Idioma:** ${input.locale}`);
	sections.push('');

	// Intenção original
	sections.push('## Intenção original');
	sections.push('');
	if (input.rawIntent?.text) {
		sections.push(input.rawIntent.text);
	} else {
		sections.push('_Intenção não registrada._');
	}
	if (input.rawIntent?.desiredOutcome) {
		sections.push('');
		sections.push(`**Resultado desejado:** ${input.rawIntent.desiredOutcome}`);
	}
	sections.push('');

	// Papel escolhido
	sections.push('## Papel escolhido');
	sections.push('');
	sections.push(getRolePublicName(input.initialRole));
	sections.push('');

	// Ajustes
	sections.push('## Ajustes');
	sections.push('');
	if (input.rulers) {
		for (const [key, value] of Object.entries(input.rulers)) {
			sections.push(`- ${getRulerPublicName(key)}: ${value}`);
		}
	} else {
		sections.push('_Ajustes não registrados._');
	}
	sections.push('');

	// Profundidade
	sections.push('## Profundidade');
	sections.push('');
	if (input.levelMatch?.status === 'matched' && input.levelMatch.selected) {
		sections.push('A estrutura está clara o suficiente para avançar.');
	} else if (input.levelMatch?.status === 'ambiguous') {
		sections.push(
			'Existem duas ou mais formas próximas de estruturar esse pedido.',
		);
	} else if (input.levelMatch?.status === 'blocked') {
		sections.push(
			'Preciso de mais clareza antes de gerar um prompt confiável.',
		);
	} else {
		sections.push('_Profundidade não calculada._');
	}
	sections.push('');

	// Detalhes necessários
	sections.push('## Detalhes necessários');
	sections.push('');
	if (input.answers && input.answers.length > 0) {
		for (const answer of input.answers) {
			const valueStr =
				typeof answer.value === 'string'
					? answer.value
					: JSON.stringify(answer.value);
			sections.push(`- ${answer.questionId}: ${valueStr}`);
		}
	} else {
		sections.push('_Nenhum detalhe coletado._');
	}
	sections.push('');

	// Estrutura do prompt
	sections.push('## Estrutura do prompt');
	sections.push('');
	if (input.contract) {
		sections.push('_Estrutura cognitiva definida._');
		if (input.contract.expectedOutput) {
			sections.push(`**Saída esperada:** ${input.contract.expectedOutput}`);
		}
		if (input.contract.responseFormat) {
			sections.push(`**Formato:** ${input.contract.responseFormat}`);
		}
	} else {
		sections.push('_Estrutura ainda não definida._');
	}
	sections.push('');

	// Prompt final
	sections.push('## Prompt final');
	sections.push('');
	if (input.prompt) {
		sections.push('```markdown');
		sections.push(input.prompt);
		sections.push('```');
	} else if (input.status === 'draft') {
		sections.push(
			'_Sessão ainda em rascunho. O prompt final será gerado na etapa de geração._',
		);
	} else {
		sections.push('_Prompt final não disponível._');
	}
	sections.push('');

	// Feedback
	sections.push('## Feedback');
	sections.push('');
	if (input.feedback) {
		sections.push(
			input.feedback.value === 'positive'
				? 'Feedback positivo registrado.'
				: 'Feedback negativo registrado.',
		);
	} else {
		sections.push('_Nenhum feedback registrado._');
	}
	sections.push('');

	// Metadados
	sections.push('## Metadados');
	sections.push('');
	if (input.model) {
		sections.push(`- **Modelo:** ${input.model}`);
	}
	sections.push(`- **Versão do contrato:** ${CONTRACT_VERSION}`);
	sections.push(`- **Última atualização:** ${input.updatedAt}`);
	sections.push('');

	return sections.join('\n');
}

export type DebugExportPayload = {
	version: string;
	exportedAt: string;
	session: {
		id: string;
		status: string;
		createdAt: string;
		updatedAt: string;
		locale: string;
	};
	rawIntent?: RawIntent | null;
	initialRole?: string | null;
	rulers?: RulersVector | null;
	levelMatch?: LevelMatch | null;
	collectionProtocol?: unknown;
	collectionAnswers?: CollectionAnswer[];
	cognitiveContract?: CognitiveContract | null;
	promptResult?: PromptGenerationResult | null;
	feedback?: Feedback | null;
	llmMetadata?: {
		model?: string | null;
		usage?: PromptGenerationResult['usage'];
		warnings?: string[];
	};
};

export function exportSessionAsJson(input: SessionExportInput): unknown {
	const payload: DebugExportPayload = {
		cognitiveContract: input.contract,
		collectionAnswers: input.answers,
		exportedAt: new Date().toISOString(),
		feedback: input.feedback,
		initialRole: input.initialRole,
		levelMatch: input.levelMatch,
		llmMetadata: {
			model: input.model,
			usage: input.promptResult?.usage,
			warnings: input.promptResult?.warnings,
		},
		promptResult: input.promptResult,
		rawIntent: input.rawIntent,
		rulers: input.rulers,
		session: {
			createdAt: input.createdAt,
			id: input.id,
			locale: input.locale,
			status: input.status,
			updatedAt: input.updatedAt,
		},
		version: `${CONTRACT_VERSION}-debug`,
	};

	return redactSensitiveKeys(payload);
}
