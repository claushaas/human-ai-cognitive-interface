import { describe, expect, it } from 'vitest';
import {
	exportSessionAsJson,
	exportSessionAsMarkdown,
} from '../../../app/lib/export/session-export.server';
import completedSession from '../../fixtures/export/completed-session-export-input.json';
import draftSession from '../../fixtures/export/draft-session-export-input.json';
import feedbackSession from '../../fixtures/export/session-with-feedback-export-input.json';
import llmSession from '../../fixtures/export/session-with-llm-metadata-export-input.json';

describe('session-export.server', () => {
	describe('exportSessionAsMarkdown', () => {
		it('contains intention original', () => {
			const markdown = exportSessionAsMarkdown(completedSession);
			expect(markdown).toContain('Quero aprender Python do zero');
		});

		it('contains prompt final when completed', () => {
			const session = {
				...completedSession,
				prompt: 'Você é um mentor experiente em Python...',
			};
			const markdown = exportSessionAsMarkdown(session);
			expect(markdown).toContain('Você é um mentor experiente em Python...');
		});

		it('informs absence of prompt when draft', () => {
			const markdown = exportSessionAsMarkdown(draftSession);
			expect(markdown).toContain('Sessão ainda em rascunho');
		});

		it('contains feedback when exists', () => {
			const markdown = exportSessionAsMarkdown(feedbackSession);
			expect(markdown).toContain('Feedback positivo registrado');
		});

		it('contains model metadata when exists', () => {
			const markdown = exportSessionAsMarkdown(llmSession);
			expect(markdown).toContain('deepseek-v4-flash');
		});

		it('does not contain API key', () => {
			const markdown = exportSessionAsMarkdown(completedSession);
			expect(markdown).not.toContain('apiKey');
			expect(markdown).not.toContain('sk-');
		});

		it('does not contain JWT', () => {
			const markdown = exportSessionAsMarkdown(completedSession);
			expect(markdown).not.toContain('jwt');
			expect(markdown).not.toContain('eyJhbGci');
		});

		it('is written in Portuguese by default', () => {
			const markdown = exportSessionAsMarkdown(completedSession);
			expect(markdown).toContain('Sessão de Prompt');
			expect(markdown).toContain('Intenção original');
			expect(markdown).toContain('Papel escolhido');
		});
	});

	describe('exportSessionAsJson', () => {
		it('contains contract/match/promptResult', () => {
			const json = exportSessionAsJson(completedSession) as Record<
				string,
				unknown
			>;
			expect(json.cognitiveContract).toBeDefined();
			expect(json.levelMatch).toBeDefined();
			expect(json.promptResult).toBeDefined();
		});

		it('passes through redaction', () => {
			const sessionWithSecret = {
				...completedSession,
				promptResult: {
					...completedSession.promptResult,
					apiKey: 'sk-secret-123',
				},
			};
			const json = exportSessionAsJson(sessionWithSecret) as Record<
				string,
				unknown
			>;
			const promptResult = json.promptResult as
				| Record<string, unknown>
				| undefined;
			expect(promptResult?.apiKey).not.toBe('sk-secret-123');
			expect(String(promptResult?.apiKey)).toContain('REDACTED');
		});

		it('is versioned', () => {
			const json = exportSessionAsJson(completedSession) as Record<
				string,
				unknown
			>;
			expect(json.version).toContain('v1');
			expect(json.exportedAt).toBeDefined();
		});
	});
});
