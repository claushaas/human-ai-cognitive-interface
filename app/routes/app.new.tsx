import { redirect } from 'react-router';
import { requireUser } from '~/lib/auth/require-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import { createSession } from '~/lib/db/sessions.server';
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

export async function loader({ context, request }: Route.LoaderArgs) {
	const user = await requireUser(
		request,
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

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
