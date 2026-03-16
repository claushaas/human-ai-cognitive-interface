/**
 * Normaliza distância para score 0-100
 *
 * @param distance - Distância calculada
 * @param maxDistance - Distância máxima possível
 * @returns Score normalizado (0-100)
 */
export function normalizeScore(distance: number, maxDistance: number): number {
	return Math.max(0, Math.min(100, 100 * (1 - distance / maxDistance)));
}

/**
 * Calcula score bruto (sem normalização) para um nível
 *
 * @param distance - Distância Manhattan ponderada
 * @param maxDistance - Distância máxima possível para o track
 * @returns Score bruto
 */
export function calculateRawScore(
	distance: number,
	maxDistance: number,
): number {
	return normalizeScore(distance, maxDistance);
}
