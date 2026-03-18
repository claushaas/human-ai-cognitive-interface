import { useState } from 'react';
import type { CollectionProtocol } from '~/types/criteria';

interface CollectionCompleteProps {
	sessionId: string;
	protocol: CollectionProtocol;
	finalPayload: Record<string, unknown>;
	collectionPrompt: string | null;
	onNewSession: () => void;
}

export function CollectionComplete({
	sessionId,
	protocol,
	finalPayload,
	collectionPrompt,
	onNewSession,
}: CollectionCompleteProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyPrompt = async () => {
		if (collectionPrompt) {
			await navigator.clipboard.writeText(collectionPrompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const criteriaCount = protocol.criteria.length;
	const implicitCount = protocol.implicitCriteria.length;

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 text-center">
			{/* Success Icon */}
			<div className="w-16 h-16 mx-auto text-success mb-4">
				<svg
					aria-hidden="true"
					className="w-full h-full"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
					/>
				</svg>
			</div>

			{/* Title */}
			<h2 className="text-2xl font-bold text-text-primary mb-2">
				Coleta Concluída!
			</h2>
			<p className="text-text-secondary mb-8">
				O protocolo de coleta foi finalizado com sucesso. Seu contrato cognitivo
				está pronto para uso.
			</p>

			{/* Summary Cards */}
			<div className="grid gap-4 mt-8 mb-8">
				<div className="bg-bg-primary rounded-lg border border-border-primary p-4">
					<p className="text-sm text-text-secondary mb-1">
						Critérios Coletados
					</p>
					<p className="text-xl font-semibold text-text-primary">
						{criteriaCount}
					</p>
				</div>
				<div className="bg-bg-primary rounded-lg border border-border-primary p-4">
					<p className="text-sm text-text-secondary mb-1">
						Critérios Implícitos
					</p>
					<p className="text-xl font-semibold text-text-primary">
						{implicitCount}
					</p>
				</div>
				<div className="bg-bg-primary rounded-lg border border-border-primary p-4">
					<p className="text-sm text-text-secondary mb-1">Modo Atual</p>
					<p className="text-xl font-semibold text-text-primary">
						Modo Execução
					</p>
				</div>
				<div className="bg-bg-primary rounded-lg border border-border-primary p-4">
					<p className="text-sm text-text-secondary mb-1">ID da Sessão</p>
					<p className="text-xl font-semibold text-text-primary font-mono text-sm">
						{sessionId}
					</p>
				</div>
			</div>

			{/* Copy Prompt Button */}
			{collectionPrompt && (
				<div className="mb-6">
					<button
						className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg hover:bg-border-primary transition-colors w-full"
						onClick={handleCopyPrompt}
						type="button"
					>
						{copied ? (
							<>
								<svg
									aria-hidden="true"
									className="w-4 h-4 text-success"
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
								<span className="text-success">Copiado!</span>
							</>
						) : (
							<>
								<svg
									aria-hidden="true"
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
								<span>Copiar Prompt de Coleta</span>
							</>
						)}
					</button>
				</div>
			)}

			{/* JSON Payload Preview */}
			<div className="mb-6">
				<details className="bg-bg-primary rounded-lg border border-border-primary overflow-hidden">
					<summary className="p-4 cursor-pointer hover:bg-bg-secondary transition-colors text-left font-medium text-text-primary">
						Ver Payload Completo
					</summary>
					<div className="p-4 border-t border-border-primary">
						<pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
							{JSON.stringify(finalPayload, null, 2)}
						</pre>
					</div>
				</details>
			</div>

			{/* New Session Button */}
			<button
				className="px-4 py-2 text-primary hover:underline"
				onClick={onNewSession}
				type="button"
			>
				Iniciar Nova Sessão
			</button>
		</div>
	);
}
