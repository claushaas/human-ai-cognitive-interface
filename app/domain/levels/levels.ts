/**
 * Canonical cognitive levels (N1–N8) for the HACI matching engine.
 *
 * Source of truth: docs/raw inputs/canonical-prompt-generator.json
 */

import type { RulersVector } from '../rulers/rulers';

export type LevelId = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8';

export type CanonicalLevel = {
	id: LevelId;
	name: string;
	vector: RulersVector;
};

export const LEVEL_IDS: readonly LevelId[] = [
	'N1',
	'N2',
	'N3',
	'N4',
	'N5',
	'N6',
	'N7',
	'N8',
] as const;

export const OPERATIONAL_LEVELS: readonly LevelId[] = [
	'N1',
	'N2',
	'N3',
	'N4',
	'N5',
	'N6',
] as const;

export const META_LEVELS: readonly LevelId[] = ['N7', 'N8'] as const;

export const CANONICAL_LEVELS: readonly CanonicalLevel[] = [
	{
		id: 'N1',
		name: 'Execução Estritamente Delimitada',
		vector: { decision: 1, inference: 1, meta: 1, scope: 1, source: 1 },
	},
	{
		id: 'N2',
		name: 'Análise Controlada e Diagnóstico',
		vector: { decision: 1, inference: 2, meta: 1, scope: 2, source: 1 },
	},
	{
		id: 'N3',
		name: 'Síntese Estruturada e Organização Cognitiva',
		vector: { decision: 1, inference: 3, meta: 1, scope: 3, source: 1 },
	},
	{
		id: 'N4',
		name: 'Exploração de Alternativas e Trade-offs',
		vector: { decision: 1, inference: 4, meta: 1, scope: 4, source: 2 },
	},
	{
		id: 'N5',
		name: 'Apoio à Decisão Humana',
		vector: { decision: 2, inference: 4, meta: 2, scope: 4, source: 2 },
	},
	{
		id: 'N6',
		name: 'Governança, Controle e Segurança Cognitiva',
		vector: { decision: 3, inference: 2, meta: 3, scope: 5, source: 1 },
	},
	{
		id: 'N7',
		name: 'Meta-Cognição e Arquitetura de Pensamento',
		vector: { decision: 1, inference: 3, meta: 5, scope: 4, source: 2 },
	},
	{
		id: 'N8',
		name: 'Documentação, Contratos e Sistemas de Uso',
		vector: { decision: 2, inference: 2, meta: 5, scope: 5, source: 1 },
	},
] as const;

export function isOperationalLevel(levelId: LevelId): boolean {
	return OPERATIONAL_LEVELS.includes(levelId);
}

export function isMetaLevel(levelId: LevelId): boolean {
	return META_LEVELS.includes(levelId);
}

export function isLevelId(value: unknown): value is LevelId {
	return LEVEL_IDS.includes(value as LevelId);
}

export function getLevelById(levelId: LevelId): CanonicalLevel | undefined {
	return CANONICAL_LEVELS.find((l) => l.id === levelId);
}

export function getLevelName(levelId: LevelId): string {
	return getLevelById(levelId)?.name ?? levelId;
}
