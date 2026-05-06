export interface Step {
	label: string;
	state: 'blocked' | 'complete' | 'current' | 'pending';
}

export interface StepIndicatorProps {
	className?: string;
	steps: Step[];
}

const stateClasses: Record<Step['state'], string> = {
	blocked: 'text-haci-text-subtle after:bg-haci-border',
	complete: 'text-haci-accent after:bg-haci-accent',
	current: 'text-haci-text font-semibold after:bg-haci-accent',
	pending: 'text-haci-text-subtle after:bg-haci-border',
};

const stateDotClasses: Record<Step['state'], string> = {
	blocked: 'bg-haci-border',
	complete: 'bg-haci-accent',
	current: 'bg-haci-accent ring-2 ring-haci-accent-soft',
	pending: 'bg-haci-border',
};

export function StepIndicator({ className = '', steps }: StepIndicatorProps) {
	return (
		<ol
			aria-label="Progresso das etapas"
			className={`flex items-center gap-1 ${className}`}
		>
			{steps.map((step, index) => {
				const isLast = index === steps.length - 1;
				return (
					<li
						aria-current={step.state === 'current' ? 'step' : undefined}
						className={`flex items-center gap-2 text-xs ${stateClasses[step.state]}`}
						key={step.label}
					>
						<span
							aria-hidden="true"
							className={`inline-block h-2 w-2 shrink-0 rounded-full ${stateDotClasses[step.state]}`}
						/>
						<span className="hidden sm:inline">{step.label}</span>
						{!isLast && (
							<span
								aria-hidden="true"
								className="mx-1 hidden h-px w-4 bg-current opacity-30 sm:inline-block"
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}
