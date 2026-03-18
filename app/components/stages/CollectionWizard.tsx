import { useState } from 'react';
import type { CollectionBlock } from '~/types/criteria';
import { CollectionBlockCard } from './CollectionBlockCard';

interface CollectionWizardProps {
	blocks: CollectionBlock[];
	responses: Record<string, string>;
	currentBlockIndex: number;
	onNavigate: (index: number) => void;
	onSubmit: (blockId: string, response: string) => void;
	onComplete: () => void;
	isSubmitting?: boolean;
}

export function CollectionWizard({
	blocks,
	responses,
	currentBlockIndex,
	onNavigate,
	onSubmit,
	onComplete,
	isSubmitting = false,
}: CollectionWizardProps) {
	const [localResponse, setLocalResponse] = useState(
		responses[blocks[currentBlockIndex]?.id] || '',
	);
	const [showValidationError, setShowValidationError] = useState(false);
	const [lastSaved, setLastSaved] = useState<string | null>(null);

	const currentBlock = blocks[currentBlockIndex];
	const isFirstBlock = currentBlockIndex === 0;
	const isLastBlock = currentBlockIndex === blocks.length - 1;

	const handlePrevious = () => {
		if (!isFirstBlock) {
			// Save current response before navigating
			if (localResponse.trim()) {
				onSubmit(currentBlock.id, localResponse);
			}
			onNavigate(currentBlockIndex - 1);
			setLocalResponse(responses[blocks[currentBlockIndex - 1]?.id] || '');
			setShowValidationError(false);
		}
	};

	const handleNext = () => {
		if (!localResponse.trim()) {
			setShowValidationError(true);
			return;
		}

		// Submit response
		onSubmit(currentBlock.id, localResponse);
		setLastSaved(new Date().toLocaleTimeString());

		if (isLastBlock) {
			onComplete();
		} else {
			onNavigate(currentBlockIndex + 1);
			setLocalResponse(responses[blocks[currentBlockIndex + 1]?.id] || '');
			setShowValidationError(false);
		}
	};

	const handleSkip = () => {
		if (!isLastBlock) {
			onNavigate(currentBlockIndex + 1);
			setLocalResponse(responses[blocks[currentBlockIndex + 1]?.id] || '');
			setShowValidationError(false);
		}
	};

	// Update local response when navigating to a block with existing response
	const handleNavigateToBlock = (index: number) => {
		if (localResponse.trim() && index !== currentBlockIndex) {
			onSubmit(currentBlock.id, localResponse);
		}
		onNavigate(index);
		setLocalResponse(responses[blocks[index]?.id] || '');
		setShowValidationError(false);
	};

	if (!currentBlock) {
		return null;
	}

	return (
		<div className="max-w-3xl mx-auto py-8 px-4">
			{/* Stepper */}
			<div className="flex items-center space-x-2 mb-8">
				{blocks.map((block, index) => {
					const isCompleted = responses[block.id]?.trim().length > 0;
					const isActive = index === currentBlockIndex;

					return (
						<div className="flex items-center" key={block.id}>
							<button
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
									isActive
										? 'bg-primary text-text-inverse'
										: isCompleted
											? 'bg-success text-text-inverse'
											: 'bg-bg-tertiary text-text-secondary'
								}`}
								onClick={() => handleNavigateToBlock(index)}
								type="button"
							>
								{isCompleted && !isActive ? (
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
								) : (
									index + 1
								)}
							</button>
							{index < blocks.length - 1 && (
								<div
									className={`flex-1 h-0.5 min-w-[20px] ${
										isCompleted && responses[blocks[index + 1]?.id]?.trim()
											? 'bg-primary'
											: 'bg-border-primary'
									}`}
								/>
							)}
						</div>
					);
				})}
			</div>

			{/* Block Card */}
			<div className="mb-6">
				<CollectionBlockCard
					block={currentBlock}
					blockNumber={currentBlockIndex + 1}
					error={showValidationError ? 'Este campo é obrigatório' : undefined}
					isValid={!showValidationError}
					onChange={setLocalResponse}
					totalBlocks={blocks.length}
					value={localResponse}
				/>
			</div>

			{/* Auto-save indicator */}
			{lastSaved && (
				<div className="text-xs text-success flex items-center gap-1 mb-4">
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
					<span>Salvo às {lastSaved}</span>
				</div>
			)}

			{/* Navigation Buttons */}
			<div className="flex items-center justify-between pt-6 border-t border-border-primary">
				<button
					className="px-4 py-2 border border-border-primary rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isFirstBlock || isSubmitting}
					onClick={handlePrevious}
					type="button"
				>
					Anterior
				</button>

				<div className="flex items-center gap-4">
					{!isLastBlock && (
						<button
							className="text-text-secondary hover:text-text-primary underline text-sm"
							onClick={handleSkip}
							type="button"
						>
							Pular
						</button>
					)}

					{isLastBlock ? (
						<button
							className="px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting}
							onClick={handleNext}
							type="button"
						>
							{isSubmitting ? 'Salvando...' : 'Revisar Respostas'}
						</button>
					) : (
						<button
							className="px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting}
							onClick={handleNext}
							type="button"
						>
							{isSubmitting ? 'Salvando...' : 'Próximo'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
