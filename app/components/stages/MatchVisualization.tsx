// Dados dos níveis canônicos
import canonicalLevels from '~/config/canonical-levels.json';
import type { CanonicalLevelId, LevelMatch, RulersVector } from '~/types';

interface MatchVisualizationProps {
	levelMatch: LevelMatch;
	currentRulers: RulersVector;
	onSelectLevel?: (level: CanonicalLevelId) => void;
	selectedLevel?: CanonicalLevelId;
}

// Labels das réguas
const rulerLabels: Record<keyof RulersVector, string> = {
	decision: 'DEC',
	inference: 'INF',
	meta: 'META',
	scope: 'SCO',
	source: 'SRC',
};

// Cores para badges baseado no score
function getScoreBadge(score: number): {
	label: string;
	variant: 'recommended' | 'alternative' | 'incompatible';
} {
	if (score >= 90) return { label: 'Recomendado', variant: 'recommended' };
	if (score >= 60) return { label: 'Alternativa', variant: 'alternative' };
	return { label: 'Incompatível', variant: 'incompatible' };
}

function getBadgeClasses(
	variant: 'recommended' | 'alternative' | 'incompatible',
): string {
	switch (variant) {
		case 'recommended':
			return 'bg-success/20 text-success';
		case 'alternative':
			return 'bg-warning/20 text-warning';
		case 'incompatible':
			return 'bg-text-tertiary/20 text-text-tertiary';
	}
}

function getCardClasses(score: number, isSelected: boolean): string {
	const baseClasses =
		'bg-bg-primary rounded-lg border-2 p-5 transition-all cursor-pointer hover:shadow-md';

	if (isSelected) {
		return `${baseClasses} border-primary bg-primary/5`;
	}

	if (score >= 90) {
		return `${baseClasses} border-success bg-success/5`;
	}

	if (score >= 60) {
		return `${baseClasses} border-warning bg-warning/5`;
	}

	return `${baseClasses} border-border-primary`;
}

export function MatchVisualization({
	levelMatch,
	currentRulers,
	onSelectLevel,
	selectedLevel,
}: MatchVisualizationProps) {
	const { candidates, score } = levelMatch;

	// Ordenar candidatos por score (maior primeiro)
	const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);

	// Encontrar níveis canônicos para obter nomes e vetores
	const levelsMap = new Map(canonicalLevels.levels.map((l) => [l.id, l]));

	return (
		<div className="bg-bg-primary rounded-xl border border-border-primary p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
						<svg
							aria-hidden="true"
							className="w-5 h-5 text-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
							/>
						</svg>
					</div>
					<div>
						<h2 className="text-lg font-semibold text-text-primary">
							Resultado do Match
						</h2>
						<p className="text-sm text-text-secondary">
							Níveis canônicos compatíveis com suas réguas
						</p>
					</div>
				</div>

				{/* Score geral */}
				<div className="text-right">
					<span className="text-sm text-text-secondary">Score geral</span>
					<div className="text-3xl font-mono font-bold text-primary">
						{score}%
					</div>
				</div>
			</div>

			{/* Grid de candidatos */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sortedCandidates.map((candidate) => {
					const levelData = levelsMap.get(candidate.level);
					const badge = getScoreBadge(candidate.score);
					const isSelected = selectedLevel === candidate.level;

					return (
						<button
							className={getCardClasses(candidate.score, isSelected)}
							disabled={!onSelectLevel}
							key={candidate.level}
							onClick={() => onSelectLevel?.(candidate.level)}
							type="button"
						>
							{/* Header do card */}
							<div className="flex items-start justify-between mb-4">
								<div>
									<span className="text-sm font-medium text-text-secondary">
										{candidate.level}
									</span>
									<h3 className="text-base font-bold text-text-primary mt-1 text-left">
										{levelData?.name || candidate.level}
									</h3>
								</div>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses(
										badge.variant,
									)}`}
								>
									{badge.label}
								</span>
							</div>

							{/* Score */}
							<div className="mb-4">
								<span className="text-2xl font-mono font-bold text-primary">
									{candidate.score}%
								</span>
							</div>

							{/* Comparação de vetores */}
							<div className="grid grid-cols-5 gap-1 mt-4 pt-4 border-t border-border-primary">
								{(Object.keys(rulerLabels) as Array<keyof RulersVector>).map(
									(rulerId) => {
										const currentValue = currentRulers[rulerId];
										const levelValue = levelData?.vector[rulerId];
										const matches = currentValue === levelValue;

										return (
											<div className="text-center" key={rulerId}>
												<span className="text-[10px] text-text-tertiary uppercase">
													{rulerLabels[rulerId]}
												</span>
												<div
													className={`text-sm font-medium ${
														matches ? 'text-success' : 'text-warning'
													}`}
												>
													{currentValue}
													{!matches && (
														<span className="text-text-tertiary text-xs">
															→{levelValue}
														</span>
													)}
												</div>
											</div>
										);
									},
								)}
							</div>

							{/* Indicador de seleção */}
							{isSelected && (
								<div className="mt-3 flex items-center gap-2 text-sm text-primary">
									<svg
										aria-hidden="true"
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M5 13l4 4L19 7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
									Selecionado
								</div>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
