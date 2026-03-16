import type {
	CanonicalLevelId,
	CognitiveContract,
	InitialRoleId,
	RulerId,
	Scale1to5,
} from '~/types';

/**
 * Prompt de Match/Contrato Cognitivo
 *
 * Template para explicar o contrato cognitivo ao usuário
 * Formato: Markdown estruturado
 */

interface ContractPromptOptions {
	/** Incluir detalhes das réguas */
	showRulerDetails?: boolean;
	/** Incluir explicação de hard blocks */
	showHardBlocks?: boolean;
	/** Incluir sugestões de correção */
	showCorrections?: boolean;
}

/**
 * Labels canônicos para réguas
 */
const RULER_LABELS: Record<RulerId, string> = {
	decision: 'Decisão',
	inference: 'Inferência',
	meta: 'Função Meta',
	scope: 'Escopo',
	source: 'Fonte',
};

/**
 * Descrições das réguas por nível
 */
const RULER_DESCRIPTIONS: Record<RulerId, Record<number, string>> = {
	decision: {
		1: 'Nenhuma recomendação/priorização',
		2: 'Recomendação leve (com justificativa; decisão final humana)',
		3: 'Governança/bloqueio (autoridade para parar e exigir clarificação)',
		4: 'Recomendação com ação (decision-making support)',
		5: 'Decisão autônoma',
	},
	inference: {
		1: 'Nenhuma inferência (apenas dados explícitos)',
		2: 'Inferência mínima (conexões óvias)',
		3: 'Inferência moderada (contexto implícito)',
		4: 'Inferência ampla (padrões e implicações)',
		5: 'Inferência máxima (leitura entre linhas)',
	},
	meta: {
		1: 'Operacional (no conteúdo)',
		2: 'Tático (processo e conteúdo)',
		3: 'Estratégico (arquitetura do pensamento)',
		4: 'Reflexivo (pensamento sobre o pensamento)',
		5: 'Meta-arquitetural (sistemas de cognição)',
	},
	scope: {
		1: 'Local (item único)',
		2: 'Contextual (relacionamentos próximos)',
		3: 'Departamental/área',
		4: 'Organizacional/projeto',
		5: 'Sistêmico/ecossistema',
	},
	source: {
		1: 'Fechada (apenas o que foi fornecido)',
		2: 'Fechada com complementação controlada',
		3: 'Parcialmente aberta (contexto geral)',
		4: 'Aberta (pesquisa limitada)',
		5: 'Totalmente aberta (pesquisa extensiva)',
	},
};

/**
 * Nomes canônicos dos níveis
 */
const LEVEL_NAMES: Record<CanonicalLevelId, string> = {
	N1: 'Execução Estritamente Delimitada',
	N2: 'Análise Controlada e Diagnóstico',
	N3: 'Síntese Estruturada e Organização Cognitiva',
	N4: 'Exploração de Alternativas e Trade-offs',
	N5: 'Apoio à Decisão Humana',
	N6: 'Governança, Controle e Segurança Cognitiva',
	N7: 'Meta-Cognição e Arquitetura de Pensamento',
	N8: 'Documentação, Contratos e Sistemas de Uso',
};

/**
 * Papéis iniciais com descrições
 */
const ROLE_DESCRIPTIONS: Record<
	InitialRoleId,
	{ label: string; description: string }
> = {
	'role.analyze': {
		description: 'Entender algo que já existe',
		label: 'Analisar',
	},
	'role.decideSupport': {
		description: 'Ajudar a pensar, mas decisão é humana',
		label: 'Apoiar decisão',
	},
	'role.document': {
		description: 'Transformar em algo oficial e reutilizável',
		label: 'Documentar / Formalizar',
	},
	'role.explore': {
		description: 'Ver caminhos possíveis sem decidir',
		label: 'Explorar alternativas',
	},
	'role.synthesize': {
		description: 'Estruturar conteúdo existente',
		label: 'Organizar / Sintetizar',
	},
	'role.transform': {
		description: 'Mudar forma, formato ou estrutura',
		label: 'Transformar conteúdo',
	},
};

