import type { SessionRecord } from 'db/client';
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
	session: string | SessionRecord,
	eventType: AuditEventType,
	payload: Record<string, unknown> = {},
): void {
	const sessionId = typeof session === 'string' ? session : session.id;
	const entry: AuditLogEntry = {
		eventType,
		payload,
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
	session: string | SessionRecord,
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

	auditLog(session, eventType, {
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
	session: string | SessionRecord,
	blockId: string,
	message: string,
	severity: 'BLOCK' | 'WARN' | 'CONFIRM',
): void {
	auditLog(session, 'HARD_BLOCK_TRIGGERED', {
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
	session: string | SessionRecord,
	originalRulers: RulersVector,
	correctedRulers: RulersVector,
	delta: Partial<RulersVector>,
): void {
	auditLog(session, 'CORRECTION_APPLIED', {
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
	session: string | SessionRecord,
	contractId: string,
	role: InitialRoleId,
	level: string,
	rulers: RulersVector,
): void {
	auditLog(session, 'CONTRACT_CONFIRMED', {
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
	session: string | SessionRecord,
	protocolId: string,
	criteriaCount: number,
	implicitCriteria: string[],
): void {
	auditLog(session, 'PROTOCOL_DERIVED', {
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
	session: string | SessionRecord,
	fromMode: ModeId,
	toMode: ModeId,
	reason: string,
): void {
	auditLog(session, 'MODE_TRANSITION', {
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
	session: string | SessionRecord,
	error: string,
	context: Record<string, unknown> = {},
): void {
	auditLog(session, 'VALIDATION_ERROR', {
		error,
		...context,
	});
}
