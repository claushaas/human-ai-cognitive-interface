import type { RulerId } from '~/types';

interface RulerConfig {
	label: string;
	scale: number[];
	labels: Record<string, string>;
	constitutionalCap?: number;
}

interface RulerSliderProps {
	rulerId: RulerId;
	value: number;
	onChange: (value: number) => void;
	config: RulerConfig;
	disabled?: boolean;
}

// Ícones para cada régua
const rulerIcons: Record<RulerId, string> = {
	decision: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
	inference:
		'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
	meta: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
	scope:
		'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
	source:
		'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

export function RulerSlider({
	rulerId,
	value,
	onChange,
	config,
	disabled = false,
}: RulerSliderProps) {
	const { label, scale, labels, constitutionalCap } = config;
	const maxValue = Math.max(...scale);

	// Calcular porcentagem para o fill e thumb
	const percentage = ((value - 1) / (maxValue - 1)) * 100;

	// Verificar se valor está acima do cap constitucional
	const isAboveCap = constitutionalCap && value > constitutionalCap;

	return (
		<div className="w-full space-y-3">
			{/* Header com label e valor */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
						<svg
							aria-hidden="true"
							className="w-4 h-4 text-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d={rulerIcons[rulerId]}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
							/>
						</svg>
					</div>
					<span className="text-sm font-medium text-text-primary">{label}</span>
					{constitutionalCap && (
						<span
							className="text-xs px-1.5 py-0.5 bg-warning/10 text-warning rounded"
							title="Cap constitucional: valores 4-5 proibidos"
						>
							Max {constitutionalCap}
						</span>
					)}
				</div>
				<span
					className={`text-xs px-2 py-1 rounded-full ${
						isAboveCap
							? 'bg-danger/10 text-danger'
							: 'bg-primary/10 text-primary'
					}`}
				>
					{value}/{maxValue}
				</span>
			</div>

			{/* Slider track */}
			<div className="relative w-full h-2 bg-bg-tertiary rounded-full">
				{/* Fill */}
				<div
					className="absolute h-full bg-primary rounded-full transition-all duration-200"
					style={{ width: `${percentage}%` }}
				/>

				{/* Steps e Thumb */}
				<div className="absolute inset-0 flex items-center justify-between px-[11px]">
					{scale.map((step) => {
						const isDisabled = !!constitutionalCap && step > constitutionalCap;
						const isActive = step <= value;

						return (
							<button
								className={`w-5 h-5 rounded-full transition-all duration-200 -ml-2.5 first:ml-0 ${
									isDisabled
										? 'bg-border-secondary cursor-not-allowed'
										: isActive
											? 'bg-primary shadow-md'
											: 'bg-bg-primary border-2 border-border-secondary hover:border-primary'
								}`}
								disabled={disabled || isDisabled}
								key={step}
								onClick={() => !isDisabled && onChange(step)}
								title={
									isDisabled
										? 'Proibido constitucionalmente'
										: labels[String(step)]
								}
								type="button"
							/>
						);
					})}
				</div>
			</div>

			{/* Step labels */}
			<div className="flex justify-between px-1">
				{scale.map((step) => {
					const isDisabled = !!constitutionalCap && step > constitutionalCap;
					return (
						<button
							className={`text-xs transition-colors ${
								isDisabled
									? 'text-text-tertiary/50 cursor-not-allowed'
									: step === value
										? 'text-primary font-medium'
										: 'text-text-tertiary hover:text-primary'
							}`}
							disabled={disabled || isDisabled}
							key={step}
							onClick={() => !isDisabled && onChange(step)}
							type="button"
						>
							{step}
						</button>
					);
				})}
			</div>

			{/* Description do valor selecionado */}
			<div className="pt-2 border-t border-border-primary">
				<p
					className={`text-sm ${
						isAboveCap ? 'text-danger' : 'text-text-secondary'
					}`}
				>
					{isAboveCap
						? '⚠️ Valor proibido constitucionalmente (máximo 3 para decisão)'
						: labels[String(value)]}
				</p>
			</div>
		</div>
	);
}
