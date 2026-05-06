import type { z } from 'zod';
import type {
	CognitiveContractSchema,
	CollectionAnswerSchema,
	CollectionProtocolSchema,
	CollectionQuestionSchema,
	CorrectionSuggestionSchema,
	FeedbackSchema,
	FeedbackValueSchema,
	HardBlockSchema,
	InitialRoleSchema,
	InternalRoleSchema,
	LevelCandidateSchema,
	LevelIdSchema,
	LevelMatchSchema,
	LocaleSchema,
	PromptGenerationRequestSchema,
	PromptGenerationResultSchema,
	RawIntentSchema,
	RulerKeySchema,
	RulersVectorSchema,
	SessionSchema,
	SessionStatusSchema,
} from './schemas';

export type CollectionAnswer = z.infer<typeof CollectionAnswerSchema>;
export type CollectionProtocol = z.infer<typeof CollectionProtocolSchema>;
export type CollectionQuestion = z.infer<typeof CollectionQuestionSchema>;
export type CognitiveContract = z.infer<typeof CognitiveContractSchema>;
export type CorrectionSuggestion = z.infer<typeof CorrectionSuggestionSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type HardBlock = z.infer<typeof HardBlockSchema>;
export type InitialRole = z.infer<typeof InitialRoleSchema>;
export type InternalRole = z.infer<typeof InternalRoleSchema>;
export type LevelCandidate = z.infer<typeof LevelCandidateSchema>;
export type LevelId = z.infer<typeof LevelIdSchema>;
export type LevelMatch = z.infer<typeof LevelMatchSchema>;
export type Locale = z.infer<typeof LocaleSchema>;
export type PromptGenerationRequest = z.infer<
	typeof PromptGenerationRequestSchema
>;
export type PromptGenerationResult = z.infer<
	typeof PromptGenerationResultSchema
>;
export type RawIntent = z.infer<typeof RawIntentSchema>;
export type RulerKey = z.infer<typeof RulerKeySchema>;
export type RulersVector = z.infer<typeof RulersVectorSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type FeedbackValue = z.infer<typeof FeedbackValueSchema>;
