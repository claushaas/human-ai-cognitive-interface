/**
 * Canonical Prompt Generator — Match Engine (Pure Functions)
 * ---------------------------------------------------------
 * This file contains PURE functions for:
 * - distance calculation (weighted Manhattan)
 * - semantic hard-block evaluation
 * - level matching + thresholds
 * - correction suggestions (delta proposals) + one-shot application
 *
 * Design goals:
 * - deterministic
 * - auditable
 * - side-effect free
 * - easy to unit test
 *
 * Note:
 * - This module does NOT do UI, IO, clipboard, persistence, or API calls.
 */

export type Scale1to5 = 1 | 2 | 3 | 4 | 5;

export type RulerId = 'inference' | 'decision' | 'scope' | 'source' | 'meta';

export type RulersVector = Record<RulerId, Scale1to5>;

export type CanonicalLevelId =
	| 'N1'
	| 'N2'
	| 'N3'
	| 'N4'
	| 'N5'
	| 'N6'
	| 'N7'
	| 'N8';

export type CanonicalLevel = {
	id: CanonicalLevelId;
	name: string;
	vector: RulersVector;
};

export type InitialRoleId =
	| 'role.analyze'
	| 'role.synthesize'
	| 'role.explore'
	| 'role.decideSupport'
	| 'role.document'
	| 'role.transform'
	// Optional/extension roles (keep for compatibility):
	| 'role.research'
	| 'role.execute';

export type Weights = Record<RulerId, number>;

export type Thresholds = {
	/** Auto-select if best >= autoSelectMin and no competitor >= candidatesMin */
	autoSelectMin: number; // e.g., 90
	/** Candidate inclusion threshold (top list) */
	candidatesMin: number; // e.g., 70
	/** Hard block if best < blockBelow (no viable match) */
	blockBelow: number; // e.g., 70
	/** Max number of candidates returned (2–3 recommended) */
	maxCandidates: number; // e.g., 3
};

export type PriorConfig = {
	enabled: boolean;
	/** how much the role prior can contribute to final score (0..1) */
	maxContribution: number; // e.g., 0.15
	/** per-role suggested level boosts */
	roleBoosts: Partial<Record<InitialRoleId, CanonicalLevelId[]>>;
};

export type BlockAction = 'BLOCK' | 'BLOCK_OR_REQUIRE_CONFIRMATION';

export type BlockRule = {
	id: string;
	name: string;
	/** A stable code for debugging/logs */
	action: BlockAction;
	/**
	 * Deterministic predicate.
	 * If returns true => block triggers for this candidate level.
	 */
	when: (ctx: BlockContext) => boolean;
};

export type BlockContext = {
	user: {
		initialRole: InitialRoleId;
		rulers: RulersVector;
	};
	level: CanonicalLevel;
};

export type HardBlockPolicy = {
	constitutional: {
		/** hard cap on decision ruler allowed in this system */
		decisionMaxAllowed: Scale1to5 | 3;
		forbidTotalAutonomy: boolean;
		forbidUnboundedResponsibilityShift: boolean;
	};
	rules: BlockRule[];
};

export type MatchCandidate = {
	levelId: CanonicalLevelId;
	name: string;
	score: number; // 0..100
	distance: number;
	reasons: string[];
};

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
		preferCriticalAxesFirst: RulerId[]; // e.g., ["decision","source"]
		neverIntroduceNewBlocks: boolean;
	};
};

export type MatchResult = {
	selectedLevel: CanonicalLevelId | null;
	score: number | null;
	candidates: MatchCandidate[];
	blocked: { isBlocked: boolean; reasons: string[] };
	correctionsSuggested: CorrectionSuggestion[];
};

/* -------------------------------------------------------
 * Core math: weighted Manhattan distance + score mapping
 * ----------------------------------------------------- */

/**
 * Weighted Manhattan distance:
 *   Σ weight(axis) * abs(u - v)
 */
export function computeWeightedDistance(
	user: RulersVector,
	level: RulersVector,
	weights: Weights,
): number {
	const axes: RulerId[] = ['inference', 'decision', 'scope', 'source', 'meta'];
	return axes.reduce((sum, axis) => {
		const w = weights[axis] ?? 1;
		const diff = Math.abs(user[axis] - level[axis]);
		return sum + w * diff;
	}, 0);
}

