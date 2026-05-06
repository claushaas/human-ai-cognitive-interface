import { createPaletteKit } from '@clhaas/palette-kit';

const palette = createPaletteKit({
	context: 'light',
	intents: {
		brand: { chroma: 0.08, hue: 260 },
		danger: { chroma: 0.11, hue: 32 },
		neutral: { chroma: 0.018, hue: 70 },
		success: { chroma: 0.07, hue: 145 },
		warning: { chroma: 0.095, hue: 70 },
	},
	output: 'oklch',
	preset: 'soft',
	resolverConfig: {
		relationParams: {
			on: { contrastTarget: 75 },
		},
	},
});

function oklchToCss(
	value: { alpha?: number; c: number; h: number; l: number },
	customAlpha?: number,
): string {
	const alpha = customAlpha ?? value.alpha ?? 1;
	if (alpha < 1) {
		return `oklch(${value.l.toFixed(3)} ${value.c.toFixed(4)} ${value.h.toFixed(2)} / ${alpha.toFixed(3)})`;
	}
	return `oklch(${value.l.toFixed(3)} ${value.c.toFixed(4)} ${value.h.toFixed(2)})`;
}

const bg = palette.resolve({ intent: 'neutral', level: 1, usage: 'fill' });
const surface = palette.resolve({ intent: 'neutral', level: 2, usage: 'fill' });
const surfaceSubtle = palette.resolve({
	intent: 'neutral',
	level: 3,
	usage: 'fill',
});

const text = palette.resolve({
	intent: 'neutral',
	on: bg,
	usage: 'visualVocabulary',
});
const textMuted = palette.resolve({
	intent: 'neutral',
	level: 7,
	usage: 'fill',
});
const textSubtle = palette.resolve({
	intent: 'neutral',
	level: 6,
	usage: 'fill',
});

const border = palette.resolve({ intent: 'neutral', level: 3, usage: 'lines' });
const borderStrong = palette.resolve({
	intent: 'neutral',
	level: 4,
	usage: 'lines',
});

const accent = palette.resolve({ intent: 'brand', level: 5, usage: 'fill' });
const accentSoft = palette.resolve({
	intent: 'brand',
	level: 2,
	usage: 'fill',
});
const accentInk = palette.resolve({
	intent: 'brand',
	level: 7,
	usage: 'fill',
});
const accentContrast = palette.resolve({
	intent: 'neutral',
	on: accent,
	usage: 'visualVocabulary',
});

const warning = palette.resolve({
	intent: 'warning',
	level: 5,
	usage: 'fill',
});
const warningSurface = palette.resolve({
	intent: 'warning',
	level: 2,
	usage: 'fill',
});

const danger = palette.resolve({ intent: 'danger', level: 5, usage: 'fill' });
const dangerSurface = palette.resolve({
	intent: 'danger',
	level: 2,
	usage: 'fill',
});

const success = palette.resolve({
	intent: 'success',
	level: 5,
	usage: 'fill',
});
const successSurface = palette.resolve({
	intent: 'success',
	level: 2,
	usage: 'fill',
});

const focus = palette.resolve({ intent: 'brand', level: 6, usage: 'fill' });
const shadowBase = palette.resolve({
	intent: 'neutral',
	level: 4,
	usage: 'overlays',
});

export const haciTokens = {
	accent: oklchToCss(accent),
	'accent-contrast': oklchToCss(accentContrast),
	'accent-ink': oklchToCss(accentInk),
	'accent-soft': oklchToCss(accentSoft),
	bg: oklchToCss(bg),
	border: oklchToCss(border),
	'border-strong': oklchToCss(borderStrong),
	danger: oklchToCss(danger),
	'danger-surface': oklchToCss(dangerSurface),
	focus: oklchToCss(focus),
	shadow: oklchToCss(shadowBase, 0.12),
	success: oklchToCss(success),
	'success-surface': oklchToCss(successSurface),
	surface: oklchToCss(surface),
	'surface-subtle': oklchToCss(surfaceSubtle),
	text: oklchToCss(text),
	'text-muted': oklchToCss(textMuted),
	'text-subtle': oklchToCss(textSubtle),
	warning: oklchToCss(warning),
	'warning-surface': oklchToCss(warningSurface),
} as const;

export type HaciToken = keyof typeof haciTokens;

export function generateThemeCss(): string {
	const lines: string[] = [':root {'];
	for (const [key, value] of Object.entries(haciTokens)) {
		const cssVar = `--haci-${key}`;
		lines.push(`  ${cssVar}: ${value};`);
	}
	lines.push('}');
	return lines.join('\n');
}
