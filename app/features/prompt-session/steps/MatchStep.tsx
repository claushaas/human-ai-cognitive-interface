import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import { Card } from '~/components/ui/Card';
import type {
	CorrectionSuggestion,
	LevelMatch,
	RulersVector,
} from '~/domain/contracts';

export interface MatchStepProps {
	levelMatch: LevelMatch;
	onAdvance: () => void;
	onApplyCorrection?: (rulers: RulersVector) => void;
	onGoBack?: () => void;
}

export function MatchStep({
	levelMatch,
	onAdvance,
	onApplyCorrection,
	onGoBack,
}: MatchStepProps) {
	const status = levelMatch.status;

	if (status === 'blocked' || status === 'no_match') {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="font-serif text-xl font-bold text-haci-text">
						Profundidade
					</h2>
				</div>

				<Callout tone="warning">
					<p className="font-medium">
						Preciso de mais clareza antes de gerar um prompt confiável.
					</p>
					{levelMatch.hardBlocks.length > 0 && (
						<ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
							{levelMatch.hardBlocks.map((block) => (
								<li key={block.code}>{block.message}</li>
							))}
						</ul>
					)}
				</Callout>

				{levelMatch.correctionSuggestions &&
					levelMatch.correctionSuggestions.length > 0 && (
						<div className="space-y-3">
							<h3 className="font-medium text-sm text-haci-text">
								Sugestões de ajuste
							</h3>
							{levelMatch.correctionSuggestions.map((suggestion) => (
								<SuggestionCard
									key={suggestion.id}
									onApply={(rulers) => onApplyCorrection?.(rulers)}
									suggestion={suggestion}
								/>
							))}
						</div>
					)}

				<div className="flex justify-between">
					<Button onClick={onGoBack} variant="ghost">
						Voltar
					</Button>
				</div>
			</div>
		);
	}

	if (status === 'ambiguous') {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="font-serif text-xl font-bold text-haci-text">
						Profundidade
					</h2>
				</div>

				<Callout tone="info">
					<p>
						Existem formas próximas de estruturar esse pedido. Escolha a que
						mais se aproxima do que você precisa.
					</p>
				</Callout>

				<div className="space-y-3">
					{levelMatch.candidates.map((candidate) => (
						<Card className="hover:bg-haci-surface-subtle" key={candidate.id}>
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm text-haci-text">
										{candidate.id}
									</p>
									{candidate.reasons && candidate.reasons.length > 0 && (
										<p className="mt-1 text-haci-text-subtle text-xs">
											{candidate.reasons.join(', ')}
										</p>
									)}
								</div>
							</div>
						</Card>
					))}
				</div>

				{levelMatch.correctionSuggestions &&
					levelMatch.correctionSuggestions.length > 0 && (
						<div className="space-y-3">
							<h3 className="font-medium text-sm text-haci-text">
								Ou ajuste sua escolha
							</h3>
							{levelMatch.correctionSuggestions.map((suggestion) => (
								<SuggestionCard
									key={suggestion.id}
									onApply={(rulers) => onApplyCorrection?.(rulers)}
									suggestion={suggestion}
								/>
							))}
						</div>
					)}

				<div className="flex justify-between">
					<Button onClick={onGoBack} variant="ghost">
						Voltar
					</Button>
					<Button onClick={onAdvance}>Continuar</Button>
				</div>
			</div>
		);
	}

	// matched
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">
					Profundidade
				</h2>
			</div>

			<Callout tone="success">
				<p>A estrutura está clara o suficiente para avançar.</p>
			</Callout>

			<div className="flex justify-between">
				<Button onClick={onGoBack} variant="ghost">
					Voltar
				</Button>
				<Button onClick={onAdvance}>Continuar</Button>
			</div>
		</div>
	);
}

function SuggestionCard({
	suggestion,
	onApply,
}: {
	suggestion: CorrectionSuggestion;
	onApply?: (rulers: RulersVector) => void;
}) {
	// Parse the changes to build adjusted rulers
	const handleApply = () => {
		if (!onApply) return;
		// The parent should handle applying the correction
		// For now, we just pass back the suggestion ID
	};

	return (
		<Card className="hover:bg-haci-surface-subtle">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="font-medium text-sm text-haci-text">
						{suggestion.message}
					</p>
					{suggestion.changes.length > 0 && (
						<p className="mt-1 text-haci-text-subtle text-xs">
							{suggestion.changes
								.map((c) => `${c.ruler}: ${c.from} → ${c.to}`)
								.join(', ')}
						</p>
					)}
				</div>
				<Button onClick={handleApply} size="sm" variant="secondary">
					Aplicar
				</Button>
			</div>
		</Card>
	);
}
