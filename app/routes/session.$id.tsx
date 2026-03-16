import type { LoaderFunctionArgs } from 'react-router';
import { Outlet } from 'react-router';
import { generateCollectionPrompt } from '~/core/prompts/collection';
import { generateContractPrompt } from '~/core/prompts/contract';
import { createRepositories } from '~/db';
import type { CognitiveContract, CollectionProtocol } from '~/types';

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

	// Buscar sessão
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
	}

	// Buscar contrato mais recente
	const contracts = await repos.contracts.findBySessionId(sessionId);
	const contract = contracts[0];

	// Parse contrato e protocolo de coleção
	const contractData = contract?.contract_data
		? (JSON.parse(contract.contract_data) as CognitiveContract)
		: null;
	const protocolData = session.protocol
		? (JSON.parse(session.protocol) as CollectionProtocol)
		: null;

	// Gerar prompts
	const contractPrompt = contractData
		? generateContractPrompt(contractData)
		: null;

	const collectionPrompt = protocolData
		? generateCollectionPrompt(protocolData)
		: null;

	return new Response(
		JSON.stringify({
			contract: contractData,
			prompts: {
				collection: collectionPrompt,
				contract: contractPrompt,
			},
			session: {
				...session,
				contract: contractData,
				protocol: protocolData,
			},
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

export default function SessionLayout() {
	return <Outlet />;
}
