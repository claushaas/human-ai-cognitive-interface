import { useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { data, useFetcher, useLoaderData, useNavigate } from 'react-router';
import {
	CollectionComplete,
	CollectionIntro,
	CollectionReview,
	CollectionWizard,
} from '~/components/stages';
import { deriveCriteria } from '~/core/derivation';
import type { CollectionPayload } from '~/core/prompts/execution-interface';
import { createRepositories } from '~/db';
import { logModeTransition, logProtocolDerived } from '~/lib/audit';
import {
	createValidationErrorResponse,
	validateSessionMode,
} from '~/lib/validation';
import type {
	CognitiveContract,
	CollectionBlock,
	CollectionProtocol,
} from '~/types';

/**
 * Extrai critérios e blocos do protocolo derivado
 */
function extractProtocolData(protocol: CollectionProtocol) {
	const schema = protocol.collectionPayloadSchema as Record<
		string,
		unknown
	> | null;
	const criteriaIds = Object.keys(schema?.properties || {});

	const blocksJson = protocol.criteria.map((block: CollectionBlock) => ({
		avoid: block.avoid,
		example: block.example,
		id: block.id,
		include: block.include,
		instruction: block.instruction,
		rationale: block.rationale,
		title: block.title,
	}));

	return { blocksJson, criteriaIds };
}

export async function loader({ params, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data({ error: 'Session ID required' }, { status: 400 });
	}

	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return data({ error: 'Session not found' }, { status: 404 });
	}

	// Validação de modo: Stage 2 requer MODE_PREPARATION
	const modeValidation = validateSessionMode(session.mode, [
		'MODE_PREPARATION',
	]);
	if (!modeValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
			modeValidation.error || 'Invalid mode',
			modeValidation.status,
		);
	}

	const contracts = await repos.contracts.findBySessionId(sessionId);
	const latestContract = contracts[0];

	if (!latestContract) {
		return data({ error: 'No contract found for session' }, { status: 404 });
	}

	// Reconstruct CognitiveContract from individual fields with error handling
	let contractData: CognitiveContract | null = null;
	try {
		const levelMatch = latestContract.level_match
			? JSON.parse(latestContract.level_match)
			: null;
		const rulers = latestContract.rulers ? JSON.parse(latestContract.rulers) : null;

		// Validar dados mínimos necessários
		if (latestContract.role && levelMatch && rulers) {
			contractData = {
				correction: latestContract.correction
					? JSON.parse(latestContract.correction)
					: undefined,
				hardBlocks: latestContract.hard_blocks
					? JSON.parse(latestContract.hard_blocks)
					: undefined,
				levelMatch,
				role: latestContract.role,
				rulers,
			};
		}
	} catch (e) {
		console.error('Failed to parse contract data:', e);
	}

	if (!contractData) {
		return data(
			{ error: 'Invalid contract data in session' },
			{ status: 500 },
		);
	}

	// Buscar protocolo de coleta existente
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	let protocol = protocols[0];

	// Se não existir protocolo, derivar automaticamente
	if (!protocol) {
		const derivedProtocol = deriveCriteria(contractData);

		// Extrair critérios e blocos usando helper
		const { blocksJson, criteriaIds } = extractProtocolData(derivedProtocol);

		const protocolId = crypto.randomUUID();
		await repos.collectionProtocols.create(
			protocolId,
			sessionId,
			latestContract.id,
			criteriaIds,
			blocksJson as unknown as string[],
		);

		// Atualizar sessão com protocolo (armazenado como JSON string)
		await repos.sessions.update(sessionId, {
			protocol: derivedProtocol as unknown as CollectionPayload,
		});

		// Log de auditoria da derivação do protocolo
		logProtocolDerived(
			sessionId,
			protocolId,
			derivedProtocol.criteria.length,
			derivedProtocol.implicitCriteria,
		);

		// Recarregar protocolo criado
		const protocols =
			await repos.collectionProtocols.findBySessionId(sessionId);
		protocol = protocols[0];
	}

	const protocolData = protocol
		? {
				blocks: protocol.blocks ? JSON.parse(protocol.blocks) : [],
				criteria: protocol.criteria ? JSON.parse(protocol.criteria) : [],
				id: protocol.id,
				payload: protocol.payload ? JSON.parse(protocol.payload) : null,
				status: protocol.status,
			}
		: null;

	// Identificar próximo bloco pendente
	const nextBlock = identifyNextBlock(
		protocolData?.blocks,
		protocolData?.payload,
	);

	return {
		contract: contractData,
		nextBlock,
		protocol: protocolData,
		session: {
			...session,
			contract: contractData,
		},
		totalBlocks: protocolData?.blocks?.length ?? 0,
	};
}

