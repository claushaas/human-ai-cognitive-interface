import type { CollectionPayload } from '~/core/prompts/execution-interface';
import type { CognitiveContract, InitialRoleId, ModeId } from '~/types';

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
