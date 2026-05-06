import { describe, expect, it } from 'vitest';
import { applyRolePrior, getDefaultPrior } from '~/domain/matching/prior';

describe('applyRolePrior', () => {
	const prior = getDefaultPrior();

	it('does nothing when prior is disabled', () => {
		const result = applyRolePrior(0.5, 'N1', 'role.transform', {
			...prior,
			enabled: false,
		});
		expect(result).toBe(0.5);
	});

	it('does nothing when level is not boosted for role', () => {
		const result = applyRolePrior(0.5, 'N1', 'role.analyze', prior);
		expect(result).toBe(0.5);
	});

	it('boosts score for boosted level', () => {
		// role.analyze boosts N2
		const result = applyRolePrior(0.5, 'N2', 'role.analyze', prior);
		expect(result).toBeGreaterThan(0.5);
		expect(result).toBeLessThanOrEqual(1);
	});

	it('caps boost at maxContribution', () => {
		// With base 0.9, headroom 0.1, maxContribution 0.15
		// bump = 0.1 * 0.15 = 0.015
		const result = applyRolePrior(0.9, 'N2', 'role.analyze', prior);
		expect(result).toBeCloseTo(0.915, 3);
	});

	it('handles perfect score (no headroom)', () => {
		const result = applyRolePrior(1.0, 'N2', 'role.analyze', prior);
		expect(result).toBe(1.0);
	});

	it('applies correct boosts per role', () => {
		// role.explore boosts N4 and N5
		const n4 = applyRolePrior(0.6, 'N4', 'role.explore', prior);
		const n5 = applyRolePrior(0.6, 'N5', 'role.explore', prior);
		const n1 = applyRolePrior(0.6, 'N1', 'role.explore', prior);

		expect(n4).toBeGreaterThan(0.6);
		expect(n5).toBeGreaterThan(0.6);
		expect(n1).toBe(0.6);
	});
});
