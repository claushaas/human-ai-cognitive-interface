/**
 * Role prior: soft bias based on initial role selection.
 *
 * Gives a score boost to levels associated with the chosen role.
 * Max contribution is capped (default 0.15) to prevent override of
 * ruler-based matching.
 *
 * Source of truth: docs/raw inputs/canonical-prompt-generator.json
 */

import type { LevelId } from '../levels/levels';
import type { InternalRoleId } from '../roles/roles';

export type PriorConfig = {
	enabled: boolean;
	/** Maximum contribution to final score (0..1) */
	maxContribution: number;
	/** Per-role level boosts */
	roleBoosts: Partial<Record<InternalRoleId, LevelId[]>>;
};

export function applyRolePrior(
	baseScore: number,
	levelId: LevelId,
	initialRole: InternalRoleId,
	prior: PriorConfig,
): number {
	if (!prior.enabled) return baseScore;

	const boosts = prior.roleBoosts[initialRole] ?? [];
	if (!boosts.includes(levelId)) return baseScore;

	// Increase up to maxContribution (proportional to remaining headroom)
	const headroom = 1 - baseScore;
	const bump = headroom * clampNumber(prior.maxContribution, 0, 1);
	return clampNumber(baseScore + bump, 0, 1);
}

export function getDefaultPrior(): PriorConfig {
	return {
		enabled: true,
		maxContribution: 0.15,
		roleBoosts: {
			'role.analyze': ['N2', 'N6', 'N7'],
			'role.decideSupport': ['N5'],
			'role.document': ['N8', 'N6'],
			'role.execute': ['N1'],
			'role.explore': ['N4', 'N5'],
			'role.research': ['N4', 'N5'],
			'role.synthesize': ['N3', 'N8'],
			'role.transform': ['N1', 'N3'],
		},
	};
}

function clampNumber(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}
