/**
 * Session export utilities — server-side only.
 */

import { and, asc, eq, isNull } from 'drizzle-orm';
import type { DbClient } from './client.server';
import { collectionAnswers, sessions, users } from './schema';
import {
	deserializeContract,
	deserializeLevelMatch,
	deserializePromptResult,
	deserializeRawIntent,
	deserializeRulers,
} from './sessions.server';

export type ExportFormat = 'json' | 'markdown';

export type SessionExportData = {
	answers: Array<{
		answerJson: string;
		questionId: string;
	}>;
	contract: unknown;
	createdAt: string;
	desiredOutcome: string | null;
	id: string;
	inputText: string;
	levelMatch: unknown;
	locale: string;
	model: string | null;
	prompt: string | null;
	promptResult: unknown;
	rawIntent: unknown;
	rulers: unknown;
	status: string;
	title: string | null;
	user: {
		email: string;
		name: string | null;
	};
	variablesCollected: number;
};

export async function exportSessionData(
	db: DbClient,
	sessionId: string,
	userId: string,
): Promise<SessionExportData | null> {
	const session = await db
		.select()
		.from(sessions)
		.where(
			and(
				eq(sessions.id, sessionId),
				eq(sessions.userId, userId),
				isNull(sessions.deletedAt),
			),
		)
		.limit(1);

	if (session.length === 0) return null;

	const s = session[0];

	const [userResult, answers] = await Promise.all([
		db.select().from(users).where(eq(users.id, s.userId)).limit(1),
		db
			.select()
			.from(collectionAnswers)
			.where(eq(collectionAnswers.sessionId, sessionId))
			.orderBy(asc(collectionAnswers.questionId)),
	]);

	const user = userResult[0];

	return {
		answers: answers.map((a: (typeof answers)[number]) => ({
			answerJson: a.answerJson,
			questionId: a.questionId,
		})),
		contract: deserializeContract(s),
		createdAt: s.createdAt,
		desiredOutcome: s.desiredOutcome,
		id: s.id,
		inputText: s.inputText,
		levelMatch: deserializeLevelMatch(s),
		locale: s.locale,
		model: s.model,
		prompt: s.prompt,
		promptResult: deserializePromptResult(s),
		rawIntent: deserializeRawIntent(s),
		rulers: deserializeRulers(s),
		status: s.status,
		title: s.title,
		user: user
			? {
					email: user.email ?? 'unknown',
					name: user.name,
				}
			: { email: 'unknown', name: null },
		variablesCollected: answers.length,
	};
}

export function formatAsMarkdown(data: SessionExportData): string {
	const sections: string[] = [];

	sections.push(`# ${data.title ?? 'Sessão HACI'}`);
	sections.push('');
	sections.push(`**ID:** ${data.id}`);
	sections.push(`**Criada:** ${data.createdAt}`);
	sections.push(`**Status:** ${data.status}`);
	sections.push(`**Usuário:** ${data.user.email}`);
	sections.push('');

	sections.push('## Entrada Inicial');
	sections.push('');
	sections.push(data.inputText);
	if (data.desiredOutcome) {
		sections.push('');
		sections.push(`**Resultado Desejado:** ${data.desiredOutcome}`);
	}
	if (data.rawIntent) {
		sections.push('');
		sections.push('```json');
		sections.push(JSON.stringify(data.rawIntent, null, 2));
		sections.push('```');
	}
	sections.push('');

	if (data.rulers) {
		sections.push('## Réguas Selecionadas');
		sections.push('');
		sections.push('```json');
		sections.push(JSON.stringify(data.rulers, null, 2));
		sections.push('```');
		sections.push('');
	}

	if (data.levelMatch) {
		sections.push('## Match de Níveis');
		sections.push('');
		sections.push('```json');
		sections.push(JSON.stringify(data.levelMatch, null, 2));
		sections.push('```');
		sections.push('');
	}

	if (data.answers.length > 0) {
		sections.push('## Respostas Coletadas');
		sections.push('');
		for (const answer of data.answers) {
			sections.push(`### ${answer.questionId}`);
			sections.push('');
			sections.push('```json');
			sections.push(JSON.stringify(JSON.parse(answer.answerJson), null, 2));
			sections.push('```');
			sections.push('');
		}
	}

	if (data.contract) {
		sections.push('## Contrato Cognitivo');
		sections.push('');
		sections.push('```json');
		sections.push(JSON.stringify(data.contract, null, 2));
		sections.push('```');
		sections.push('');
	}

	if (data.prompt) {
		sections.push('## Prompt Gerado');
		sections.push('');
		sections.push('```markdown');
		sections.push(data.prompt);
		sections.push('```');
		if (data.model) {
			sections.push('');
			sections.push(`**Modelo:** ${data.model}`);
		}
		sections.push('');
	}

	if (data.promptResult) {
		sections.push('## Resultado do Prompt');
		sections.push('');
		sections.push('```json');
		sections.push(JSON.stringify(data.promptResult, null, 2));
		sections.push('```');
		sections.push('');
	}

	sections.push('---');
	sections.push(`*Exportado via HACI — ${new Date().toISOString()}*`);

	return sections.join('\n');
}

export function formatAsJson(data: SessionExportData): string {
	return JSON.stringify(data, null, 2);
}