/**
 * Max possible distance given scale 1..5:
 * max abs diff per axis = 4
 * => maxDistance = Σ weight(axis) * 4
 */
export function computeMaxDistance(weights: Weights): number {
	const axes: RulerId[] = ['inference', 'decision', 'scope', 'source', 'meta'];
	return axes.reduce((sum, axis) => sum + (weights[axis] ?? 1) * 4, 0);
}

/**
 * Convert distance to score [0..100].
 * score = 100 - (distance / maxDistance) * 100
 * clamp to [0..100]
 */
export function distanceToScore(distance: number, maxDistance: number): number {
	if (maxDistance <= 0) return 0;
	const raw = 100 - (distance / maxDistance) * 100;
	return clampNumber(raw, 0, 100);
}

/* -------------------------------------------------------
 * Hard blocks: semantic + constitutional constraints
 * ----------------------------------------------------- */

export function evaluateHardBlocks(
	ctx: BlockContext,
	policy: HardBlockPolicy,
): {
	isBlocked: boolean;
	reasons: string[];
	requiresConfirmation: boolean;
} {
	const reasons: string[] = [];

	// Constitutional caps (deterministic)
	if (ctx.user.rulers.decision > policy.constitutional.decisionMaxAllowed) {
		reasons.push(
			`Decisão do usuário (${ctx.user.rulers.decision}) excede o máximo permitido (${policy.constitutional.decisionMaxAllowed}).`,
		);
	}
	if (ctx.level.vector.decision > policy.constitutional.decisionMaxAllowed) {
		reasons.push(
			`Decisão do nível (${ctx.level.vector.decision}) excede o máximo permitido (${policy.constitutional.decisionMaxAllowed}).`,
		);
	}

	let requiresConfirmation = false;

	for (const rule of policy.rules) {
		if (!rule.when(ctx)) continue;
		reasons.push(rule.name);
		if (rule.action === 'BLOCK_OR_REQUIRE_CONFIRMATION') {
			requiresConfirmation = true;
		}
	}

	return {
		isBlocked: reasons.length > 0 && !requiresConfirmation,
		reasons,
		requiresConfirmation,
	};
}

/* -------------------------------------------------------
 * Role prior: soft bias (optional)
 * ----------------------------------------------------- */

export function applyRolePrior(
	baseScore: number,
	levelId: CanonicalLevelId,
	initialRole: InitialRoleId,
	prior: PriorConfig,
): number {
	if (!prior.enabled) return baseScore;
	const boosts = prior.roleBoosts[initialRole] ?? [];
	if (!boosts.includes(levelId)) return baseScore;

	// Increase up to maxContribution (e.g., +15% of remaining headroom)
	const headroom = 100 - baseScore;
	const bump = headroom * clampNumber(prior.maxContribution, 0, 1);
	return clampNumber(baseScore + bump, 0, 100);
}

/* -------------------------------------------------------
 * Matching: compute candidates, apply thresholds, suggest corrections
 * ----------------------------------------------------- */

