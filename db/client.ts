import type { CollectionPayload } from '~/core/prompts/execution-interface';
import type { CognitiveContract, InitialRoleId, ModeId } from '~/types';
import type {
	DashboardStats,
	PaginatedSessions,
	SessionListItem,
} from '~/types/dashboard';

export interface SessionRecord {
	id: string;
	mode: ModeId;
	current_stage: number;
	contract: string | null; // JSON stringified CognitiveContract
	protocol: string | null; // JSON stringified CollectionPayload
	created_at: string;
	updated_at: string;
}

export interface ContractRecord {
	id: string;
	session_id: string;
	role: InitialRoleId;
	level_match: string; // JSON stringified LevelMatch
	rulers: string; // JSON stringified RulersVector
	hard_blocks: string | null; // JSON stringified HardBlock[]
	correction: string | null; // JSON stringified LocalCorrection
	contract_data: string | null; // JSON stringified CognitiveContract completo
	created_at: string;
}

export interface CollectionProtocolRecord {
	id: string;
	session_id: string;
	contract_id: string;
	criteria: string; // JSON stringified array
	blocks: string; // JSON stringified array
	payload: string | null; // JSON stringified CollectionPayload
	status: 'pending' | 'in_progress' | 'completed';
}

export interface DatabaseEnv {
	DB: D1Database;
}

/**
 * Repositório de Sessões
 */
export class SessionRepository {
	constructor(private db: D1Database) {}

