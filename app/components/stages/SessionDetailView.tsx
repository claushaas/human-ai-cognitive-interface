import { useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui';
import type { SessionDetail } from '~/types/dashboard';

interface SessionDetailViewProps {
	session: SessionDetail;
	onExport: (format: 'json' | 'markdown') => void;
	onDelete?: () => void;
}

const roleLabels: Record<string, string> = {
	'role.analyze': 'Analisar',
	'role.decideSupport': 'Apoiar Decisão',
	'role.document': 'Documentar',
	'role.explore': 'Explorar',
	'role.synthesize': 'Sintetizar',
	'role.transform': 'Transformar',
};

const statusLabels: Record<string, { label: string; color: string }> = {
	collection_in_progress: {
		color: 'bg-amber-100 text-amber-800',
		label: 'Coleta em Andamento',
	},
	completed: { color: 'bg-green-100 text-green-800', label: 'Completo' },
	contract_configured: {
		color: 'bg-blue-100 text-blue-800',
		label: 'Contrato Configurado',
	},
	draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
};

const rulerLabels: Record<string, string> = {
	decision: 'Decisão',
	inference: 'Inferência',
	meta: 'Função Meta',
	scope: 'Escopo',
	source: 'Fonte',
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

export function SessionDetailView({
	session,
	onExport,
	onDelete,
}: SessionDetailViewProps) {
	const [activeTab, setActiveTab] = useState<
		'overview' | 'contract' | 'collection'
	>('overview');
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const status = statusLabels[session.status] || statusLabels.draft;
	const canContinue = session.status !== 'completed';

	const handleContinue = () => {
		window.location.href = `/session/${session.id}/stage-${session.currentStage}`;
	};

	const handleDelete = () => {
		if (showDeleteConfirm) {
			onDelete?.();
		} else {
			setShowDeleteConfirm(true);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl font-bold text-gray-900">
							Detalhes da Sessão
						</h1>
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
						>
							{status.label}
						</span>
					</div>
					<p className="text-sm text-gray-500 font-mono">ID: {session.id}</p>
					<p className="text-sm text-gray-500">
						Criada em {formatDate(session.createdAt)}
					</p>
				</div>

				<div className="flex items-center gap-2">
					{canContinue && (
						<button
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							onClick={handleContinue}
							type="button"
						>
							Continuar Sessão
						</button>
					)}
					<button
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						onClick={() => onExport('json')}
						type="button"
					>
						Exportar JSON
					</button>
					{onDelete && (
						<button
							className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
							onClick={handleDelete}
							type="button"
						>
							{showDeleteConfirm ? 'Confirmar Exclusão' : 'Deletar'}
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="border-b border-gray-200">
				<nav className="flex gap-6">
					<button
						className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'overview'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						}`}
						onClick={() => setActiveTab('overview')}
						type="button"
					>
						Visão Geral
					</button>
					<button
						className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'contract'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						}`}
						onClick={() => setActiveTab('contract')}
						type="button"
					>
						Contrato
					</button>
					<button
						className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'collection'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						}`}
						onClick={() => setActiveTab('collection')}
						type="button"
					>
						Coleta
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			{activeTab === 'overview' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500 mb-1">Papel</p>
							<p className="text-lg font-semibold text-gray-900">
								{session.role ? roleLabels[session.role] || session.role : '—'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500 mb-1">Nível</p>
							<p className="text-lg font-semibold text-gray-900">
								{session.level || '—'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500 mb-1">Etapa Atual</p>
							<p className="text-lg font-semibold text-gray-900">
								{session.currentStage === 0 && 'Seleção de Papel'}
								{session.currentStage === 1 && 'Configuração de Réguas'}
								{session.currentStage === 2 && 'Coleta de Critérios'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500 mb-1">Modo</p>
							<p className="text-lg font-semibold text-gray-900">
								{session.mode === 'MODE_PREPARATION' && 'Preparação'}
								{session.mode === 'MODE_GOVERNANCE' && 'Governança'}
								{session.mode === 'MODE_EXECUTION' && 'Execução'}
							</p>
						</CardContent>
					</Card>

					{session.progress && (
						<Card className="md:col-span-2 lg:col-span-4">
							<CardContent className="p-4">
								<p className="text-sm text-gray-500 mb-2">
									Progresso da Coleta
								</p>
								<div className="flex items-center gap-4">
									<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
										<div
											className="h-full bg-blue-500 transition-all duration-300"
											style={{
												width: `${session.progress.totalBlocks > 0 ? (session.progress.completedBlocks / session.progress.totalBlocks) * 100 : 0}%`,
											}}
										/>
									</div>
									<span className="text-sm text-gray-600">
										{session.progress.completedBlocks} /{' '}
										{session.progress.totalBlocks}
									</span>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{activeTab === 'contract' && session.contract && (
				<div className="space-y-4">
					<Card>
						<CardHeader className="border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">
								Contrato Cognitivo
							</h3>
						</CardHeader>
						<CardContent className="p-4 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500 mb-1">
										Papel Selecionado
									</p>
									<p className="font-medium text-gray-900">
										{roleLabels[session.contract.role] || session.contract.role}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">Nível Match</p>
									<p className="font-medium text-gray-900">
										{session.contract.levelMatch.selectedLevel} (
										{session.contract.levelMatch.score.toFixed(1)}%)
									</p>
								</div>
							</div>

							<div className="border-t border-gray-200 pt-4">
								<p className="text-sm text-gray-500 mb-3">
									Réguas Configuradas
								</p>
								<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
									{Object.entries(session.contract.rulers).map(
										([key, value]) => (
											<div className="bg-gray-50 rounded-lg p-3" key={key}>
												<p className="text-xs text-gray-500">
													{rulerLabels[key]}
												</p>
												<p className="text-lg font-semibold text-gray-900">
													{value}
												</p>
											</div>
										),
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{session.contract.hardBlocks.length > 0 && (
						<Card className="border-red-200">
							<CardHeader className="border-b border-red-200 bg-red-50">
								<h3 className="font-semibold text-red-800">
									Hard Blocks Ativos
								</h3>
							</CardHeader>
							<CardContent className="p-4">
								<ul className="space-y-2">
									{session.contract.hardBlocks.map((block) => (
										<li className="text-red-700 text-sm" key={block.id}>
											<strong>{block.severity}:</strong> {block.message}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{activeTab === 'contract' && !session.contract && (
				<div className="text-center py-12 text-gray-500">
					<p>Nenhum contrato configurado para esta sessão.</p>
				</div>
			)}

			{activeTab === 'collection' && session.collectionPayload && (
				<div className="space-y-4">
					<Card>
						<CardHeader className="border-b border-gray-200">
							<h3 className="font-semibold text-gray-900">Dados Coletados</h3>
						</CardHeader>
						<CardContent className="p-4">
							<pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-sm">
								{JSON.stringify(session.collectionPayload, null, 2)}
							</pre>
						</CardContent>
					</Card>
				</div>
			)}

			{activeTab === 'collection' && !session.collectionPayload && (
				<div className="text-center py-12 text-gray-500">
					<p>Nenhum dado coletado ainda.</p>
					{canContinue && (
						<button
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							onClick={handleContinue}
							type="button"
						>
							Continuar Coleta
						</button>
					)}
				</div>
			)}
		</div>
	);
}