export function matchLevels(params: {
	user: { initialRole: InitialRoleId; rulers: RulersVector };
	levels: CanonicalLevel[];
	weights: Weights;
	thresholds: Thresholds;
	prior: PriorConfig;
	hardBlocks: HardBlockPolicy;
	correctionPolicy?: CorrectionPolicy;
}): MatchResult {
	const { user, levels, weights, thresholds, prior, hardBlocks } = params;
	const correctionPolicy: CorrectionPolicy | undefined =
		params.correctionPolicy;

	const maxDist = computeMaxDistance(weights);

	const computed: MatchCandidate[] = [];
	const blockedReasonsGlobal: string[] = [];

	for (const level of levels) {
		const block = evaluateHardBlocks({ level, user }, hardBlocks);

		// If "requires confirmation", we treat as not blocked here (it's a UX-level stop),
		// but we keep the reason on the candidate.
		if (block.isBlocked) {
			// skip candidate entirely, but retain reasons for reporting if needed
			continue;
		}

		const distance = computeWeightedDistance(
			user.rulers,
			level.vector,
			weights,
		);
		const score0 = distanceToScore(distance, maxDist);
		const score = applyRolePrior(score0, level.id, user.initialRole, prior);

		computed.push({
			distance,
			levelId: level.id,
			name: level.name,
			reasons: block.requiresConfirmation ? block.reasons : [],
			score,
		});

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
			score: null,
			selectedLevel: null,
		};
	}

	// Rank by score desc, then by distance asc
	const ranked = [...computed].sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		return a.distance - b.distance;
	});

	const top = ranked[0];
	const candidates = ranked
		.filter((c) => c.score >= thresholds.candidatesMin)
		.slice(0, thresholds.maxCandidates);

	// Determine best competitor
	const competitor =
		ranked.find(
			(c) => c.levelId !== top.levelId && c.score >= thresholds.candidatesMin,
		) ?? null;

	// Threshold logic
	if (top.score < thresholds.blockBelow) {
		return {
			blocked: {
				isBlocked: true,
				reasons: uniqueStrings([
					`Match fraco: melhor score (${round2(top.score)}%) abaixo de ${thresholds.blockBelow}%.`,
					...(blockedReasonsGlobal.length ? blockedReasonsGlobal : []),
				]),
			},
			candidates: candidates,
			correctionsSuggested: suggestCorrectionsSafe({
				correctionPolicy,
				hardBlocks,
				levels,
				prior,
				ranked,
				thresholds,
				user,
				weights,
			}),
			score: null,
			selectedLevel: null,
		};
	}

	// Auto-select when strong and no competitor
	if (top.score >= thresholds.autoSelectMin && !competitor) {
		return {
			blocked: {
				isBlocked: false,
				reasons: uniqueStrings(blockedReasonsGlobal),
			},
			candidates: candidates,
			correctionsSuggested: [],
			score: round2(top.score),
			selectedLevel: top.levelId,
		};
	}

	// Ambiguous (70–90 or competitor exists)
	return {
		blocked: { isBlocked: false, reasons: uniqueStrings(blockedReasonsGlobal) },
		candidates: candidates.length
			? candidates
			: ranked.slice(0, thresholds.maxCandidates),
		correctionsSuggested: suggestCorrectionsSafe({
			correctionPolicy,
			hardBlocks,
			levels,
			prior,
			ranked,
			thresholds,
			user,
			weights,
		}),
		score: null,
		selectedLevel: null,
	};
}

/* -------------------------------------------------------
 * Corrections (deltas): propose 2–3 local adjustments (no loops)
 * ----------------------------------------------------- */

function suggestCorrectionsSafe(args: {
	user: { initialRole: InitialRoleId; rulers: RulersVector };
	levels: CanonicalLevel[];
	ranked: MatchCandidate[];
	hardBlocks: HardBlockPolicy;
	weights: Weights;
	thresholds: Thresholds;
	prior: PriorConfig;
	correctionPolicy?: CorrectionPolicy;
}): CorrectionSuggestion[] {
	const { correctionPolicy } = args;
	if (!correctionPolicy?.enabled) return [];

	const maxSuggestions = correctionPolicy.selectionPolicy.maxSuggestions ?? 3;
	const criticalAxes = correctionPolicy.selectionPolicy
		.preferCriticalAxesFirst ?? ['decision', 'source'];
	const allowNone = correctionPolicy.deltaPolicy.allowNoneOption;

	// Choose a target level: the top ranked (best match) if exists
	const top = args.ranked[0];
	const topLevel = args.levels.find((l) => l.id === top.levelId);
	if (!topLevel) return [];

	const deltas = generateLocalDeltas({
		criticalAxes,
		maxRulersChanged: correctionPolicy.deltaPolicy.maxRulersChanged,
		target: topLevel.vector,
		user: args.user.rulers,
	});

	// Filter deltas that would introduce new blocks (optional strictness)
	const safeDeltas = deltas.filter((delta) => {
		const adjusted = applyDelta(args.user.rulers, delta);
		// evaluate blocks against the target level and (also) against any remaining top candidates
		const ctx: BlockContext = {
			level: topLevel,
			user: { initialRole: args.user.initialRole, rulers: adjusted },
		};
		const block = evaluateHardBlocks(ctx, args.hardBlocks);
		return !block.isBlocked; // allow requiresConfirmation to pass
	});

	const scored = safeDeltas
		.map((delta) => {
			const adjusted = applyDelta(args.user.rulers, delta);
			const dist = computeWeightedDistance(
				adjusted,
				topLevel.vector,
				args.weights,
			);
			const score0 = distanceToScore(dist, computeMaxDistance(args.weights));
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

	const suggestions: CorrectionSuggestion[] = scored.map((item, idx) => {
		const label = formatDeltaLabel(item.delta);
		return {
			delta: item.delta,
			id: `corr-${idx + 1}`,
			label,
			shortRationale:
				'Ajuste local (±1) para reduzir ambiguidade e aproximar o comportamento do nível recomendado, sem criar loops.',
		};
	});

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
		].slice(0, maxSuggestions + 1); // keep bounded
	}

	return suggestions;
}

