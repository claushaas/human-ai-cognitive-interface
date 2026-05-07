/**
 * Cloudflare Access user extraction — server-side only.
 *
 * Extracts identity from Cloudflare Access headers.
 * Does not cryptographically validate JWT in this phase;
 * relies on Cloudflare Access boundary at the edge.
 */

import type { AuthenticatedUser, AuthResult } from './types';

const ACCESS_EMAIL_HEADER = 'cf-access-authenticated-user-email';
const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function isValidEmailFormat(email: string): boolean {
	// Minimal check: must contain @ and a domain part
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getCloudflareAccessUser(request: Request): AuthResult {
	const email = request.headers.get(ACCESS_EMAIL_HEADER);

	if (!email) {
		return {
			reason: 'Missing Cloudflare Access email header',
			status: 'unauthenticated',
		};
	}

	const normalized = normalizeEmail(email);

	if (normalized.length === 0) {
		return {
			reason: 'Empty Cloudflare Access email',
			status: 'unauthenticated',
		};
	}

	if (!isValidEmailFormat(normalized)) {
		return {
			reason: 'Invalid Cloudflare Access email format',
			status: 'unauthenticated',
		};
	}

	const user: AuthenticatedUser = {
		email: normalized,
		id: `cf-access-${normalized}`,
		provider: 'cloudflare-access',
		providerSubject: normalized,
	};

	return { status: 'authenticated', user };
}

/**
 * Check if JWT assertion header is present (for future validation).
 * Not used for identity extraction in this phase.
 */
export function hasAccessJwt(request: Request): boolean {
	return request.headers.has(ACCESS_JWT_HEADER);
}
