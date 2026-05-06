/**
 * Hard block rules for the HACI matching engine.
 *
 * Constitutional and semantic constraints that override score-based matching.
 *
 * Source of truth: docs/raw inputs/canonical-prompt-generator.json
 * Precedence: JSON canonical > code > Markdown docs.
 *
 * IMPORTANT divergence fix: canonical JSON includes role.explore in
 * block.source.closedButResearch, but canonical-match.ts only checks
 * role.research. Implementation follows JSON.
 */

import type { CanonicalLevel } from '../levels/levels';
import type { InternalRoleId } from '../roles/roles';
import type { RulersVector } from '../rulers/rulers';

export type BlockAction = 'BLOCK' | 'BLOCK_OR_REQUIRE_CONFIRMATION';

export type BlockContext = {
	user: {
		initialRole: InternalRoleId;
		rulers: RulersVector;
	};
	level: CanonicalLevel;
};

export type BlockRule = {
	id: string;
	name: string;
	action: BlockAction;
	when: (ctx: BlockContext) => boolean;
};

export type HardBlockPolicy = {
	constitutional: {
		decisionMaxAllowed: number;
		forbidTotalAutonomy: boolean;
		forbidUnboundedResponsibilityShift: boolean;
	};
	rules: BlockRule[];
};

export type BlockResult = {
	isBlocked: boolean;
	reasons: string[];
	requiresConfirmation: boolean;
};

export function evaluateHardBlocks(
	ctx: BlockContext,
	policy: HardBlockPolicy,
): BlockResult {
	const reasons: string[] = [];

	// Constitutional caps
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

export function getDefaultHardBlocks(): HardBlockPolicy {
	return {
		constitutional: {
			decisionMaxAllowed: 3,
			forbidTotalAutonomy: true,
			forbidUnboundedResponsibilityShift: true,
		},
		rules: [
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
					user.rulers.source === 1 &&
					(user.initialRole === 'role.research' ||
						user.initialRole === 'role.explore'),
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
				name: 'Escopo sistêmico sem intenção sistêmica (user scope ≤2 vs nível scope ≥4).',
				when: ({ user, level }) =>
					user.rulers.scope <= 2 && level.vector.scope >= 4,
			},
			{
				action: 'BLOCK',
				id: 'block.governanceRequiresDecision3',
				name: 'Governança (N6) exige decisão=3 (autoridade de bloquear/parar).',
				when: ({ user, level }) =>
					level.id === 'N6' && user.rulers.decision < 3,
			},
		],
	};
}
