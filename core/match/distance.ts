import type { RulerId, RulersVector } from '~/types';

/**
 * Calcula distância Manhattan ponderada entre dois vetores de réguas
 *
 * Fórmula: Σ (peso_eixo × |U_eixo − N_eixo|)
 *
 * @param userVector - Vetor do usuário
 * @param levelVector - Vetor do nível canônico
 * @param weights - Pesos por régua
 * @returns Distância ponderada
 */
export function calculateWeightedManhattanDistance(
	userVector: RulersVector,
	levelVector: RulersVector,
	weights: Record<RulerId, number>,
): number {
	return (Object.keys(userVector) as RulerId[]).reduce((sum, rulerId) => {
		const diff = Math.abs(userVector[rulerId] - levelVector[rulerId]);
		return sum + weights[rulerId] * diff;
	}, 0);
}
