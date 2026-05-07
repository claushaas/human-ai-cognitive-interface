import { describe, expect, it } from 'vitest';
import {
	FEEDBACK_VALUES,
	getFeedbackLabel,
	isFeedbackValue,
	normalizeFeedbackValue,
} from '../../../app/domain/feedback/feedback';

describe('feedback domain', () => {
	describe('isFeedbackValue', () => {
		it('accepts positive', () => {
			expect(isFeedbackValue('positive')).toBe(true);
		});

		it('accepts negative', () => {
			expect(isFeedbackValue('negative')).toBe(true);
		});

		it('rejects other strings', () => {
			expect(isFeedbackValue('maybe')).toBe(false);
			expect(isFeedbackValue('')).toBe(false);
			expect(isFeedbackValue('positive ')).toBe(false);
		});

		it('rejects non-strings', () => {
			expect(isFeedbackValue(1)).toBe(false);
			expect(isFeedbackValue(null)).toBe(false);
			expect(isFeedbackValue(undefined)).toBe(false);
			expect(isFeedbackValue({})).toBe(false);
		});
	});

	describe('normalizeFeedbackValue', () => {
		it('returns positive for positive', () => {
			expect(normalizeFeedbackValue('positive')).toBe('positive');
		});

		it('returns negative for negative', () => {
			expect(normalizeFeedbackValue('negative')).toBe('negative');
		});

		it('throws for invalid values', () => {
			expect(() => normalizeFeedbackValue('maybe')).toThrow();
			expect(() => normalizeFeedbackValue('')).toThrow();
		});
	});

	describe('getFeedbackLabel', () => {
		it('returns pt-BR labels by default', () => {
			expect(getFeedbackLabel('positive')).toBe('Sim');
			expect(getFeedbackLabel('negative')).toBe('Não');
		});

		it('returns en labels when requested', () => {
			expect(getFeedbackLabel('positive', 'en')).toBe('Yes');
			expect(getFeedbackLabel('negative', 'en')).toBe('No');
		});
	});

	describe('FEEDBACK_VALUES', () => {
		it('contains only positive and negative', () => {
			expect(FEEDBACK_VALUES).toEqual(['positive', 'negative']);
		});
	});
});