export async function action({ params, request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data({ error: 'Session ID required' }, { status: 400 });
	}

	// Buscar sessão para validação de modo
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return data({ error: 'Session not found' }, { status: 404 });
	}

	// Validação de modo: Actions de Stage 2 requerem MODE_PREPARATION
	const modeValidation = validateSessionMode(session.mode, [
		'MODE_PREPARATION',
	]);
	if (!modeValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
			modeValidation.error || 'Invalid mode',
			modeValidation.status,
		);
	}

	const formData = await request.formData();
	const actionType = formData.get('_action');

	switch (actionType) {
		case 'derive-protocol':
			return handleDeriveProtocol(sessionId, repos);
		case 'submit-response':
			return handleSubmitResponse(formData, sessionId, repos);
		case 'complete-collection':
			return handleCompleteCollection(sessionId, repos);
		default:
			return data({ error: 'Unknown action type' }, { status: 400 });
	}
}

async function handleDeriveProtocol(
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	// Buscar contrato
	const contracts = await repos.contracts.findBySessionId(sessionId);
	const latestContract = contracts[0];

	if (!latestContract) {
		return data({ error: 'No contract found for session' }, { status: 404 });
	}

	// Reconstruct CognitiveContract from individual fields with error handling
	let contractData: CognitiveContract | null = null;
	try {
		const levelMatch = latestContract.level_match
			? JSON.parse(latestContract.level_match)
			: null;
		const rulers = latestContract.rulers ? JSON.parse(latestContract.rulers) : null;

		// Validar dados mínimos necessários
		if (latestContract.role && levelMatch && rulers) {
			contractData = {
				correction: latestContract.correction
					? JSON.parse(latestContract.correction)
					: undefined,
				hardBlocks: latestContract.hard_blocks
					? JSON.parse(latestContract.hard_blocks)
					: undefined,
				levelMatch,
				role: latestContract.role,
				rulers,
			};
		}
	} catch (e) {
		console.error('Failed to parse contract data:', e);
	}

	if (!contractData) {
		return data({ error: 'Invalid contract data' }, { status: 500 });
	}

	// Derivar protocolo
	const protocol = deriveCriteria(contractData);

	// Extrair critérios e blocos usando helper
	const { blocksJson, criteriaIds } = extractProtocolData(protocol);

	// Salvar protocolo
	const protocolId = crypto.randomUUID();
	await repos.collectionProtocols.create(
		protocolId,
		sessionId,
		latestContract.id,
		criteriaIds,
		blocksJson as unknown as string[],
	);

	// Atualizar sessão com protocolo
	await repos.sessions.update(sessionId, {
		protocol: protocol as unknown as CollectionPayload,
	});

	// Log de auditoria da derivação do protocolo
	logProtocolDerived(
		sessionId,
		protocolId,
		protocol.criteria.length,
		protocol.implicitCriteria,
	);

	return {
		protocol: {
			blocks: blocksJson,
			criteria: criteriaIds,
			id: protocolId,
		},
		success: true,
	};
}

