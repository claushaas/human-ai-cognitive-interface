import type { SessionListItem } from '~/types/dashboard';

interface SessionCardProps {
	session: SessionListItem;
	onClick?: () => void;
}

const roleLabels: Record<string, string> = {
	'role.analyze': 'Analisar',
	'role.decideSupport': 'Apoiar Decisão',
	'role.document': 'Documentar',
	'role.explore': 'Explorar',
	'role.synthesize': 'Sintetizar',
	'role.transform': 'Transformar',
};

const levelColors: Record<string, { bg: string; text: string }> = {
	N1: { bg: 'bg-slate-100', text: 'text-slate-700' },
	N2: { bg: 'bg-slate-100', text: 'text-slate-700' },
	N3: { bg: 'bg-slate-100', text: 'text-slate-700' },
	N4: { bg: 'bg-slate-100', text: 'text-slate-700' },
	N5: { bg: 'bg-blue-100', text: 'text-blue-700' },
	N6: { bg: 'bg-blue-100', text: 'text-blue-700' },
	N7: { bg: 'bg-purple-100', text: 'text-purple-700' },
	N8: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const statusConfig: Record<
	string,
	{ color: string; label: string; icon: string }
> = {
	collection_in_progress: {
		color: 'bg-amber-500',
		icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
		label: 'Coleta',
	},
	completed: {
		color: 'bg-green-500',
		icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		label: 'Completo',
	},
	contract_configured: {
		color: 'bg-blue-500',
		icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
		label: 'Contrato',
	},
	draft: {
		color: 'bg-gray-500',
		icon: 'M11.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-4.293-4.293a1 1 0 010-1.414z',
		label: 'Rascunho',
	},
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

function formatTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleTimeString('pt-BR', {
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function SessionCard({ session, onClick }: SessionCardProps) {
	const status = statusConfig[session.status] || statusConfig.draft;
	const levelStyle = session.level ? levelColors[session.level] : null;
	const progress = session.progress;
	const progressPercent =
		progress && progress.totalBlocks > 0
			? Math.round((progress.completedBlocks / progress.totalBlocks) * 100)
			: 0;

	return (
		<div
			className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
			onClick={onClick}
		>
			{/* Header: Status dot + Date */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div
						className={`w-2 h-2 rounded-full ${status.color}`}
						title={status.label}
					/>
					<span className="text-xs text-gray-500">
						{formatDate(session.createdAt)} às {formatTime(session.createdAt)}
					</span>
				</div>
				{session.level && levelStyle && (
					<span
						className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${levelStyle.bg} ${levelStyle.text}`}
					>
						{session.level}
					</span>
				)}
			</div>

			{/* Role Badge */}
			{session.role && (
				<div className="mb-3">
					<span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
						{roleLabels[session.role] || session.role}
					</span>
				</div>
			)}

			{/* Session ID */}
			<div className="text-xs text-gray-400 font-mono mb-3 truncate">
				{session.id.slice(0, 8)}...
			</div>

			{/* Progress Bar */}
			{progress && progress.totalBlocks > 0 && (
				<div className="mt-3">
					<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
						<span>Progresso</span>
						<span>{progressPercent}%</span>
					</div>
					<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-blue-500 transition-all duration-300"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<div className="text-xs text-gray-400 mt-1">
						{progress.completedBlocks} de {progress.totalBlocks} critérios
					</div>
				</div>
			)}
		</div>
	);
}
