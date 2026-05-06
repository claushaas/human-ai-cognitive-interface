import { describe, expect, it } from 'vitest';
import type {
	CognitiveContract,
	PromptGenerationResult,
} from '~/domain/contracts';
import { CONTRACT_VERSION } from '~/domain/contracts';
import {
	createInitialPromptSessionState,
	promptSessionReducer,
} from '~/features/prompt-session/state';
import type { PromptSessionState } from '~/features/prompt-session/types';
import {
	canAdvanceFromStep,
	getCurrentStepIndex,
	STEP_ORDER,
} from '~/features/prompt-session/types';

function makeState(
	partial: Partial<PromptSessionState> = {},
): PromptSessionState {
	return {
		...createInitialPromptSessionState(),
		...partial,
	};
}

describe('createInitialPromptSessionState', () => {
	it('returns idle state at intent step', () => {
		const state = createInitialPromptSessionState();
		expect(state.status).toBe('idle');
		expect(state.currentStep).toBe('intent');
		expect(state.collectionAnswers).toEqual([]);
		expect(state.debugEnabled).toBe(false);
	});
});

describe('promptSessionReducer', () => {
	describe('SET_INTENT', () => {
		it('sets raw intent and advances status', () => {
			const state = makeState();
			const intent = {
				locale: 'pt-BR' as const,
				text: 'Test intent',
				version: CONTRACT_VERSION,
			};
			const next = promptSessionReducer(state, {
				payload: intent,
				type: 'SET_INTENT',
			});
			expect(next.rawIntent).toEqual(intent);
			expect(next.status).toBe('editingIntent');
		});

		it('invalidates downstream state', () => {
			const state = makeState({
				contract: {
					id: 'test',
					version: CONTRACT_VERSION,
				} as unknown as CognitiveContract,
				initialRole: 'role.analyze',
				levelMatch: { candidates: [], hardBlocks: [], status: 'matched' },
			});
			const intent = {
				locale: 'pt-BR' as const,
				text: 'New intent',
				version: CONTRACT_VERSION,
			};
			const next = promptSessionReducer(state, {
				payload: intent,
				type: 'SET_INTENT',
			});
			expect(next.initialRole).toBe('role.analyze');
			expect(next.levelMatch).toBeUndefined();
			expect(next.contract).toBeUndefined();
		});
	});

	describe('SET_ROLE', () => {
		it('sets role and advances status', () => {
			const state = makeState({
				rawIntent: { locale: 'pt-BR', text: 'test', version: CONTRACT_VERSION },
			});
			const next = promptSessionReducer(state, {
				payload: 'role.analyze',
				type: 'SET_ROLE',
			});
			expect(next.initialRole).toBe('role.analyze');
			expect(next.status).toBe('selectingRole');
		});
	});

	describe('SET_RULERS', () => {
		it('sets rulers and advances status', () => {
			const state = makeState();
			const rulers = {
				decision: 1,
				inference: 2,
				meta: 1,
				scope: 2,
				source: 1,
			} as const;
			const next = promptSessionReducer(state, {
				payload: rulers,
				type: 'SET_RULERS',
			});
			expect(next.rulers).toEqual(rulers);
			expect(next.status).toBe('adjustingRulers');
		});
	});

	describe('SET_MATCH', () => {
		it('sets match and updates status to matching', () => {
			const state = makeState();
			const match = {
				candidates: [],
				hardBlocks: [],
				selected: { id: 'N1', score: 1.0 },
				status: 'matched' as const,
			};
			const next = promptSessionReducer(state, {
				payload: match,
				type: 'SET_MATCH',
			});
			expect(next.levelMatch).toEqual(match);
			expect(next.status).toBe('matching');
		});

		it('sets status to blocked when match is blocked', () => {
			const state = makeState();
			const match = {
				candidates: [],
				hardBlocks: [
					{ code: 'test', message: 'Test', severity: 'blocking' as const },
				],
				status: 'blocked' as const,
			};
			const next = promptSessionReducer(state, {
				payload: match,
				type: 'SET_MATCH',
			});
			expect(next.status).toBe('blocked');
		});
	});

	describe('ADVANCE_STEP', () => {
		it('advances from intent to role', () => {
			const state = makeState({ currentStep: 'intent' });
			const next = promptSessionReducer(state, { type: 'ADVANCE_STEP' });
			expect(next.currentStep).toBe('role');
		});

		it('advances from role to rulers', () => {
			const state = makeState({ currentStep: 'role' });
			const next = promptSessionReducer(state, { type: 'ADVANCE_STEP' });
			expect(next.currentStep).toBe('rulers');
		});

		it('does not advance past result', () => {
			const state = makeState({ currentStep: 'result' });
			const next = promptSessionReducer(state, { type: 'ADVANCE_STEP' });
			expect(next.currentStep).toBe('result');
		});
	});

	describe('GO_BACK', () => {
		it('goes back from role to intent', () => {
			const state = makeState({ currentStep: 'role' });
			const next = promptSessionReducer(state, { type: 'GO_BACK' });
			expect(next.currentStep).toBe('intent');
		});

		it('does not go back past intent', () => {
			const state = makeState({ currentStep: 'intent' });
			const next = promptSessionReducer(state, { type: 'GO_BACK' });
			expect(next.currentStep).toBe('intent');
		});
	});

	describe('GO_TO_STEP', () => {
		it('allows going back to previous step', () => {
			const state = makeState({ currentStep: 'rulers' });
			const next = promptSessionReducer(state, {
				payload: 'intent',
				type: 'GO_TO_STEP',
			});
			expect(next.currentStep).toBe('intent');
		});

		it('allows going to adjacent forward step', () => {
			const state = makeState({ currentStep: 'intent' });
			const next = promptSessionReducer(state, {
				payload: 'role',
				type: 'GO_TO_STEP',
			});
			expect(next.currentStep).toBe('role');
		});

		it('prevents skipping multiple steps forward', () => {
			const state = makeState({ currentStep: 'intent' });
			const next = promptSessionReducer(state, {
				payload: 'result',
				type: 'GO_TO_STEP',
			});
			expect(next.currentStep).toBe('intent');
		});
	});

	describe('SET_COLLECTION_ANSWERS', () => {
		it('sets answers and invalidates result', () => {
			const state = makeState({
				promptResult: { prompt: 'test' } as unknown as PromptGenerationResult,
			});
			const answers = [
				{
					answeredAt: '2026-01-01T00:00:00Z',
					questionId: 'q1',
					value: 'answer',
				},
			];
			const next = promptSessionReducer(state, {
				payload: answers,
				type: 'SET_COLLECTION_ANSWERS',
			});
			expect(next.collectionAnswers).toEqual(answers);
			expect(next.promptResult).toBeUndefined();
		});
	});

	describe('APPLY_CORRECTION', () => {
		it('updates rulers and invalidates downstream', () => {
			const state = makeState({
				levelMatch: { candidates: [], hardBlocks: [], status: 'ambiguous' },
				rulers: { decision: 1, inference: 4, meta: 1, scope: 4, source: 2 },
			});
			const newRulers = {
				decision: 1,
				inference: 3,
				meta: 1,
				scope: 4,
				source: 2,
			};
			const next = promptSessionReducer(state, {
				payload: { rulers: newRulers },
				type: 'APPLY_CORRECTION',
			});
			expect(next.rulers).toEqual(newRulers);
			expect(next.levelMatch).toBeUndefined();
		});
	});

	describe('SET_ERROR', () => {
		it('sets error and failed status', () => {
			const state = makeState();
			const next = promptSessionReducer(state, {
				payload: 'Something went wrong',
				type: 'SET_ERROR',
			});
			expect(next.error).toBe('Something went wrong');
			expect(next.status).toBe('failed');
		});
	});

	describe('RESET', () => {
		it('resets to initial state', () => {
			const state = makeState({
				currentStep: 'result',
				rawIntent: { locale: 'pt-BR', text: 'test', version: CONTRACT_VERSION },
				status: 'completed',
			});
			const next = promptSessionReducer(state, { type: 'RESET' });
			expect(next.currentStep).toBe('intent');
			expect(next.status).toBe('idle');
			expect(next.rawIntent).toBeUndefined();
		});
	});

	describe('TOGGLE_DEBUG', () => {
		it('toggles debug mode', () => {
			const state = makeState({ debugEnabled: false });
			const next = promptSessionReducer(state, { type: 'TOGGLE_DEBUG' });
			expect(next.debugEnabled).toBe(true);
		});
	});
});

