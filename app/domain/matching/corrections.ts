/**
 * Correction suggestions: local delta proposals without loops.
 *
 * Design constraints from JSON canonical:
 * - At most 2 rulers changed per suggestion
 * - Magnitude max ±1 per ruler
 * - User chooses one (or none) and proceeds
 * - No second choice loop
 * - Never introduce new hard blocks
 */

import type { CanonicalLevel } from '../levels/levels';
import type { InternalRoleId } from '../roles/roles';
import type { RulerId, RulersVector } from '../rulers/rulers';
import {
	computeMaxDistance,
	computeWeightedDistance,
	distanceToScore,
} from './distance';
import type { HardBlockPolicy } from './hard-blocks';
import { evaluateHardBlocks } from './hard-blocks';
import type { PriorConfig } from './prior';
import { applyRolePrior } from './prior';

export type CorrectionDelta = Partial<Record<RulerId, -1 | 1>>;

export type CorrectionSuggestion = {
	id: string;
	label: string;
	delta: CorrectionDelta;
	shortRationale: string;
};

export type CorrectionPolicy = {
	enabled: boolean;
	deltaPolicy: {
		maxRulersChanged: number; // e.g., 2
		maxStepPerRuler: 1; // fixed at 1
		allowNoneOption: boolean;
	};
	selectionPolicy: {
		maxSuggestions: number; // e.g., 3
		preferCriticalAxesFirst: RulerId[]; // e.g., ["decision", "source"]
		neverIntroduceNewBlocks: boolean;
	};
};

export function getDefaultCorrectionPolicy(): CorrectionPolicy {
	return {
		deltaPolicy: {
			allowNoneOption: true,
			maxRulersChanged: 2,
			maxStepPerRuler: 1,
		},
		enabled: true,
		selectionPolicy: {
			maxSuggestions: 3,
			neverIntroduceNewBlocks: true,
			preferCriticalAxesFirst: ['decision', 'source'],
		},
	};
}

/**
 * Generate small deltas (±1) focusing on axes where user differs from target.
 */
export function generateLocalDeltas(params: {
	user: RulersVector;
	target: RulersVector;
	maxRulersChanged: number;
	criticalAxes: RulerId[];
}): CorrectionDelta[] {
	const { user, target } = params;
	const maxRulersChanged = clampInt(params.maxRulersChanged, 1, 2);
	const allAxes: RulerId[] = [
		'inference',
		'decision',
		'scope',
		'source',
		'meta',
	];

	const axesSorted: RulerId[] = [
		...params.criticalAxes.filter((a) => allAxes.includes(a)),
		...allAxes.filter((a) => !params.criticalAxes.includes(a)),
	];

	// Compute per-axis direction toward target
	const candidatesPerAxis = axesSorted.map((axis) => {
		const u = user[axis];
		const t = target[axis];
		if (u === t) return null;
		return { axis, step: (t > u ? 1 : -1) as -1 | 1 };
	});

	const singleAxis = candidatesPerAxis
		.filter((c): c is { axis: RulerId; step: -1 | 1 } => c !== null)
		.map((c) => ({ [c.axis]: c.step }) as CorrectionDelta);

	if (maxRulersChanged === 1) return singleAxis;

	// Two-axis combinations
	const nonNull = candidatesPerAxis.filter(
		(c): c is { axis: RulerId; step: -1 | 1 } => c !== null,
	);
	const twoAxis: CorrectionDelta[] = [];

	for (let i = 0; i < nonNull.length; i++) {
		for (let j = i + 1; j < nonNull.length; j++) {
			const a = nonNull[i];
			const b = nonNull[j];
			twoAxis.push({ [a.axis]: a.step, [b.axis]: b.step });
		}
	}

	// Prefer fewer changes first, then prioritize combos with critical axes
	const rank = (d: CorrectionDelta): number => {
		const axes = Object.keys(d) as RulerId[];
		const includesCritical = axes.some((a) => params.criticalAxes.includes(a));
		return (includesCritical ? 0 : 10) + axes.length;
	};

	return [...singleAxis, ...twoAxis].sort((a, b) => rank(a) - rank(b));
}

