import type { RulerId, RulersVector } from '~/types';

interface CorrectionDelta {
	rulersDelta: Partial<RulersVector>;
	reason: string;
}

/**
 * Gera sugestões de correção local quando match é ambíguo
 *
 * Restrições canônicas (docs/07-level-matching.md seção 7):
 * - Máximo 2 réguas alteradas
 * - Magnitude máxima ±1 por régua
 * - Retornar 2-3 alternativas
 *
 * @param rulers - Vetor atual do usuário
 * @param targetVector - Vetor do nível alvo mais próximo
 * @returns Lista de correções sugeridas
 */
export function suggestCorrections(
	rulers: RulersVector,
	targetVector: RulersVector,
): CorrectionDelta[] {
	const corrections: CorrectionDelta[] = [];

	// Encontrar réguas com maior divergência
	const divergences: { ruler: RulerId; diff: number }[] = (
		Object.keys(rulers) as RulerId[]
	)
		.map((ruler) => ({
			diff: Math.abs(rulers[ruler] - targetVector[ruler]),
			ruler,
		}))
		.filter((d) => d.diff > 0)
		.sort((a, b) => b.diff - a.diff);

	// Gerar correções para as 2-3 maiores divergências
	for (let i = 0; i < Math.min(3, divergences.length); i++) {
		const { ruler } = divergences[i];
		const targetValue = targetVector[ruler];
		const currentValue = rulers[ruler];

		// Correção: mover em direção ao alvo (máximo ±1)
		const delta = targetValue > currentValue ? 1 : -1;
		const newValue = Math.max(1, Math.min(5, currentValue + delta)) as
			| 1
			| 2
			| 3
			| 4
			| 5;

		corrections.push({
			reason: getCorrectionReason(ruler, currentValue, newValue, targetValue),
			rulersDelta: {
				[ruler]: newValue,
			},
		});
	}

	// Se houver múltiplas divergências, sugerir correção combinada
	if (divergences.length >= 2) {
		const combinedDelta: Partial<RulersVector> = {};
		const reasons: string[] = [];

		for (let i = 0; i < Math.min(2, divergences.length); i++) {
			const { ruler } = divergences[i];
			const targetValue = targetVector[ruler];
			const currentValue = rulers[ruler];
			const delta = targetValue > currentValue ? 1 : -1;
			combinedDelta[ruler] = Math.max(1, Math.min(5, currentValue + delta)) as
				| 1
				| 2
				| 3
				| 4
				| 5;
			reasons.push(getRulerLabel(ruler));
		}

		corrections.push({
			reason: `Ajustar ${reasons.join(' e ')} para melhor alinhamento`,
			rulersDelta: combinedDelta,
		});
	}

	return corrections.slice(0, 3); // Máximo 3 correções
}

function getCorrectionReason(
	ruler: RulerId,
	current: number,
	proposed: number,
	target: number,
): string {
	const rulerLabel = getRulerLabel(ruler);
	return `Ajustar ${rulerLabel} de ${current} para ${proposed} (alvo: ${target})`;
}

function getRulerLabel(ruler: RulerId): string {
	const labels: Record<RulerId, string> = {
		decision: 'Decisão',
		inference: 'Inferência',
		meta: 'Meta',
		scope: 'Escopo',
		source: 'Fonte',
	};
	return labels[ruler];
}

/**
 * Aplica delta de correção ao vetor de réguas
 *
 * @param rulers - Vetor original
 * @param delta - Delta para aplicar
 * @returns Novo vetor com correção aplicada
 */
export function applyDelta(
	rulers: RulersVector,
	delta: Partial<RulersVector>,
): RulersVector {
	return {
		...rulers,
		...delta,
	};
}
