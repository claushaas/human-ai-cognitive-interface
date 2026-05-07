/**
 * JSON parsing and extraction — safe, no eval, no Function constructor.
 */

import { LlmInvalidJsonError } from './errors';

/**
 * Try to parse JSON directly first, then extract from markdown code block.
 */
export function extractJsonObject(text: string): unknown {
	const trimmed = text.trim();

	// Direct parse
	try {
		return JSON.parse(trimmed);
	} catch {
		// continue to extraction
	}

	// Extract from ```json ... ``` block
	const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (blockMatch?.[1]) {
		try {
			return JSON.parse(blockMatch[1].trim());
		} catch {
			// continue
		}
	}

	// Try to find first { ... } or [ ... ] at top level
	const objectMatch = trimmed.match(/^(\{[\s\S]*\})\s*$/);
	if (objectMatch?.[1]) {
		try {
			return JSON.parse(objectMatch[1]);
		} catch {
			// continue
		}
	}

	const arrayMatch = trimmed.match(/^(\[[\s\S]*\])\s*$/);
	if (arrayMatch?.[1]) {
		try {
			return JSON.parse(arrayMatch[1]);
		} catch {
			// continue
		}
	}

	throw new LlmInvalidJsonError(
		'Não foi possível extrair JSON válido da resposta.',
		{
			rawContent:
				trimmed.length > 500 ? `${trimmed.slice(0, 500)}...` : trimmed,
		},
	);
}

/**
 * Parse JSON or throw controlled error.
 */
export function parseJsonOrThrow(text: string): unknown {
	try {
		return JSON.parse(text.trim());
	} catch {
		return extractJsonObject(text);
	}
}
