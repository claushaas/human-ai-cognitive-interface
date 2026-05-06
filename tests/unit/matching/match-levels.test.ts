import { describe, expect, it } from 'vitest';
import { CANONICAL_LEVELS } from '~/domain/levels/levels';
import { getDefaultCorrectionPolicy } from '~/domain/matching/corrections';
import { getDefaultHardBlocks } from '~/domain/matching/hard-blocks';
import {
	getDefaultThresholds,
	matchLevels,
} from '~/domain/matching/match-levels';
import { getDefaultPrior } from '~/domain/matching/prior';
import type { InternalRoleId } from '~/domain/roles/roles';
import type { RulersVector } from '~/domain/rulers/rulers';
import { DEFAULT_WEIGHTS } from '~/domain/rulers/rulers';

function runMatch(
	initialRole: InternalRoleId,
	rulers: RulersVector,
	overrides?: Partial<Parameters<typeof matchLevels>[0]>,
) {
	return matchLevels({
		correctionPolicy: getDefaultCorrectionPolicy(),
		hardBlocks: getDefaultHardBlocks(),
		levels: CANONICAL_LEVELS,
		prior: getDefaultPrior(),
		thresholds: getDefaultThresholds(),
		user: { initialRole, rulers },
		weights: DEFAULT_WEIGHTS,
		...overrides,
	});
}

describe('matchLevels — golden tests', () => {
	it('N1 perfect match (all min)', () => {
		const result = runMatch('role.transform', {
			decision: 1,
			inference: 1,
			meta: 1,
			scope: 1,
			source: 1,
		});
		// With default thresholds, N2/N3 also score >= 0.7, so ambiguous
		expect(result.candidates[0]?.levelId).toBe('N1');
		expect(result.candidates[0]?.score).toBe(1.0);
		expect(result.blocked.isBlocked).toBe(false);
		expect(result.trackSelection.track).toBe('operational');
	});

	it('N5 strong match with role.explore', () => {
		const result = runMatch('role.explore', {
			decision: 2,
			inference: 4,
			meta: 2,
			scope: 4,
			source: 2,
		});
		// N4 also scores high; ambiguous with default thresholds
		expect(result.candidates[0]?.levelId).toBe('N5');
		expect(result.candidates[0]?.score).toBe(1.0);
		expect(result.blocked.isBlocked).toBe(false);
		expect(result.trackSelection.track).toBe('operational');
	});

	it('blocks decision=4 constitutionally', () => {
		const result = runMatch('role.analyze', {
			decision: 4,
			inference: 2,
			meta: 1,
			scope: 2,
			source: 1,
		});
		expect(result.selectedLevel).toBeNull();
		expect(result.score).toBeNull();
		expect(result.blocked.isBlocked).toBe(true);
		expect(
			result.blocked.reasons.some((r) => r.includes('cap constitucional')),
		).toBe(true);
	});

	it('blocks role.explore with source=1 (JSON canonical)', () => {
		const result = runMatch('role.explore', {
			decision: 1,
			inference: 3,
			meta: 1,
			scope: 3,
			source: 1,
		});
		expect(result.selectedLevel).toBeNull();
		expect(result.score).toBeNull();
		expect(result.blocked.isBlocked).toBe(true);
		expect(
			result.blocked.reasons.some((r) => r.includes('Fonte fechada')),
		).toBe(true);
	});

	it('N6 blocked when decision < 3, but other operational levels available', () => {
		const result = runMatch('role.document', {
			decision: 2,
			inference: 2,
			meta: 3,
			scope: 5,
			source: 1,
		});
		// N6 is blocked, but N5/N3 may still be viable => ambiguous
		expect(result.selectedLevel).toBeNull();
		expect(result.blocked.isBlocked).toBe(false);
		expect(result.rejected.some((r) => r.levelId === 'N6')).toBe(true);
		expect(result.candidates.length).toBeGreaterThan(0);
	});

	it('ambiguous match between N4 and N5', () => {
		const result = runMatch('role.explore', {
			decision: 1,
			inference: 4,
			meta: 1,
			scope: 4,
			source: 2,
		});
		expect(result.selectedLevel).toBeNull();
		expect(result.score).toBeNull();
		expect(result.blocked.isBlocked).toBe(false);
		expect(result.correctionsSuggested.length).toBeGreaterThan(0);
		expect(result.candidates[0]?.levelId).toBe('N4');
	});

	it('meta track selection for meta=5', () => {
		const result = runMatch('role.document', {
			decision: 1,
			inference: 2,
			meta: 5,
			scope: 4,
			source: 1,
		});
		// N7 and N8 both in meta track with high scores => ambiguous
		expect(result.trackSelection.track).toBe('meta');
		expect(result.trackSelection.selectedIds).toContain('N8');
		expect(result.trackSelection.rejectedIds).toContain('N1');
		expect(result.candidates[0]?.levelId).toBe('N8');
	});

	it('weak match below threshold returns corrections', () => {
		const result = runMatch('role.analyze', {
			decision: 1,
			inference: 5,
			meta: 5,
			scope: 1,
			source: 5,
		});
		// Extreme values create weak match
		expect(result.blocked.isBlocked).toBe(true);
		expect(result.correctionsSuggested.length).toBeGreaterThan(0);
	});

	it('role prior boosts correct level', () => {
		// role.analyze boosts N2, N6, N7
		// N2 vector: (2,1,1,2,1)
		const result = runMatch('role.analyze', {
			decision: 1,
			inference: 2,
			meta: 1,
			scope: 2,
			source: 1,
		});
		// Perfect match for N2, but N1/N3 may also score >= 0.7
		expect(result.candidates[0]?.levelId).toBe('N2');
		expect(result.candidates[0]?.score).toBe(1.0);
	});

	it('includes blocked candidates in rejected', () => {
		const result = runMatch('role.explore', {
			decision: 1,
			inference: 3,
			meta: 1,
			scope: 3,
			source: 1,
		});
		expect(result.rejected.length).toBeGreaterThan(0);
		expect(result.rejected.some((r) => r.blocked)).toBe(true);
	});

	it('auto-selects with high candidatesMin threshold', () => {
		// Use custom thresholds to force auto-select
		const result = runMatch(
			'role.transform',
			{
				decision: 1,
				inference: 1,
				meta: 1,
				scope: 1,
				source: 1,
			},
			{
				thresholds: {
					...getDefaultThresholds(),
					candidatesMin: 0.95, // Only N1 (1.0) qualifies
				},
			},
		);
		expect(result.selectedLevel).toBe('N1');
		expect(result.score).toBeGreaterThanOrEqual(0.9);
		expect(result.correctionsSuggested).toHaveLength(0);
	});
});

