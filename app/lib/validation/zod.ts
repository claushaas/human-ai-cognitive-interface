import type { z } from 'zod';

export class ValidationError extends Error {
	constructor(
		message: string,
		public readonly issues: z.ZodIssue[],
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new ValidationError('Validation failed', result.error.issues);
	}
	return result.data;
}

export function safeParseWithIssues<T>(
	schema: z.ZodType<T>,
	data: unknown,
):
	| { data: T; issues: undefined; success: true }
	| { data: undefined; issues: z.ZodIssue[]; success: false } {
	const result = schema.safeParse(data);
	if (!result.success) {
		return {
			data: undefined,
			issues: result.error.issues,
			success: false,
		};
	}
	return { data: result.data, issues: undefined, success: true };
}

export function formatZodIssues(issues: z.ZodIssue[]): string[] {
	return issues.map((issue) => {
		const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
		return `${path}: ${issue.message}`;
	});
}
