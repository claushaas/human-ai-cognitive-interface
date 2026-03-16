import type { CanonicalLevelId, InitialRoleId } from '~/types';

/**
 * Boost de prior por papel inicial
 * Baseado em docs/07-level-matching.md seção 4
 *
 * Contribuição máxima: 0.15 (15%)
 */
export const ROLE_PRIOR_BOOSTS: Record<
	InitialRoleId,
	Record<CanonicalLevelId, number>
> = {
	// role.analyze: N1, N2 (análise local/diagnóstico)
	'role.analyze': {
		N1: 0.15,
		N2: 0.1,
		N3: 0.05,
		N4: 0.0,
		N5: 0.0,
		N6: 0.0,
		N7: 0.0,
		N8: 0.0,
	},
	// role.decideSupport: N5 (apoio à decisão)
	'role.decideSupport': {
		N1: 0.0,
		N2: 0.0,
		N3: 0.0,
		N4: 0.05,
		N5: 0.15,
		N6: 0.05,
		N7: 0.0,
		N8: 0.0,
	},
	// role.document: N8 (documentação)
	'role.document': {
		N1: 0.0,
		N2: 0.0,
		N3: 0.05,
		N4: 0.0,
		N5: 0.0,
		N6: 0.0,
		N7: 0.0,
		N8: 0.15,
	},
	// role.explore: N4 (exploração de alternativas)
	'role.explore': {
		N1: 0.0,
		N2: 0.0,
		N3: 0.05,
		N4: 0.15,
		N5: 0.05,
		N6: 0.0,
		N7: 0.0,
		N8: 0.0,
	},
	// role.synthesize: N3, N8 (síntese e documentação)
	'role.synthesize': {
		N1: 0.0,
		N2: 0.05,
		N3: 0.15,
		N4: 0.05,
		N5: 0.0,
		N6: 0.0,
		N7: 0.0,
		N8: 0.1,
	},
	// role.transform: N3, N4 (transformação estruturada)
	'role.transform': {
		N1: 0.0,
		N2: 0.05,
		N3: 0.1,
		N4: 0.1,
		N5: 0.05,
		N6: 0.0,
		N7: 0.0,
		N8: 0.05,
	},
};

/**
 * Aplica prior boost ao score de um nível baseado no papel
 *
 * @param baseScore - Score base (0-100)
 * @param role - Papel inicial
 * @param level - Nível para aplicar boost
 * @returns Score com prior aplicado (0-100)
 */
export function applyPriorBoost(
	baseScore: number,
	role: InitialRoleId,
	level: CanonicalLevelId,
): number {
	const boost = ROLE_PRIOR_BOOSTS[role]?.[level] ?? 0;
	// Boost é aplicado como adição percentual ao score (máx 100)
	return Math.min(100, baseScore + boost * 100);
}
