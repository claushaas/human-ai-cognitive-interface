/**
 * Types for the HACI prompt session flow.
 *
 * Pure types — no React, no IO, no Cloudflare, no LLM.
 */

import type {
	CognitiveContract,
	CollectionAnswer,
	CollectionProtocol,
	InitialRole,
	LevelMatch,
	PromptGenerationResult,
	RawIntent,
	RulersVector,
} from '~/domain/contracts';

export type PromptSessionStep =
	| 'intent'
	| 'role'
	| 'rulers'
	| 'match'
	| 'collection'
	| 'review'
	| 'result';

export type PromptSessionStatus =
	| 'idle'
	| 'editingIntent'
	| 'selectingRole'
	| 'adjustingRulers'
	| 'matching'
	| 'ambiguous'
	| 'blocked'
	| 'collecting'
	| 'reviewing'
	| 'generating'
	| 'completed'
	| 'failed';

export interface PromptSessionState {
	status: PromptSessionStatus;
	currentStep: PromptSessionStep;
	rawIntent?: RawIntent;
	initialRole?: InitialRole;
	rulers?: RulersVector;
	levelMatch?: LevelMatch;
	collectionProtocol?: CollectionProtocol;
	collectionAnswers: CollectionAnswer[];
	contract?: CognitiveContract;
	promptResult?: PromptGenerationResult;
	error?: string;
	debugEnabled: boolean;
}

export type PromptSessionAction =
	| { type: 'SET_INTENT'; payload: RawIntent }
	| { type: 'SET_ROLE'; payload: InitialRole }
	| { type: 'SET_RULERS'; payload: RulersVector }
	| { type: 'SET_MATCH'; payload: LevelMatch }
	| { type: 'SET_COLLECTION_PROTOCOL'; payload: CollectionProtocol }
	| { type: 'SET_COLLECTION_ANSWERS'; payload: CollectionAnswer[] }
	| { type: 'SET_CONTRACT'; payload: CognitiveContract }
	| { type: 'SET_PROMPT_RESULT'; payload: PromptGenerationResult }
	| { type: 'SET_ERROR'; payload: string }
	| { type: 'CLEAR_ERROR' }
	| { type: 'ADVANCE_STEP' }
	| { type: 'GO_BACK' }
	| { type: 'TOGGLE_DEBUG' }
	| { type: 'RESET' }
	| { type: 'APPLY_CORRECTION'; payload: { rulers: RulersVector } }
	| { type: 'START_GENERATING' }
	| { type: 'FINISH_GENERATING'; payload: PromptGenerationResult }
	| { type: 'GO_TO_STEP'; payload: PromptSessionStep }
	| { type: 'HYDRATE'; payload: Partial<PromptSessionState> };

export interface PromptSessionSnapshot {
	step: PromptSessionStep;
	status: PromptSessionStatus;
	hasIntent: boolean;
	hasRole: boolean;
	hasRulers: boolean;
	hasMatch: boolean;
	hasCollection: boolean;
	hasContract: boolean;
	hasResult: boolean;
	hasError: boolean;
}

export const STEP_ORDER: readonly PromptSessionStep[] = [
	'intent',
	'role',
	'rulers',
	'match',
	'collection',
	'review',
	'result',
] as const;

export function getCurrentStepIndex(step: PromptSessionStep): number {
	return STEP_ORDER.indexOf(step);
}

export function canAdvanceFromStep(
	state: PromptSessionState,
	step: PromptSessionStep,
): boolean {
	switch (step) {
		case 'intent':
			return !!state.rawIntent?.text?.trim();
		case 'role':
			return !!state.initialRole;
		case 'rulers':
			return !!state.rulers;
		case 'match': {
			if (!state.levelMatch) return false;
			if (state.levelMatch.status === 'blocked') return false;
			if (state.levelMatch.status === 'no_match') return false;
			return true;
		}
		case 'collection': {
			if (!state.collectionProtocol) return false;
			const requiredQuestions = state.collectionProtocol.questions.filter(
				(q) => q.required,
			);
			const answeredRequired = requiredQuestions.filter((q) =>
				state.collectionAnswers.some((a) => a.questionId === q.id),
			);
			return answeredRequired.length === requiredQuestions.length;
		}
		case 'review':
			return !!state.contract;
		case 'result':
			return !!state.promptResult;
		default:
			return false;
	}
}

export function buildPromptSessionSnapshot(
	state: PromptSessionState,
): PromptSessionSnapshot {
	return {
		hasCollection: state.collectionAnswers.length > 0,
		hasContract: !!state.contract,
		hasError: !!state.error,
		hasIntent: !!state.rawIntent,
		hasMatch: !!state.levelMatch,
		hasResult: !!state.promptResult,
		hasRole: !!state.initialRole,
		hasRulers: !!state.rulers,
		status: state.status,
		step: state.currentStep,
	};
}
