import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { data, redirect } from 'react-router';
import { RoleSelection } from '~/components/ui';
import { createRepositories } from '~/db';

// Dados dos papéis - em produção viriam de config/initial-roles.json
const roles = [
	{
		blockedBehaviors: ['criação gratuita', 'execução', 'decisão'],
		description: 'Entender algo que já existe',
		id: 'role.analyze' as const,
		label: 'Analisar',
		semanticLoad: ['leitura', 'interpretação', 'diagnóstico'],
	},
	{
		blockedBehaviors: ['invenção de conteúdo'],
		description: 'Estruturar conteúdo existente',
		id: 'role.synthesize' as const,
		label: 'Organizar / Sintetizar',
		semanticLoad: ['estrutura', 'clareza', 'coerência'],
	},
	{
		blockedBehaviors: ['resposta única prematura', 'tom prescritivo'],
		description: 'Ver caminhos possíveis sem decidir',
		id: 'role.explore' as const,
		label: 'Explorar alternativas',
		semanticLoad: ['expansão', 'comparação', 'trade-offs'],
	},
	{
		blockedBehaviors: ['decidir por'],
		description: 'Ajudar a pensar, mas decisão é humana',
		id: 'role.decideSupport' as const,
		label: 'Apoiar decisão',
		semanticLoad: ['recomendação', 'justificativa'],
	},
	{
		blockedBehaviors: ['tom informal', 'explicações vagas'],
		description: 'Transformar em algo oficial e reutilizável',
		id: 'role.document' as const,
		label: 'Documentar / Formalizar',
		semanticLoad: ['precisão terminológica', 'rastreabilidade'],
	},
	{
		blockedBehaviors: ['mudança sem justificativa'],
		description: 'Mudar forma, formato ou estrutura',
		id: 'role.transform' as const,
		label: 'Transformar conteúdo',
		semanticLoad: ['tradução', 'reformatação', 'reestruturação'],
	},
];

export async function action({ request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const formData = await request.formData();
	const role = formData.get('role') as string;

	if (!role) {
		return data({ error: 'Missing required field: role' }, { status: 400 });
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

	return { sessions: results || [] };
}

export function meta() {
	return [
		{ title: 'Nova Sessão — HACI' },
		{
			content: 'Selecione o papel inicial para sua sessão cognitiva',
			name: 'description',
		},
	];
}

// Componente padrão da rota — UI de seleção de papel
export default function SessionNewPage() {
	return <RoleSelection roles={roles} />;
}
