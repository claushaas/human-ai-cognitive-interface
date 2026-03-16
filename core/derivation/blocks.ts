import type { CollectionBlock, CriterionId } from '~/types';

/**
 * Catálogo de blocos de coleta canônicos
 * Cada critério tem um bloco padrão que é personalizado pelo contrato
 */

const CRITERIA_BLOCKS: Record<CriterionId, Omit<CollectionBlock, 'id'>> = {
	C1: {
		avoid: [
			'Múltiplos objetivos misturados',
			'Instruções vagas ou ambíguas',
			'Pressupostos não declarados',
		],
		example:
			'Analisar o código de autenticação e identificar vulnerabilidades.',
		include: [
			'Verbo de ação no início (analisar, criar, transformar, etc.)',
			'Objeto direto claro (o que será trabalhado)',
			'Contexto mínimo necessário para entendimento',
		],
		instruction:
			'Descreva o que você precisa realizar de forma clara e direta.',
		rationale: 'Objetivo claro direciona toda a execução.',
		title: 'Objetivo Operacional',
	},
	C2: {
		avoid: [
			'Assumir formato padrão sem declarar',
			'Múltiplos formatos conflitantes',
		],
		example: 'Um relatório em markdown com seções para cada vulnerabilidade.',
		include: [
			'Tipo de artefato (código, documento, análise, etc.)',
			'Estrutura esperada (se aplicável)',
			'Nível de detalhe desejado',
		],
		instruction: 'Especifique qual formato de saída você espera receber.',
		rationale: 'Formato claro evita retrabalho.',
		title: 'Artefato/Resultado Esperado',
	},
	C3: {
		avoid: [
			'Escopo implícito não declarado',
			'Misturar níveis de granularidade',
		],
		example:
			'Apenas o módulo de autenticação, sem incluir autorização ou sessão.',
		include: [
			'Componentes/sistemas envolvidos',
			'Limites explícitos (o que está fora)',
			'Dependências relevantes',
		],
		instruction: 'Defina os limites do que deve ser considerado na tarefa.',
		rationale: 'Escopo delimitado foca a execução.',
		title: 'Escopo de Atuação',
	},
	C4: {
		avoid: ['Fontes conflitantes', 'Fontes não verificáveis'],
		example: 'Documentação oficial do React e código em src/components/',
		include: [
			'Documentação de referência',
			'Código-fonte relevante',
			'Restrições de fontes externas',
		],
		instruction: 'Identifique quais são as fontes de informação válidas.',
		rationale: 'Fontes claras garantem precisão.',
		title: 'Fonte da Verdade',
	},
	C5: {
		avoid: [
			'Inferências não validadas apresentadas como fato',
			'Suposições críticas',
		],
		example:
			'Pode inferir padrões de código, mas não crie funcionalidades não declaradas.',
		include: [
			'Inferências permitidas',
			'Áreas que exigem explicitidade',
			'Grau de especulação aceitável',
		],
		instruction:
			'Esclareça o que pode ser inferido vs. o que precisa ser explícito.',
		rationale: 'Limites de inferência previnem erros de interpretação.',
		title: 'Limites de Inferência',
	},
	C6: {
		avoid: ['Ambiguidade sobre autoridade', 'Decisões conflitantes'],
		example:
			'Recomende abordagens com prós/contras, mas não implemente sem aprovação.',
		include: [
			'Nível de autonomia permitido',
			'Decisões que requerem aprovação',
			'Critérios de priorização',
		],
		instruction:
			'Defina quem toma decisões e quais são os limites de autonomia.',
		rationale: 'Autoridade clara evita decisões não alinhadas.',
		title: 'Autoridade/Decisão',
	},
	C7: {
		avoid: ['Misturar modos sem clareza', 'Executar quando deveria preparar'],
		example:
			'Este é um pedido de preparação: derive critérios, não execute a tarefa.',
		include: [
			'Modo atual (preparação ou execução)',
			'Próximos passos esperados',
		],
		instruction: 'Esclareça se este é um pedido de execução ou de preparação.',
		rationale: 'Modo claro alinha expectativas.',
		title: 'Execução vs Preparação',
	},
	C8: {
		avoid: [
			'Transformações não declaradas',
			'Mudanças de escopo não autorizadas',
		],
		example: 'Reestruturar seções é permitido; alterar conteúdo técnico não.',
		include: [
			'Tipos de transformação (reestruturar, traduzir, refatorar)',
			'Margem para mudanças de formato',
			'Elementos que podem ser modificados',
		],
		instruction: 'Liste quais transformações são válidas para esta tarefa.',
		rationale: 'Transformações claras preservam intenção.',
		title: 'Transformações Permitidas',
	},
	C9: {
		avoid: ['Proibições vagas', 'Restrições conflitantes'],
		example: 'Não alterar nomes de variáveis públicas ou APIs exportadas.',
		include: [
			'Elementos intocáveis',
			'Propriedades críticas a preservar',
			'Limites absolutos',
		],
		instruction: 'Liste o que NÃO deve ser transformado ou alterado.',
		rationale: 'Proibições claras previnem danos.',
		title: 'Transformações Proibidas',
	},
	C10: {
		avoid: ['Formato incompatível com o artefato', 'Detalhes desnecessários'],
		example: 'Markdown com headings ## para seções principais.',
		include: [
			'Estrutura (seções, ordem)',
			'Convenções (nomenclatura, estilo)',
			'Meio de entrega (arquivo, mensagem, etc.)',
		],
		instruction: 'Especifique detalhes do formato de entrega.',
		rationale: 'Formato adequado facilita uso.',
		title: 'Formato de Saída',
	},
	C11: {
		avoid: ['Critérios subjetivos', 'Validação impossível'],
		example: 'Código deve passar nos testes existentes sem modificações.',
		include: [
			'Critérios objetivos de sucesso',
			'Métodos de validação',
			'Quem valida (se aplicável)',
		],
		instruction: 'Defina como o resultado será validado.',
		rationale: 'Validação clara define "pronto".',
		title: 'Critérios de Sucesso/Validação',
	},
	C12: {
		avoid: ['Continuar em erro conhecido', 'Ignorar bloqueios'],
		example: 'Se encontrar dependências circulares, pare e reporte.',
		include: [
			'Condições de bloqueio',
			'Quando pedir clarificação',
			'Fallbacks aceitáveis',
		],
		instruction: 'Especifique quando interromper ou reportar erro.',
		rationale: 'Parada clara previne perda de esforço.',
		title: 'Condições de Parada/Erro',
	},
	C13: {
		avoid: ['Dependências implícitas', 'Versões não declaradas'],
		example: 'TypeScript 5.x, Node 20+, strict mode habilitado.',
		include: [
			'Tecnologias envolvidas',
			'Versões críticas',
			'Restrições de ambiente',
		],
		instruction: 'Liste dependências técnicas e contexto relevante.',
		rationale: 'Contexto técnico garante compatibilidade.',
		title: 'Dependências/Contexto Técnico',
	},
	C14: {
		avoid: ['Ignorar requisitos de segurança', 'Conformidade superficial'],
		example: 'Não expor chaves de API ou dados sensíveis no código.',
		include: [
			'Requisitos de segurança',
			'Conformidade regulatória',
			'Políticas organizacionais',
		],
		instruction: 'Declare restrições de segurança ou conformidade aplicáveis.',
		rationale: 'Segurança não negociável.',
		title: 'Restrições de Segurança/Conformidade',
	},
};

/**
 * Gera bloco de coleta personalizado para um critério
 *
 * @param criterionId - ID do critério
 * @param _context - Contexto para personalização (futuro)
 * @returns Bloco de coleta completo
 */
export function generateCollectionBlock(
	criterionId: CriterionId,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_context?: Record<string, unknown>,
): CollectionBlock {
	const baseBlock = CRITERIA_BLOCKS[criterionId];

	return {
		id: criterionId,
		...baseBlock,
	};
}

/**
 * Gera blocos para múltiplos critérios
 */
export function generateCollectionBlocks(
	criteria: CriterionId[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	context?: Record<string, unknown>,
): CollectionBlock[] {
	return criteria.map((id) => generateCollectionBlock(id, context));
}
