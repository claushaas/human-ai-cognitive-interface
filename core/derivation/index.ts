import type {
	CognitiveContract,
	CollectionProtocol,
	CriterionId,
} from '~/types';
import { generateCollectionBlocks } from './blocks';
import { getImplicitCriteria } from './implicit';
import { orderCriteria } from './ordering';
import { deriveAllCriteria } from './rules';

/**
 * Motor de derivação de critérios
 *
 * Transforma um Contrato Cognitivo em um Protocolo de Coleta
 * conforme docs/08-criteria-and-collection-protocol.md
 *
 * @param contract - Contrato cognitivo validado
 * @returns Protocolo de coleta completo
 */
export function deriveCriteria(
	contract: CognitiveContract,
): CollectionProtocol {
	const { role, levelMatch, rulers } = contract;

	// 1. Derivar todos os critérios baseados nas regras R0-R8
	const rawCriteria = deriveAllCriteria({
		level: levelMatch.selectedLevel,
		role,
		rulers,
	});

	// 2. Identificar critérios implícitos
	const implicitCriteria = getImplicitCriteria(role, levelMatch.selectedLevel);

	// 3. Filtrar critérios implícitos (não precisam ser coletados)
	const explicitCriteria = rawCriteria.filter(
		(c) => !implicitCriteria.includes(c),
	);

	// 4. Ordenar critérios pela ordem UX canônica
	const orderedCriteria = orderCriteria(explicitCriteria);

	// 5. Gerar blocos de coleta
	const criteriaBlocks = generateCollectionBlocks(orderedCriteria, {
		contract,
	});

	// 6. Construir protocolo
	const protocol: CollectionProtocol = {
		collectionPayloadSchema: buildPayloadSchema(orderedCriteria),
		criteria: criteriaBlocks,
		implicitCriteria,
		protocolVersion: '1.0.0',
	};

	// 7. Verificar bloqueios
	const blockingIssue = checkBlockingIssues(contract);
	if (blockingIssue) {
		protocol.blockingIssue = blockingIssue.issue;
		protocol.question = blockingIssue.question;
	}

	return protocol;
}

/**
 * Verifica se há questões bloqueantes que impedem coleta
 */
function checkBlockingIssues(
	_contract: CognitiveContract,
): { issue: string; question: string } | null {
	// TODO: Implementar verificações de bloqueio específicas
	// Por exemplo: contrato inválido, nível incompatível, etc.
	return null;
}

/**
 * Constrói schema JSON para o payload de coleta
 */
function buildPayloadSchema(criteria: CriterionId[]): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		properties: {},
		required: [],
		type: 'object',
	};

	// Mapear critérios para propriedades do schema
	for (const criterion of criteria) {
		if (criterion === 'C1') {
			schema.properties.objective = {
				description: 'Objetivo operacional',
				minLength: 10,
				type: 'string',
			};
			schema.required.push('objective');
		} else if (criterion === 'C2') {
			schema.properties.artifact = {
				description: 'Artefato/resultado esperado',
				type: 'string',
			};
		} else if (criterion === 'C3') {
			schema.properties.scope = {
				description: 'Escopo de atuação',
				type: 'string',
			};
		} else if (criterion === 'C4') {
			schema.properties.sources = {
				description: 'Fontes da verdade',
				items: { type: 'string' },
				type: 'array',
			};
		} else if (criterion === 'C5') {
			schema.properties.inferenceLimits = {
				description: 'Limites de inferência',
				type: 'string',
			};
		} else if (criterion === 'C6') {
			schema.properties.authority = {
				description: 'Autoridade e limites de decisão',
				type: 'string',
			};
		} else if (criterion === 'C8') {
			schema.properties.allowedTransforms = {
				description: 'Transformações permitidas',
				items: { type: 'string' },
				type: 'array',
			};
		} else if (criterion === 'C9') {
			schema.properties.forbiddenTransforms = {
				description: 'Transformações proibidas',
				items: { type: 'string' },
				type: 'array',
			};
		} else if (criterion === 'C10') {
			schema.properties.outputFormat = {
				description: 'Formato de saída',
				type: 'string',
			};
		} else if (criterion === 'C11') {
			schema.properties.successCriteria = {
				description: 'Critérios de sucesso',
				items: { type: 'string' },
				type: 'array',
			};
		} else if (criterion === 'C12') {
			schema.properties.stoppingConditions = {
				description: 'Condições de parada/erro',
				items: { type: 'string' },
				type: 'array',
			};
		} else if (criterion === 'C13') {
			schema.properties.technicalContext = {
				description: 'Dependências e contexto técnico',
				type: 'string',
			};
		} else if (criterion === 'C14') {
			schema.properties.securityConstraints = {
				description: 'Restrições de segurança/conformidade',
				items: { type: 'string' },
				type: 'array',
			};
		}
	}

	return schema;
}
