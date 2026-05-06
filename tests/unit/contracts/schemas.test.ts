import { describe, expect, it } from 'vitest';
import {
	CollectionProtocolSchema,
	CollectionQuestionSchema,
	FeedbackSchema,
	InitialRoleSchema,
	LevelCandidateSchema,
	LevelIdSchema,
	LevelMatchSchema,
	LocaleSchema,
	PromptGenerationResultSchema,
	RawIntentSchema,
	RulersVectorSchema,
	SessionSchema,
} from '~/domain/contracts';

describe('RawIntentSchema', () => {
	it('aceita texto válido', () => {
		const result = RawIntentSchema.safeParse({
			desiredOutcome: 'Test',
			locale: 'pt-BR',
			text: 'Quero criar um prompt',
			version: 'v1',
		});
		expect(result.success).toBe(true);
	});

	it('rejeita texto vazio', () => {
		const result = RawIntentSchema.safeParse({
			locale: 'pt-BR',
			text: '',
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});

	it('rejeita texto com apenas espaços', () => {
		const result = RawIntentSchema.safeParse({
			locale: 'pt-BR',
			text: '   ',
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});
});

describe('LocaleSchema', () => {
	it('aceita pt-BR', () => {
		expect(LocaleSchema.safeParse('pt-BR').success).toBe(true);
	});

	it('aceita en', () => {
		expect(LocaleSchema.safeParse('en').success).toBe(true);
	});

	it('rejeita fr-FR', () => {
		expect(LocaleSchema.safeParse('fr-FR').success).toBe(false);
	});

	it('rejeita valor aleatório', () => {
		expect(LocaleSchema.safeParse('es').success).toBe(false);
	});
});

describe('InitialRoleSchema', () => {
	it('aceita os 6 papéis públicos', () => {
		const roles = [
			'role.analyze',
			'role.synthesize',
			'role.explore',
			'role.decideSupport',
			'role.document',
			'role.transform',
		];
		for (const role of roles) {
			expect(InitialRoleSchema.safeParse(role).success).toBe(true);
		}
	});

	it('rejeita papel inválido', () => {
		expect(InitialRoleSchema.safeParse('role.invalid').success).toBe(false);
	});
});

describe('RulersVectorSchema', () => {
	it('aceita decision 1, 2, 3', () => {
		for (const d of [1, 2, 3]) {
			const result = RulersVectorSchema.safeParse({
				decision: d,
				inference: 3,
				meta: 2,
				scope: 3,
				source: 1,
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejeita decision 4', () => {
		const result = RulersVectorSchema.safeParse({
			decision: 4,
			inference: 3,
			meta: 2,
			scope: 3,
			source: 1,
		});
		expect(result.success).toBe(false);
	});

	it('rejeita decision 5', () => {
		const result = RulersVectorSchema.safeParse({
			decision: 5,
			inference: 3,
			meta: 2,
			scope: 3,
			source: 1,
		});
		expect(result.success).toBe(false);
	});

	it('rejeita valores 0 e 6', () => {
		expect(
			RulersVectorSchema.safeParse({
				decision: 1,
				inference: 0,
				meta: 2,
				scope: 3,
				source: 1,
			}).success,
		).toBe(false);
		expect(
			RulersVectorSchema.safeParse({
				decision: 1,
				inference: 6,
				meta: 2,
				scope: 3,
				source: 1,
			}).success,
		).toBe(false);
	});
});

describe('LevelIdSchema', () => {
	it('aceita N1-N8', () => {
		for (let i = 1; i <= 8; i++) {
			expect(LevelIdSchema.safeParse(`N${i}`).success).toBe(true);
		}
	});

	it('rejeita N0', () => {
		expect(LevelIdSchema.safeParse('N0').success).toBe(false);
	});

	it('rejeita N9', () => {
		expect(LevelIdSchema.safeParse('N9').success).toBe(false);
	});
});

describe('LevelCandidateSchema', () => {
	it('rejeita score fora de 0..1', () => {
		expect(
			LevelCandidateSchema.safeParse({
				id: 'N1',
				score: 1.5,
			}).success,
		).toBe(false);
		expect(
			LevelCandidateSchema.safeParse({
				id: 'N1',
				score: -0.1,
			}).success,
		).toBe(false);
	});

	it('aceita score dentro de 0..1', () => {
		expect(
			LevelCandidateSchema.safeParse({ id: 'N1', score: 0.5 }).success,
		).toBe(true);
	});
});

describe('LevelMatchSchema', () => {
	it('exige selected quando status for matched', () => {
		const result = LevelMatchSchema.safeParse({
			candidates: [],
			hardBlocks: [],
			status: 'matched',
		});
		expect(result.success).toBe(false);
	});

	it('aceita matched com selected', () => {
		const result = LevelMatchSchema.safeParse({
			candidates: [],
			hardBlocks: [],
			selected: { id: 'N5', score: 0.85 },
			status: 'matched',
		});
		expect(result.success).toBe(true);
	});

	it('exige hard block blocking quando status for blocked', () => {
		const result = LevelMatchSchema.safeParse({
			candidates: [],
			hardBlocks: [
				{
					code: 'test',
					message: 'test',
					severity: 'warning',
				},
			],
			status: 'blocked',
		});
		expect(result.success).toBe(false);
	});

	it('aceita blocked com hard block blocking', () => {
		const result = LevelMatchSchema.safeParse({
			candidates: [],
			hardBlocks: [
				{
					code: 'test',
					message: 'test',
					severity: 'blocking',
				},
			],
			status: 'blocked',
		});
		expect(result.success).toBe(true);
	});
});

describe('CollectionQuestionSchema', () => {
	it('exige options para enum', () => {
		const result = CollectionQuestionSchema.safeParse({
			answerType: 'enum',
			id: 'q1',
			label: 'Pergunta',
			required: true,
		});
		expect(result.success).toBe(false);
	});

	it('aceita enum com options', () => {
		const result = CollectionQuestionSchema.safeParse({
			answerType: 'enum',
			id: 'q1',
			label: 'Pergunta',
			options: ['A', 'B'],
			required: true,
		});
		expect(result.success).toBe(true);
	});
});

describe('CollectionProtocolSchema', () => {
	it('rejeita IDs duplicados de pergunta', () => {
		const result = CollectionProtocolSchema.safeParse({
			contractId: 'c1',
			questions: [
				{
					answerType: 'text',
					id: 'q1',
					label: 'P1',
					required: true,
				},
				{
					answerType: 'text',
					id: 'q1',
					label: 'P2',
					required: true,
				},
			],
			status: 'ready',
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});
});

describe('PromptGenerationResultSchema', () => {
	it('rejeita prompt vazio', () => {
		const result = PromptGenerationResultSchema.safeParse({
			contractId: 'c1',
			generatedAt: '2026-05-05T00:00:00.000Z',
			prompt: '',
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});

	it('rejeita prompt com apenas espaços', () => {
		const result = PromptGenerationResultSchema.safeParse({
			contractId: 'c1',
			generatedAt: '2026-05-05T00:00:00.000Z',
			prompt: '   ',
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});

	it('rejeita tokens negativos', () => {
		const result = PromptGenerationResultSchema.safeParse({
			contractId: 'c1',
			generatedAt: '2026-05-05T00:00:00.000Z',
			prompt: 'Válido',
			usage: { inputTokens: -1 },
			version: 'v1',
		});
		expect(result.success).toBe(false);
	});
});

describe('SessionSchema', () => {
	it('aceita sessão draft mínima', () => {
		const result = SessionSchema.safeParse({
			createdAt: '2026-05-05T00:00:00.000Z',
			id: 'session_01',
			locale: 'pt-BR',
			status: 'draft',
			updatedAt: '2026-05-05T00:00:00.000Z',
			userId: 'user_01',
		});
		expect(result.success).toBe(true);
	});
});

describe('FeedbackSchema', () => {
	it('aceita positive', () => {
		const result = FeedbackSchema.safeParse({
			createdAt: '2026-05-05T00:00:00.000Z',
			id: 'fb1',
			sessionId: 's1',
			userId: 'u1',
			value: 'positive',
		});
		expect(result.success).toBe(true);
	});

	it('aceita negative', () => {
		const result = FeedbackSchema.safeParse({
			createdAt: '2026-05-05T00:00:00.000Z',
			id: 'fb1',
			sessionId: 's1',
			userId: 'u1',
			value: 'negative',
		});
		expect(result.success).toBe(true);
	});

	it('rejeita valor inválido', () => {
		const result = FeedbackSchema.safeParse({
			createdAt: '2026-05-05T00:00:00.000Z',
			id: 'fb1',
			sessionId: 's1',
			userId: 'u1',
			value: 'neutral',
		});
		expect(result.success).toBe(false);
	});
});
