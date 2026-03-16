import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from 'react-router';
import { createRepositories } from '~/db';
import type { CognitiveContract, InitialRoleId, RulersVector } from '~/types';

export async function action({ request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const formData = await request.formData();
	const role = formData.get('role') as string;
	const rulersParam = formData.get('rulers') as string;

	if (!role || !rulersParam) {
		return new Response(
			JSON.stringify({ error: 'Missing required fields: role, rulers' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	// Criar sessão
	const sessionId = crypto.randomUUID();
	await repos.sessions.create(sessionId, 'MODE_PREPARATION');

	// Parse rulers
	const rulers = JSON.parse(rulersParam) as RulersVector;

	// TODO: Calcular match do nível usando core/match
	// TODO: Verificar hard blocks usando core/match
	// TODO: Criar contrato cognitivo

	// Placeholder de contrato para exemplo
	const contract: CognitiveContract = {
		hardBlocks: [],
		levelMatch: {
			candidates: [],
			score: 100,
			selectedLevel: 'N1',
		},
		role: role as InitialRoleId,
		rulers,
	};

	// Salvar contrato
	const contractId = crypto.randomUUID();
	await repos.contracts.create(contractId, sessionId, contract);

	// Atualizar sessão com contrato
	await repos.sessions.update(sessionId, {
		contract,
		current_stage: 1,
	});

	return redirect(`/session/${sessionId}/stage-2`);
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
