/**
 * Client-side persistence helpers for PromptSessionFlow.
 *
 * These functions call server actions to save session progress.
 */

import type {
	CognitiveContract,
	CollectionProtocol,
	InitialRole,
	LevelMatch,
	PromptGenerationResult,
	RawIntent,
	RulersVector,
} from '~/domain/contracts';

export async function saveIntent(
	sessionId: string,
	rawIntent: RawIntent,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'saveIntent');
	formData.append('rawIntent', JSON.stringify(rawIntent));

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save intent: ${response.status}`);
	}
}

export async function saveRoleAndRulers(
	sessionId: string,
	initialRole: InitialRole,
	rulers: RulersVector,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'saveRoleAndRulers');
	formData.append('initialRole', initialRole);
	formData.append('rulers', JSON.stringify(rulers));

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save role and rulers: ${response.status}`);
	}
}

export async function saveMatch(
	sessionId: string,
	levelMatch: LevelMatch,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'saveMatch');
	formData.append('levelMatch', JSON.stringify(levelMatch));

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save match: ${response.status}`);
	}
}

export async function saveCollectionProtocol(
	sessionId: string,
	protocol: CollectionProtocol,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'saveCollectionProtocol');
	formData.append('protocol', JSON.stringify(protocol));

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save collection protocol: ${response.status}`);
	}
}

export async function saveContract(
	sessionId: string,
	contract: CognitiveContract,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'saveContract');
	formData.append('contract', JSON.stringify(contract));

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save contract: ${response.status}`);
	}
}

export async function generatePrompt(sessionId: string): Promise<{
	success: boolean;
	promptResult?: PromptGenerationResult;
	error?: string;
	errorCode?: string;
	rateLimited?: boolean;
}> {
	const formData = new FormData();
	formData.append('_action', 'generatePrompt');

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		return {
			error: `Failed to generate prompt: ${response.status}`,
			success: false,
		};
	}

	return response.json() as Promise<{
		success: boolean;
		promptResult?: PromptGenerationResult;
		error?: string;
		errorCode?: string;
		rateLimited?: boolean;
	}>;
}

export async function savePromptResult(
	sessionId: string,
	promptResult: PromptGenerationResult,
	model?: string,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'savePromptResult');
	formData.append('promptResult', JSON.stringify(promptResult));
	if (model) formData.append('model', model);

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to save prompt result: ${response.status}`);
	}
}

export async function markSessionFailed(
	sessionId: string,
	error: string,
): Promise<void> {
	const formData = new FormData();
	formData.append('_action', 'markFailed');
	formData.append('error', error);

	const response = await fetch(`/app/session/${sessionId}`, {
		body: formData,
		method: 'POST',
	});

	if (!response.ok) {
		throw new Error(`Failed to mark session failed: ${response.status}`);
	}
}