/**
 * Generate small deltas (±1) focusing on axes where user differs from target.
 * Priority:
 * 1) critical axes (decision, source)
 * 2) remaining axes
 * Each delta changes at most maxRulersChanged axes.
 */
export function generateLocalDeltas(params: {
	user: RulersVector;
	target: RulersVector;
	maxRulersChanged: number;
	criticalAxes: RulerId[];
}): CorrectionDelta[] {
	const { user, target } = params;
	const maxRulersChanged = clampInt(params.maxRulersChanged, 1, 2); // enforced by design
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

	// Compute per-axis direction toward target (±1 if possible)
	const candidatesPerAxis: Array<{ axis: RulerId; step: -1 | 1 } | null> =
		axesSorted.map((axis) => {
			const u = user[axis];
			const t = target[axis];
			if (u === t) return null;
			return { axis, step: (t > u ? 1 : -1) as -1 | 1 };
		});

	const singleAxis: CorrectionDelta[] = candidatesPerAxis
		.filter(Boolean)
		.map((c) => ({ [c?.axis]: c?.step }) as CorrectionDelta);

	if (maxRulersChanged === 1) return singleAxis;

	// Two-axis combinations (ordered by priority list)
	const nonNull = candidatesPerAxis.filter(Boolean) as Array<{
		axis: RulerId;
		step: -1 | 1;
	}>;
	const twoAxis: CorrectionDelta[] = [];

	for (let i = 0; i < nonNull.length; i++) {
		for (let j = i + 1; j < nonNull.length; j++) {
			const a = nonNull[i];
			const b = nonNull[j];
			twoAxis.push({ [a.axis]: a.step, [b.axis]: b.step });
		}
	}

	// Prefer fewer changes first, then prioritize combos that include critical axes
	const rank = (d: CorrectionDelta): number => {
		const axes = Object.keys(d) as RulerId[];
		const includesCritical = axes.some((a) => params.criticalAxes.includes(a));
		return (includesCritical ? 0 : 10) + axes.length; // smaller is better
	};

	return [...singleAxis, ...twoAxis].sort((a, b) => rank(a) - rank(b));
}

/* -------------------------------------------------------
 * One-shot correction application
 * ----------------------------------------------------- */

export function applyDelta(
	user: RulersVector,
	delta: CorrectionDelta,
): RulersVector {
	const axes: RulerId[] = ['inference', 'decision', 'scope', 'source', 'meta'];
	return axes.reduce((acc, axis) => {
		const step = delta[axis] ?? 0;
		const next = clampInt(user[axis] + step, 1, 5) as Scale1to5;
		acc[axis] = next;
		return acc;
	}, {} as RulersVector);
}

/* -------------------------------------------------------
 * Utilities
 * ----------------------------------------------------- */

