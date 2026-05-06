import { describe, expect, it } from 'vitest';
import { haciTokens } from '~/styles/theme';

describe('haciTokens', () => {
	it('contém todos os tokens semânticos obrigatórios', () => {
		const expected = [
			'bg',
			'surface',
			'surface-subtle',
			'text',
			'text-muted',
			'text-subtle',
			'border',
			'border-strong',
			'accent',
			'accent-soft',
			'accent-ink',
			'accent-contrast',
			'warning',
			'warning-surface',
			'danger',
			'danger-surface',
			'success',
			'success-surface',
			'focus',
			'shadow',
		];

		for (const key of expected) {
			expect(haciTokens[key as keyof typeof haciTokens]).toBeDefined();
		}
	});

	it('todos os tokens são strings não vazias', () => {
		for (const [_key, value] of Object.entries(haciTokens)) {
			expect(typeof value).toBe('string');
			expect(value.length).toBeGreaterThan(0);
			expect(value).not.toBe('');
		}
	});

	it('tokens de cor usam oklch ou hex', () => {
		for (const [key, value] of Object.entries(haciTokens)) {
			const isOklch = value.startsWith('oklch(');
			const isHex = value.startsWith('#');
			expect(
				isOklch || isHex,
				`Token ${key} deve usar oklch ou hex, mas usou: ${value}`,
			).toBe(true);
		}
	});

	it('accent contrast é diferente do accent base', () => {
		const contrast = haciTokens['accent-contrast'];
		const accent = haciTokens.accent;
		expect(contrast).not.toBe(accent);
		expect(contrast).toContain('oklch(');
	});
});
