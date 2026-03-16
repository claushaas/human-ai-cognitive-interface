/**
 * Thresholds canônicos para decisão de match
 * Baseado em docs/07-level-matching.md seção 6
 */
export const DEFAULT_THRESHOLDS = {
	/** Auto-seleção se score >= 90 */
	autoSelectMin: 90,
	/** Bloqueia se máximo < 70 */
	blockBelow: 70,
	/** Apenas candidatos >= 70 */
	candidatesMin: 70,
	/** Máximo de candidatos retornados */
	maxCandidates: 3,
};
