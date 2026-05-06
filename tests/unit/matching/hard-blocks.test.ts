import { describe, expect, it } from 'vitest';
import type { BlockContext } from '~/domain/matching/hard-blocks';
import {
	evaluateHardBlocks,
	getDefaultHardBlocks,
} from '~/domain/matching/hard-blocks';

describe('evaluateHardBlocks', () => {
	const policy = getDefaultHardBlocks();

	function makeCtx(
		partial: Partial<BlockContext['user']> & {
			level?: Partial<BlockContext['level']>;
		},
	): BlockContext {
		return {
			level: {
				id: partial.level?.id ?? 'N2',
				name: 'Test',
				vector: {
					decision: partial.level?.vector?.decision ?? 1,
					inference: partial.level?.vector?.inference ?? 2,
					meta: partial.level?.vector?.meta ?? 1,
					scope: partial.level?.vector?.scope ?? 2,
					source: partial.level?.vector?.source ?? 1,
				},
			},
			user: {
				initialRole: partial.initialRole ?? 'role.analyze',
				rulers: {
					decision: partial.rulers?.decision ?? 2,
					inference: partial.rulers?.inference ?? 2,
					meta: partial.rulers?.meta ?? 2,
					scope: partial.rulers?.scope ?? 2,
					source: partial.rulers?.source ?? 2,
				},
			},
		};
	}

	describe('block.decision.totalOrHigh', () => {
		it('blocks when user decision >= 4', () => {
			const ctx = makeCtx({ rulers: { decision: 4 } });
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('cap constitucional'))).toBe(
				true,
			);
		});

		it('blocks when level decision >= 4', () => {
			const ctx = makeCtx({
				level: { id: 'N99', vector: { decision: 4 } },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
		});

		it('does not block when decision <= 3', () => {
			const ctx = makeCtx({ rulers: { decision: 3 } });
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(false);
		});
	});

	describe('block.source.closedButResearch', () => {
		it('blocks role.research with source=1', () => {
			const ctx = makeCtx({
				initialRole: 'role.research',
				rulers: { source: 1 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('Fonte fechada'))).toBe(
				true,
			);
		});

		it('blocks role.explore with source=1 (JSON canonical)', () => {
			const ctx = makeCtx({
				initialRole: 'role.explore',
				rulers: { source: 1 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('Fonte fechada'))).toBe(
				true,
			);
		});

		it('does not block role.analyze with source=1', () => {
			const ctx = makeCtx({
				initialRole: 'role.analyze',
				rulers: { source: 1 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.reasons.some((r) => r.includes('Fonte fechada'))).toBe(
				false,
			);
		});
	});

	describe('block.inferenceHighWithClosedSource', () => {
		it('blocks when inference >= 4 and source=1', () => {
			const ctx = makeCtx({ rulers: { inference: 4, source: 1 } });
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('Inferência alta'))).toBe(
				true,
			);
		});

		it('does not block when inference=3 and source=1', () => {
			const ctx = makeCtx({ rulers: { inference: 3, source: 1 } });
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.reasons.some((r) => r.includes('Inferência alta'))).toBe(
				false,
			);
		});
	});

	describe('block.metaHighAgainstOperational', () => {
		it('requires confirmation for meta >= 4 with role.execute', () => {
			const ctx = makeCtx({
				initialRole: 'role.execute',
				rulers: { meta: 4 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.requiresConfirmation).toBe(true);
			expect(result.isBlocked).toBe(false);
		});

		it('requires confirmation for meta >= 4 with role.transform', () => {
			const ctx = makeCtx({
				initialRole: 'role.transform',
				rulers: { meta: 4 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.requiresConfirmation).toBe(true);
		});

		it('does not affect role.analyze with meta=4', () => {
			const ctx = makeCtx({
				initialRole: 'role.analyze',
				rulers: { meta: 4 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.requiresConfirmation).toBe(false);
		});
	});

	describe('block.scopeSystemicWithoutSystemicIntent', () => {
		it('blocks when user scope <= 2 and level scope >= 4', () => {
			const ctx = makeCtx({
				level: { id: 'N4', vector: { scope: 4 } },
				rulers: { scope: 2 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('Escopo sistêmico'))).toBe(
				true,
			);
		});

		it('does not block when user scope=3 and level scope=4', () => {
			const ctx = makeCtx({
				level: { id: 'N4', vector: { scope: 4 } },
				rulers: { scope: 3 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.reasons.some((r) => r.includes('Escopo sistêmico'))).toBe(
				false,
			);
		});
	});

	describe('block.governanceRequiresDecision3', () => {
		it('blocks N6 when decision < 3', () => {
			const ctx = makeCtx({
				level: { id: 'N6', vector: { decision: 3 } },
				rulers: { decision: 2 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.isBlocked).toBe(true);
			expect(result.reasons.some((r) => r.includes('N6'))).toBe(true);
		});

		it('does not block N6 when decision=3', () => {
			const ctx = makeCtx({
				level: { id: 'N6', vector: { decision: 3 } },
				rulers: { decision: 3 },
			});
			const result = evaluateHardBlocks(ctx, policy);
			expect(result.reasons.some((r) => r.includes('N6'))).toBe(false);
		});
	});
});
