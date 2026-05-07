/**
 * JSON repair tests.
 */

import { describe, expect, it } from 'vitest';
import { LlmInvalidJsonError } from '~/lib/llm/errors';
import {
	extractJsonObject,
	parseJsonOrThrow,
} from '~/lib/llm/json-repair.server';

describe('extractJsonObject', () => {
	it('parses valid JSON directly', () => {
		const data = { test: true, value: 42 };
		const result = extractJsonObject(JSON.stringify(data));
		expect(result).toEqual(data);
	});

	it('extracts JSON from markdown code block', () => {
		const text = '```json\n{"test": true}\n```';
		const result = extractJsonObject(text);
		expect(result).toEqual({ test: true });
	});

	it('extracts JSON from plain code block', () => {
		const text = '```\n{"test": true}\n```';
		const result = extractJsonObject(text);
		expect(result).toEqual({ test: true });
	});

	it('throws on invalid JSON', () => {
		expect(() => extractJsonObject('not json')).toThrow(LlmInvalidJsonError);
	});

	it('throws on ambiguous text', () => {
		expect(() =>
			extractJsonObject('Here is some text and { partial json'),
		).toThrow(LlmInvalidJsonError);
	});
});

describe('parseJsonOrThrow', () => {
	it('parses valid JSON', () => {
		const result = parseJsonOrThrow('{"test": true}');
		expect(result).toEqual({ test: true });
	});

	it('extracts from code block when direct parse fails', () => {
		const result = parseJsonOrThrow('```json\n{"test": true}\n```');
		expect(result).toEqual({ test: true });
	});

	it('throws on unrecoverable JSON', () => {
		expect(() => parseJsonOrThrow('this is not json {')).toThrow(
			LlmInvalidJsonError,
		);
	});
});
