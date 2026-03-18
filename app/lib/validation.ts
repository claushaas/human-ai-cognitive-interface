import { logValidationError } from '~/lib/audit';
import type { ModeId, RulersVector } from '~/types';

/**
 * Resultado da validação de modo
 */
export interface ModeValidationResult {
	valid: boolean;
	error?: string;
	status: number;
}

/**
 * Valida se o modo da sessão permite a operação solicitada
 * - MODE_PREPARATION: permite operações de configuração (match, correção, confirmação)
 * - MODE_GOVERNANCE: permite operações de governança e revisão
 * - MODE_EXECUTION: não permite modificar contrato ou coleta
 *
 * @param sessionMode - Modo atual da sessão
 * @param requiredMode - Modo requerido para a operação (ou modos compatíveis)
 * @returns Resultado da validação
 */
export function validateSessionMode(
	sessionMode: ModeId,
	allowedModes: ModeId[],
): ModeValidationResult {
	if (!allowedModes.includes(sessionMode)) {
		return {
			error: `Operation not allowed in mode ${sessionMode}. Allowed modes: ${allowedModes.join(', ')}`,
			status: 400,
			valid: false,
		};
	}

	return { status: 200, valid: true };
}

/**
 * Valida o cap constitucional: decision deve ser <= 3
 * Conforme docs/12-constitution.md: valores 4 e 5 são proibidos
 *
 * @param rulers - Vetor de réguas a validar
 * @returns Resultado da validação
 */
export function validateConstitutionalCap(
	rulers: RulersVector,
): ModeValidationResult {
	if (rulers.decision > 3) {
		return {
			error:
				"Constitutional violation: decision > 3 is prohibited. Values 4 and 5 on 'decision' ruler are constitutionally forbidden.",
			status: 400,
			valid: false,
		};
	}

	return { status: 200, valid: true };
}

/**
 * Validação completa de réguas cognitivas
 * - Cap constitucional (decision <= 3)
 * - Range das réguas (1-5 para inference, scope, source, meta; 1-3 para decision)
 *
 * @param rulers - Vetor de réguas a validar
 * @returns Resultado da validação com todos os erros encontrados
 */
export function validateRulersVector(
	rulers: RulersVector,
): ModeValidationResult {
	// Validar cap constitucional
	const capValidation = validateConstitutionalCap(rulers);
	if (!capValidation.valid) {
		return capValidation;
	}

	// Validar ranges usando configuração DRY
	const rulerValidations: {
		[key in keyof RulersVector]?: { min: number; max: number };
	} = {
		decision: { max: 3, min: 1 },
		inference: { max: 5, min: 1 },
		meta: { max: 5, min: 1 },
		scope: { max: 5, min: 1 },
		source: { max: 5, min: 1 },
	};

	for (const [ruler, range] of Object.entries(rulerValidations)) {
		const value = rulers[ruler as keyof RulersVector];
		if (!range) continue;
		if (value < range.min || value > range.max) {
			return {
				error: `Invalid range: ${ruler} must be between ${range.min} and ${range.max}`,
				status: 400,
				valid: false,
			};
		}
	}

	return { status: 200, valid: true };
}

/**
 * Cria uma resposta de erro padronizada para validações
 *
 * @param sessionId - ID da sessão para auditoria
 * @param error - Mensagem de erro
 * @param status - Código HTTP de status
 * @returns Response HTTP formatada
 */
export function createValidationErrorResponse(
	sessionId: string,
	error: string,
	status: number,
): Response {
	// Log para auditoria usando sistema centralizado
	logValidationError(sessionId, error, { status });

	return new Response(JSON.stringify({ error }), {
		headers: { 'Content-Type': 'application/json' },
		status,
	});
}
