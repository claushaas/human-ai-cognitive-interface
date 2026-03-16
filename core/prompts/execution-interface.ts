import type { CognitiveContract, CollectionProtocol } from '~/types';

/**
 * Interface para Prompt de Execução
 *
 * Define como o contrato + inputs coletados se transformam em instrução final
 *
 * NOTA: A implementação do prompt de execução está fora de escopo deste sistema.
 * Esta interface define apenas o contrato de entrada/saída para futura implementação.
 */

/**
 * Payload de coleta resultante do protocolo de coleta
 */
export type CollectionPayload = Record<string, unknown>;

/**
 * Contexto completo para execução
 */
export interface ExecutionContext {
	/** Contrato cognitivo validado */
	contract: CognitiveContract;

	/** Protocolo de coleta aplicado */
	protocol: CollectionProtocol;

	/** Dados coletados através do protocolo */
	payload: CollectionPayload;
}

/**
 * Resultado da geração de prompt de execução
 */
export interface ExecutionPromptResult {
	/** Prompt final para execução da tarefa */
	prompt: string;

	/** Metadata sobre a geração */
	metadata: {
		/** Número de critérios satisfeitos */
		criteriaSatisfied: number;

		/** Número total de critérios */
		criteriaTotal: number;

		/** Se todos os critérios obrigatórios foram atendidos */
		allCriteriaMet: boolean;

		/** Timestamp de geração */
		generatedAt: string;
	};
}

/**
 * Valida se o payload de coleta satisfaz o schema do protocolo
 *
 * @param payload - Dados coletados
 * @param protocol - Protocolo com schema esperado
 * @returns true se válido, false caso contrário
 */
export function validateCollectionPayload(
	payload: CollectionPayload,
	protocol: CollectionProtocol,
): boolean {
	// TODO: Implementar validação contra collectionPayloadSchema
	// Esta é uma implementação placeholder para futura validação JSON Schema
	const schema = protocol.collectionPayloadSchema as Record<string, unknown>;

	if (!schema || typeof schema !== 'object') {
		return false;
	}

	const required = schema.required as string[] | undefined;
	const properties = schema.properties as Record<string, unknown> | undefined;

	if (!required || !properties) {
		return Object.keys(payload).length > 0;
	}

	// Verificar se todos os campos required estão presentes
	for (const field of required) {
		if (!(field in payload) || payload[field] === undefined) {
			return false;
		}
	}

	return true;
}

/**
 * Gera contexto de execução validado
 *
 * @param contract - Contrato cognitivo
 * @param protocol - Protocolo de coleta
 * @param payload - Dados coletados
 * @returns Contexto de execução ou erro de validação
 */
export function createExecutionContext(
	contract: CognitiveContract,
	protocol: CollectionProtocol,
	payload: CollectionPayload,
):
	| { context: ExecutionContext; isValid: true }
	| { error: string; isValid: false } {
	const isValid = validateCollectionPayload(payload, protocol);

	if (!isValid) {
		return {
			error: 'Payload de coleta não satisfaz o schema do protocolo',
			isValid: false,
		};
	}

	return {
		context: {
			contract,
			payload,
			protocol,
		},
		isValid: true,
	};
}

/**
 * Interface para implementação futura do gerador de prompt de execução
 *
 * @example
 * ```typescript
 * // Implementação futura:
 * import { generateExecutionPrompt } from './prompts/execution';
 *
 * const result = generateExecutionPrompt(executionContext);
 * ```
 */
export type ExecutionPromptGenerator = (
	context: ExecutionContext,
) => ExecutionPromptResult;

/**
 * Placeholder para função de geração de prompt de execução
 *
 * @deprecated Será implementada em etapa futura
 * @throws Error - Sempre lança erro indicando que está fora de escopo
 */
export function generateExecutionPrompt(_context: ExecutionContext): never {
	throw new Error(
		'generateExecutionPrompt não está implementada — fora de escopo da Etapa 1.3',
	);
}
