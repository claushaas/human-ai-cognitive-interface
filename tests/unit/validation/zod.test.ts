import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	formatZodIssues,
	parseOrThrow,
	safeParseWithIssues,
	ValidationError,
} from '~/lib/validation/zod';

const TestSchema = z.object({
	age: z.number().int().nonnegative(),
	name: z.string().min(1),
});

describe('parseOrThrow', () => {
	it('retorna dado parseado quando válido', () => {
		const data = { age: 30, name: 'Test' };
		const result = parseOrThrow(TestSchema, data);
		expect(result).toEqual(data);
	});

	it('lança ValidationError quando inválido', () => {
		expect(() => parseOrThrow(TestSchema, { age: -1, name: '' })).toThrow(
			ValidationError,
		);
	});

	it('mensagem de erro contém issues', () => {
		try {
			parseOrThrow(TestSchema, { age: -1, name: '' });
		} catch (error) {
			if (error instanceof ValidationError) {
				expect(error.issues.length).toBeGreaterThan(0);
				expect(error.message).toBe('Validation failed');
			}
		}
	});
});

describe('safeParseWithIssues', () => {
	it('retorna sucesso com dado válido', () => {
		const data = { age: 30, name: 'Test' };
		const result = safeParseWithIssues(TestSchema, data);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(data);
			expect(result.issues).toBeUndefined();
		}
	});

	it('retorna issues com dado inválido', () => {
		const result = safeParseWithIssues(TestSchema, { age: -1, name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.issues.length).toBeGreaterThan(0);
			expect(result.data).toBeUndefined();
		}
	});
});

describe('formatZodIssues', () => {
	it('inclui path e mensagem', () => {
		const result = TestSchema.safeParse({ age: -1, name: '' });
		if (!result.success) {
			const formatted = formatZodIssues(result.error.issues);
			expect(formatted.length).toBeGreaterThan(0);
			for (const line of formatted) {
				expect(typeof line).toBe('string');
				expect(line.length).toBeGreaterThan(0);
			}
		}
	});

	it('mostra (root) quando não há path', () => {
		const issues: z.ZodIssue[] = [
			{
				code: 'custom',
				message: 'Erro genérico',
				path: [],
			} as z.ZodIssue,
		];
		const formatted = formatZodIssues(issues);
		expect(formatted[0]).toContain('(root)');
	});
});
