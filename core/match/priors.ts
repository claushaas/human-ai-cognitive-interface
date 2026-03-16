import type { CanonicalLevelId, InitialRoleId } from '~/types';
import rolePriorsConfig from '../../config/role-priors.json';

/**
 * Boost de prior por papel inicial
 * Baseado em docs/07-level-matching.md seção 4
 *
 * Contribuição máxima: 0.15 (15%)
 */
export const ROLE_PRIOR_BOOSTS: Record<
	InitialRoleId,
	Record<CanonicalLevelId, number>
> = rolePriorsConfig.roleBoosts;

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