async function handleSubmitResponse(
	formData: FormData,
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	const blockId = formData.get('blockId');
	const response = formData.get('response');
	const responsesParam = formData.get('responses');

	if (!blockId || response === null) {
		return data(
			{ error: 'Missing required fields: blockId, response' },
			{ status: 400 },
		);
	}

	// Buscar protocolo existente
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	const protocol = protocols[0];

	if (!protocol) {
		return data({ error: 'Protocol not found for session' }, { status: 404 });
	}

	// Parse respostas existentes ou criar novo objeto
	const currentResponses = responsesParam
		? JSON.parse(responsesParam as string)
		: protocol.payload
			? JSON.parse(protocol.payload)
			: {};

	// Adicionar/atualizar resposta do bloco
	currentResponses[blockId as string] = response;

	// Validar resposta contra schema do bloco
	const blocks: CollectionBlock[] = protocol.blocks
		? JSON.parse(protocol.blocks)
		: [];
	const currentBlock = blocks.find((b) => b.id === blockId);

	if (!currentBlock) {
		return data({ error: 'Block not found' }, { status: 404 });
	}

	// Validação básica (pode ser expandida conforme schema)
	if (typeof response !== 'string' || response.trim().length === 0) {
		return data({ error: 'Response cannot be empty' }, { status: 400 });
	}

	// Atualizar payload no banco
	await repos.collectionProtocols.update(protocol.id, {
		payload: currentResponses as unknown as CollectionPayload,
		status: 'in_progress',
	});

	// Identificar próximo bloco
	const nextBlock = identifyNextBlock(blocks, currentResponses);

	return {
		nextBlock,
		responses: currentResponses,
		success: true,
		totalBlocks: blocks.length,
	};
}

async function handleCompleteCollection(
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	// Buscar protocolo
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	const protocol = protocols[0];

	if (!protocol) {
		return data({ error: 'Protocol not found for session' }, { status: 404 });
	}

	const blocks: CollectionBlock[] = protocol.blocks
		? JSON.parse(protocol.blocks)
		: [];
	const responses = protocol.payload ? JSON.parse(protocol.payload) : {};

	// Validar que todos os blocos foram respondidos
	const pendingBlocks = blocks.filter(
		(block) => responses[block.id] === undefined || responses[block.id] === '',
	);

	if (pendingBlocks.length > 0) {
		return data(
			{
				error: 'Pending blocks',
				pendingBlocks: pendingBlocks.map((b) => b.id),
			},
			{ status: 400 },
		);
	}

	// Marcar protocolo como completo
	await repos.collectionProtocols.update(protocol.id, {
		status: 'completed',
	});

	// Transitar sessão para MODE_EXECUTION
	const session = await repos.sessions.findById(sessionId);
	if (session) {
		await repos.sessions.update(sessionId, {
			current_stage: 2,
			mode: 'MODE_EXECUTION',
		});

		// Log de auditoria da transição de modo
		logModeTransition(
			sessionId,
			session.mode,
			'MODE_EXECUTION',
			'Collection completed, transitioning to execution',
		);
	}

	// Gerar payload final para execução
	const finalPayload = {
		collectedData: responses,
		protocolId: protocol.id,
		status: 'complete',
	};

	return {
		finalPayload,
		redirect: `/session/${sessionId}/complete`,
		success: true,
	};
}

/**
 * Identifica o próximo bloco pendente baseado nas respostas atuais
 */
function identifyNextBlock(
	blocks: CollectionBlock[] = [],
	responses: Record<string, unknown> = {},
): CollectionBlock | null {
	for (const block of blocks) {
		if (responses[block.id] === undefined || responses[block.id] === '') {
			return block;
		}
	}
	return null; // Todos os blocos respondidos
}

