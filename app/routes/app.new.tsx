import { redirect } from 'react-router';
import { getDevUser } from '~/lib/auth/dev-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import { createSession } from '~/lib/db/sessions.server';
import { ensureDevUser } from '~/lib/db/users.server';
import { getRuntimeEnv } from '~/lib/env/runtime.server';
import type { Route } from './+types/app.new';

export function meta() {
	return [
		{ title: 'Novo Prompt — HACI' },
		{
			content: 'Criar um novo prompt HACI estruturado.',
			name: 'description',
		},
	];
}

export async function loader({ context }: Route.LoaderArgs) {
	const rawEnv = context.cloudflare.env as unknown as Record<
		string,
		string | undefined
	>;
	const env = getRuntimeEnv(rawEnv);
	const user = getDevUser(env);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

	// Ensure dev user exists in DB
	await ensureDevUser(db, user);

	// Create a new draft session
	const sessionId = await createSession(db, {
		locale: 'pt-BR',
		rawIntent: {
			locale: 'pt-BR',
			text: '',
			version: 'v1',
		},
		status: 'draft',
		userId: user.id,
	});

	return redirect(`/app/session/${sessionId}`);
}

export default function AppNew() {
	// This should not render since loader always redirects
	return null;
}