	async create(id: string, mode: ModeId): Promise<SessionRecord | null> {
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO sessions (id, mode, current_stage, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?)`,
			)
			.bind(id, mode, now, now)
			.run();

		return this.findById(id);
	}

	async findById(id: string): Promise<SessionRecord | null> {
		return await this.db
			.prepare('SELECT * FROM sessions WHERE id = ?')
			.bind(id)
			.first<SessionRecord>();
	}

	async update(
		id: string,
		updates: Partial<{
			mode: ModeId;
			current_stage: number;
			contract: CognitiveContract;
			protocol: CollectionPayload;
		}>,
	): Promise<SessionRecord | null> {
		const fields: string[] = [];
		const values: unknown[] = [];

		if (updates.mode !== undefined) {
			fields.push('mode = ?');
			values.push(updates.mode);
		}

		if (updates.current_stage !== undefined) {
			fields.push('current_stage = ?');
			values.push(updates.current_stage);
		}

		if (updates.contract !== undefined) {
			fields.push('contract = ?');
			values.push(JSON.stringify(updates.contract));
		}

		if (updates.protocol !== undefined) {
			fields.push('protocol = ?');
			values.push(JSON.stringify(updates.protocol));
		}

		fields.push('updated_at = ?');
		values.push(new Date().toISOString());

		values.push(id);

		await this.db
			.prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();

		return this.findById(id);
	}

	/**
	 * Lista sessões com filtros e paginação
	 */
	async list(options: {
		limit?: number;
		offset?: number;
		role?: InitialRoleId;
		level?: string;
		status?: string;
		search?: string;
	}): Promise<PaginatedSessions> {
		const limit = options.limit ?? 20;
		const offset = options.offset ?? 0;

		// Build WHERE clause dynamically
		const whereConditions: string[] = [];
		const whereValues: unknown[] = [];

		if (options.role) {
			whereConditions.push('c.role = ?');
			whereValues.push(options.role);
		}

		if (options.level) {
			whereConditions.push(
				"json_extract(c.level_match, '$.selectedLevel') = ?",
			);
			whereValues.push(options.level);
		}

		if (options.search) {
			whereConditions.push('(s.id LIKE ? OR c.role LIKE ?)');
			whereValues.push(`%${options.search}%`, `%${options.search}%`);
		}

		const whereClause =
			whereConditions.length > 0
				? `WHERE ${whereConditions.join(' AND ')}`
				: '';

		// Get total count
		const countQuery = `
			SELECT COUNT(*) as total
			FROM sessions s
			LEFT JOIN contracts c ON s.id = c.session_id
			${whereClause}
		`;
		const countResult = await this.db
			.prepare(countQuery)
			.bind(...whereValues)
			.first<{ total: number }>();
		const total = countResult?.total ?? 0;

		// Get sessions with contract data
		const query = `
			SELECT
				s.id,
				s.mode,
				s.current_stage,
				s.created_at,
				s.updated_at,
				s.contract,
				c.role,
				c.level_match,
				cp.status as collection_status,
				cp.blocks,
				cp.payload
			FROM sessions s
			LEFT JOIN contracts c ON s.id = c.session_id
			LEFT JOIN collection_protocols cp ON s.id = cp.session_id
			${whereClause}
			ORDER BY s.updated_at DESC
			LIMIT ? OFFSET ?
		`;

		const { results } = await this.db
			.prepare(query)
			.bind(...whereValues, limit, offset)
			.all<{
				id: string;
				mode: ModeId;
				current_stage: number;
				created_at: string;
				updated_at: string;
				contract: string | null;
				role: InitialRoleId | null;
				level_match: string | null;
				collection_status: string | null;
				blocks: string | null;
				payload: string | null;
			}>();

		const sessions: SessionListItem[] = (results || []).map((row) => {
			// Parse contract to get level
			let level: string | undefined;
			if (row.level_match) {
				try {
					const levelMatch = JSON.parse(row.level_match);
					level = levelMatch.selectedLevel;
				} catch {
					// ignore parse error
				}
			}

			// Calculate status based on mode and data
			let status: SessionListItem['status'] = 'draft';
			if (row.mode === 'MODE_EXECUTION') {
				status = 'completed';
			} else if (row.collection_status === 'completed') {
				status = 'completed';
			} else if (row.collection_status === 'in_progress') {
				status = 'collection_in_progress';
			} else if (row.contract) {
				status = 'contract_configured';
			}

			// Calculate progress
			let progress:
				| { completedBlocks: number; totalBlocks: number }
				| undefined;
			if (row.blocks) {
				try {
					const blocks = JSON.parse(row.blocks);
					const totalBlocks = Array.isArray(blocks) ? blocks.length : 0;
					const payload = row.payload ? JSON.parse(row.payload) : {};
					const completedBlocks = Object.keys(payload).length;
					progress = { completedBlocks, totalBlocks };
				} catch {
					// ignore parse error
				}
			}

			return {
				createdAt: row.created_at,
				currentStage: row.current_stage,
				id: row.id,
				level: level as SessionListItem['level'],
				mode: row.mode,
				progress,
				role: row.role ?? undefined,
				status,
				updatedAt: row.updated_at,
			};
		});

		return {
			pagination: {
				page: Math.floor(offset / limit) + 1,
				pageSize: limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
			sessions,
		};
	}

	/**
	 * Obtém estatísticas do dashboard
	 */
	async getStats(): Promise<DashboardStats> {
		// Total sessions
		const totalResult = await this.db
			.prepare('SELECT COUNT(*) as count FROM sessions')
			.first<{ count: number }>();

		// Completed sessions
		const completedResult = await this.db
			.prepare(
				"SELECT COUNT(*) as count FROM sessions WHERE mode = 'MODE_EXECUTION'",
			)
			.first<{ count: number }>();

		// Most used role
		const roleResult = await this.db
			.prepare(`
				SELECT c.role, COUNT(*) as count
				FROM contracts c
				GROUP BY c.role
				ORDER BY count DESC
				LIMIT 1
			`)
			.first<{ role: InitialRoleId; count: number }>();

		// Sessions this month
		const now = new Date();
		const firstDayOfMonth = new Date(
			now.getFullYear(),
			now.getMonth(),
			1,
		).toISOString();
		const thisMonthResult = await this.db
			.prepare('SELECT COUNT(*) as count FROM sessions WHERE created_at >= ?')
			.bind(firstDayOfMonth)
			.first<{ count: number }>();

		return {
			averageLevel: null, // Would require more complex calculation
			completedSessions: completedResult?.count ?? 0,
			mostUsedRole: roleResult?.role ?? null,
			sessionsThisMonth: thisMonthResult?.count ?? 0,
			totalSessions: totalResult?.count ?? 0,
		};
	}

	/**
	 * Deleta uma sessão e seus dados relacionados
	 */
	async delete(id: string): Promise<boolean> {
		try {
			// Delete collection protocols first (foreign key constraint)
			await this.db
				.prepare('DELETE FROM collection_protocols WHERE session_id = ?')
				.bind(id)
				.run();

			// Delete contracts
			await this.db
				.prepare('DELETE FROM contracts WHERE session_id = ?')
				.bind(id)
				.run();

			// Delete session
			await this.db.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();

			return true;
		} catch (error) {
			console.error('Error deleting session:', error);
			return false;
		}
	}
}

/**
 * Repositório de Contratos
 */
export class ContractRepository {
	constructor(private db: D1Database) {}

	async create(
		id: string,
		sessionId: string,
		contract: CognitiveContract,
	): Promise<ContractRecord | null> {
		await this.db
			.prepare(
				`INSERT INTO contracts (id, session_id, role, level_match, rulers, hard_blocks, correction, contract_data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				id,
				sessionId,
				contract.role,
				JSON.stringify(contract.levelMatch),
				JSON.stringify(contract.rulers),
				contract.hardBlocks ? JSON.stringify(contract.hardBlocks) : null,
				contract.correction ? JSON.stringify(contract.correction) : null,
				JSON.stringify(contract),
				new Date().toISOString(),
			)
			.run();

		return this.findById(id);
	}

