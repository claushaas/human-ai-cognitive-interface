import type { HardBlock } from '~/types';

interface HardBlocksAlertProps {
	blocks: HardBlock[];
	onAcknowledge?: (blockId: string) => void;
}

// Ícones por severidade
const severityIcons: Record<string, string> = {
	BLOCK: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
	CONFIRM:
		'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
	WARN: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

// Cores por severidade
const severityConfig: Record<
	string,
	{
		bg: string;
		border: string;
		icon: string;
		title: string;
		description: string;
		action: string;
	}
> = {
	BLOCK: {
		action: 'text-danger underline cursor-pointer hover:text-danger-dark',
		bg: 'bg-danger/10',
		border: 'border-danger/20',
		description: 'text-danger/80',
		icon: 'text-danger',
		title: 'text-danger font-semibold',
	},
	CONFIRM: {
		action: 'text-info underline cursor-pointer hover:text-info-dark',
		bg: 'bg-info/10',
		border: 'border-info/20',
		description: 'text-info/80',
		icon: 'text-info',
		title: 'text-info font-semibold',
	},
	WARN: {
		action: 'text-warning underline cursor-pointer hover:text-warning-dark',
		bg: 'bg-warning/10',
		border: 'border-warning/20',
		description: 'text-warning/80',
		icon: 'text-warning',
		title: 'text-warning font-semibold',
	},
};

export function HardBlocksAlert({
	blocks,
	onAcknowledge,
}: HardBlocksAlertProps) {
	if (blocks.length === 0) return null;

	// Separar por severidade
	const blockBlocks = blocks.filter((b) => b.severity === 'BLOCK');
	const warnBlocks = blocks.filter((b) => b.severity === 'WARN');
	const confirmBlocks = blocks.filter((b) => b.severity === 'CONFIRM');

	// Ordem de exibição: BLOCK primeiro, depois WARN, depois CONFIRM
	const orderedBlocks = [...blockBlocks, ...warnBlocks, ...confirmBlocks];

	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
					<svg
						aria-hidden="true"
						className="w-5 h-5 text-danger"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-lg font-semibold text-text-primary">
						Alertas e Bloqueios
					</h2>
					<p className="text-sm text-text-secondary">
						{blocks.length} alerta(s) requer(em) atenção
					</p>
				</div>
			</div>

			{/* Lista de bloqueios */}
			<div className="space-y-3">
				{orderedBlocks.map((block) => {
					const config = severityConfig[block.severity];

					return (
						<div
							className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
							key={block.id}
						>
							<div className="flex items-start gap-3">
								<svg
									aria-hidden="true"
									className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d={severityIcons[block.severity]}
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								<div className="flex-1">
									<h3 className={`text-sm ${config.title}`}>
										{block.severity === 'BLOCK'
											? 'Bloqueado'
											: block.severity === 'WARN'
												? 'Aviso'
												: 'Requer Confirmação'}
									</h3>
									<p className={`text-sm mt-1 ${config.description}`}>
										{block.message}
									</p>
									{onAcknowledge && (
										<button
											className={`text-sm mt-2 ${config.action}`}
											onClick={() => onAcknowledge(block.id)}
											type="button"
										>
											Entendi
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
