import type { CanonicalLevelId, InitialRoleId, RulersVector } from '~/types';
import canonicalLevels from '../../config/canonical-levels.json';
import { suggestCorrections } from './corrections';
import { calculateWeightedManhattanDistance } from './distance';
import { evaluateHardBlocks } from './hard-blocks';
import { applyPriorBoost } from './priors';
import { normalizeScore } from './score';
import { DEFAULT_THRESHOLDS } from './thresholds';
import { selectTrack } from './track-selection';
import { DEFAULT_RULER_WEIGHTS } from './weights';

interface MatchCandidate {
	level: CanonicalLevelId;
	score: number;
	rawScore: number;
	priorBoost: number;
}

interface MatchResult {
	selectedLevel?: CanonicalLevelId;
	candidates: MatchCandidate[];
	score: number;
	autoSelected: boolean;
	corrections?: Array<{
		rulersDelta: Partial<RulersVector>;
		reason: string;
	}>;
	hardBlocks?: Array<{
		ruleId: string;
		message: string;
		severity: 'BLOCK' | 'WARN' | 'CONFIRM';
	}>;
}

/**
 * Calcula match entre vetor de réguas do usuário e níveis canônicos
 *
 * Algoritmo:
 * 1. Seleciona track (operacional N1-N6 ou meta N7-N8)
 * 2. Calcula distância Manhattan ponderada para cada nível no track
 * 3. Normaliza score (0-100)
 * 4. Aplica prior boost baseado no papel
 * 5. Filtra candidatos por threshold
 * 6. Decide: auto-seleção, candidatos múltiplos, ou bloqueio
 *
 * @param rulers - Vetor de réguas do usuário
 * @param role - Papel inicial (para prior boost)
 * @returns Resultado do match
 */
export function calculateMatch(
	rulers: RulersVector,
	role: InitialRoleId,
): MatchResult {
	// 1. Avaliar hard blocks primeiro
	const hardBlocks = evaluateHardBlocks(rulers, role);
	const blockingHardBlocks = hardBlocks.filter((hb) => hb.severity === 'BLOCK');

	if (blockingHardBlocks.length > 0) {
		return {
			autoSelected: false,
			candidates: [],
			hardBlocks: blockingHardBlocks,
			score: 0,
		};
	}

	// 2. Selecionar track baseado nas réguas
	const allowedLevels = selectTrack(rulers);

	// 3. Calcular scores para cada nível no track
	const candidates: MatchCandidate[] = [];
	const maxPossibleDistance = calculateMaxDistance();

	for (const levelData of canonicalLevels.levels) {
		const levelId = levelData.id as CanonicalLevelId;

		// Pular níveis fora do track
		if (!allowedLevels.includes(levelId)) {
			continue;
		}

		const levelVector = levelData.vector as RulersVector;

		// Calcular distância e score
		const distance = calculateWeightedManhattanDistance(
			rulers,
			levelVector,
			DEFAULT_RULER_WEIGHTS,
		);
		const rawScore = normalizeScore(distance, maxPossibleDistance);

		// Aplicar prior boost
		const boostedScore = applyPriorBoost(rawScore, role, levelId);

		candidates.push({
			level: levelId,
			priorBoost: Math.round((boostedScore - rawScore) * 100) / 100,
			rawScore: Math.round(rawScore),
			score: Math.round(boostedScore),
		});
	}

	// 4. Ordenar candidatos por score
	candidates.sort((a, b) => b.score - a.score);

	// 5. Filtrar por threshold mínimo
	const filteredCandidates = candidates.filter(
		(c) => c.score >= DEFAULT_THRESHOLDS.candidatesMin,
	);

	// 6. Decidir resultado
	// Se nenhum candidato acima do threshold de bloqueio
	if (
		filteredCandidates.length === 0 ||
		(candidates.length > 0 &&
			candidates[0].score < DEFAULT_THRESHOLDS.blockBelow)
	) {
		const bestCandidate = candidates[0];
		return {
			autoSelected: false,
			candidates: [],
			corrections: bestCandidate
				? suggestCorrections(rulers, getLevelVector(bestCandidate.level))
				: undefined,
			hardBlocks: hardBlocks.filter((hb) => hb.severity !== 'BLOCK'),
			score: bestCandidate?.score ?? 0,
		};
	}

	// 7. Verificar auto-seleção (score >= 90 e claramente dominante)
	const topCandidate = filteredCandidates[0];
	if (topCandidate.score >= DEFAULT_THRESHOLDS.autoSelectMin) {
		// Verificar se é claramente dominante (diferença > 15 para o segundo)
		const secondCandidate = filteredCandidates[1];
		const isDominant =
			!secondCandidate || topCandidate.score - secondCandidate.score > 15;

		if (isDominant) {
			return {
				autoSelected: true,
				candidates: [topCandidate],
				hardBlocks: hardBlocks.filter((hb) => hb.severity !== 'BLOCK'),
				score: topCandidate.score,
				selectedLevel: topCandidate.level,
			};
		}
	}

	// 8. Retornar múltiplos candidatos (ambíguo)
	const topCandidates = filteredCandidates.slice(
		0,
		DEFAULT_THRESHOLDS.maxCandidates,
	);

	return {
		autoSelected: false,
		candidates: topCandidates,
		corrections: suggestCorrections(
			rulers,
			getLevelVector(topCandidates[0].level),
		),
		hardBlocks: hardBlocks.filter((hb) => hb.severity !== 'BLOCK'),
		score: topCandidates[0].score,
	};
}

/**
 * Calcula distância máxima possível (pior caso)
 * Considera pesos e faixas de cada régua
 */
function calculateMaxDistance(): number {
	// inference: |5-1| * 1.0 = 4.0
	// decision: |3-1| * 1.5 = 3.0 (decision vai até 3)
	// scope: |5-1| * 1.2 = 4.8
	// source: |5-1| * 1.5 = 6.0
	// meta: |5-1| * 1.3 = 5.2
	// Total: 23.0
	return (
		4 * DEFAULT_RULER_WEIGHTS.inference +
		2 * DEFAULT_RULER_WEIGHTS.decision +
		4 * DEFAULT_RULER_WEIGHTS.scope +
		4 * DEFAULT_RULER_WEIGHTS.source +
		4 * DEFAULT_RULER_WEIGHTS.meta
	);
}

/**
 * Obtém vetor de um nível canônico
 */
function getLevelVector(level: CanonicalLevelId): RulersVector {
	const levelData = canonicalLevels.levels.find((l) => l.id === level);
	if (!levelData) {
		throw new Error(`Nível canônico não encontrado: ${level}`);
	}
	return levelData.vector as RulersVector;
}

// Exportar tipos e utilitários
export type { MatchCandidate, MatchResult };
export {
	applyPriorBoost,
	calculateWeightedManhattanDistance,
	DEFAULT_RULER_WEIGHTS,
	DEFAULT_THRESHOLDS,
	evaluateHardBlocks,
	normalizeScore,
	selectTrack,
	suggestCorrections,
};
