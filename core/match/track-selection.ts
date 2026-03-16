import type { CanonicalLevelId, RulersVector } from '~/types';

/**
 * Implementa regra de seleção de track conforme docs/12-constitution.md seção 5.1
 *
 * Regra:
 * - Se decision == 3: apenas operational (N1-N6)
 * - Senão se meta >= 4: apenas meta (N7-N8)
 * - Senão: apenas operational (N1-N6)
 *
 * @param rulers - Vetor de réguas do usuário
 * @returns Lista de níveis permitidos no track
 */
export function selectTrack(rulers: RulersVector): CanonicalLevelId[] {
	// N6 (governança) exige decision = 3
	if (rulers.decision === 3) {
		// Track operacional: N1-N6
		return ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'];
	}

	// Meta >= 4 indica track meta/constitucional
	if (rulers.meta >= 4) {
		// Track meta: N7-N8
		return ['N7', 'N8'];
	}

	// Default: track operacional
	return ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'];
}

/**
 * Verifica se um nível é operacional (N1-N6) ou meta/constitucional (N7-N8)
 */
export function isOperationalLevel(level: CanonicalLevelId): boolean {
	return (
		level === 'N1' ||
		level === 'N2' ||
		level === 'N3' ||
		level === 'N4' ||
		level === 'N5' ||
		level === 'N6'
	);
}

/**
 * Verifica se um nível é meta/constitucional (N7-N8)
 */
export function isMetaLevel(level: CanonicalLevelId): boolean {
	return level === 'N7' || level === 'N8';
}
