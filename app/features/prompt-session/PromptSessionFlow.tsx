/**
 * Prompt Session Flow — orchestrator for the complete HACI user journey.
 *
 * Integrates all steps, state management, matching engine, and mock generation.
 * No LLM, no D1, no Cloudflare, no external IO.
 */

import { useCallback, useMemo, useReducer } from 'react';
import { AppShell } from '~/components/shell/AppShell';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import { StepIndicator } from '~/components/ui/StepIndicator';
import { deriveMockCollectionProtocol } from '~/domain/collection/mock-protocol';
import type {
	CognitiveContract,
	CollectionAnswer,
	InitialRole,
	LevelMatch,
	RawIntent,
	RulersVector,
} from '~/domain/contracts';
import { CONTRACT_VERSION, CognitiveContractSchema } from '~/domain/contracts';
import { CANONICAL_LEVELS } from '~/domain/levels';
import {
	getDefaultCorrectionPolicy,
	getDefaultHardBlocks,
	getDefaultPrior,
	getDefaultThresholds,
	matchLevels,
} from '~/domain/matching';
import { generateMockPromptResult } from '~/domain/prompt/mock-generate-prompt';
import type { InternalRoleId } from '~/domain/roles';
import { DEFAULT_WEIGHTS } from '~/domain/rulers';
import { DebugContractPanel } from '~/features/debug/DebugContractPanel';
import {
	saveContract,
	saveIntent,
	saveMatch,
	savePromptResult,
} from './persistence';
import { createInitialPromptSessionState, promptSessionReducer } from './state';
import { CollectionStep } from './steps/CollectionStep';
import { IntentStep } from './steps/IntentStep';
import { MatchStep } from './steps/MatchStep';
import { ResultStep } from './steps/ResultStep';
import { ReviewStep } from './steps/ReviewStep';
import { RoleStep } from './steps/RoleStep';
import { RulersStep } from './steps/RulersStep';
import {
	canAdvanceFromStep,
	getCurrentStepIndex,
	type PromptSessionStep,
	STEP_ORDER,
} from './types';

const STEP_LABELS: Record<PromptSessionStep, string> = {
	collection: 'Detalhes',
	intent: 'Entrada',
	match: 'Profundidade',
	result: 'Resultado',
	review: 'Revisão',
	role: 'Papel',
	rulers: 'Ajustes',
};

