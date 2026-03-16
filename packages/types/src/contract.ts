import type { CanonicalLevelId, InitialRoleId, RulersVector } from "./core";

export type LevelMatch = {
	selectedLevel: CanonicalLevelId;
	score: number;
	candidates: Array<{
		level: CanonicalLevelId;
		score: number;
	}>;
};

export type LocalCorrection = {
	rulersDelta: Partial<RulersVector>;
	reason: string;
};

export type HardBlock = {
	id: string;
	message: string;
	severity: "BLOCK" | "WARN" | "CONFIRM";
};

export type CognitiveContract = {
	role: InitialRoleId;
	levelMatch: LevelMatch;
	rulers: RulersVector;
	hardBlocks: HardBlock[];
	correction?: LocalCorrection;
};
