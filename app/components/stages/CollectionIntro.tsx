import type { CognitiveContract } from '~/types';
import type { CollectionBlock, CriterionId } from '~/types/criteria';

interface CollectionIntroProps {
	protocol: {
		criteria: CollectionBlock[];
		implicitCriteria: CriterionId[];
		blockingIssue?: string;
	};
	contract: CognitiveContract;
	onStart: () => void;
}

export function CollectionIntro({
	protocol,
	contract,
	onStart,
}: CollectionIntroProps) {
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
						Protocolo de Coleta
					</h2>
					<p className="text-text-secondary">
						Etapa 2 — Coleta de Critérios de Qualidade
					</p>
				</div>
			</div>

			{/* Alerta Central - Proibição */}
			<div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r mb-6">
				<div className="flex items-start gap-3">
					<svg
						aria-hidden="true"
						className="w-6 h-6 text-warning flex-shrink-0"
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
					<div>
						<p className="text-warning font-medium text-lg">
							⚠️ NÃO executaremos a tarefa agora
						</p>
						<p className="text-text-secondary mt-1">
							Esta etapa é dedicada exclusivamente à coleta de critérios.
							<strong className="text-text-primary">
								{' '}
								Não geraremos código, não executaremos comandos
							</strong>
							, e não realizaremos a tarefa solicitada. Apenas coletaremos
							informações para garantir qualidade na execução futura.
						</p>
					</div>
				</div>
			</div>

			{/* Resumo do Contrato */}
			<div className="bg-bg-primary rounded-xl border border-border-primary p-6 mb-6">
				<h3 className="text-lg font-semibold text-text-primary mb-4">
					Contrato Cognitivo Confirmado
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-text-secondary">Papel</p>
						<p className="font-medium text-text-primary capitalize">
							{contract.role.replace('_', ' ').toLowerCase()}
						</p>
					</div>
					<div>
						<p className="text-sm text-text-secondary">Nível Canônico</p>
						<p className="font-medium text-text-primary">
							{contract.levelMatch.selectedLevel || 'N/A'}
						</p>
					</div>
				</div>
			</div>

			{/* Critérios Implícitos */}
			{protocol.implicitCriteria.length > 0 && (
				<div className="bg-bg-primary rounded-xl border border-border-primary p-6 mb-6">
					<h3 className="text-lg font-semibold text-text-primary mb-3">
						Critérios Já Satisfeitos
					</h3>
					<p className="text-sm text-text-secondary mb-4">
						Estes critérios foram automaticamente satisfeitos pelo seu contrato
						cognitivo e não requerem coleta:
					</p>
					<div className="flex flex-wrap gap-2">
						{protocol.implicitCriteria.map((criterion) => (
							<span
								className="bg-bg-secondary text-text-secondary px-3 py-1 rounded-full text-sm"
								key={criterion}
							>
								{criterion}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Critérios a Coletar */}
			<div className="bg-bg-primary rounded-xl border border-border-primary p-6 mb-6">
				<h3 className="text-lg font-semibold text-text-primary mb-3">
					Critérios para Coleta
				</h3>
				<p className="text-sm text-text-secondary mb-4">
					Você precisará responder{' '}
					<strong className="text-text-primary">
						{protocol.criteria.length} critério
						{protocol.criteria.length !== 1 ? 's' : ''}
					</strong>{' '}
					para completar o protocolo de coleta:
				</p>
				<div className="space-y-2">
					{protocol.criteria.map((criterion, index) => (
						<div
							className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
							key={criterion.id}
						>
							<span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
								{index + 1}
							</span>
							<span className="text-text-primary">{criterion.title}</span>
						</div>
					))}
				</div>
			</div>

			{/* Botão Iniciar */}
			<button
				className="w-full py-3 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors"
				onClick={onStart}
				type="button"
			>
				Iniciar Coleta
			</button>
		</div>
	);
}