function generateId(): string {
	return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface PromptSessionFlowProps {
	initialState?: Partial<import('./types').PromptSessionState>;
	sessionId?: string;
}

export default function PromptSessionFlow({
	initialState,
	sessionId: _sessionId,
}: PromptSessionFlowProps = {}) {
	const [state, dispatch] = useReducer(
		promptSessionReducer,
		initialState
			? { ...createInitialPromptSessionState(), ...initialState }
			: createInitialPromptSessionState(),
	);

	const currentStepIndex = getCurrentStepIndex(state.currentStep);

	const stepIndicatorSteps = useMemo(
		() =>
			STEP_ORDER.map((step, index) => ({
				label: STEP_LABELS[step],
				state: (index < currentStepIndex
					? 'complete'
					: index === currentStepIndex
						? 'current'
						: 'pending') as 'blocked' | 'complete' | 'current' | 'pending',
			})),
		[currentStepIndex],
	);

	const _canGoBack = currentStepIndex > 0;
	const _canAdvance = canAdvanceFromStep(state, state.currentStep);

	const _handleAdvance = useCallback(() => {
		dispatch({ type: 'ADVANCE_STEP' });
	}, []);

	const handleGoBack = useCallback(() => {
		dispatch({ type: 'GO_BACK' });
	}, []);

	const handleIntentSubmit = useCallback(
		async (intent: RawIntent) => {
			dispatch({ payload: intent, type: 'SET_INTENT' });
			if (_sessionId) {
				try {
					await saveIntent(_sessionId, intent);
				} catch {
					// Silently fail - user can continue
				}
			}
			dispatch({ type: 'ADVANCE_STEP' });
		},
		[_sessionId],
	);

	const handleRoleSelect = useCallback((role: InitialRole) => {
		dispatch({ payload: role, type: 'SET_ROLE' });
		dispatch({ type: 'ADVANCE_STEP' });
	}, []);

	const handleRulersSubmit = useCallback(
		async (rulers: RulersVector) => {
			dispatch({ payload: rulers, type: 'SET_RULERS' });

			// Compute match
			const role = state.initialRole as InternalRoleId;
			const matchResult = matchLevels({
				correctionPolicy: getDefaultCorrectionPolicy(),
				hardBlocks: getDefaultHardBlocks(),
				levels: [...CANONICAL_LEVELS],
				prior: getDefaultPrior(),
				thresholds: getDefaultThresholds(),
				user: { initialRole: role, rulers },
				weights: DEFAULT_WEIGHTS,
			});

			const levelMatch: LevelMatch = {
				candidates: matchResult.candidates.map((c) => ({
					confidence:
						c.score >= 0.9 ? 'high' : c.score >= 0.7 ? 'medium' : 'low',
					distance: c.distance,
					id: c.levelId,
					reasons: c.reasons,
					score: c.score,
				})),
				correctionSuggestions: matchResult.correctionsSuggested.map(
					(s, _i) => ({
						changes: Object.entries(s.delta).map(([ruler, step]) => {
							const from = rulers[ruler as keyof RulersVector];
							return {
								from,
								ruler: ruler as keyof RulersVector,
								to: Math.max(1, Math.min(5, from + step)) as 1 | 2 | 3 | 4 | 5,
							};
						}),
						id: s.id,
						message: s.label,
					}),
				),
				hardBlocks: matchResult.blocked.isBlocked
					? matchResult.blocked.reasons.map((r, i) => ({
							code: `block-${i}`,
							message: r,
							severity: 'blocking' as const,
						}))
					: [],
				selected: matchResult.selectedLevel
					? {
							confidence: 'high',
							id: matchResult.selectedLevel,
							score: matchResult.score ?? 0,
						}
					: undefined,
				status: matchResult.blocked.isBlocked
					? 'blocked'
					: matchResult.selectedLevel
						? 'matched'
						: 'ambiguous',
			};

			dispatch({ payload: levelMatch, type: 'SET_MATCH' });
			dispatch({ type: 'ADVANCE_STEP' });
		},
		[state.initialRole],
	);

	const handleApplyCorrection = useCallback(
		async (rulers: RulersVector) => {
			dispatch({ payload: { rulers }, type: 'APPLY_CORRECTION' });

			// Recompute match with new rulers
			const role = state.initialRole as InternalRoleId;
			const matchResult = matchLevels({
				correctionPolicy: getDefaultCorrectionPolicy(),
				hardBlocks: getDefaultHardBlocks(),
				levels: [...CANONICAL_LEVELS],
				prior: getDefaultPrior(),
				thresholds: getDefaultThresholds(),
				user: { initialRole: role, rulers },
				weights: DEFAULT_WEIGHTS,
			});

			const levelMatch: LevelMatch = {
				candidates: matchResult.candidates.map((c) => ({
					confidence:
						c.score >= 0.9 ? 'high' : c.score >= 0.7 ? 'medium' : 'low',
					distance: c.distance,
					id: c.levelId,
					reasons: c.reasons,
					score: c.score,
				})),
				correctionSuggestions: matchResult.correctionsSuggested.map(
					(s, _i) => ({
						changes: Object.entries(s.delta).map(([ruler, step]) => {
							const from = rulers[ruler as keyof RulersVector];
							return {
								from,
								ruler: ruler as keyof RulersVector,
								to: Math.max(1, Math.min(5, from + step)) as 1 | 2 | 3 | 4 | 5,
							};
						}),
						id: s.id,
						message: s.label,
					}),
				),
				hardBlocks: matchResult.blocked.isBlocked
					? matchResult.blocked.reasons.map((r, i) => ({
							code: `block-${i}`,
							message: r,
							severity: 'blocking' as const,
						}))
					: [],
				selected: matchResult.selectedLevel
					? {
							confidence: 'high',
							id: matchResult.selectedLevel,
							score: matchResult.score ?? 0,
						}
					: undefined,
				status: matchResult.blocked.isBlocked
					? 'blocked'
					: matchResult.selectedLevel
						? 'matched'
						: 'ambiguous',
			};

			dispatch({ payload: levelMatch, type: 'SET_MATCH' });

			if (_sessionId) {
				try {
					await saveMatch(_sessionId, levelMatch);
				} catch {
					// Silently fail
				}
			}
		},
		[state.initialRole, _sessionId],
	);

	const handleCollectionSubmit = useCallback(
		async (answers: CollectionAnswer[]) => {
			dispatch({ payload: answers, type: 'SET_COLLECTION_ANSWERS' });

			// Build contract
			if (
				state.rawIntent &&
				state.initialRole &&
				state.rulers &&
				state.levelMatch
			) {
				try {
					const _protocol = state.collectionProtocol ?? {
						contractId: generateId(),
						questions: [],
						status: 'ready',
						version: CONTRACT_VERSION,
					};

					const collectedCriteria: Record<string, unknown> = {};
					for (const answer of answers) {
						collectedCriteria[answer.questionId] = answer.value;
					}

					const contract: CognitiveContract = {
						collectedCriteria,
						createdAt: new Date().toISOString(),
						id: generateId(),
						initialRole: state.initialRole,
						levelMatch: state.levelMatch,
						locale: 'pt-BR',
						rawIntent: state.rawIntent,
						rulers: state.rulers,
						version: CONTRACT_VERSION,
					};

					const validation = CognitiveContractSchema.safeParse(contract);
					if (!validation.success) {
						dispatch({
							payload: `Erro de validação: ${validation.error.message}`,
							type: 'SET_ERROR',
						});
						return;
					}

					dispatch({ payload: contract, type: 'SET_CONTRACT' });
					if (_sessionId) {
						try {
							await saveContract(_sessionId, contract);
						} catch {
							// Silently fail
						}
					}
					dispatch({ type: 'ADVANCE_STEP' });
				} catch (err) {
					dispatch({
						payload: err instanceof Error ? err.message : 'Erro desconhecido',
						type: 'SET_ERROR',
					});
				}
			}
		},
		[
			state.rawIntent,
			state.initialRole,
			state.rulers,
			state.levelMatch,
			state.collectionProtocol,
			_sessionId,
		],
	);

	const handleGenerate = useCallback(async () => {
		if (!state.contract) return;

		dispatch({ type: 'START_GENERATING' });

		try {
			const result = generateMockPromptResult({
				answers: state.collectionAnswers,
				collectionProtocol: state.collectionProtocol,
				contract: state.contract,
				version: CONTRACT_VERSION,
			});

			dispatch({ payload: result, type: 'FINISH_GENERATING' });
			if (_sessionId) {
				try {
					await savePromptResult(_sessionId, result);
				} catch {
					// Silently fail
				}
			}
			dispatch({ type: 'ADVANCE_STEP' });
		} catch (err) {
			dispatch({
				payload: err instanceof Error ? err.message : 'Erro ao gerar prompt',
				type: 'SET_ERROR',
			});
		}
	}, [
		state.contract,
		state.collectionAnswers,
		state.collectionProtocol,
		_sessionId,
	]);

	const handleNewPrompt = useCallback(() => {
		dispatch({ type: 'RESET' });
	}, []);

	const handleMatchAdvance = useCallback(() => {
		// Generate mock protocol when advancing from match
		if (state.contract) {
			try {
				const protocol = deriveMockCollectionProtocol(state.contract);
				dispatch({ payload: protocol, type: 'SET_COLLECTION_PROTOCOL' });
			} catch (_err) {
				// If contract not ready, we'll generate it after collection
			}
		}
		dispatch({ type: 'ADVANCE_STEP' });
	}, [state.contract]);

	return (
		<AppShell>
			<div className="space-y-8">
				<div className="space-y-2">
					<h1 className="font-serif text-2xl font-bold text-haci-text">
						Novo Prompt
					</h1>
					<StepIndicator steps={stepIndicatorSteps} />
				</div>

				{state.error && (
					<Callout tone="danger">
						<p>{state.error}</p>
						<Button
							className="mt-2"
							onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
							size="sm"
							variant="ghost"
						>
							Limpar erro
						</Button>
					</Callout>
				)}

				<div className="rounded-xl border border-haci-border bg-haci-surface p-6">
					{state.currentStep === 'intent' && (
						<IntentStep onSubmit={handleIntentSubmit} />
					)}

					{state.currentStep === 'role' && (
						<RoleStep
							onSelect={handleRoleSelect}
							selectedRole={state.initialRole}
						/>
					)}

					{state.currentStep === 'rulers' && (
						<RulersStep
							initialRulers={state.rulers}
							onSubmit={handleRulersSubmit}
						/>
					)}

					{state.currentStep === 'match' && state.levelMatch && (
						<MatchStep
							levelMatch={state.levelMatch}
							onAdvance={handleMatchAdvance}
							onApplyCorrection={handleApplyCorrection}
							onGoBack={handleGoBack}
						/>
					)}

					{state.currentStep === 'collection' && state.collectionProtocol && (
						<CollectionStep
							answers={state.collectionAnswers}
							onGoBack={handleGoBack}
							onSubmit={handleCollectionSubmit}
							protocol={state.collectionProtocol}
						/>
					)}

					{state.currentStep === 'review' && state.contract && (
						<ReviewStep
							answers={state.collectionAnswers}
							contract={state.contract}
							onGenerate={handleGenerate}
							onGoBack={handleGoBack}
						/>
					)}

					{state.currentStep === 'result' && state.promptResult && (
						<ResultStep
							onNewPrompt={handleNewPrompt}
							promptResult={state.promptResult}
						/>
					)}
				</div>

				{state.debugEnabled && (
					<DebugContractPanel
						collectionAnswers={state.collectionAnswers}
						collectionProtocol={state.collectionProtocol}
						contract={state.contract}
						initialRole={state.initialRole}
						levelMatch={state.levelMatch}
						promptResult={state.promptResult}
						rawIntent={state.rawIntent}
						rulers={state.rulers}
					/>
				)}

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							onClick={() => dispatch({ type: 'TOGGLE_DEBUG' })}
							size="sm"
							variant="ghost"
						>
							{state.debugEnabled ? 'Ocultar debug' : 'Mostrar debug'}
						</Button>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
