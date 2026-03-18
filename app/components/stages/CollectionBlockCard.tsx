import type { CollectionBlock } from '~/types/criteria';

interface CollectionBlockCardProps {
	block: CollectionBlock;
	blockNumber: number;
	totalBlocks: number;
	value: string;
	onChange: (value: string) => void;
	isValid?: boolean;
	error?: string;
}

export function CollectionBlockCard({
	block,
	blockNumber,
	totalBlocks,
	value,
	onChange,
	isValid = true,
	error,
}: CollectionBlockCardProps) {
	return (
		<div className="bg-bg-primary rounded-xl border border-border-primary overflow-hidden">
			{/* Header */}
			<div className="bg-bg-secondary px-6 py-4 border-b border-border-primary">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text-primary">
						{block.title}
					</h3>
					<span className="text-sm text-text-secondary">
						Bloco {blockNumber} de {totalBlocks}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				{/* Instrução */}
				<p className="text-text-primary leading-relaxed mb-4">
					{block.instruction}
				</p>

				{/* Lista "Incluir" */}
				{block.include.length > 0 && (
					<div className="mb-4">
						<h4 className="text-sm font-medium text-text-primary mb-2">
							Incluir:
						</h4>
						<ul className="space-y-2">
							{block.include.map((item) => (
								<li
									className="flex items-start gap-2 text-sm text-text-secondary"
									key={item}
								>
									<svg
										aria-hidden="true"
										className="w-4 h-4 text-success flex-shrink-0 mt-0.5"
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
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Lista "Evitar" */}
				{block.avoid.length > 0 && (
					<div className="mb-4">
						<h4 className="text-sm font-medium text-text-primary mb-2">
							Evitar:
						</h4>
						<ul className="space-y-2">
							{block.avoid.map((item) => (
								<li
									className="flex items-start gap-2 text-sm text-text-secondary"
									key={`avoid-${item}`}
								>
									<svg
										aria-hidden="true"
										className="w-4 h-4 text-danger flex-shrink-0 mt-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M6 18L18 6M6 6l12 12"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Exemplo */}
				{block.example && (
					<div className="bg-bg-secondary p-4 rounded-md text-sm text-text-secondary italic mb-4">
						<strong className="text-text-primary not-italic">Exemplo: </strong>
						{block.example}
					</div>
				)}

				{/* Rationale */}
				{block.rationale && (
					<p className="text-xs text-text-tertiary mb-4">{block.rationale}</p>
				)}

				{/* Textarea */}
				<div>
					<label
						className="block text-sm font-medium text-text-primary mb-2"
						htmlFor={`response-${block.id}`}
					>
						Sua Resposta
					</label>
					<textarea
						className={`w-full min-h-[120px] p-3 border rounded-lg focus:ring-2 focus:border-transparent bg-bg-primary text-text-primary resize-y ${
							isValid
								? 'border-border-primary focus:ring-primary'
								: 'border-danger focus:ring-danger'
						}`}
						id={`response-${block.id}`}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Digite sua resposta aqui..."
						value={value}
					/>
					{error && <p className="text-sm text-danger mt-2">{error}</p>}
				</div>
			</div>
		</div>
	);
}
