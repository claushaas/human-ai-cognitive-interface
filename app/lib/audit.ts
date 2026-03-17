import type { InitialRoleId, ModeId, RulersVector } from '~/types';

/**
 * Tipo de evento de auditoria
 */
export type AuditEventType =
	| 'SESSION_CREATED'
	| 'MATCH_CALCULATED'
	| 'MATCH_AUTO_SELECTED'
	| 'MATCH_AMBIGUOUS'
	| 'MATCH_BLOCKED'
	| 'CORRECTION_APPLIED'
	| 'HARD_BLOCK_TRIGGERED'
	| 'CONTRACT_CONFIRMED'
	| 'PROTOCOL_DERIVED'
	| 'RESPONSE_SUBMITTED'
	| 'COLLECTION_COMPLETED'
	| 'MODE_TRANSITION'
	| 'VALIDATION_ERROR';

/**
 * Entrada de log de auditoria
 */
export interface AuditLogEntry {
	timestamp: string;
	sessionId: string;
	eventType: AuditEventType;
	payload: Record<string, unknown>;
}

/**
 * Registra um evento de auditoria
 * Os logs são capturados automaticamente pelo Cloudflare Workers
 *
 * @param sessionId - ID da sessão
 * @param eventType - Tipo do evento
 * @param payload - Dados adicionais do evento
 */
export function auditLog(
	sessionId: string,
	eventType: AuditEventType,
	payload: Record<string, unknown> = {},
): void {
	const entry: AuditLogEntry = {
		eventType,
		payload: {
			...payload,
			// Sanitização básica - evitar log de dados sensíveis
			timestamp: new Date().toISOString(),
		},
		sessionId,
		timestamp: new Date().toISOString(),
	};

	// Log estruturado para Cloudflare
	console.log(JSON.stringify(entry));
}

/**
 * Log de decisão de match
 *
 * @param sessionId - ID da sessão
 * @param rulers - Réguas usadas no cálculo
 * @param result - Resultado do match
 */
export function logMatchDecision(
	sessionId: string,
	rulers: RulersVector,
	result: {
		selectedLevel?: string;
		score: number;
		autoSelected: boolean;
		hasHardBlocks: boolean;
		hasCorrections: boolean;
	},
): void {
	const eventType: AuditEventType = result.autoSelected
		? 'MATCH_AUTO_SELECTED'
		: result.hasHardBlocks
			? 'MATCH_BLOCKED'
			: 'MATCH_AMBIGUOUS';

	auditLog(sessionId, eventType, {
		autoSelected: result.autoSelected,
		hasCorrections: result.hasCorrections,
		hasHardBlocks: result.hasHardBlocks,
		rulers,
		score: result.score,
		selectedLevel: result.selectedLevel,
	});
}

/**
 * Log de hard block aplicado
 *
 * @param sessionId - ID da sessão
 * @param blockId - ID da regra de bloqueio
 * @param message - Mensagem do bloqueio
 * @param severity - Severidade do bloqueio
 */
export function logHardBlock(
	sessionId: string,
	blockId: string,
	message: string,
	severity: 'BLOCK' | 'WARN' | 'CONFIRM',
): void {
	auditLog(sessionId, 'HARD_BLOCK_TRIGGERED', {
		blockId,
		message,
		severity,
	});
}

/**
 * Log de correção aplicada
 *
 * @param sessionId - ID da sessão
 * @param originalRulers - Réguas originais
 * @param correctedRulers - Réguas corrigidas
 * @param delta - Delta aplicado
 */
export function logCorrection(
	sessionId: string,
	originalRulers: RulersVector,
	correctedRulers: RulersVector,
	delta: Partial<RulersVector>,
): void {
	auditLog(sessionId, 'CORRECTION_APPLIED', {
		correctedRulers,
		delta,
		modifiedRulers: Object.keys(delta),
		originalRulers,
	});
}

/**
 * Log de confirmação de contrato
 *
 * @param sessionId - ID da sessão
 * @param contractId - ID do contrato
 * @param role - Papel selecionado
 * @param level - Nível selecionado
 * @param rulers - Réguas configuradas
 */
export function logContractConfirmed(
	sessionId: string,
	contractId: string,
	role: InitialRoleId,
	level: string,
	rulers: RulersVector,
): void {
	auditLog(sessionId, 'CONTRACT_CONFIRMED', {
		contractId,
		level,
		role,
		rulers,
	});
}

/**
 * Log de derivação de protocolo
 *
 * @param sessionId - ID da sessão
 * @param protocolId - ID do protocolo
 * @param criteriaCount - Número de critérios derivados
 * @param implicitCriteria - Critérios implícitos identificados
 */
export function logProtocolDerived(
	sessionId: string,
	protocolId: string,
	criteriaCount: number,
	implicitCriteria: string[],
): void {
	auditLog(sessionId, 'PROTOCOL_DERIVED', {
		criteriaCount,
		implicitCriteria,
		protocolId,
	});
}

/**
 * Log de transição de modo
 *
 * @param sessionId - ID da sessão
 * @param fromMode - Modo anterior
 * @param toMode - Novo modo
 * @param reason - Razão da transição
 */
export function logModeTransition(
	sessionId: string,
	fromMode: ModeId,
	toMode: ModeId,
	reason: string,
): void {
	auditLog(sessionId, 'MODE_TRANSITION', {
		fromMode,
		reason,
		toMode,
	});
}

/**
 * Log de erro de validação
 *
 * @param sessionId - ID da sessão
 * @param error - Mensagem de erro
 * @param context - Contexto adicional
 */
export function logValidationError(
	sessionId: string,
	error: string,
	context: Record<string, unknown> = {},
): void {
	auditLog(sessionId, 'VALIDATION_ERROR', {
		error,
		...context,
	});
}
