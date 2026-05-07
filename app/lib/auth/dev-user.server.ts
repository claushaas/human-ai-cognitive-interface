/**
 * Dev/mock user authentication — server-side only.
 *
 * This is a temporary helper for local/test environments.
 * Will be replaced/encapsulated by Cloudflare Access in production.
 *
 * ONLY works when APP_ENV is 'local' or 'test'.
 */

import type { RuntimeEnv } from '~/lib/env/runtime.server';
import type { AuthenticatedUser } from './types';

const DEV_USER_DEFAULT: AuthenticatedUser = {
	email: 'dev@haci.local',
	id: 'dev-user-local',
	name: 'Developer',
	provider: 'dev',
	providerSubject: 'dev-subject-local',
};

export function getDevUser(env: RuntimeEnv): AuthenticatedUser {
	if (env.APP_ENV !== 'local' && env.APP_ENV !== 'test') {
		throw new Error(
			'Dev user fallback is only allowed in local/test environment',
		);
	}

	const email = env.DEV_AUTH_EMAIL ?? DEV_USER_DEFAULT.email;
	const normalized = email.trim().toLowerCase();

	return {
		...DEV_USER_DEFAULT,
		email: normalized,
		id: `dev-user-${normalized}`,
		providerSubject: `dev-subject-${normalized}`,
	};
}

export function requireDevUser(env: RuntimeEnv): AuthenticatedUser {
	return getDevUser(env);
}
