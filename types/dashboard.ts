import type { CollectionPayload } from '~/core/prompts/execution-interface';
import type { CognitiveContract } from './contract';
import type { CanonicalLevelId, InitialRoleId, ModeId } from './core';
import type { CollectionProtocol } from './criteria';

/**
 * Status possíveis de uma sessão
 */
export type SessionStatus =
	| 'draft'
	| 'contract_configured'
	| 'collection_in_progress'
	| 'completed';

/**
 * DTO para listagem de sessões
 */
export interface SessionListItem {
	id: string;
	mode: ModeId;
	currentStage: number;
	role?: InitialRoleId;
	level?: CanonicalLevelId;
	createdAt: string;
	updatedAt: string;
	status: SessionStatus;
	progress?: {
		completedBlocks: number;
		totalBlocks: number;
	};
}

/**
 * Filtros para listagem de sessões
 */
export interface SessionFilters {
	role?: InitialRoleId;
	level?: CanonicalLevelId;
	status?: SessionStatus;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
}

/**
 * DTO para visualização completa de uma sessão
 */
export interface SessionDetail extends SessionListItem {
	contract: CognitiveContract | null;
	protocol: CollectionProtocol | null;
	collectionPayload: CollectionPayload | null;
}

/**
 * Estatísticas do dashboard
 */
export interface DashboardStats {
	totalSessions: number;
	completedSessions: number;
	mostUsedRole: InitialRoleId | null;
	averageLevel: string | null;
	sessionsThisMonth: number;
}

/**
 * Opções de paginação para listagem
 */
export interface PaginationOptions {
	page: number;
	pageSize: number;
}

/**
 * Resultado paginado de sessões
 */
export interface PaginatedSessions {
	sessions: SessionListItem[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}
