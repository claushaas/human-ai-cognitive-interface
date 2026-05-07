import { describe, expect, it } from 'vitest';
import {
	redactSensitiveKeys,
	redactSensitiveValue,
} from '../../../app/lib/export/redaction.server';
import partialPayload from '../../fixtures/debug/debug-payload-partial-session.json';
import safePayload from '../../fixtures/debug/debug-payload-safe.json';
import secretsPayload from '../../fixtures/debug/debug-payload-with-secrets.json';

describe('redaction.server', () => {
	describe('redactSensitiveValue', () => {
		it('masks string values', () => {
			const result = redactSensitiveValue('secret-token-12345');
			expect(result).toContain('REDACTED');
		});

		it('returns primitives unchanged', () => {
			expect(redactSensitiveValue(42)).toBe(42);
			expect(redactSensitiveValue(true)).toBe(true);
			expect(redactSensitiveValue(null)).toBe(null);
		});
	});

	describe('redactSensitiveKeys', () => {
		it('removes/masks apiKey', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			expect(result.apiKey).not.toBe('sk-test-1234567890abcdef');
			expect(String(result.apiKey)).toContain('REDACTED');
		});

		it('removes/masks authorization', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			expect(result.authorization).not.toBe('Bearer secret-token-12345');
			expect(String(result.authorization)).toContain('REDACTED');
		});

		it('removes/masks cookie', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			const nested = result.nested as Record<string, unknown> | undefined;
			const deep = nested?.deep as Record<string, unknown> | undefined;
			expect(String(deep?.cookie)).toContain('REDACTED');
		});

		it('removes/masks jwt', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			expect(result.jwt).not.toBe(
				(secretsPayload as Record<string, string>).jwt,
			);
			expect(String(result.jwt)).toContain('REDACTED');
		});

		it('removes/masks token', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			expect(result.token).not.toBe('csrf-token-abc123');
			expect(String(result.token)).toContain('REDACTED');
		});

		it('removes/masks secret', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			expect(result.secret).not.toBe('my-app-secret');
			expect(String(result.secret)).toContain('REDACTED');
		});

		it('works on nested objects', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			const nested = result.nested as Record<string, unknown> | undefined;
			expect(nested?.apiKey).not.toBe('nested-key-123');
			expect(String(nested?.apiKey)).toContain('REDACTED');
			expect(nested?.safeField).toBe('this is safe');
			const deep = nested?.deep as Record<string, unknown> | undefined;
			expect(String(deep?.authorization)).toContain('REDACTED');
		});

		it('works on arrays', () => {
			const result = redactSensitiveKeys(secretsPayload) as Record<
				string,
				unknown
			>;
			const arr = result.arrayWithSecrets as
				| Array<Record<string, unknown>>
				| undefined;
			expect(arr).toBeDefined();
			expect(arr?.[0]?.token).not.toBe('array-token-1');
			expect(String(arr?.[0]?.token)).toContain('REDACTED');
			expect(arr?.[2]?.safe).toBe('visible');
		});

		it('does not mutate original object', () => {
			const original = { apiKey: 'secret', safe: 'value' };
			const copy = { ...original };
			redactSensitiveKeys(original);
			expect(original.apiKey).toBe(copy.apiKey);
			expect(original.safe).toBe(copy.safe);
		});

		it('does not alter safe payloads', () => {
			const result = redactSensitiveKeys(safePayload);
			expect(result).toEqual(safePayload);
		});

		it('does not break on partial sessions', () => {
			const result = redactSensitiveKeys(partialPayload);
			expect(result).toEqual(partialPayload);
		});
	});
});
