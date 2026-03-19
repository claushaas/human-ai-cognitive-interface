import type { SessionListItem } from '~/types/dashboard';
import { SessionCard } from './SessionCard';

interface SessionListProps {
	sessions: SessionListItem[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	onPageChange: (page: number) => void;
	isLoading?: boolean;
}

export function SessionList({
	sessions,
	pagination,
	onPageChange,
	isLoading,
}: SessionListProps) {
	const handleSessionClick = (sessionId: string) => {
		window.location.href = `/sessions/${sessionId}`;
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(6)].map((_, index) => (
					<div
						className="bg-gray-100 border border-gray-200 rounded-lg p-4 animate-pulse"
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder uses index as key
						key={`skeleton-${index}`}
					>
						<div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
						<div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
						<div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
						<div className="h-2 bg-gray-200 rounded w-full mt-4" />
					</div>
				))}
			</div>
		);
	}

	if (sessions.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Ícone de documento</title>
						<path
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Nenhuma sessão encontrada
				</h3>
				<p className="text-gray-500">
					Crie uma nova sessão para começar a usar o sistema.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sessions.map((session) => (
					<SessionCard
						key={session.id}
						onClick={() => handleSessionClick(session.id)}
						session={session}
					/>
				))}
			</div>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 mt-8">
					<button
						className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						disabled={pagination.page <= 1}
						onClick={() => onPageChange(pagination.page - 1)}
						type="button"
					>
						Anterior
					</button>

					<span className="text-sm text-gray-600">
						Página {pagination.page} de {pagination.totalPages}
					</span>

					<button
						className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						disabled={pagination.page >= pagination.totalPages}
						onClick={() => onPageChange(pagination.page + 1)}
						type="button"
					>
						Próxima
					</button>
				</div>
			)}

			<div className="text-center text-sm text-gray-500 mt-4">
				Mostrando {sessions.length} de {pagination.total} sessões
			</div>
		</div>
	);
}
