import { describe, expect, it } from 'vitest';
import {
	computeMaxDistance,
	computeWeightedDistance,
	distanceToScore,
} from '~/domain/matching/distance';
import { DEFAULT_WEIGHTS } from '~/domain/rulers/rulers';

describe('computeWeightedDistance', () => {
	it('returns 0 for identical vectors', () => {
		const v = { decision: 2, inference: 3, meta: 2, scope: 2, source: 2 };
		expect(computeWeightedDistance(v, v, DEFAULT_WEIGHTS)).toBe(0);
	});

	it('computes weighted Manhattan distance correctly', () => {
		const user = { decision: 1, inference: 1, meta: 1, scope: 1, source: 1 };
		const level = { decision: 5, inference: 5, meta: 5, scope: 5, source: 5 };
		const dist = computeWeightedDistance(user, level, DEFAULT_WEIGHTS);
		// (1.0 + 1.5 + 1.2 + 1.5 + 1.3) * 4 = 6.5 * 4 = 26
		expect(dist).toBe(26);
	});

	it('handles partial differences', () => {
		const user = { decision: 2, inference: 3, meta: 3, scope: 3, source: 2 };
		const level = { decision: 3, inference: 3, meta: 3, scope: 3, source: 3 };
		const dist = computeWeightedDistance(user, level, DEFAULT_WEIGHTS);
		// decision: 1.5 * 1 = 1.5, source: 1.5 * 1 = 1.5
		expect(dist).toBe(3);
	});
});

describe('computeMaxDistance', () => {
	it('returns sum of weights * 4', () => {
		const max = computeMaxDistance(DEFAULT_WEIGHTS);
		expect(max).toBe(26); // (1.0 + 1.5 + 1.2 + 1.5 + 1.3) * 4
	});

	it('handles custom weights', () => {
		const weights = { decision: 2, inference: 2, meta: 2, scope: 2, source: 2 };
		expect(computeMaxDistance(weights)).toBe(40);
	});
});

describe('distanceToScore', () => {
	it('returns 1 for zero distance', () => {
		expect(distanceToScore(0, 26)).toBe(1);
	});

	it('returns 0 for max distance', () => {
		expect(distanceToScore(26, 26)).toBe(0);
	});

	it('returns 0.5 for half distance', () => {
		expect(distanceToScore(13, 26)).toBe(0.5);
	});

	it('clamps negative raw scores to 0', () => {
		expect(distanceToScore(30, 26)).toBe(0);
	});

	it('returns 0 for zero maxDistance', () => {
		expect(distanceToScore(5, 0)).toBe(0);
	});
});
