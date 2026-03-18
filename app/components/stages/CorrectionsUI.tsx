// Labels das réguas
import rulersConfig from '~/config/cognitive-rulers.json';
import type { LocalCorrection, RulersVector } from '~/types';

interface CorrectionsUIProps {
	corrections: LocalCorrection[];
	currentRulers: RulersVector;
	onApplyCorrection: (delta: Partial<RulersVector>) => void;
	onSkip: () => void;
	isLoading?: boolean;
}

// Labels amigáveis para as réguas
function getRulerLabel(rulerId: keyof RulersVector): string {
	return rulersConfig.rulers[rulerId]?.label || rulerId;
}

export function CorrectionsUI({
	corrections,
	currentRulers,
	onApplyCorrection,
	onSkip,
	isLoading = false,
}: CorrectionsUIProps) {
	if (corrections.length === 0) return null;

	return (
		<div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
					<svg
						aria-hidden="true"
						className="w-5 h-5 text-warning"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M13 10V3L4 14h7v7l9-11h-7z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-lg font-semibold text-text-primary">
						Correções Sugeridas
					</h2>
					<p className="text-sm text-text-secondary">
						Ajustes para melhorar o match
					</p>
				</div>
			</div>

			{/* Lista de correções */}
			<div className="space-y-3 mb-4">
				{corrections.map((correction) => {
					const modifiedRulers = Object.keys(correction.rulersDelta) as Array<
						keyof RulersVector
					>;

					const correctionKey = modifiedRulers.join('-');

					return (
						<div
							className="bg-bg-primary rounded-lg border border-border-primary p-4"
							key={correctionKey}
						>
							{/* Delta das réguas */}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
								{modifiedRulers.map((rulerId) => {
									const originalValue = currentRulers[rulerId];
									const newValue = correction.rulersDelta[rulerId];

									if (newValue === undefined) return null;

									return (
										<div
											className="flex items-center gap-2 text-sm"
											key={rulerId}
										>
											<span className="text-text-secondary">
												{getRulerLabel(rulerId)}:
											</span>
											<span className="text-text-tertiary line-through">
												{originalValue}
											</span>
											<span className="text-text-tertiary">→</span>
											<span className="text-primary font-medium">
												{newValue}
											</span>
										</div>
									);
								})}
							</div>

							{/* Razão */}
							<p className="text-sm text-text-secondary mb-3">
								{correction.reason}
							</p>

							{/* Botão aplicar */}
							<button
								className="w-full py-2 px-4 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={isLoading}
								onClick={() => onApplyCorrection(correction.rulersDelta)}
								type="button"
							>
								{isLoading ? 'Aplicando...' : 'Aplicar Correção'}
							</button>
						</div>
					);
				})}
			</div>

			{/* Botão pular */}
			<button
				className="w-full py-2 px-4 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-border-secondary transition-colors"
				onClick={onSkip}
				type="button"
			>
				Manter como está
			</button>

			{/* Nota informativa */}
			<p className="text-xs text-text-tertiary mt-3 text-center">
				Correções limitadas a máximo 2 réguas com variação de ±1 cada
			</p>
		</div>
	);
}
