/**
 * Users repository — server-side only.
 */

import { eq } from 'drizzle-orm';
import type { DevUser } from '~/lib/auth/dev-user.server';
import type { DbClient } from './client.server';
import { users } from './schema';

export type UpsertUserInput = {
	email: string;
	id: string;
	name?: string;
	provider: string;
	providerSubject: string;
};

export async function upsertUser(
	db: DbClient,
	input: UpsertUserInput,
): Promise<void> {
	const now = new Date().toISOString();

	const existing = await db
		.select()
		.from(users)
		.where(eq(users.providerSubject, input.providerSubject))
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(users)
			.set({
				email: input.email,
				name: input.name ?? existing[0].name,
				updatedAt: now,
			})
			.where(eq(users.id, existing[0].id));
	} else {
		await db.insert(users).values({
			createdAt: now,
			email: input.email,
			id: input.id,
			name: input.name ?? null,
			provider: input.provider,
			providerSubject: input.providerSubject,
			updatedAt: now,
		});
	}
}

export async function getUserById(db: DbClient, userId: string) {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return result[0] ?? null;
}

export async function getUserByEmail(db: DbClient, email: string) {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	return result[0] ?? null;
}

export async function ensureDevUser(
	db: DbClient,
	devUser: DevUser,
): Promise<void> {
	await upsertUser(db, {
		email: devUser.email,
		id: devUser.id,
		name: devUser.name,
		provider: devUser.provider,
		providerSubject: devUser.providerSubject,
	});
}
