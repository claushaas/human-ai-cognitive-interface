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

	// Parse contrato e protocolo de coleção com tratamento de erro
	let contractData: CognitiveContract | null = null;
	if (contract) {
		try {
			const levelMatch = contract.level_match
				? JSON.parse(contract.level_match)
				: null;
			const rulers = contract.rulers ? JSON.parse(contract.rulers) : null;

			// Validar dados mínimos necessários
			if (contract.role && levelMatch && rulers) {
				contractData = {
					correction: contract.correction
						? JSON.parse(contract.correction)
						: undefined,
					hardBlocks: contract.hard_blocks
						? JSON.parse(contract.hard_blocks)
						: undefined,
					levelMatch,
					role: contract.role,
					rulers,
				};
			}
		} catch (e) {
			console.error('Failed to parse contract data:', e);
			contractData = null;
		}
	}
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
