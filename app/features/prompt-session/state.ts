/**
 * Prompt session reducer / state machine.
 *
 * Pure function — no side effects, no Date.now(), no Math.random().
 * All timestamps and IDs must be generated outside the reducer and passed in.
 */

import type {
	PromptSessionAction,
	PromptSessionState,
	PromptSessionStep,
} from './types';
import { getCurrentStepIndex, STEP_ORDER } from './types';

export function createInitialPromptSessionState(): PromptSessionState {
	return {
		collectionAnswers: [],
		currentStep: 'intent',
		debugEnabled: false,
		status: 'idle',
	};
}

function getNextStep(current: PromptSessionStep): PromptSessionStep | null {
	const idx = getCurrentStepIndex(current);
	if (idx >= 0 && idx < STEP_ORDER.length - 1) {
		return STEP_ORDER[idx + 1];
	}
	return null;
}

function getPreviousStep(current: PromptSessionStep): PromptSessionStep | null {
	const idx = getCurrentStepIndex(current);
	if (idx > 0) {
		return STEP_ORDER[idx - 1];
	}
	return null;
}

function invalidateDownstream(
	state: PromptSessionState,
	fromStep: PromptSessionStep,
): PromptSessionState {
	const fromIndex = getCurrentStepIndex(fromStep);
	const updates: Partial<PromptSessionState> = {};

	if (fromIndex <= getCurrentStepIndex('match')) {
		updates.levelMatch = undefined;
		updates.collectionProtocol = undefined;
		updates.collectionAnswers = [];
		updates.contract = undefined;
		updates.promptResult = undefined;
	}
	if (fromIndex <= getCurrentStepIndex('collection')) {
		updates.collectionProtocol = undefined;
		updates.collectionAnswers = [];
		updates.contract = undefined;
		updates.promptResult = undefined;
	}
	if (fromIndex <= getCurrentStepIndex('review')) {
		updates.contract = undefined;
		updates.promptResult = undefined;
	}

	return { ...state, ...updates };
}

export function promptSessionReducer(
	state: PromptSessionState,
	action: PromptSessionAction,
): PromptSessionState {
	switch (action.type) {
		case 'SET_INTENT':
			return invalidateDownstream(
				{
					...state,
					error: undefined,
					rawIntent: action.payload,
					status: 'editingIntent',
				},
				'intent',
			);

		case 'SET_ROLE':
			return invalidateDownstream(
				{
					...state,
					error: undefined,
					initialRole: action.payload,
					status: 'selectingRole',
				},
				'role',
			);

		case 'SET_RULERS':
			return invalidateDownstream(
				{
					...state,
					error: undefined,
					rulers: action.payload,
					status: 'adjustingRulers',
				},
				'rulers',
			);

		case 'SET_MATCH':
			return {
				...state,
				error: undefined,
				levelMatch: action.payload,
				status:
					action.payload.status === 'blocked'
						? 'blocked'
						: action.payload.status === 'ambiguous'
							? 'ambiguous'
							: 'matching',
			};

		case 'SET_COLLECTION_PROTOCOL':
			return {
				...state,
				collectionProtocol: action.payload,
				error: undefined,
				status: 'collecting',
			};

		case 'SET_COLLECTION_ANSWERS':
			return {
				...state,
				collectionAnswers: action.payload,
				contract: undefined,
				error: undefined,
				promptResult: undefined,
			};

		case 'SET_CONTRACT':
			return {
				...state,
				contract: action.payload,
				error: undefined,
				status: 'reviewing',
			};

		case 'SET_PROMPT_RESULT':
			return {
				...state,
				error: undefined,
				promptResult: action.payload,
				status: 'completed',
			};

		case 'SET_ERROR':
			return {
				...state,
				error: action.payload,
				status: 'failed',
			};

		case 'CLEAR_ERROR':
			return {
				...state,
				error: undefined,
				status: state.status === 'failed' ? 'idle' : state.status,
			};

		case 'ADVANCE_STEP': {
			const next = getNextStep(state.currentStep);
			if (!next) return state;
			return { ...state, currentStep: next };
		}

		case 'GO_BACK': {
			const prev = getPreviousStep(state.currentStep);
			if (!prev) return state;
			return { ...state, currentStep: prev };
		}

		case 'GO_TO_STEP': {
			const targetIdx = getCurrentStepIndex(action.payload);
			const currentIdx = getCurrentStepIndex(state.currentStep);
			// Only allow going back or to adjacent forward steps
			if (targetIdx <= currentIdx || targetIdx === currentIdx + 1) {
				return { ...state, currentStep: action.payload };
			}
			return state;
		}

		case 'TOGGLE_DEBUG':
			return { ...state, debugEnabled: !state.debugEnabled };

		case 'RESET':
			return createInitialPromptSessionState();

		case 'APPLY_CORRECTION':
			return invalidateDownstream(
				{
					...state,
					error: undefined,
					rulers: action.payload.rulers,
					status: 'adjustingRulers',
				},
				'rulers',
			);

		case 'START_GENERATING':
			return { ...state, status: 'generating' };

		case 'FINISH_GENERATING':
			return {
				...state,
				error: undefined,
				promptResult: action.payload,
				status: 'completed',
			};

		default:
			return state;
	}
}
