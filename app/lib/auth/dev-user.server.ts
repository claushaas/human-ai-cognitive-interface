/**
 * Dev/mock user authentication — server-side only.
 *
 * This is a temporary helper for local/test environments.
 * Will be replaced by Cloudflare Access in Phase 7.
 *
 * ONLY works when APP_ENV is 'local' or 'test'.
 */

import type { RuntimeEnv } from '~/lib/env/runtime.server';

export type DevUser = {
	email: string;
	id: string;
	name: string;
	provider: string;
	providerSubject: string;
};

const DEV_USER_DEFAULT: DevUser = {
	email: 'dev@haci.local',
	id: 'dev-user-local',
	name: 'Developer',
	provider: 'dev',
	providerSubject: 'dev-subject-local',
};

export function getDevUser(env: RuntimeEnv): DevUser {
	if (env.APP_ENV !== 'local' && env.APP_ENV !== 'test') {
		throw new Error(
			'Dev user fallback is only allowed in local/test environment',
		);
	}

	const email = env.DEV_AUTH_EMAIL ?? DEV_USER_DEFAULT.email;

	return {
		...DEV_USER_DEFAULT,
		email,
		id: `dev-user-${email}`,
		providerSubject: `dev-subject-${email}`,
	};
}

export function requireDevUser(env: RuntimeEnv): DevUser {
	return getDevUser(env);
}
