import type { CanonicalLevelId, RulersVector } from '@haci/types';

// Placeholder for match engine
export function calculateMatch(_rulers: RulersVector) {
	// TODO: Implement match algorithm
	return {
		candidates: [],
		score: 100,
		selectedLevel: 'N1' as CanonicalLevelId,
	};
}
