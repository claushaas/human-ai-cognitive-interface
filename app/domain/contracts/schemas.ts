import { z } from 'zod';
import { CONTRACT_VERSION } from './version';

// ─── Base enums ───

export const LocaleSchema = z.enum(['pt-BR', 'en']);

export const InitialRoleSchema = z.enum([
	'role.analyze',
	'role.synthesize',
	'role.explore',
	'role.decideSupport',
	'role.document',
	'role.transform',
]);

export const InternalRoleSchema = z.enum([
	'role.analyze',
	'role.synthesize',
	'role.explore',
	'role.decideSupport',
	'role.document',
	'role.transform',
	'role.research',
	'role.execute',
]);

export const RulerKeySchema = z.enum([
	'inference',
	'decision',
	'scope',
	'source',
	'meta',
]);

export const Scale1To5Schema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
]);

export const DecisionScaleSchema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
]);

export const LevelIdSchema = z.enum([
	'N1',
	'N2',
	'N3',
	'N4',
	'N5',
	'N6',
	'N7',
	'N8',
]);

export const SessionStatusSchema = z.enum([
	'draft',
	'collecting',
	'ready',
	'generating',
	'completed',
	'failed',
	'deleted',
]);

export const FeedbackValueSchema = z.enum(['positive', 'negative']);

// ─── Compound schemas ───

export const RawIntentSchema = z
	.object({
		desiredOutcome: z.string().max(2000).optional(),
		locale: LocaleSchema,
		text: z
			.string()
			.min(1, 'Texto não pode ser vazio')
			.max(8000, 'Texto não pode exceder 8000 caracteres')
			.refine((v) => v.trim().length > 0, {
				message: 'Texto não pode conter apenas espaços em branco',
			}),
		version: z.literal(CONTRACT_VERSION),
	})
	.strict();

export const RulersVectorSchema = z
	.object({
		decision: DecisionScaleSchema,
		inference: Scale1To5Schema,
		meta: Scale1To5Schema,
		scope: Scale1To5Schema,
		source: Scale1To5Schema,
	})
	.strict();

export const LevelCandidateSchema = z
	.object({
		confidence: z.enum(['low', 'medium', 'high']).optional(),
		distance: z.number().nonnegative().optional(),
		id: LevelIdSchema,
		reasons: z.array(z.string()).optional(),
		score: z.number().min(0).max(1),
	})
	.strict();

export const HardBlockSchema = z
	.object({
		code: z.string().min(1),
		message: z.string().min(1),
		severity: z.enum(['blocking', 'requires_confirmation', 'warning']),
		source: z.string().optional(),
	})
	.strict();

export const CorrectionSuggestionSchema = z
	.object({
		changes: z
			.array(
				z.object({
					from: z.number().int().min(1).max(5),
					ruler: RulerKeySchema,
					to: z.number().int().min(1).max(3),
				}),
			)
			.min(1)
			.max(2),
		id: z.string().min(1),
		message: z.string().min(1),
	})
	.strict()
	.superRefine((val, ctx) => {
		for (const change of val.changes) {
			if (change.ruler === 'decision' && change.to > 3) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						'Correção de decisão não pode exceder 3 (limite constitucional)',
					path: ['changes', val.changes.indexOf(change), 'to'],
				});
			}
			const diff = Math.abs(change.to - change.from);
			if (diff > 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Cada correção pode alterar no máximo 1 ponto por régua',
					path: ['changes', val.changes.indexOf(change)],
				});
			}
		}
	});

export const LevelMatchSchema = z
	.object({
		candidates: z.array(LevelCandidateSchema),
		correctionSuggestions: z.array(CorrectionSuggestionSchema).optional(),
		hardBlocks: z.array(HardBlockSchema),
		rejected: z.array(LevelCandidateSchema).optional(),
		selected: LevelCandidateSchema.optional(),
		status: z.enum(['matched', 'ambiguous', 'blocked', 'no_match']),
	})
	.strict()
	.superRefine((val, ctx) => {
		if (val.status === 'matched' && !val.selected) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Quando status é 'matched', selected deve estar presente",
				path: ['selected'],
			});
		}
		if (val.status === 'blocked') {
			const hasBlocking = val.hardBlocks.some((b) => b.severity === 'blocking');
			if (!hasBlocking) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Quando status é 'blocked', deve haver pelo menos um hard block com severity 'blocking'",
					path: ['hardBlocks'],
				});
			}
		}
	});

