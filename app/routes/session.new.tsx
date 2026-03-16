import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from 'react-router';
import { createRepositories } from '~/db';

export async function action({ request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const formData = await request.formData();
	const role = formData.get('role') as string;

	if (!role) {
		return new Response(
			JSON.stringify({ error: 'Missing required field: role' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	// Criar sessão com papel inicial
	const sessionId = crypto.randomUUID();
	await repos.sessions.create(sessionId, 'MODE_PREPARATION');

	// Redirect para stage-1 (cálculo de match)
	return redirect(`/session/${sessionId}/stage-1`);
}

export async function loader({ context }: LoaderFunctionArgs) {
	// Lista sessões recentes para debugging
	const db = context.cloudflare.env.DB;
	const { results } = await db
		.prepare('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10')
		.all();

	return new Response(JSON.stringify({ sessions: results || [] }), {
		headers: { 'Content-Type': 'application/json' },
	});
}
