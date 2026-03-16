import type { CriterionId } from '~/types';

/**
 * Ordenação UX de critérios para reduzir fadiga cognitiva
 *
 * Princípios:
 * 1. Critérios com dependências vêm primeiro
 * 2. Simplicidade primeiro (menos carga cognitiva)
 * 3. Contexto antes de restrições
 */

/**
 * Ordem canônica dos critérios (C1 primeiro, C14 último)
 * Baseado em R8 e docs/08-criteria-and-collection-protocol.md
 */
const CRITERION_ORDER: Record<CriterionId, number> = {
	C1: 1, // Objetivo operacional (sempre primeiro)
	C2: 2, // Artefato/resultado
	C3: 3, // Escopo de atuação
	C4: 4, // Fonte da verdade
	C5: 5, // Limites de inferência
	C6: 6, // Autoridade/decisão
	C7: 7, // Execução vs preparação
	C8: 8, // Transformações permitidas
	C9: 9, // Transformações proibidas
	C10: 10, // Formato de saída
	C11: 11, // Critérios de sucesso
	C12: 12, // Condições de parada/erro
	C13: 13, // Dependências/contexto técnico
	C14: 14, // Restrições de segurança (sempre último)
};

/**
 * Ordena lista de critérios pela ordem canônica UX
 */
export function orderCriteria(criteria: CriterionId[]): CriterionId[] {
	return criteria.sort((a, b) => CRITERION_ORDER[a] - CRITERION_ORDER[b]);
}

/**
 * Separa critérios em "essenciais" e "complementares"
 * Essenciais: C1-C4 (contexto básico)
 * Complementares: C5-C14 (detalhes e restrições)
 */
export function splitByImportance(criteria: CriterionId[]): {
	essential: CriterionId[];
	supplementary: CriterionId[];
} {
	const essential: CriterionId[] = [];
	const supplementary: CriterionId[] = [];

	for (const criterion of criteria) {
		const order = CRITERION_ORDER[criterion];
		if (order <= 4) {
			essential.push(criterion);
		} else {
			supplementary.push(criterion);
		}
	}

	return { essential, supplementary };
}
