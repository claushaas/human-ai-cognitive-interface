/**
 * Main matching engine: pure orchestrator.
 *
 * Combines:
 * - weighted Manhattan distance
 * - hard block evaluation
 * - role prior application
 * - threshold logic
 * - correction suggestions
 * - track selection (operational vs meta)
 *
 * No IO, no side effects, no React/Cloudflare/Drizzle/browser/LLM.
 */

import type { CanonicalLevel, LevelId } from '../levels/levels';
import type { InternalRoleId } from '../roles/roles';
import type { RulerId, RulersVector } from '../rulers/rulers';
import type { CorrectionPolicy, CorrectionSuggestion } from './corrections';
import { suggestCorrectionsSafe } from './corrections';
import {
	computeMaxDistance,
	computeWeightedDistance,
	distanceToScore,
} from './distance';
import type { HardBlockPolicy } from './hard-blocks';
import { evaluateHardBlocks } from './hard-blocks';
import type { PriorConfig } from './prior';
import { applyRolePrior } from './prior';
import type { TrackSelection } from './track-selection';
import { selectTrack } from './track-selection';

export type Thresholds = {
	autoSelectMin: number; // e.g., 0.90
	candidatesMin: number; // e.g., 0.70
	blockBelow: number; // e.g., 0.70
	maxCandidates: number; // e.g., 3
};

export type MatchCandidate = {
	levelId: LevelId;
	name: string;
	score: number; // 0..1
	distance: number;
	reasons: string[];
	blocked?: boolean;
};

export type MatchResult = {
	selectedLevel: LevelId | null;
	score: number | null;
	candidates: MatchCandidate[];
	rejected: MatchCandidate[];
	blocked: { isBlocked: boolean; reasons: string[] };
	correctionsSuggested: CorrectionSuggestion[];
	trackSelection: TrackSelection;
};

export type MatchInput = {
	user: {
		initialRole: InternalRoleId;
		rulers: RulersVector;
	};
	levels: CanonicalLevel[];
	weights: Record<RulerId, number>;
	thresholds: Thresholds;
	prior: PriorConfig;
	hardBlocks: HardBlockPolicy;
	correctionPolicy?: CorrectionPolicy;
};

export function getDefaultThresholds(): Thresholds {
	return {
		autoSelectMin: 0.9,
		blockBelow: 0.7,
		candidatesMin: 0.7,
		maxCandidates: 3,
	};
}

export function matchLevels(input: MatchInput): MatchResult {
	const { user, levels, weights, thresholds, prior, hardBlocks } = input;
	const correctionPolicy = input.correctionPolicy;

	const maxDist = computeMaxDistance(weights);

	const computed: MatchCandidate[] = [];
	const rejected: MatchCandidate[] = [];
	const blockedReasonsGlobal: string[] = [];

	for (const level of levels) {
		const block = evaluateHardBlocks({ level, user }, hardBlocks);

		if (block.isBlocked) {
			rejected.push({
				blocked: true,
				distance: Number.POSITIVE_INFINITY,
				levelId: level.id,
				name: level.name,
				reasons: block.reasons,
				score: 0,
			});
			blockedReasonsGlobal.push(...block.reasons);
			continue;
		}

		const distance = computeWeightedDistance(
			user.rulers,
			level.vector,
			weights,
		);
		const score0 = distanceToScore(distance, maxDist);
		const score = applyRolePrior(score0, level.id, user.initialRole, prior);

		const candidate: MatchCandidate = {
			distance,
			levelId: level.id,
			name: level.name,
			reasons: block.requiresConfirmation ? block.reasons : [],
			score: round3(score),
		};

		computed.push(candidate);

		if (block.requiresConfirmation) {
			blockedReasonsGlobal.push(...block.reasons);
		}
	}

	// If nothing survives blocks => blocked
	if (computed.length === 0) {
		return {
			blocked: {
				isBlocked: true,
				reasons: uniqueStrings(
					blockedReasonsGlobal.length
						? blockedReasonsGlobal
						: ['Nenhum nível disponível após bloqueios semânticos.'],
				),
			},
			candidates: [],
			correctionsSuggested: [],
			rejected,
			score: null,
			selectedLevel: null,
			trackSelection: {
				reason: 'todos os candidatos bloqueados',
				rejectedIds: [],
				selectedIds: [],
				track: 'operational',
			},
		};
	}

	// Rank by score desc, then distance asc
	const ranked = [...computed].sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		return a.distance - b.distance;
	});

	const top = ranked[0];

	// Apply track selection to filter candidates
	const allCandidateIds = ranked.map((c) => c.levelId);
	const trackSelection = selectTrack(allCandidateIds, user.rulers);
	const trackFiltered = ranked.filter((c) =>
		trackSelection.selectedIds.includes(c.levelId),
	);

	// Threshold: blockBelow
	if (top.score < thresholds.blockBelow) {
		return {
			blocked: {
				isBlocked: true,
				reasons: uniqueStrings([
					`Match fraco: melhor score (${round3(top.score)}) abaixo de ${thresholds.blockBelow}.`,
					...(blockedReasonsGlobal.length ? blockedReasonsGlobal : []),
				]),
			},
			candidates: trackFiltered
				.filter((c) => c.score >= thresholds.candidatesMin)
				.slice(0, thresholds.maxCandidates),
			correctionsSuggested: suggestCorrectionsSafe({
				correctionPolicy,
				hardBlocks,
				levels,
				prior,
				topCandidate: { levelId: top.levelId, score: top.score },
				user,
				weights,
			}),
			rejected,
			score: null,
			selectedLevel: null,
			trackSelection,
		};
	}

	// Determine best competitor
	const competitor = trackFiltered.find(
		(c) => c.levelId !== top.levelId && c.score >= thresholds.candidatesMin,
	);

	// Auto-select when strong and no competitor
	if (top.score >= thresholds.autoSelectMin && !competitor) {
		return {
			blocked: {
				isBlocked: false,
				reasons: uniqueStrings(blockedReasonsGlobal),
			},
			candidates: trackFiltered
				.filter((c) => c.score >= thresholds.candidatesMin)
				.slice(0, thresholds.maxCandidates),
			correctionsSuggested: [],
			rejected,
			score: round3(top.score),
			selectedLevel: top.levelId,
			trackSelection,
		};
	}

	// Ambiguous: suggest corrections
	return {
		blocked: { isBlocked: false, reasons: uniqueStrings(blockedReasonsGlobal) },
		candidates: trackFiltered.length
			? trackFiltered
					.filter((c) => c.score >= thresholds.candidatesMin)
					.slice(0, thresholds.maxCandidates)
			: ranked.slice(0, thresholds.maxCandidates),
		correctionsSuggested: suggestCorrectionsSafe({
			correctionPolicy,
			hardBlocks,
			levels,
			prior,
			topCandidate: { levelId: top.levelId, score: top.score },
			user,
			weights,
		}),
		rejected,
		score: null,
		selectedLevel: null,
		trackSelection,
	};
}

function uniqueStrings(items: string[]): string[] {
	return Array.from(new Set(items.filter(Boolean)));
}

function round3(n: number): number {
	return Math.round(n * 1000) / 1000;
}
