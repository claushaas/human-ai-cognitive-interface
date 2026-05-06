/**
 * Weighted Manhattan distance and score normalization.
 *
 * Pure functions — no side effects, no IO.
 */

import type { RulerId, RulersVector } from '../rulers/rulers';

export type Weights = Record<RulerId, number>;

const RULER_IDS: readonly RulerId[] = [
	'inference',
	'decision',
	'scope',
	'source',
	'meta',
] as const;

/**
 * Weighted Manhattan distance: Σ weight(axis) × |user − level|
 */
export function computeWeightedDistance(
	user: RulersVector,
	level: RulersVector,
	weights: Weights,
): number {
	return RULER_IDS.reduce((sum, axis) => {
		const w = weights[axis] ?? 1;
		const diff = Math.abs(user[axis] - level[axis]);
		return sum + w * diff;
	}, 0);
}

/**
 * Max possible distance given scale 1..5 (max diff per axis = 4).
 */
export function computeMaxDistance(weights: Weights): number {
	return RULER_IDS.reduce((sum, axis) => sum + (weights[axis] ?? 1) * 4, 0);
}

/**
 * Convert distance to normalized score [0..1].
 * score = 1 − (distance / maxDistance)
 */
export function distanceToScore(distance: number, maxDistance: number): number {
	if (maxDistance <= 0) return 0;
	const raw = 1 - distance / maxDistance;
	return clampNumber(raw, 0, 1);
}

function clampNumber(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}