export function clampNumber(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

export function clampInt(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function uniqueStrings(items: string[]): string[] {
	return Array.from(new Set(items.filter(Boolean)));
}

export function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function formatDeltaLabel(delta: CorrectionDelta): string {
	const entries = Object.entries(delta) as Array<[RulerId, -1 | 1]>;
	if (entries.length === 0) return 'Sem ajuste';
	const parts = entries.map(
		([axis, step]) => `${axis} ${step > 0 ? '+1' : '-1'}`,
	);
	return parts.join(' · ');
}

/* -------------------------------------------------------
 * Default Canonical Levels + Default Blocks (optional helpers)
 * ----------------------------------------------------- */

export function getDefaultCanonicalLevels(): CanonicalLevel[] {
	return [
		{
			id: 'N1',
			name: 'Execução Estritamente Delimitada',
			vector: { decision: 1, inference: 1, meta: 1, scope: 1, source: 1 },
		},
		{
			id: 'N2',
			name: 'Análise Controlada e Diagnóstico',
			vector: { decision: 1, inference: 2, meta: 1, scope: 2, source: 1 },
		},
		{
			id: 'N3',
			name: 'Síntese Estruturada e Organização Cognitiva',
			vector: { decision: 1, inference: 3, meta: 1, scope: 3, source: 1 },
		},
		{
			id: 'N4',
			name: 'Exploração de Alternativas e Trade-offs',
			vector: { decision: 1, inference: 4, meta: 1, scope: 4, source: 2 },
		},
		{
			id: 'N5',
			name: 'Apoio à Decisão Humana',
			vector: { decision: 2, inference: 4, meta: 2, scope: 4, source: 2 },
		},
		{
			id: 'N6',
			name: 'Governança, Controle e Segurança Cognitiva',
			vector: { decision: 3, inference: 2, meta: 3, scope: 5, source: 1 },
		},
		{
			id: 'N7',
			name: 'Meta-Cognição e Arquitetura de Pensamento',
			vector: { decision: 1, inference: 3, meta: 5, scope: 4, source: 2 },
		},
		{
			id: 'N8',
			name: 'Documentação, Contratos e Sistemas de Uso',
			vector: { decision: 2, inference: 2, meta: 5, scope: 5, source: 1 },
		},
	];
}

export function getDefaultWeights(): Weights {
	return { decision: 1.5, inference: 1.0, meta: 1.3, scope: 1.2, source: 1.5 };
}

export function getDefaultThresholds(): Thresholds {
	return {
		autoSelectMin: 90,
		blockBelow: 70,
		candidatesMin: 70,
		maxCandidates: 3,
	};
}

export function getDefaultPrior(): PriorConfig {
	return {
		enabled: true,
		maxContribution: 0.15,
		roleBoosts: {
			'role.analyze': ['N2', 'N6', 'N7'],
			'role.decideSupport': ['N5'],
			'role.document': ['N8', 'N6'],
			'role.execute': ['N1'],
			'role.explore': ['N4', 'N5'],
			'role.research': ['N4', 'N5'],
			'role.synthesize': ['N3', 'N8'],
			'role.transform': ['N1', 'N3'],
		},
	};
}

export function getDefaultHardBlocks(): HardBlockPolicy {
	const rules: BlockRule[] = [
		{
			action: 'BLOCK',
			id: 'block.decision.totalOrHigh',
			name: 'Decisão total/alta é proibida (cap constitucional).',
			when: ({ user, level }) =>
				user.rulers.decision >= 4 || level.vector.decision >= 4,
		},
		{
			action: 'BLOCK',
			id: 'block.source.closedButResearch',
			name: 'Fonte fechada não permite pesquisa/benchmarks.',
			when: ({ user }) =>
				user.rulers.source === 1 && user.initialRole === 'role.research',
		},
		{
			action: 'BLOCK',
			id: 'block.inferenceHighWithClosedSource',
			name: 'Inferência alta com fonte fechada é instável (risco de suposição/alucinação estrutural).',
			when: ({ user }) =>
				user.rulers.source === 1 && user.rulers.inference >= 4,
		},
		{
			action: 'BLOCK_OR_REQUIRE_CONFIRMATION',
			id: 'block.metaHighAgainstOperational',
			name: 'Meta alta pode conflitar com objetivo operacional direto (exige confirmação).',
			when: ({ user }) =>
				user.rulers.meta >= 4 &&
				(user.initialRole === 'role.execute' ||
					user.initialRole === 'role.transform'),
		},
		{
			action: 'BLOCK',
			id: 'block.scopeSystemicWithoutSystemicIntent',
			name: 'Escopo sistêmico sem intenção sistêmica (user scope <=2 vs nível scope >=4).',
			when: ({ user, level }) =>
				user.rulers.scope <= 2 && level.vector.scope >= 4,
		},
		{
			action: 'BLOCK',
			id: 'block.governanceRequiresDecision3',
			name: 'Governança (N6) exige decisão=3 (autoridade de bloquear/parar).',
			when: ({ user, level }) => level.id === 'N6' && user.rulers.decision < 3,
		},
	];

	return {
		constitutional: {
			decisionMaxAllowed: 3,
			forbidTotalAutonomy: true,
			forbidUnboundedResponsibilityShift: true,
		},
		rules,
	};
}

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