export const CognitiveContractSchema = z
	.object({
		collectedCriteria: z.record(z.string(), z.unknown()).optional(),
		constraints: z.array(z.string()).optional(),
		createdAt: z.string().min(1),
		expectedOutput: z.string().optional(),
		id: z.string().min(1),
		initialRole: InitialRoleSchema,
		levelMatch: LevelMatchSchema,
		locale: LocaleSchema,
		missingCriteria: z.array(z.string()).optional(),
		normalizedIntent: z.string().optional(),
		rawIntent: RawIntentSchema,
		responseFormat: z.string().optional(),
		risks: z.array(z.string()).optional(),
		rulers: RulersVectorSchema,
		version: z.literal(CONTRACT_VERSION),
	})
	.strict();

export const CollectionQuestionSchema = z
	.object({
		answerType: z.enum([
			'text',
			'number',
			'boolean',
			'enum',
			'multi-select',
			'url',
		]),
		examples: z.array(z.string()).optional(),
		id: z.string().min(1),
		label: z.string().min(1),
		options: z.array(z.string()).optional(),
		rationale: z.string().optional(),
		required: z.boolean(),
		validation: z.record(z.string(), z.unknown()).optional(),
	})
	.strict()
	.superRefine((val, ctx) => {
		if (
			(val.answerType === 'enum' || val.answerType === 'multi-select') &&
			(!val.options || val.options.length === 0)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Perguntas do tipo 'enum' ou 'multi-select' devem ter options não vazio",
				path: ['options'],
			});
		}
	});

export const CollectionProtocolSchema = z
	.object({
		contractId: z.string().min(1),
		questions: z.array(CollectionQuestionSchema),
		status: z.enum(['ready', 'needs_more_context']),
		version: z.literal(CONTRACT_VERSION),
	})
	.strict()
	.superRefine((val, ctx) => {
		const ids = val.questions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		if (uniqueIds.size !== ids.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'IDs de perguntas devem ser únicos',
				path: ['questions'],
			});
		}
	});

export const CollectionAnswerSchema = z
	.object({
		answeredAt: z.string().min(1),
		questionId: z.string().min(1),
		value: z.unknown(),
	})
	.strict();

export const PromptGenerationRequestSchema = z
	.object({
		answers: z.array(CollectionAnswerSchema).optional(),
		collectionProtocol: CollectionProtocolSchema.optional(),
		contract: CognitiveContractSchema,
		version: z.literal(CONTRACT_VERSION),
	})
	.strict();

export const PromptGenerationResultSchema = z
	.object({
		contractId: z.string().min(1),
		generatedAt: z.string().min(1),
		model: z.string().optional(),
		prompt: z
			.string()
			.min(1, 'Prompt não pode ser vazio')
			.refine((v) => v.trim().length > 0, {
				message: 'Prompt não pode conter apenas espaços em branco',
			}),
		usage: z
			.object({
				inputTokens: z.number().int().nonnegative().optional(),
				outputTokens: z.number().int().nonnegative().optional(),
				totalTokens: z.number().int().nonnegative().optional(),
			})
			.optional(),
		version: z.literal(CONTRACT_VERSION),
		warnings: z.array(z.string()).optional(),
	})
	.strict();

export const SessionSchema = z
	.object({
		contract: CognitiveContractSchema.optional(),
		createdAt: z.string().min(1),
		deletedAt: z.string().nullable().optional(),
		id: z.string().min(1),
		locale: LocaleSchema,
		promptResult: PromptGenerationResultSchema.optional(),
		rawIntent: RawIntentSchema.optional(),
		status: SessionStatusSchema,
		updatedAt: z.string().min(1),
		userId: z.string().min(1),
	})
	.strict();

export const FeedbackSchema = z
	.object({
		createdAt: z.string().min(1),
		id: z.string().min(1),
		sessionId: z.string().min(1),
		updatedAt: z.string().optional(),
		userId: z.string().min(1),
		value: FeedbackValueSchema,
	})
	.strict();