	async findById(id: string): Promise<ContractRecord | null> {
		return await this.db
			.prepare('SELECT * FROM contracts WHERE id = ?')
			.bind(id)
			.first<ContractRecord>();
	}

	async findBySessionId(sessionId: string): Promise<ContractRecord[]> {
		const { results } = await this.db
			.prepare(
				'SELECT * FROM contracts WHERE session_id = ? ORDER BY created_at DESC',
			)
			.bind(sessionId)
			.all<ContractRecord>();

		return results || [];
	}
}

/**
 * Repositório de Collection Protocols
 */
export class CollectionProtocolRepository {
	constructor(private db: D1Database) {}

	async create(
		id: string,
		sessionId: string,
		contractId: string,
		criteria: string[],
		blocks: string[],
	): Promise<CollectionProtocolRecord | null> {
		await this.db
			.prepare(
				`INSERT INTO collection_protocols (id, session_id, contract_id, criteria, blocks, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
			)
			.bind(
				id,
				sessionId,
				contractId,
				JSON.stringify(criteria),
				JSON.stringify(blocks),
			)
			.run();

		return this.findById(id);
	}

	async findById(id: string): Promise<CollectionProtocolRecord | null> {
		return await this.db
			.prepare('SELECT * FROM collection_protocols WHERE id = ?')
			.bind(id)
			.first<CollectionProtocolRecord>();
	}

	async update(
		id: string,
		updates: Partial<{
			status: 'pending' | 'in_progress' | 'completed';
			payload: CollectionPayload;
		}>,
	): Promise<CollectionProtocolRecord | null> {
		const fields: string[] = [];
		const values: unknown[] = [];

		if (updates.status !== undefined) {
			fields.push('status = ?');
			values.push(updates.status);
		}

		if (updates.payload !== undefined) {
			fields.push('payload = ?');
			values.push(JSON.stringify(updates.payload));
		}

		values.push(id);

		await this.db
			.prepare(
				`UPDATE collection_protocols SET ${fields.join(', ')} WHERE id = ?`,
			)
			.bind(...values)
			.run();

		return this.findById(id);
	}

	async findBySessionId(
		sessionId: string,
	): Promise<CollectionProtocolRecord[]> {
		const { results } = await this.db
			.prepare(
				'SELECT * FROM collection_protocols WHERE session_id = ? ORDER BY created_at DESC',
			)
			.bind(sessionId)
			.all<CollectionProtocolRecord>();

		return results || [];
	}
}

/**
 * Cria uma instância de repositórios com o ambiente D1
 */
export function createRepositories(env: DatabaseEnv) {
	const db = env.DB;

	return {
		collectionProtocols: new CollectionProtocolRepository(db),
		contracts: new ContractRepository(db),
		sessions: new SessionRepository(db),
	};
}

export type Repositories = ReturnType<typeof createRepositories>;
