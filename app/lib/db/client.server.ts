/**
 * Drizzle D1 client — server-side only.
 *
 * Must NOT be imported from client components.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type DbClient = ReturnType<typeof createDbClient>;

export function createDbClient(d1Database: D1Database) {
	return drizzle(d1Database, { schema });
}

/**
 * Extract D1 binding from Cloudflare Workers env.
 */
export function getD1FromEnv(env: Record<string, unknown>): D1Database {
	const binding = env.HACI_DB;
	if (!binding || typeof binding !== 'object' || !('prepare' in binding)) {
		throw new Error('D1 binding HACI_DB is missing or invalid');
	}
	return binding as D1Database;
}