/**
 * Gera prompt de contrato cognitivo em markdown
 *
 * @param contract - Contrato cognitivo validado
 * @param options - Opções de renderização
 * @returns String em markdown formatado
 */
export function generateContractPrompt(
	contract: CognitiveContract,
	options: ContractPromptOptions = {},
): string {
	const {
		showRulerDetails = true,
		showHardBlocks = true,
		showCorrections = true,
	} = options;

	const { role, levelMatch, rulers, hardBlocks, correction } = contract;

	const roleInfo = ROLE_DESCRIPTIONS[role];
	const levelName = LEVEL_NAMES[levelMatch.selectedLevel];

	let prompt = `# Contrato Cognitivo Configurado

## Papel Selecionado

**${roleInfo.label}** — ${roleInfo.description}

---

## Nível Canônico

### ${levelMatch.selectedLevel}: ${levelName}

**Score de match:** ${Math.round(levelMatch.score)}%

`;

	// Réguas cognitivas
	if (showRulerDetails) {
		prompt += `## Réguas Cognitivas Configuradas

| Régua | Valor | Descrição |
|-------|-------|-----------|
`;
		for (const [rulerId, value] of Object.entries(rulers) as [
			RulerId,
			Scale1to5,
		][]) {
			const label = RULER_LABELS[rulerId];
			const description = RULER_DESCRIPTIONS[rulerId][value];
			prompt += `| ${label} | ${value}/5 | ${description} |\n`;
		}

		prompt += `
---

`;
	}

	// Candidatos de match
	if (levelMatch.candidates.length > 0) {
		prompt += `## Níveis Candidatos

| Nível | Score | Status |
|-------|-------|--------|
`;
		for (const candidate of levelMatch.candidates) {
			const status =
				candidate.level === levelMatch.selectedLevel
					? 'Selecionado'
					: 'Alternativa';
			prompt += `| ${candidate.level} | ${Math.round(candidate.score)}% | ${status} |\n`;
		}

		prompt += `
---

`;
	}

	// Hard blocks
	if (showHardBlocks && hardBlocks.length > 0) {
		prompt += `## Bloqueios Ativos

`;
		for (const block of hardBlocks) {
			const severityIcon =
				block.severity === 'BLOCK'
					? '🔴'
					: block.severity === 'WARN'
						? '🟡'
						: '🟠';
			prompt += `${severityIcon} **${block.id}**: ${block.message}\n\n`;
		}

		prompt += `---

`;
	}

	// Correções aplicadas
	if (showCorrections && correction) {
		prompt += `## Correções Aplicadas

**Alterações nas réguas:**
`;
		for (const [ruler, delta] of Object.entries(correction.rulersDelta)) {
			const rulerLabel = RULER_LABELS[ruler as RulerId];
			const sign = delta && delta > 0 ? '+' : '';
			prompt += `- ${rulerLabel}: ${sign}${delta}\n`;
		}

		prompt += `
**Motivo:** ${correction.reason}

---

`;
	}

	prompt += `## Modo de Operação

Este contrato está em **modo de preparação** — o sistema irá derivar critérios de coleta, mas não executará a tarefa final até que todos os critérios sejam satisfeitos.

`;

	return prompt;
}

/**
 * Gera resumo conciso do contrato para exibição rápida
 */
export function generateContractSummary(contract: CognitiveContract): string {
	const { role, levelMatch, rulers } = contract;
	const roleInfo = ROLE_DESCRIPTIONS[role];
	const levelName = LEVEL_NAMES[levelMatch.selectedLevel];

	return `**${roleInfo.label}** em **${levelMatch.selectedLevel}** (${levelName}) — Score: ${Math.round(levelMatch.score)}%

Réguas: inference=${rulers.inference}, decision=${rulers.decision}, scope=${rulers.scope}, source=${rulers.source}, meta=${rulers.meta}`;
}
