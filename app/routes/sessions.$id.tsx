import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { data, redirect, useLoaderData, useNavigate } from 'react-router';
import { SessionDetailView } from '~/components/stages';
import { Header } from '~/components/ui';
import { createRepositories } from '~/db';
import type { CognitiveContract } from '~/types';
import type { CollectionProtocol } from '~/types/criteria';
import type { SessionDetail } from '~/types/dashboard';

interface LoaderData {
	session: SessionDetail;
}

export async function loader({ params, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		throw new Response('Session ID required', { status: 400 });
	}

	// Get session data
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		throw new Response('Session not found', { status: 404 });
	}

	// Get contract
	const contracts = await repos.contracts.findBySessionId(sessionId);
	const contractRaw = contracts.length > 0 ? contracts[0] : null;
	let contract: CognitiveContract | null = null;
	if (contractRaw) {
		try {
			const levelMatch = contractRaw.level_match
				? JSON.parse(contractRaw.level_match)
				: null;
			const rulers = contractRaw.rulers ? JSON.parse(contractRaw.rulers) : null;

			// Validar dados mínimos necessários
			if (contractRaw.role && levelMatch && rulers) {
				contract = {
					correction: contractRaw.correction
						? JSON.parse(contractRaw.correction)
						: undefined,
					hardBlocks: contractRaw.hard_blocks
						? JSON.parse(contractRaw.hard_blocks)
						: undefined,
					levelMatch,
					role: contractRaw.role,
					rulers,
				};
			}
		} catch (e) {
			console.error('Failed to parse contract data:', e);
			contract = null;
		}
	}

	// Get protocol/payload
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	const protocol =
		protocols.length > 0
			? {
					blocks: JSON.parse(protocols[0].blocks || '[]'),
					criteria: JSON.parse(protocols[0].criteria || '[]') as string[],
					payload: protocols[0].payload
						? JSON.parse(protocols[0].payload)
						: null,
					status: protocols[0].status,
				}
			: null;

	// Calculate status
	let status: SessionDetail['status'] = 'draft';
	if (session.mode === 'MODE_EXECUTION') {
		status = 'completed';
	} else if (protocol?.status === 'completed') {
		status = 'completed';
	} else if (protocol?.status === 'in_progress') {
		status = 'collection_in_progress';
	} else if (contract) {
		status = 'contract_configured';
	}

	// Calculate progress
	let progress: { completedBlocks: number; totalBlocks: number } | undefined;
	if (protocol?.blocks && Array.isArray(protocol.blocks)) {
		const payload = protocol.payload || {};
		progress = {
			completedBlocks: Object.keys(payload).length,
			totalBlocks: protocol.blocks.length,
		};
	}

	const sessionDetail: SessionDetail = {
		collectionPayload: protocol?.payload || null,
		contract,
		createdAt: session.created_at,
		currentStage: session.current_stage,
		id: session.id,
		level: contract?.levelMatch?.selectedLevel,
		mode: session.mode,
		progress,
		protocol: protocol as unknown as CollectionProtocol | null,
		role: contract?.role,
		status,
		updatedAt: session.updated_at,
	};

	return { session: sessionDetail };
}

