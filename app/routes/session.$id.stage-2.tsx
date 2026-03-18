import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
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
		return new Response(JSON.stringify({ error: 'Session ID required' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
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

	if (!latestContract?.contract_data) {
		return new Response(
			JSON.stringify({ error: 'No contract found for session' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 404,
			},
		);
	}

	const contractData = JSON.parse(
		latestContract.contract_data,
	) as CognitiveContract;

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

	return new Response(
		JSON.stringify({
			contract: contractData,
			nextBlock,
			protocol: protocolData,
			session: {
				...session,
				contract: contractData,
			},
			totalBlocks: protocolData?.blocks?.length ?? 0,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

export async function action({ params, request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Session ID required' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	// Buscar sessão para validação de modo
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
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
			return new Response(JSON.stringify({ error: 'Unknown action type' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			});
	}
}

async function handleDeriveProtocol(
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	// Buscar contrato
	const contracts = await repos.contracts.findBySessionId(sessionId);
	const latestContract = contracts[0];

	if (!latestContract?.contract_data) {
		return new Response(
			JSON.stringify({ error: 'No contract found for session' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 404,
			},
		);
	}

	const contractData = JSON.parse(
		latestContract.contract_data,
	) as CognitiveContract;

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

	return new Response(
		JSON.stringify({
			protocol: {
				blocks: blocksJson,
				criteria: criteriaIds,
				id: protocolId,
			},
			success: true,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
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
		return new Response(
			JSON.stringify({ error: 'Missing required fields: blockId, response' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	// Buscar protocolo existente
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	const protocol = protocols[0];

	if (!protocol) {
		return new Response(
			JSON.stringify({ error: 'Protocol not found for session' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 404,
			},
		);
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
		return new Response(JSON.stringify({ error: 'Block not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
	}

	// Validação básica (pode ser expandida conforme schema)
	if (typeof response !== 'string' || response.trim().length === 0) {
		return new Response(JSON.stringify({ error: 'Response cannot be empty' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	// Atualizar payload no banco
	await repos.collectionProtocols.update(protocol.id, {
		payload: currentResponses as unknown as CollectionPayload,
		status: 'in_progress',
	});

	// Identificar próximo bloco
	const nextBlock = identifyNextBlock(blocks, currentResponses);

	return new Response(
		JSON.stringify({
			nextBlock,
			responses: currentResponses,
			success: true,
			totalBlocks: blocks.length,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

async function handleCompleteCollection(
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	// Buscar protocolo
	const protocols = await repos.collectionProtocols.findBySessionId(sessionId);
	const protocol = protocols[0];

	if (!protocol) {
		return new Response(
			JSON.stringify({ error: 'Protocol not found for session' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 404,
			},
		);
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
		return new Response(
			JSON.stringify({
				error: 'Pending blocks',
				pendingBlocks: pendingBlocks.map((b) => b.id),
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
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

	return new Response(
		JSON.stringify({
			finalPayload,
			redirect: `/session/${sessionId}/complete`,
			success: true,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
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
