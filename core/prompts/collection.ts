import type {
	CollectionBlock,
	CollectionProtocol,
	InitialRoleId,
} from '~/types';

/**
 * Prompt de Protocolo de Coleta
 *
 * CRÍTICO: Inclui proibição central (não executar tarefa final)
 * Template dinâmico baseado no catálogo de critérios
 */

interface CollectionPromptOptions {
	/** Incluir bloco de introdução com proibição central */
	includeIntroduction?: boolean;
	/** Incluir bloco de conclusão */
	includeConclusion?: boolean;
	/** Formato de saída ('markdown' | 'json') */
	format?: 'markdown' | 'json';
}

const ROLE_INSTRUCTIONS: Record<InitialRoleId, string> = {
	'role.analyze':
		'Analise o contexto fornecido sem criar novo conteúdo ou executar ações.',
	'role.decideSupport':
		'Forneça recomendações com justificativa, mas não decida pelo usuário.',
	'role.document':
		'Documente de forma precisa e reutilizável, mantendo rigor terminológico.',
	'role.explore':
		'Explore alternativas e possibilidades sem fechar em uma única resposta.',
	'role.synthesize':
		'Estruture e organize o conteúdo mantendo a coerência e clareza.',
	'role.transform':
		'Transforme o conteúdo conforme especificado, preservando a intenção original.',
};

/**
 * Gera prompt de protocolo de coleta em markdown
 *
 * @param protocol - Protocolo de coleta derivado
 * @param options - Opções de renderização
 * @returns String em markdown formatado
 */
export function generateCollectionPrompt(
	protocol: CollectionProtocol,
	options: CollectionPromptOptions = {},
): string {
	const {
		includeIntroduction = true,
		includeConclusion = true,
		format = 'markdown',
	} = options;

	if (format === 'json') {
		return JSON.stringify(protocol, null, 2);
	}

	let prompt = '';

	// Introdução com PROIBIÇÃO CENTRAL
	if (includeIntroduction) {
		prompt += `# Protocolo de Coleta de Critérios

> ⚠️ **IMPORTANTE: Este é um pedido de PREPARAÇÃO, não de EXECUÇÃO.**
>
> **NÃO execute a tarefa final do usuário.**
>
> Sua função agora é coletar informações necessárias para que a tarefa seja executada posteriormente com clareza e precisão.

## Critérios Implícitos

Os seguintes critérios já estão satisfeitos pelo contrato e não precisam ser coletados:

${protocol.implicitCriteria.map((c) => `- **${c}**`).join('\n')}

## Visão Geral

Este protocolo contém **${protocol.criteria.length} blocos** de coleta a serem preenchidos.

---

`;
	}

	// Blocos de coleta
	for (let i = 0; i < protocol.criteria.length; i++) {
		const block = protocol.criteria[i];
		const isLast = i === protocol.criteria.length - 1;

		prompt += `## Bloco ${i + 1}: ${block.title}

**Instrução:** ${block.instruction}

### O que incluir:
${block.include.map((item) => `- ${item}`).join('\n')}

### O que evitar:
${block.avoid.map((item) => `- ${item}`).join('\n')}

**Exemplo:** ${block.example}

> **Racional:** ${block.rationale}

---

${isLast ? '' : ''}`;
	}

	// Conclusão
	if (includeConclusion) {
		prompt += `## Próximos Passos

Após preencher todos os blocos acima, o sistema estará pronto para **EXECUÇÃO** da tarefa.

**Resumo do protocolo:**
- Versão: ${protocol.protocolVersion}
- Total de critérios: ${protocol.criteria.length}
- Critérios implícitos: ${protocol.implicitCriteria.length}
${protocol.blockingIssue ? `- **Bloqueio:** ${protocol.blockingIssue}` : ''}
`;
	}

	return prompt;
}

/**
 * Gera instrução personalizada para um bloco específico
 *
 * @param block - Bloco de coleta
 * @param role - Papel inicial para contextualização
 * @returns Instrução personalizada
 */
export function generateBlockInstruction(
	block: CollectionBlock,
	role: InitialRoleId,
): string {
	const roleContext = ROLE_INSTRUCTIONS[role];

	return `${roleContext}\n\n${block.instruction}\n\nInclua: ${block.include.join('; ')}. Evite: ${block.avoid.join('; ')}.`;
}

/**
 * Gera prompt de um único bloco para coleta iterativa
 */
export function generateSingleBlockPrompt(
	block: CollectionBlock,
	blockNumber: number,
	totalBlocks: number,
): string {
	return `### Bloco ${blockNumber}/${totalBlocks}: ${block.title}

${block.instruction}

**Incluir:**
${block.include.map((item) => `- ${item}`).join('\n')}

**Evitar:**
${block.avoid.map((item) => `- ${item}`).join('\n')}

**Exemplo:** ${block.example}

> ${block.rationale}
`;
}
