import type { RulersVector, CanonicalLevelId } from "@haci/types";

// Placeholder for match engine
export function calculateMatch(rulers: RulersVector) {
	// TODO: Implement match algorithm
	return {
		selectedLevel: "N1" as CanonicalLevelId,
		score: 100,
		candidates: [],
	};
}