// Componente UI da página
export default function Stage2Page() {
	const loaderData = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const navigate = useNavigate();

	const [view, setView] = useState<'intro' | 'wizard' | 'review' | 'complete'>(
		'intro',
	);
	const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
	const [responses, setResponses] = useState<Record<string, string>>({});

	// Parse session data from loader
	const sessionData = loaderData ? JSON.parse(String(loaderData)) : null;
	const { session, protocol, nextBlock, contract } = sessionData || {};

	// Initialize responses from protocol payload
	useEffect(() => {
		if (protocol?.payload) {
			setResponses(protocol.payload as Record<string, string>);
		}
	}, [protocol?.payload]);

	// Processar resposta do fetcher
	useEffect(() => {
		if (fetcher.data) {
			const data = fetcher.data as {
				nextBlock?: CollectionBlock | null;
				responses?: Record<string, string>;
				redirect?: string;
				success?: boolean;
				finalPayload?: Record<string, unknown>;
				error?: string;
			};

			if (data.error) {
				alert(data.error);
				return;
			}

			// Se redirecionamento após completar
			if (data.redirect && data.success && data.finalPayload) {
				setView('complete');
				return;
			}

			// Atualizar respostas
			if (data.responses) {
				setResponses(data.responses);
			}

			// Se não há mais blocos pendentes, ir para revisão
			if (data.nextBlock === null && view === 'wizard') {
				setView('review');
			}
		}
	}, [fetcher.data, view]);

	// Handler para enviar resposta de um bloco
	const handleSubmitResponse = (blockId: string, response: string) => {
		if (!session) return;
		const formData = new FormData();
		formData.append('_action', 'submit-response');
		formData.append('blockId', blockId);
		formData.append('response', response);
		formData.append('responses', JSON.stringify(responses));

		fetcher.submit(formData, {
			action: `/session/${session.id}/stage-2`,
			method: 'post',
		});
	};

	// Handler para completar a coleta
	const handleCompleteCollection = () => {
		if (!session) return;
		const formData = new FormData();
		formData.append('_action', 'complete-collection');

		fetcher.submit(formData, {
			action: `/session/${session.id}/stage-2`,
			method: 'post',
		});
	};

	// Handler para navegar para nova sessão
	const handleNewSession = () => {
		navigate('/');
	};

	// Extrair blocos do protocolo
	const blocks: CollectionBlock[] = protocol?.blocks || [];
	const isLoading = fetcher.state === 'submitting';

	// Construir objeto CollectionProtocol para CollectionIntro
	const collectionProtocol = protocol
		? {
				blockingIssue: sessionData?.protocol?.blockingIssue,
				criteria: blocks,
				implicitCriteria: sessionData?.protocol?.implicitCriteria || [],
			}
		: { criteria: [], implicitCriteria: [] };

	// Payload final para CollectionComplete (apenas em view complete)
	const finalPayload =
		(fetcher.data as { finalPayload?: Record<string, unknown> } | null)
			?.finalPayload || responses;

	return (
		<div className="min-h-screen bg-bg-secondary">
			{/* Header */}
			<header className="border-b border-border-primary bg-bg-primary">
				<div className="container-page py-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-text-inverse"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-xl font-semibold text-text-primary">
								Etapa 2 — Protocolo de Coleta
							</h1>
							<p className="text-sm text-text-secondary">
								Coleta de Critérios de Qualidade
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container-page">
				{view === 'intro' && contract && (
					<CollectionIntro
						contract={contract}
						onStart={() => {
							// Se há blocos pendentes, ir para o wizard
							if (nextBlock && blocks.length > 0) {
								const index = blocks.findIndex(
									(b: CollectionBlock) => b.id === nextBlock.id,
								);
								setCurrentBlockIndex(index >= 0 ? index : 0);
							}
							setView('wizard');
						}}
						protocol={collectionProtocol}
					/>
				)}

				{view === 'wizard' && blocks.length > 0 && (
					<CollectionWizard
						blocks={blocks}
						currentBlockIndex={currentBlockIndex}
						isSubmitting={isLoading}
						onComplete={() => setView('review')}
						onNavigate={setCurrentBlockIndex}
						onSubmit={handleSubmitResponse}
						responses={responses}
					/>
				)}

				{view === 'review' && blocks.length > 0 && (
					<CollectionReview
						blocks={blocks}
						isSubmitting={isLoading}
						onComplete={handleCompleteCollection}
						onEdit={(index) => {
							setCurrentBlockIndex(index);
							setView('wizard');
						}}
						responses={responses}
					/>
				)}

				{view === 'complete' && (
					<CollectionComplete
						collectionPrompt={null} // TODO: generate from core/prompts
						finalPayload={finalPayload}
						onNewSession={handleNewSession}
						protocol={collectionProtocol as CollectionProtocol}
						sessionId={session?.id || ''}
					/>
				)}
			</main>
		</div>
	);
}
