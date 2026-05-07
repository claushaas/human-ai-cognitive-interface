/**
 * Unified user authentication — server-side only.
 *
 * Attempts Cloudflare Access first, then dev fallback for local/test.
 * Upserts user into D1 when authenticated.
 */

import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import { upsertUser } from '~/lib/db/users.server';
import { getRuntimeEnv } from '~/lib/env/runtime.server';
import { getCloudflareAccessUser } from './access.server';
import { getDevUser } from './dev-user.server';
import type { AuthenticatedUser } from './types';

export async function getAuthenticatedUser(
	request: Request,
	env: Record<string, unknown>,
): Promise<AuthenticatedUser | null> {
	const runtimeEnv = getRuntimeEnv(env as Record<string, string | undefined>);

	// 1. Try Cloudflare Access
	const accessResult = getCloudflareAccessUser(request);
	if (accessResult.status === 'authenticated') {
		return accessResult.user;
	}

	// 2. Dev fallback only in local/test
	if (runtimeEnv.APP_ENV === 'local' || runtimeEnv.APP_ENV === 'test') {
		try {
			return getDevUser(runtimeEnv);
		} catch {
			// Dev user not available
		}
	}

	return null;
}

export async function requireUser(
	request: Request,
	env: Record<string, unknown>,
): Promise<AuthenticatedUser> {
	const user = await getAuthenticatedUser(request, env);

	if (!user) {
		throw new Response('Não autenticado', { status: 401 });
	}

	// Upsert user into D1
	const d1 = getD1FromEnv(env);
	const db = createDbClient(d1);
	await upsertUser(db, {
		email: user.email,
		id: user.id,
		name: user.name,
		provider: user.provider,
		providerSubject: user.providerSubject ?? user.email,
	});

	return user;
}
