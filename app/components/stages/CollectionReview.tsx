import { useState } from 'react';
import type { CollectionBlock } from '~/types/criteria';

interface CollectionReviewProps {
	blocks: CollectionBlock[];
	responses: Record<string, string>;
	onEdit: (blockIndex: number) => void;
	onComplete: () => void;
	isSubmitting?: boolean;
}

export function CollectionReview({
	blocks,
	responses,
	onEdit,
	onComplete,
	isSubmitting = false,
}: CollectionReviewProps) {
	const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

	const answeredBlocks = blocks.filter(
		(block) => responses[block.id]?.trim().length > 0,
	);
	const totalBlocks = blocks.length;
	const answeredCount = answeredBlocks.length;

	const toggleExpand = (blockId: string) => {
		setExpandedBlock(expandedBlock === blockId ? null : blockId);
	};

	return (
		<div className="max-w-3xl mx-auto py-8 px-4">
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
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-2xl font-bold text-text-primary">
						Revisar Respostas
					</h2>
					<p className="text-text-secondary">
						{answeredCount} de {totalBlocks} critérios respondidos
					</p>
				</div>
			</div>

			{/* Lista de Revisão */}
			<div className="space-y-4 mb-6">
				{blocks.map((block, index) => {
					const response = responses[block.id];
					const hasResponse = response?.trim().length > 0;
					const isExpanded = expandedBlock === block.id;

					return (
						<div
							className="bg-bg-primary rounded-lg border border-border-primary overflow-hidden"
							key={block.id}
						>
							{/* Header */}
							<button
								className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-bg-secondary transition-colors"
								onClick={() => toggleExpand(block.id)}
								type="button"
							>
								<div className="flex items-center gap-3">
									<span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
										{index + 1}
									</span>
									<span className="font-medium text-text-primary text-left">
										{block.title}
									</span>
								</div>
								<div className="flex items-center gap-3">
									{hasResponse ? (
										<span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
											Respondido
										</span>
									) : (
										<span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
											Pendente
										</span>
									)}
									<svg
										aria-hidden="true"
										className={`w-5 h-5 text-text-tertiary transition-transform ${
											isExpanded ? 'rotate-180' : ''
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</div>
							</button>

							{/* Content (expandable) */}
							{isExpanded && (
								<div className="p-4 border-t border-border-primary">
									{hasResponse ? (
										<div>
											<p className="text-sm text-text-secondary mb-3">
												<strong className="text-text-primary">
													Sua Resposta:
												</strong>
											</p>
											<div className="bg-bg-secondary p-4 rounded-lg text-text-secondary text-sm whitespace-pre-wrap">
												{response}
											</div>
											<button
												className="mt-3 text-sm text-primary hover:underline"
												onClick={() => onEdit(index)}
												type="button"
											>
												Editar Resposta
											</button>
										</div>
									) : (
										<div className="text-center py-4">
											<p className="text-text-secondary mb-3">
												Nenhuma resposta fornecida ainda.
											</p>
											<button
												className="text-sm text-primary hover:underline"
												onClick={() => onEdit(index)}
												type="button"
											>
												Adicionar Resposta
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Botão Finalizar */}
			<button
				className="w-full py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={isSubmitting || answeredCount === 0}
				onClick={onComplete}
				type="button"
			>
				{isSubmitting
					? 'Finalizando...'
					: `Finalizar Coleta (${answeredCount}/${totalBlocks})`}
			</button>

			{/* Aviso */}
			{answeredCount < totalBlocks && (
				<p className="text-xs text-text-tertiary mt-3 text-center">
					Você pode finalizar com respostas parciais, mas recomendamos responder
					todos os critérios para melhores resultados.
				</p>
			)}
		</div>
	);
}
