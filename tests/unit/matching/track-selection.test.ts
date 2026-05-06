import { describe, expect, it } from 'vitest';
import {
	isInSelectedTrack,
	selectTrack,
} from '~/domain/matching/track-selection';
import type { RulersVector } from '~/domain/rulers/rulers';

describe('selectTrack', () => {
	it('selects operational track by default', () => {
		const rulers: RulersVector = {
			decision: 2,
			inference: 2,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = selectTrack(['N1', 'N2', 'N7', 'N8'], rulers);
		expect(result.track).toBe('operational');
		expect(result.selectedIds).toEqual(['N1', 'N2']);
		expect(result.rejectedIds).toEqual(['N7', 'N8']);
	});

	it('selects operational when decision=3', () => {
		const rulers: RulersVector = {
			decision: 3,
			inference: 2,
			meta: 3,
			scope: 5,
			source: 1,
		};
		const result = selectTrack(['N6', 'N7', 'N8'], rulers);
		expect(result.track).toBe('operational');
		expect(result.selectedIds).toEqual(['N6']);
	});

	it('selects meta track when meta >= 4', () => {
		const rulers: RulersVector = {
			decision: 1,
			inference: 2,
			meta: 4,
			scope: 4,
			source: 1,
		};
		const result = selectTrack(['N1', 'N2', 'N7', 'N8'], rulers);
		expect(result.track).toBe('meta');
		expect(result.selectedIds).toEqual(['N7', 'N8']);
		expect(result.rejectedIds).toEqual(['N1', 'N2']);
	});

	it('selects meta track when meta=5', () => {
		const rulers: RulersVector = {
			decision: 1,
			inference: 2,
			meta: 5,
			scope: 4,
			source: 1,
		};
		const result = selectTrack(['N1', 'N7', 'N8'], rulers);
		expect(result.track).toBe('meta');
		expect(result.selectedIds).toEqual(['N7', 'N8']);
	});

	it('handles empty candidates', () => {
		const rulers: RulersVector = {
			decision: 2,
			inference: 2,
			meta: 2,
			scope: 2,
			source: 2,
		};
		const result = selectTrack([], rulers);
		expect(result.track).toBe('operational');
		expect(result.selectedIds).toEqual([]);
	});
});

describe('isInSelectedTrack', () => {
	it('identifies operational levels', () => {
		expect(isInSelectedTrack('N1', 'operational')).toBe(true);
		expect(isInSelectedTrack('N6', 'operational')).toBe(true);
		expect(isInSelectedTrack('N7', 'operational')).toBe(false);
	});

	it('identifies meta levels', () => {
		expect(isInSelectedTrack('N7', 'meta')).toBe(true);
		expect(isInSelectedTrack('N8', 'meta')).toBe(true);
		expect(isInSelectedTrack('N1', 'meta')).toBe(false);
	});
});