describe('matchLevels — edge cases', () => {
	it('handles all levels blocked', () => {
		// decision=5 blocks everything
		const result = runMatch('role.analyze', {
			decision: 5,
			inference: 3,
			meta: 3,
			scope: 3,
			source: 2,
		});
		expect(result.selectedLevel).toBeNull();
		expect(result.candidates).toHaveLength(0);
		expect(result.blocked.isBlocked).toBe(true);
	});

	it('handles disabled correction policy', () => {
		const result = runMatch(
			'role.explore',
			{
				decision: 1,
				inference: 4,
				meta: 1,
				scope: 4,
				source: 2,
			},
			{
				correctionPolicy: { ...getDefaultCorrectionPolicy(), enabled: false },
			},
		);
		expect(result.correctionsSuggested).toHaveLength(0);
	});

	it('handles disabled prior', () => {
		const result = runMatch(
			'role.analyze',
			{
				decision: 1,
				inference: 2,
				meta: 1,
				scope: 2,
				source: 1,
			},
			{
				prior: { ...getDefaultPrior(), enabled: false },
			},
		);
		// Should still match N2 perfectly without prior
		expect(result.candidates[0]?.levelId).toBe('N2');
		expect(result.candidates[0]?.score).toBe(1.0);
	});

	it('returns unique block reasons', () => {
		const result = runMatch('role.research', {
			decision: 1,
			inference: 4,
			meta: 1,
			scope: 1,
			source: 1,
		});
		// Multiple blocks may apply; reasons should be unique
		const uniqueReasons = new Set(result.blocked.reasons);
		expect(uniqueReasons.size).toBe(result.blocked.reasons.length);
	});

	it('weak match with custom low blockBelow', () => {
		const result = runMatch(
			'role.analyze',
			{
				decision: 1,
				inference: 2,
				meta: 1,
				scope: 2,
				source: 1,
			},
			{
				thresholds: {
					...getDefaultThresholds(),
					blockBelow: 1.01, // Impossible to reach
					candidatesMin: 1.01,
				},
			},
		);
		expect(result.blocked.isBlocked).toBe(true);
		expect(result.correctionsSuggested.length).toBeGreaterThan(0);
	});
});