export async function action({ params, request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data({ error: 'Session ID required' }, { status: 400 });
	}

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		const success = await repos.sessions.delete(sessionId);
		if (success) {
			return redirect('/sessions');
		}
		return data({ error: 'Failed to delete session' }, { status: 500 });
	}

	if (intent === 'export') {
		const format = formData.get('format') as 'json' | 'markdown';

		// Get full session data
		const session = await repos.sessions.findById(sessionId);
		if (!session) {
			return data({ error: 'Session not found' }, { status: 404 });
		}

		if (format === 'json') {
			const exportData = {
				session: {
					contract: session.contract ? JSON.parse(session.contract) : null,
					createdAt: session.created_at,
					currentStage: session.current_stage,
					id: session.id,
					mode: session.mode,
					protocol: session.protocol ? JSON.parse(session.protocol) : null,
					updatedAt: session.updated_at,
				},
			};

			return new Response(JSON.stringify(exportData, null, 2), {
				headers: {
					'Content-Disposition': `attachment; filename="session-${sessionId}.json"`,
					'Content-Type': 'application/json',
				},
			});
		}

		if (format === 'markdown') {
			const contracts = await repos.contracts.findBySessionId(sessionId);
			const contract = contracts[0];

			const protocol = session.protocol ? JSON.parse(session.protocol) : null;

			let markdown = `# Sessão ${sessionId}\n\n`;
			markdown += `**Modo:** ${session.mode}\n`;
			markdown += `**Criada em:** ${session.created_at}\n`;
			markdown += `**Atualizada em:** ${session.updated_at}\n\n`;

			if (contract) {
				markdown += `## Contrato Cognitivo\n\n`;
				markdown += `- **Papel:** ${contract.role}\n`;
				const levelMatch = JSON.parse(contract.level_match);
				markdown += `- **Nível:** ${levelMatch.selectedLevel} (${levelMatch.score.toFixed(1)}%)\n`;
				markdown += `- **Réguas:**\n`;
				const rulers = JSON.parse(contract.rulers);
				for (const [key, value] of Object.entries(rulers)) {
					markdown += `  - ${key}: ${value}\n`;
				}
				markdown += '\n';
			}

			if (protocol) {
				markdown += `## Dados Coletados\n\n`;
				markdown += '```json\n';
				markdown += JSON.stringify(protocol, null, 2);
				markdown += '\n```\n';
			}

			return new Response(markdown, {
				headers: {
					'Content-Disposition': `attachment; filename="session-${sessionId}.md"`,
					'Content-Type': 'text/markdown',
				},
			});
		}
	}

	return data({ error: 'Invalid intent' }, { status: 400 });
}

export function meta({ data }: { data: unknown }) {
	const loaderData = data as LoaderData | undefined;
	const sessionId = loaderData?.session?.id?.slice(0, 8) || '';

	return [
		{ title: `Sessão ${sessionId} — HACI` },
		{
			content: 'Visualize os detalhes da sessão cognitiva',
			name: 'description',
		},
	];
}

export default function SessionDetailPage() {
	const loaderData = useLoaderData<typeof loader>();
	const data = loaderData
		? (JSON.parse(String(loaderData)) as LoaderData)
		: null;
	const navigate = useNavigate();

	const handleExport = (format: 'json' | 'markdown') => {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '';

		const intentInput = document.createElement('input');
		intentInput.type = 'hidden';
		intentInput.name = 'intent';
		intentInput.value = 'export';

		const formatInput = document.createElement('input');
		formatInput.type = 'hidden';
		formatInput.name = 'format';
		formatInput.value = format;

		form.appendChild(intentInput);
		form.appendChild(formatInput);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

	const handleDelete = async () => {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '';

		const intentInput = document.createElement('input');
		intentInput.type = 'hidden';
		intentInput.name = 'intent';
		intentInput.value = 'delete';

		form.appendChild(intentInput);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

	if (!data?.session) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="container mx-auto max-w-4xl px-4 py-8">
					<div className="text-center py-12">
						<p className="text-gray-500">Sessão não encontrada</p>
						<button
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							onClick={() => navigate('/sessions')}
							type="button"
						>
							Voltar para Histórico
						</button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="container mx-auto max-w-4xl px-4 py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
					<button
						className="hover:text-gray-700"
						onClick={() => navigate('/sessions')}
						type="button"
					>
						Histórico
					</button>
					<span>/</span>
					<span className="text-gray-900">Sessão</span>
				</div>

				{/* Session Detail */}
				<SessionDetailView
					onDelete={handleDelete}
					onExport={handleExport}
					session={data.session}
				/>
			</main>
		</div>
	);
}