describe('canAdvanceFromStep', () => {
	it('requires intent text for intent step', () => {
		expect(canAdvanceFromStep(makeState(), 'intent')).toBe(false);
		expect(
			canAdvanceFromStep(
				makeState({
					rawIntent: {
						locale: 'pt-BR',
						text: 'test',
						version: CONTRACT_VERSION,
					},
				}),
				'intent',
			),
		).toBe(true);
	});

	it('requires role for role step', () => {
		expect(canAdvanceFromStep(makeState(), 'role')).toBe(false);
		expect(
			canAdvanceFromStep(makeState({ initialRole: 'role.analyze' }), 'role'),
		).toBe(true);
	});

	it('requires rulers for rulers step', () => {
		expect(canAdvanceFromStep(makeState(), 'rulers')).toBe(false);
		expect(
			canAdvanceFromStep(
				makeState({
					rulers: { decision: 1, inference: 1, meta: 1, scope: 1, source: 1 },
				}),
				'rulers',
			),
		).toBe(true);
	});

	it('blocks advance when match is blocked', () => {
		const state = makeState({
			levelMatch: {
				candidates: [],
				hardBlocks: [
					{ code: 'test', message: 'Test', severity: 'blocking' as const },
				],
				status: 'blocked',
			},
		});
		expect(canAdvanceFromStep(state, 'match')).toBe(false);
	});

	it('requires collection answers for collection step', () => {
		const protocol = {
			contractId: 'test',
			questions: [
				{
					answerType: 'text' as const,
					id: 'q1',
					label: 'Test',
					required: true,
				},
			],
			status: 'ready' as const,
			version: CONTRACT_VERSION,
		};
		expect(
			canAdvanceFromStep(
				makeState({ collectionProtocol: protocol }),
				'collection',
			),
		).toBe(false);
		expect(
			canAdvanceFromStep(
				makeState({
					collectionAnswers: [
						{
							answeredAt: '2026-01-01T00:00:00Z',
							questionId: 'q1',
							value: 'answer',
						},
					],
					collectionProtocol: protocol,
				}),
				'collection',
			),
		).toBe(true);
	});
});

describe('getCurrentStepIndex', () => {
	it('returns correct indices', () => {
		expect(getCurrentStepIndex('intent')).toBe(0);
		expect(getCurrentStepIndex('role')).toBe(1);
		expect(getCurrentStepIndex('rulers')).toBe(2);
		expect(getCurrentStepIndex('match')).toBe(3);
		expect(getCurrentStepIndex('collection')).toBe(4);
		expect(getCurrentStepIndex('review')).toBe(5);
		expect(getCurrentStepIndex('result')).toBe(6);
	});
});

describe('STEP_ORDER', () => {
	it('has correct order', () => {
		expect(STEP_ORDER).toEqual([
			'intent',
			'role',
			'rulers',
			'match',
			'collection',
			'review',
			'result',
		]);
	});
});
