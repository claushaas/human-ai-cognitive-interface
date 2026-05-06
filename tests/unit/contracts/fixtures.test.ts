import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	CognitiveContractSchema,
	PromptGenerationResultSchema,
} from '~/domain/contracts';

function loadJson(path: string): unknown {
	const fullPath = resolve(process.cwd(), path);
	return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

describe('Fixtures de contratos', () => {
	it('valid-contract-v1.json passa no schema', () => {
		const data = loadJson('tests/fixtures/contracts/valid-contract-v1.json');
		const result = CognitiveContractSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('invalid-contract-decision-4.json falha por decision=4', () => {
		const data = loadJson(
			'tests/fixtures/contracts/invalid-contract-decision-4.json',
		);
		const result = CognitiveContractSchema.safeParse(data);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path.join('.'));
			const hasDecisionPath = paths.some((path) => path.includes('decision'));
			expect(hasDecisionPath).toBe(true);
		}
	});

	it('invalid-contract-missing-required.json falha por campos ausentes', () => {
		const data = loadJson(
			'tests/fixtures/contracts/invalid-contract-missing-required.json',
		);
		const result = CognitiveContractSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('invalid-locale.json falha por locale inválido', () => {
		const data = loadJson('tests/fixtures/contracts/invalid-locale.json');
		const result = CognitiveContractSchema.safeParse(data);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path.join('.'));
			const hasLocaleIssue = paths.some((path) => path.includes('locale'));
			expect(hasLocaleIssue).toBe(true);
		}
	});
});

describe('Fixtures de LLM', () => {
	it('valid-prompt-result.json passa no schema', () => {
		const data = loadJson('tests/fixtures/llm/valid-prompt-result.json');
		const result = PromptGenerationResultSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('invalid-json-result.json falha por prompt vazio', () => {
		const data = loadJson('tests/fixtures/llm/invalid-json-result.json');
		const result = PromptGenerationResultSchema.safeParse(data);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path.join('.'));
			const hasPromptIssue = paths.some((path) => path.includes('prompt'));
			expect(hasPromptIssue).toBe(true);
		}
	});
});
