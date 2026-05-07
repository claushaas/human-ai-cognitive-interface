import { describe, expect, it } from 'vitest';
import type { SessionExportData } from '../../../app/lib/db/session-export.server';
import {
	formatAsJson,
	formatAsMarkdown,
} from '../../../app/lib/db/session-export.server';

describe('session-export.server', () => {
	const mockData: SessionExportData = {
		answers: [
			{
				answerJson: '"Iniciante completo"',
				questionId: 'q1',
			},
		],
		contract: {
			collectedCriteria: { q1: 'Iniciante completo' },
			createdAt: '2026-05-01T10:05:00.000Z',
			id: 'contract-001',
			initialRole: 'mentor',
			levelMatch: { status: 'matched' },
			locale: 'pt-BR',
			rawIntent: {
				locale: 'pt-BR',
				text: 'Quero aprender Python',
				version: 'v1',
			},
			rulers: { depth: 3 },
			version: 'v1',
		},
		createdAt: '2026-05-01T10:00:00.000Z',
		desiredOutcome: 'Conseguir criar scripts básicos',
		id: 'sess-001',
		inputText: 'Quero aprender Python do zero',
		levelMatch: { status: 'matched' },
		locale: 'pt-BR',
		model: 'deepseek-v4-flash',
		prompt: 'Você é um mentor...',
		promptResult: { prompt: 'Você é um mentor...', version: 'v1' },
		rawIntent: {
			locale: 'pt-BR',
			text: 'Quero aprender Python',
			version: 'v1',
		},
		rulers: { depth: 3 },
		status: 'completed',
		title: 'Aprender Python',
		user: { email: 'dev@haci.local', name: 'Developer' },
		variablesCollected: 1,
	};

	describe('formatAsMarkdown', () => {
		it('includes title and metadata', () => {
			const markdown = formatAsMarkdown(mockData);
			expect(markdown).toContain('# Aprender Python');
			expect(markdown).toContain('**ID:** sess-001');
			expect(markdown).toContain('**Status:** completed');
		});

		it('includes input text', () => {
			const markdown = formatAsMarkdown(mockData);
			expect(markdown).toContain('Quero aprender Python do zero');
		});

		it('includes desired outcome', () => {
			const markdown = formatAsMarkdown(mockData);
			expect(markdown).toContain('Conseguir criar scripts básicos');
		});

		it('includes prompt if present', () => {
			const markdown = formatAsMarkdown(mockData);
			expect(markdown).toContain('Você é um mentor...');
			expect(markdown).toContain('**Modelo:** deepseek-v4-flash');
		});

		it('does not include auth headers or secrets', () => {
			const markdown = formatAsMarkdown(mockData);
			expect(markdown).not.toContain('Authorization');
			expect(markdown).not.toContain('secret');
			expect(markdown).not.toContain('api_key');
		});
	});

	describe('formatAsJson', () => {
		it('produces valid JSON', () => {
			const json = formatAsJson(mockData);
			const parsed = JSON.parse(json);
			expect(parsed.id).toBe('sess-001');
			expect(parsed.status).toBe('completed');
		});

		it('does not include auth headers or secrets', () => {
			const json = formatAsJson(mockData);
			expect(json).not.toContain('Authorization');
			expect(json).not.toContain('secret');
			expect(json).not.toContain('api_key');
		});
	});

	describe('incomplete session', () => {
		it('does not break with missing optional fields', () => {
			const incomplete: SessionExportData = {
				answers: [],
				contract: null,
				createdAt: '2026-05-01T10:00:00.000Z',
				desiredOutcome: null,
				id: 'sess-draft',
				inputText: 'Draft input',
				levelMatch: null,
				locale: 'pt-BR',
				model: null,
				prompt: null,
				promptResult: null,
				rawIntent: null,
				rulers: null,
				status: 'draft',
				title: null,
				user: { email: 'dev@haci.local', name: null },
				variablesCollected: 0,
			};

			const markdown = formatAsMarkdown(incomplete);
			expect(markdown).toContain('Sessão HACI');
			expect(markdown).toContain('Draft input');

			const json = formatAsJson(incomplete);
			const parsed = JSON.parse(json);
			expect(parsed.status).toBe('draft');
		});
	});
});
