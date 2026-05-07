/**
 * Canonical authentication types for HACI.
 *
 * No React, no Drizzle, no Cloudflare dependencies.
 */

export type AuthProvider = 'cloudflare-access' | 'dev';

export type AuthenticatedUser = {
	email: string;
	id: string;
	name?: string;
	provider: AuthProvider;
	providerSubject?: string;
};

export type AuthResult =
	| { status: 'authenticated'; user: AuthenticatedUser }
	| { status: 'unauthenticated'; reason: string };
