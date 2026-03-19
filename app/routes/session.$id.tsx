import type { LoaderFunctionArgs } from 'react-router';
import { data, Outlet } from 'react-router';
import { generateCollectionPrompt } from '~/core/prompts/collection';
import { generateContractPrompt } from '~/core/prompts/contract';
import { createRepositories } from '~/db';
import type { CognitiveContract, CollectionProtocol } from '~/types';

export async function loader({ params, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data({ error: 'Session ID required' }, { status: 400 });
	}

	// Buscar sessão
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return data({ error: 'Session not found' }, { status: 404 });
	}

	// Buscar contrato mais recente
	const contracts = await repos.contracts.findBySessionId(sessionId);
	const contract = contracts[0];

	// Parse contrato e protocolo de coleção
	const contractData: CognitiveContract | null = contract
		? {
				correction: contract.correction
					? JSON.parse(contract.correction)
					: undefined,
				hardBlocks: contract.hard_blocks
					? JSON.parse(contract.hard_blocks)
					: undefined,
				levelMatch: JSON.parse(contract.level_match),
				role: contract.role,
				rulers: JSON.parse(contract.rulers),
			}
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

	return {
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
	};
}

export default function SessionLayout() {
	return <Outlet />;
}
