import { describe, expect, it } from 'vitest';
import {
	applyDelta,
	generateLocalDeltas,
	getDefaultCorrectionPolicy,
} from '~/domain/matching/corrections';
import type { RulersVector } from '~/domain/rulers/rulers';

describe('generateLocalDeltas', () => {
	it('returns empty array when user matches target', () => {
		const target: RulersVector = {
			decision: 2,
			inference: 3,
			meta: 2,
			scope: 3,
			source: 2,
		};
		const result = generateLocalDeltas({
			criticalAxes: ['decision', 'source'],
			maxRulersChanged: 2,
			target,
			user: target,
		});
		expect(result).toHaveLength(0);
	});

	it('generates single-axis deltas when maxRulersChanged=1', () => {
		const user: RulersVector = {
			decision: 1,
			inference: 1,
			meta: 1,
			scope: 1,
			source: 1,
		};
		const target: RulersVector = {
			decision: 2,
			inference: 3,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = generateLocalDeltas({
			criticalAxes: ['decision', 'source'],
			maxRulersChanged: 1,
			target,
			user,
		});
		expect(result.length).toBeGreaterThan(0);
		expect(result.every((d) => Object.keys(d).length === 1)).toBe(true);
	});

	it('generates single and two-axis deltas when maxRulersChanged=2', () => {
		const user: RulersVector = {
			decision: 1,
			inference: 1,
			meta: 1,
			scope: 1,
			source: 1,
		};
		const target: RulersVector = {
			decision: 2,
			inference: 3,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = generateLocalDeltas({
			criticalAxes: ['decision', 'source'],
			maxRulersChanged: 2,
			target,
			user,
		});
		expect(result.length).toBeGreaterThan(0);
		// Should have both single and two-axis deltas
		const singles = result.filter((d) => Object.keys(d).length === 1);
		const doubles = result.filter((d) => Object.keys(d).length === 2);
		expect(singles.length).toBeGreaterThan(0);
		expect(doubles.length).toBeGreaterThan(0);
	});

	it('only includes ±1 steps', () => {
		const user: RulersVector = {
			decision: 1,
			inference: 1,
			meta: 1,
			scope: 1,
			source: 1,
		};
		const target: RulersVector = {
			decision: 5,
			inference: 5,
			meta: 5,
			scope: 5,
			source: 5,
		};
		const result = generateLocalDeltas({
			criticalAxes: ['decision', 'source'],
			maxRulersChanged: 2,
			target,
			user,
		});
		for (const delta of result) {
			for (const step of Object.values(delta)) {
				expect(step).toBeGreaterThanOrEqual(-1);
				expect(step).toBeLessThanOrEqual(1);
				expect(step).not.toBe(0);
			}
		}
	});

	it('prioritizes critical axes', () => {
		const user: RulersVector = {
			decision: 1,
			inference: 1,
			meta: 3,
			scope: 3,
			source: 1,
		};
		const target: RulersVector = {
			decision: 2,
			inference: 2,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = generateLocalDeltas({
			criticalAxes: ['decision', 'source'],
			maxRulersChanged: 2,
			target,
			user,
		});
		// First deltas should include critical axes
		const first = result[0];
		const firstAxes = Object.keys(first);
		expect(firstAxes.some((a) => ['decision', 'source'].includes(a))).toBe(
			true,
		);
	});
});

describe('applyDelta', () => {
	it('applies positive delta', () => {
		const user: RulersVector = {
			decision: 2,
			inference: 2,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = applyDelta(user, { inference: 1 });
		expect(result.inference).toBe(3);
		expect(result.decision).toBe(2);
	});

	it('applies negative delta', () => {
		const user: RulersVector = {
			decision: 3,
			inference: 3,
			meta: 3,
			scope: 3,
			source: 3,
		};
		const result = applyDelta(user, { decision: -1, scope: -1 });
		expect(result.decision).toBe(2);
		expect(result.scope).toBe(2);
	});

	it('clamps to minimum 1', () => {
		const user: RulersVector = {
			decision: 1,
			inference: 1,
			meta: 1,
			scope: 1,
			source: 1,
		};
		const result = applyDelta(user, { inference: -1 });
		expect(result.inference).toBe(1);
	});

	it('clamps to maximum 5', () => {
		const user: RulersVector = {
			decision: 5,
			inference: 5,
			meta: 5,
			scope: 5,
			source: 5,
		};
		const result = applyDelta(user, { inference: 1 });
		expect(result.inference).toBe(5);
	});

	it('preserves unmodified axes', () => {
		const user: RulersVector = {
			decision: 3,
			inference: 3,
			meta: 3,
			scope: 3,
			source: 3,
		};
		const result = applyDelta(user, {});
		expect(result).toEqual(user);
	});
});

describe('getDefaultCorrectionPolicy', () => {
	it('returns expected defaults', () => {
		const policy = getDefaultCorrectionPolicy();
		expect(policy.enabled).toBe(true);
		expect(policy.deltaPolicy.maxRulersChanged).toBe(2);
		expect(policy.deltaPolicy.maxStepPerRuler).toBe(1);
		expect(policy.deltaPolicy.allowNoneOption).toBe(true);
		expect(policy.selectionPolicy.maxSuggestions).toBe(3);
		expect(policy.selectionPolicy.neverIntroduceNewBlocks).toBe(true);
		expect(policy.selectionPolicy.preferCriticalAxesFirst).toEqual([
			'decision',
			'source',
		]);
	});
});
