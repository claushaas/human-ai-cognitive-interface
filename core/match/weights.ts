import type { RulerId } from '~/types';

/**
 * Pesos canônicos para cálculo de distância Manhattan ponderada
 * Baseado em docs/07-level-matching.md seção 3
 */
export const DEFAULT_RULER_WEIGHTS: Record<RulerId, number> = {
	decision: 1.5,
	inference: 1.0,
	meta: 1.3,
	scope: 1.2,
	source: 1.5,
};
