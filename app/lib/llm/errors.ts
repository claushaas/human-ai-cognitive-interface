/**
 * Controlled LLM errors.
 *
 * Safe for UI — never expose secrets, API keys, or full payloads.
 */

export class LlmDisabledError extends Error {
	readonly code = 'llm.disabled';
	constructor(
		message = 'Geração de prompt está temporariamente desativada. Tente novamente mais tarde.',
	) {
		super(message);
		this.name = 'LlmDisabledError';
	}
}

export class LlmConfigurationError extends Error {
	readonly code = 'llm.configuration_error';
	constructor(
		message = 'Erro de configuração do serviço de geração. Contate o suporte.',
	) {
		super(message);
		this.name = 'LlmConfigurationError';
	}
}

export class LlmProviderError extends Error {
	readonly code = 'llm.provider_error';
	readonly statusCode?: number;
	constructor(
		message = 'Erro ao comunicar com o provedor de IA. Tente novamente.',
		options?: { statusCode?: number; cause?: unknown },
	) {
		super(message);
		this.name = 'LlmProviderError';
		this.statusCode = options?.statusCode;
		if (options?.cause) {
			(this as unknown as Record<string, unknown>).cause = options.cause;
		}
	}
}

export class LlmTimeoutError extends Error {
	readonly code = 'llm.timeout';
	constructor(message = 'A geração do prompt demorou muito. Tente novamente.') {
		super(message);
		this.name = 'LlmTimeoutError';
	}
}

export class LlmInvalidJsonError extends Error {
	readonly code = 'llm.invalid_json';
	readonly rawContent?: string;
	constructor(
		message = 'A resposta do provedor não está no formato esperado. Tente novamente.',
		options?: { rawContent?: string },
	) {
		super(message);
		this.name = 'LlmInvalidJsonError';
		this.rawContent = options?.rawContent;
	}
}

export class LlmValidationError extends Error {
	readonly code = 'llm.validation_error';
	readonly issues?: string[];
	constructor(
		message = 'A resposta gerada não passou na validação interna. Tente novamente.',
		options?: { issues?: string[] },
	) {
		super(message);
		this.name = 'LlmValidationError';
		this.issues = options?.issues;
	}
}

/**
 * Convert any error to a safe public message and stable code.
 */
export function toSafeLlmError(error: unknown): {
	code: string;
	message: string;
	retryable: boolean;
} {
	if (error instanceof LlmDisabledError) {
		return { code: error.code, message: error.message, retryable: false };
	}
	if (error instanceof LlmConfigurationError) {
		return { code: error.code, message: error.message, retryable: false };
	}
	if (error instanceof LlmProviderError) {
		return { code: error.code, message: error.message, retryable: true };
	}
	if (error instanceof LlmTimeoutError) {
		return { code: error.code, message: error.message, retryable: true };
	}
	if (error instanceof LlmInvalidJsonError) {
		return { code: error.code, message: error.message, retryable: true };
	}
	if (error instanceof LlmValidationError) {
		return { code: error.code, message: error.message, retryable: true };
	}
	if (error instanceof Error) {
		return {
			code: 'llm.unknown',
			message: 'Erro inesperado na geração. Tente novamente.',
			retryable: true,
		};
	}
	return {
		code: 'llm.unknown',
		message: 'Erro inesperado na geração. Tente novamente.',
		retryable: true,
	};
}
