// Configuração das réguas
import rulersConfig from '~/config/cognitive-rulers.json';
import type { RulersVector } from '~/types';
import { RulerSlider } from './RulerSlider';

interface RulersPanelProps {
	rulers: RulersVector;
	onChange: (rulers: RulersVector) => void;
	disabled?: boolean;
}

export function RulersPanel({
	rulers,
	onChange,
	disabled = false,
}: RulersPanelProps) {
	const handleRulerChange = (rulerId: keyof RulersVector, value: number) => {
		onChange({
			...rulers,
			[rulerId]: value,
		});
	};

	const rulerOrder: Array<keyof RulersVector> = [
		'inference',
		'scope',
		'source',
		'meta',
		'decision',
	];

	return (
		<div className="bg-bg-primary rounded-xl border border-border-primary p-6">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
					<svg
						aria-hidden="true"
						className="w-5 h-5 text-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-lg font-semibold text-text-primary">
						Configuração das Réguas
					</h2>
					<p className="text-sm text-text-secondary">
						Ajuste os valores para encontrar o nível canônico adequado
					</p>
				</div>
			</div>

			{/* Grid de réguas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{rulerOrder.map((rulerId) => {
					const config = rulersConfig.rulers[rulerId];
					return (
						<div
							className={`${rulerId === 'decision' ? 'lg:col-span-2' : ''}`}
							key={rulerId}
						>
							<RulerSlider
								config={{
									constitutionalCap: (config as { constitutionalCap?: number })
										.constitutionalCap,
									label: config.label,
									labels: config.labels,
									scale: config.scale,
								}}
								disabled={disabled}
								onChange={(value) => handleRulerChange(rulerId, value)}
								rulerId={rulerId}
								value={rulers[rulerId]}
							/>
						</div>
					);
				})}
			</div>

			{/* Dica */}
			<div className="mt-6 p-4 bg-bg-secondary rounded-lg border border-border-primary">
				<div className="flex items-start gap-3">
					<svg
						aria-hidden="true"
						className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
					<p className="text-sm text-text-secondary">
						<strong className="text-text-primary">Nota:</strong> A régua
						&quot;Decisão&quot; possui um cap constitucional de valor 3. Valores
						4 e 5 são proibidos para garantir que a decisão final sempre seja
						humana.
					</p>
				</div>
			</div>
		</div>
	);
}
