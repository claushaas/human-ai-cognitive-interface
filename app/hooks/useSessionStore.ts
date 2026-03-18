import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InitialRoleId, RulersVector } from '../../types';

export type OperationMode =
	| 'MODE_PREPARATION'
	| 'MODE_GOVERNANCE'
	| 'MODE_EXECUTION';

export interface SessionState {
	// Session identification
	sessionId: string | null;

	// Current operation mode
	mode: OperationMode;

	// Current stage (0-2)
	currentStage: number;

	// Stage 0: Initial role selection
	selectedRole: InitialRoleId | null;

	// Stage 1: Rulers configuration
	rulers: RulersVector | null;

	// Stage 1: Match result
	levelMatch: {
		selectedLevel: string;
		score: number;
		candidates: Array<{ level: string; score: number }>;
	} | null;

	// Actions
	setSessionId: (id: string) => void;
	setMode: (mode: OperationMode) => void;
	setCurrentStage: (stage: number) => void;
	setSelectedRole: (role: InitialRoleId) => void;
	setRulers: (rulers: RulersVector) => void;
	setLevelMatch: (match: SessionState['levelMatch']) => void;
	reset: () => void;
}

const initialState: Omit<
	SessionState,
	| 'setSessionId'
	| 'setMode'
	| 'setCurrentStage'
	| 'setSelectedRole'
	| 'setRulers'
	| 'setLevelMatch'
	| 'reset'
> = {
	currentStage: 0,
	levelMatch: null,
	mode: 'MODE_PREPARATION',
	rulers: null,
	selectedRole: null,
	sessionId: null,
};

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			...initialState,
			reset: () => set(initialState),
			setCurrentStage: (stage) => set({ currentStage: stage }),
			setLevelMatch: (levelMatch) => set({ levelMatch }),
			setMode: (mode) => set({ mode }),
			setRulers: (rulers) => set({ rulers }),
			setSelectedRole: (role) => set({ selectedRole: role }),

			setSessionId: (id) => set({ sessionId: id }),
		}),
		{
			name: 'haci-session-storage',
			partialize: (state) => ({
				currentStage: state.currentStage,
				levelMatch: state.levelMatch,
				mode: state.mode,
				rulers: state.rulers,
				selectedRole: state.selectedRole,
				sessionId: state.sessionId,
			}),
		},
	),
);