/**
 * Apply a delta to a rulers vector, clamping to valid range [1,5].
 */
export function applyDelta(
	user: RulersVector,
	delta: CorrectionDelta,
): RulersVector {
	const axes: RulerId[] = ['inference', 'decision', 'scope', 'source', 'meta'];
	return axes.reduce(
		(acc, axis) => {
			const step = delta[axis] ?? 0;
			acc[axis] = clampInt(user[axis] + step, 1, 5) as 1 | 2 | 3 | 4 | 5;
			return acc;
		},
		{ ...user },
	);
}

/**
 * Suggest corrections for an ambiguous or weak match.
 * Returns safe deltas that don't introduce new hard blocks.
 */
export function suggestCorrectionsSafe(args: {
	user: { initialRole: InternalRoleId; rulers: RulersVector };
	levels: CanonicalLevel[];
	topCandidate: { levelId: string; score: number } | null;
	weights: Record<RulerId, number>;
	prior: PriorConfig;
	hardBlocks: HardBlockPolicy;
	correctionPolicy?: CorrectionPolicy;
}): CorrectionSuggestion[] {
	const { correctionPolicy } = args;
	if (!correctionPolicy?.enabled) return [];

	const maxSuggestions = correctionPolicy.selectionPolicy.maxSuggestions ?? 3;
	const criticalAxes = correctionPolicy.selectionPolicy
		.preferCriticalAxesFirst ?? ['decision', 'source'];
	const allowNone = correctionPolicy.deltaPolicy.allowNoneOption;

	if (!args.topCandidate) return [];

	const topLevel = args.levels.find((l) => l.id === args.topCandidate?.levelId);
	if (!topLevel) return [];

	const deltas = generateLocalDeltas({
		criticalAxes,
		maxRulersChanged: correctionPolicy.deltaPolicy.maxRulersChanged,
		target: topLevel.vector,
		user: args.user.rulers,
	});

	// Filter deltas that would introduce new blocks
	const safeDeltas = deltas.filter((delta) => {
		if (!correctionPolicy.selectionPolicy.neverIntroduceNewBlocks) {
			return true;
		}
		const adjusted = applyDelta(args.user.rulers, delta);
		const block = evaluateHardBlocks(
			{
				level: topLevel,
				user: { initialRole: args.user.initialRole, rulers: adjusted },
			},
			args.hardBlocks,
		);
		return !block.isBlocked;
	});

	// Score each safe delta
	const maxDist = computeMaxDistance(args.weights);
	const scored = safeDeltas
		.map((delta) => {
			const adjusted = applyDelta(args.user.rulers, delta);
			const dist = computeWeightedDistance(
				adjusted,
				topLevel.vector,
				args.weights,
			);
			const score0 = distanceToScore(dist, maxDist);
			const score = applyRolePrior(
				score0,
				topLevel.id,
				args.user.initialRole,
				args.prior,
			);
			return { delta, score };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, maxSuggestions);

	const suggestions: CorrectionSuggestion[] = scored.map((item, idx) => ({
		delta: item.delta,
		id: `corr-${idx + 1}`,
		label: formatDeltaLabel(item.delta),
		shortRationale:
			'Ajuste local (±1) para reduzir ambiguidade e aproximar o comportamento do nível recomendado, sem criar loops.',
	}));

	if (allowNone) {
		return [
			...suggestions,
			{
				delta: {},
				id: 'corr-none',
				label: 'Não ajustar (seguir com as escolhas atuais)',
				shortRationale:
					'Mantém as réguas atuais; o sistema seguirá com os candidatos e o nível será decidido nas próximas etapas/contratos.',
			},
		].slice(0, maxSuggestions + 1);
	}

	return suggestions;
}

function formatDeltaLabel(delta: CorrectionDelta): string {
	const entries = Object.entries(delta) as Array<[RulerId, -1 | 1]>;
	if (entries.length === 0) return 'Sem ajuste';
	const parts = entries.map(
		([axis, step]) => `${axis} ${step > 0 ? '+1' : '-1'}`,
	);
	return parts.join(' · ');
}

function clampInt(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, Math.trunc(n)));
}
