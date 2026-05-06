import { describe, expect, it } from 'vitest';

describe('tokens.css', () => {
	it('tokens CSS estão definidos no documento quando disponível', () => {
		if (typeof document === 'undefined') {
			return;
		}

		const root = document.documentElement;
		const bg = getComputedStyle(root).getPropertyValue('--haci-bg');
		const text = getComputedStyle(root).getPropertyValue('--haci-text');
		const accent = getComputedStyle(root).getPropertyValue('--haci-accent');

		expect(bg).toBeTruthy();
		expect(text).toBeTruthy();
		expect(accent).toBeTruthy();
	});

	it('tokens CSS usam oklch', () => {
		if (typeof document === 'undefined') {
			return;
		}

		const root = document.documentElement;
		const bg = getComputedStyle(root).getPropertyValue('--haci-bg');
		expect(bg).toContain('oklch');
	});
});
