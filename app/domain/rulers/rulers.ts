/**
 * Canonical cognitive rulers (5 axes) for the HACI matching engine.
 *
 * Source of truth: docs/raw inputs/canonical-prompt-generator.json
 */

export type RulerId = 'inference' | 'decision' | 'scope' | 'source' | 'meta';

export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export type RulersVector = Record<RulerId, ScaleValue>;

export type RulerScaleItem = {
	aiMeaning: string;
	uiHint: string;
	uiLabel: string;
	value: ScaleValue;
};

export type RulerConfig = {
	id: `ruler.${RulerId}`;
	label: string;
	scale: readonly RulerScaleItem[];
	tooltip: string;
	/** Constitutional cap for this ruler (if any) */
	constitutionalCap?: number;
};

export const RULER_IDS: readonly RulerId[] = [
	'inference',
	'decision',
	'scope',
	'source',
	'meta',
] as const;

export const RULERS: readonly RulerConfig[] = [
	{
		id: 'ruler.inference',
		label: 'Inferência',
		scale: [
			{
				aiMeaning: 'Inferência mínima; evitar suposições e extrapolações.',
				uiHint: 'Sem deduzir intenção; apenas aplicar o que está escrito.',
				uiLabel: 'Somente explícito',
				value: 1,
			},
			{
				aiMeaning: 'Inferência baixa e conservadora.',
				uiHint: 'Deduções simples e locais, sem extrapolar.',
				uiLabel: 'Baixa',
				value: 2,
			},
			{
				aiMeaning: 'Inferência moderada (estrutura/organização).',
				uiHint: 'Inferir estrutura e relações óbvias.',
				uiLabel: 'Média',
				value: 3,
			},
			{
				aiMeaning: 'Inferência alta, mas com rastreabilidade.',
				uiHint: 'Explorar implicações e possibilidades, com cautela.',
				uiLabel: 'Alta (controlada)',
				value: 4,
			},
			{
				aiMeaning:
					'Inferência máxima; alto risco se fonte/escopo não suportarem.',
				uiHint: 'A IA pode interpretar intenção e ampliar opções fortemente.',
				uiLabel: 'Máxima',
				value: 5,
			},
		] as const,
		tooltip: 'Quanto a IA pode deduzir além do que está explícito?',
	},
	{
		constitutionalCap: 3,
		id: 'ruler.decision',
		label: 'Decisão',
		scale: [
			{
				aiMeaning: 'Sem recomendação; sem priorização.',
				uiHint: 'Não recomendar; apenas executar/analisar/organizar.',
				uiLabel: 'Nenhuma',
				value: 1,
			},
			{
				aiMeaning: 'Recomendação permitida, sem decisão final.',
				uiHint: 'Pode sugerir uma opção, com justificativa, sem impor.',
				uiLabel: 'Recomendar (leve)',
				value: 2,
			},
			{
				aiMeaning: 'Autoridade para interromper/validar escopo e regras.',
				uiHint: 'Pode parar, bloquear e exigir clarificação.',
				uiLabel: 'Governança / Bloqueio',
				value: 3,
			},
			{
				aiMeaning: 'Não permitido (violação constitucional).',
				uiHint: 'Reservado; não deve ser usado no sistema.',
				uiLabel: 'Alta (não usar)',
				value: 4,
			},
			{
				aiMeaning: 'Proibido por design.',
				uiHint: 'A IA decide por você. Proibido.',
				uiLabel: 'Total (proibido)',
				value: 5,
			},
		] as const,
		tooltip: 'Quanto a IA pode concluir/recomendar?',
	},
	{
		id: 'ruler.scope',
		label: 'Escopo',
		scale: [
			{
				aiMeaning: 'Atuar somente em partes explicitamente delimitadas.',
				uiHint:
					'Um trecho, um parágrafo, uma função, uma parte bem delimitada.',
				uiLabel: 'Local (trecho específico)',
				value: 1,
			},
			{
				aiMeaning: 'Atuar em um único artefato completo.',
				uiHint: 'Um documento inteiro, uma página, um arquivo.',
				uiLabel: 'Artefato único',
				value: 2,
			},
			{
				aiMeaning: 'Agregação e coerência entre múltiplas fontes fornecidas.',
				uiHint: 'Consolidar/organizar vários artefatos relacionados.',
				uiLabel: 'Multi-artefato',
				value: 3,
			},
			{
				aiMeaning: 'Impacto amplo; exige governança e rastreabilidade.',
				uiHint: 'Afeta estrutura geral, arquitetura ou fluxo completo.',
				uiLabel: 'Projeto / Sistema',
				value: 4,
			},
			{
				aiMeaning: 'Nível constitucional; foco em normas e invariantes.',
				uiHint: 'Define regras, contratos e políticas do sistema.',
				uiLabel: 'Sistêmico (constitucional)',
				value: 5,
			},
		] as const,
		tooltip: 'Qual o alcance do impacto do que a IA vai fazer?',
	},
	{
		id: 'ruler.source',
		label: 'Fonte de verdade',
		scale: [
			{
				aiMeaning: 'Fonte fechada; se faltar dado, parar e pedir.',
				uiHint: 'Nada de pesquisa; nada de conhecimento externo como verdade.',
				uiLabel: 'Fechada (somente o que eu fornecer)',
				value: 1,
			},
			{
				aiMeaning: 'Usar conhecimento estável; evitar fatos voláteis.',
				uiHint: 'Pode usar conhecimento geral, sem citar pesquisas recentes.',
				uiLabel: 'Semiaberta (conhecimento geral)',
				value: 2,
			},
			{
				aiMeaning: 'Pesquisa permitida; citar e reconciliar fontes.',
				uiHint: 'Pode pesquisar e citar fontes quando necessário.',
				uiLabel: 'Aberta (pesquisa permitida)',
				value: 3,
			},
			{
				aiMeaning: 'Pesquisa + comparação + divergências explícitas.',
				uiHint: 'Comparar várias fontes e reportar divergências.',
				uiLabel: 'Aberta (multi-fonte comparativa)',
				value: 4,
			},
			{
				aiMeaning: 'Evitar: risco de irreprodutibilidade e deriva.',
				uiHint: 'Liberdade total de fonte. Evitar por risco de deriva.',
				uiLabel: 'Total (não recomendado)',
				value: 5,
			},
		] as const,
		tooltip: 'De onde a IA pode tirar informação válida?',
	},
	{
		id: 'ruler.meta',
		label: 'Função Meta',
		scale: [
			{
				aiMeaning: 'Sem meta-cognição.',
				uiHint: 'Foco no resultado, sem discutir o processo.',
				uiLabel: 'Sem meta',
				value: 1,
			},
			{
				aiMeaning: 'Meta leve (avisos e limites).',
				uiHint: 'Pode sinalizar riscos e limites quando necessário.',
				uiLabel: 'Leve',
				value: 2,
			},
			{
				aiMeaning: 'Meta moderada (contrato e rastreabilidade).',
				uiHint: 'Pode explicitar pressupostos e contratos básicos.',
				uiLabel: 'Moderada',
				value: 3,
			},
			{
				aiMeaning: 'Meta alta (explicação do processo).',
				uiHint:
					'Pode justificar escolhas e explicar por que certas regras existem.',
				uiLabel: 'Alta',
				value: 4,
			},
			{
				aiMeaning: 'Meta máxima (níveis 7–8 típicos).',
				uiHint: 'A IA atua sobre o sistema: contratos, níveis, governança.',
				uiLabel: 'Máxima (arquitetura)',
				value: 5,
			},
		] as const,
		tooltip: 'A IA atua só no conteúdo ou também no processo cognitivo?',
	},
] as const;

export const DEFAULT_WEIGHTS: Record<RulerId, number> = {
	decision: 1.5,
	inference: 1.0,
	meta: 1.3,
	scope: 1.2,
	source: 1.5,
} as const;

export function getRulerConfig(rulerId: RulerId): RulerConfig | undefined {
	return RULERS.find((r) => r.id === `ruler.${rulerId}`);
}

export function isRulerId(value: unknown): value is RulerId {
	return RULER_IDS.includes(value as RulerId);
}

export function isScaleValue(value: unknown): value is ScaleValue {
	return (
		typeof value === 'number' &&
		value >= 1 &&
		value <= 5 &&
		Number.isInteger(value)
	);
}
